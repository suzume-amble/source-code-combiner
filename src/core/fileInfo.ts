/**
 * Source Code Combinerで使用するファイル情報。
 *
 * 通常ファイルおよびシンボリックリンクの情報を保持する。
 *
 * シンボリックリンクの場合は以下の値となる。
 * - size は 0
 * - isSymbolicLink は true
 * - symbolicLinkTarget にリンク先を保持する
 */
export interface FileInfo {
    /**
     * ファイルまたはシンボリックリンクの絶対パス
     */
    absolutePath: string;

    /**
     * 基準ディレクトリからの相対パス
     */
    relativePath: string;

    /**
     * ファイル名
     */
    name: string;

    /**
     * ファイル拡張子（例: ".ts"、".md"）
     *
     * 拡張子が存在しない場合は空文字列。
     */
    extension: string;

    /**
     * ファイルサイズ（Byte）
     *
     * シンボリックリンクの場合は 0。
     */
    size: number;

    /**
     * シンボリックリンクかどうか
     */
    isSymbolicLink: boolean;

    /**
     * シンボリックリンクのリンク先
     *
     * 通常ファイルの場合は undefined。
     * readlink() が返すリンク先のパスを保持する。
     */
    symbolicLinkTarget?: string;
}
