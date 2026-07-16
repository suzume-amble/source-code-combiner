export interface FileInfo {
    /** 絶対パス */
    absolutePath: string;

    /** ルートからの相対パス */
    relativePath: string;

    /** ファイル名 */
    name: string;

    /** ファイル拡張子（例: ".ts"、".md"） */
    extension: string;

    /** ファイルサイズ(Byte) */
    size: number;
}
