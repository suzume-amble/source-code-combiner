import { FileInfo } from "./fileInfo";

/**
 * 出力されるMarkdownファイルのおおよそのサイズを推定する。
 *
 * ファイルサイズに加えて、Markdownとして自動生成される
 * ヘッダーやコードブロックなどの文字数も加算する。
 *
 * @param files 対象ファイル一覧
 * @returns 推定サイズ(Byte)
 */
export function estimateOutputSize(files: readonly FileInfo[]): number {
    let totalSize = 0;

    // ディレクトリツリーの見出しとコードブロック分を加算する。
    totalSize += "# Directory Tree\n\n".length;
    totalSize += "```text\n".length;
    totalSize += "```\n\n".length;

    // 各ファイルについて、ソースコード本体とMarkdownとして
    // 自動生成される文字列のサイズを加算する。
    for (const file of files) {
        // ソースコード本体のサイズを加算する。
        totalSize += file.size;

        // ファイルヘッダーのサイズを加算する。
        // 「# 相対パス」と、その後ろの空行を想定する。
        totalSize += "# ".length;
        totalSize += file.relativePath.length;
        totalSize += "\n\n".length;

        // コードブロック開始行のサイズを加算する。
        // 言語名は拡張子によって変わるため、概算として
        // 平均的な長さを見込んで加算する。
        totalSize += "```typescript\n".length;

        // コードブロック終了行と末尾の空行を加算する。
        totalSize += "```\n\n".length;

        // ディレクトリツリーへ出力される1行分を概算で加算する。
        totalSize += file.relativePath.length;
        totalSize += "\n".length;
    }

    return totalSize;
}
