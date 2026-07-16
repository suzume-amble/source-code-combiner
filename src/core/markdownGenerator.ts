import * as fs from "node:fs/promises";
import * as path from "node:path";

import { FileInfo } from "./fileInfo";

/** ディレクトリツリーの見出し */
const DIRECTORY_TREE_HEADING = "# Directory Tree";

/** ディレクトリツリーのコードブロック開始 */
const DIRECTORY_TREE_FENCE = "```text";

/** ファイル見出しのプレフィックス */
const FILE_HEADING_PREFIX = "# ";

/**
 * ディレクトリツリーとソースコード一覧からMarkdownを生成する。
 *
 * @param directoryTree ディレクトリツリー
 * @param files 結合対象ファイル一覧
 * @param fileTypes 拡張子とMarkdown言語識別子の対応表
 * @returns 生成したMarkdown
 */
export async function generateMarkdown(
    rootDirectoryName: string,
    directoryTree: string,
    files: FileInfo[],
    fileTypes: Readonly<Record<string, string>>,
): Promise<string> {
    const parts: string[] = [];

    // ディレクトリツリーをMarkdownの先頭へ追加する。
    parts.push(DIRECTORY_TREE_HEADING);
    parts.push("\n\n");
    parts.push(DIRECTORY_TREE_FENCE);
    parts.push("\n");
    parts.push(directoryTree);
    parts.push("```\n\n");

    // 対象ファイルを順番に読み込み、Markdownへ追加する。
    for (const file of files) {
        // ソースコードのタイトルに使うパスを生成する。
        const displayPath =
            file.relativePath === ""
                ? rootDirectoryName
                : `${rootDirectoryName}${path.sep}${file.relativePath}`;
        // UTF-8として読み込み、必要に応じてUTF-8 BOMを除去する。
        let source = await fs.readFile(file.absolutePath, "utf8");
        source = removeBom(source);

        // ソースコード中のバッククォート数を調べ、安全なコードフェンスを生成する。
        const fence = createFence(source);

        /// 拡張子からMarkdownの言語識別子を取得する。
        const language = fileTypes[file.extension] ?? "";

        parts.push("\n");
        parts.push(FILE_HEADING_PREFIX);
        parts.push(displayPath);
        parts.push("\n\n");
        parts.push(fence);
        parts.push(language);
        parts.push("\n");
        parts.push(source);

        // ソースコードが改行で終わっていない場合でも、
        // コードフェンスを必ず次の行から開始できるよう改行を補う。
        if (!source.endsWith("\n")) {
            parts.push("\n");
        }

        parts.push(fence);
        parts.push("\n");
    }

    return parts.join("");
}

/**
 * ソースコード中の最大連続バッククォート数を調べ、
 * Markdownが破綻しないコードフェンスを生成する。
 *
 * @param source ソースコード
 * @returns コードフェンス文字列
 */
function createFence(source: string): string {
    const matches = source.match(/`+/g);

    if (matches === null) {
        return "```";
    }

    let maxLength = 0;

    for (const match of matches) {
        if (match.length > maxLength) {
            maxLength = match.length;
        }
    }

    return "`".repeat(Math.max(3, maxLength + 1));
}

/**
 * UTF-8 BOM付きファイルを読み込んだ場合はBOMを除去する。
 *
 * @param text 読み込んだ文字列
 * @returns BOM除去後の文字列
 */
function removeBom(text: string): string {
    return text.startsWith("\uFEFF") ? text.slice(1) : text;
}
