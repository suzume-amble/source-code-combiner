import * as path from "node:path";

import { FileInfo } from "./fileInfo";
import { TreeStyle, TreeStylePreset, TREE_STYLE_PRESETS } from "./directoryTreeStyle";

/**
 * ディレクトリツリーのノード。
 *
 * ファイル一覧からツリー構造を組み立てるために使用する。
 */
interface TreeNode {
    /** ノード名 */
    name: string;

    /** ディレクトリかどうか */
    isDirectory: boolean;

    /** シンボリックリンクかどうか */
    isSymbolicLink: boolean;

    /** シンボリックリンクのリンク先 */
    symbolicLinkTarget?: string;

    /** 子ノード一覧 */
    children: TreeNode[];
}

/**
 * 対象ファイル一覧からディレクトリツリーを生成する。
 *
 * @param rootName ルートディレクトリ名
 * @param files 対象ファイル一覧
 * @param treeStyle 使用するツリー文字セット
 * @returns ディレクトリツリー文字列（末尾改行を含む）
 */
export function createDirectoryTree(
    rootName: string,
    files: readonly FileInfo[],
    treeStyle: TreeStyle,
): string {
    // ファイル一覧からツリー構造を生成する。
    const root = buildTree(rootName, files);

    // 使用するツリー文字セットを取得する。
    const preset = TREE_STYLE_PRESETS[treeStyle];

    // ツリーを文字列へ変換する。
    const lines: string[] = [];
    lines.push(root.name + "/");

    // Indentスタイルはインデントのみで階層を表現するため、
    // ルート直下から1段インデントして出力する。
    const rootIndent = treeStyle === TreeStyle.INDENT ? preset.indent : "";

    appendTree(root, rootIndent, lines, treeStyle, preset);

    // 最後に改行を付加して返す。
    return lines.join("\n") + "\n";
}

/**
 * ファイル一覧からツリー構造を生成する。
 *
 * @param rootName ルートディレクトリ名
 * @param files 対象ファイル一覧
 * @returns ルートノード
 */
function buildTree(rootName: string, files: readonly FileInfo[]): TreeNode {
    // ルートノードを生成する。
    const root: TreeNode = {
        name: rootName,
        isDirectory: true,
        isSymbolicLink: false,
        children: [],
    };

    // 各ファイルをツリーへ追加する。
    for (const file of files) {
        // 相対パスをディレクトリ単位へ分割する。
        const parts = file.relativePath.split(path.sep);

        let current = root;

        // ディレクトリを順番に追加する。
        for (let i = 0; i < parts.length - 1; i++) {
            const directoryName = parts[i];

            let child = current.children.find(
                (node) => node.isDirectory && node.name === directoryName,
            );

            // ディレクトリが存在しない場合は追加する。
            if (!child) {
                child = {
                    name: directoryName,
                    isDirectory: true,
                    isSymbolicLink: false,
                    children: [],
                };

                current.children.push(child);
            }

            current = child;
        }

        // ファイルをツリーへ追加する。
        current.children.push({
            name: parts[parts.length - 1],
            isDirectory: false,
            isSymbolicLink: file.isSymbolicLink,
            symbolicLinkTarget: file.symbolicLinkTarget,
            children: [],
        });
    }

    return root;
}

/**
 * 指定されたツリー文字セットを使用して、
 * ツリーを再帰的に文字列へ変換する。
 *
 * @param node 対象ノード
 * @param indent 現在のインデント文字列
 * @param lines 出力文字列一覧
 * @param treeStyle 使用するツリー文字セット
 * @param preset 使用するツリー文字セットの文字一覧
 */
function appendTree(
    node: TreeNode,
    indent: string,
    lines: string[],
    treeStyle: TreeStyle,
    preset: TreeStylePreset,
): void {
    // 子ノードを順番に出力する。
    node.children.forEach((child, index) => {
        // 最後の要素かどうかを判定する。
        const isLast = index === node.children.length - 1;

        // 表示するノード名を決定する。
        let nodeName: string;

        if (child.isDirectory) {
            nodeName = child.name + "/";
        } else if (child.isSymbolicLink) {
            nodeName = `${child.name} -> ${child.symbolicLinkTarget!}`;
        } else {
            nodeName = child.name;
        }

        // 現在のノードを出力する。
        if (treeStyle === TreeStyle.INDENT) {
            lines.push(indent + nodeName);
        } else {
            // 接続文字を決定する。
            const branch = isLast ? preset.lastBranch! : preset.branch!;
            lines.push(indent + branch + nodeName);
        }

        // ディレクトリの場合は子ノードを再帰的に出力する。
        if (child.isDirectory) {
            // 次の階層のインデントを決定する。
            const nextIndent = indent + (isLast ? preset.lastIndent : preset.indent);
            appendTree(child, nextIndent, lines, treeStyle, preset);
        }
    });
}
