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
 * シンボリックリンクはディレクトリツリーのみに出力し、
 * ソースコード一覧には出力しない。
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
        // シンボリックリンクはディレクトリツリーのみへ出力する。
        if (file.isSymbolicLink) {
            continue;
        }

        // ソースコードのタイトルに使うパスを生成する。
        const displayPath =
            file.relativePath === ""
                ? rootDirectoryName
                : `${rootDirectoryName}${path.sep}${file.relativePath}`;

        // Markdown出力用のパスへ変換する。
        // パス区切り文字は実行OSにかかわらず「/」を使用する。
        const markdownDisplayPath = displayPath.replaceAll(path.sep, "/");

        let source = "";
        let language = "";

        try {
            // UTF-8として読み込み、必要に応じてUTF-8 BOMを除去する。
            source = await fs.readFile(file.absolutePath, "utf8");
            source = removeBom(source);

            // 拡張子からMarkdownの言語識別子を取得する。
            language = fileTypes[file.extension] ?? "";
        } catch (error) {
            // エラーが発生した場合はエラーコードを除去して出力する
            source = formatErrorMessage(error);

            // エラー内容はプレーンテキストとして出力する
            language = "text";
        }

        // ソースコード中のバッククォート数を調べ、安全なコードフェンスを生成する。
        const fence = createFence(source);

        parts.push("\n");
        parts.push(FILE_HEADING_PREFIX);
        parts.push(markdownDisplayPath);
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

/**
 * エラーオブジェクトからエラーコードを取り除いた純粋なメッセージを取得する。
 *
 * Node.js のシステムエラー message（例: "ENOENT: no such file or directory, ..."）から
 * 先頭のエラーコード部分を取り除きます。
 *
 * @param error 発生したエラー
 * @returns 整形後のエラーメッセージ
 */
function formatErrorMessage(error: unknown): string {
    if (!(error instanceof Error)) {
        return "Error reading file.";
    }

    let message = error.message;
    const code = (error as { code?: string }).code;

    // エラーメッセージからエラーコード部分を除去
    if (typeof code === "string" && message.startsWith(`${code}:`)) {
        // エラーコードと区切り文字（":"）を除去し、先頭の余分な空白をトリムする
        message = message.slice(code.length + 1).trimStart();
    }

    return `Error reading file:\n${message}`;
}
