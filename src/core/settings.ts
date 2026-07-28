import * as vscode from "vscode";
import * as path from "node:path";

import { TreeStyle } from "./directoryTreeStyle";

/**
 * Source Code Combinerで使用する設定。
 *
 * settings.jsonから取得した値を妥当性確認・正規化し、
 * 実際の処理でそのまま使用できる形で保持する。
 */
export interface SourceCodeCombinerSettings {
    // 拡張子以外で結合対象とするファイル名一覧。
    additionalFileNames: string[];

    // 結合対象ファイル種別一覧。
    // キーは拡張子、値はMarkdownコードフェンスへ出力する
    // 言語名を表す。
    fileTypes: Record<string, string>;

    // 出力するMarkdownファイル名。
    outputFileName: string;

    // 実際にMarkdownを保存するディレクトリ。
    outputDirectoryPath: string;

    // ディレクトリツリーで使用する文字セット。
    treeStyle: TreeStyle;

    // 上書き確認を行うかどうか。
    confirmOverwrite: boolean;

    // 出力サイズ警告を表示するしきい値(Byte)。
    warnOnSize: number;
}

/**
 * loadSettings()で返されるエラー種別。
 */
export enum LoadSettingsError {
    // 結合対象ファイル種別一覧の設定が不正。
    INVALID_FILE_TYPES,
    // ディレクトリツリー文字セットの設定が不正。
    INVALID_TREE_STYLE,
    // 出力サイズ警告しきい値の設定が不正。
    INVALID_SIZE_THRESHOLD,
}

/**
 * loadSettings() 成功時の戻り値。
 */
export interface LoadSettingsSuccess {
    success: true;
    settings: SourceCodeCombinerSettings;
}

/**
 * loadSettings() 失敗時の戻り値。
 */
export interface LoadSettingsFailure {
    success: false;
    error: LoadSettingsError;
    detail?: string;
}

/**
 * loadSettings()の戻り値。
 *
 * settings.jsonの読み込み結果を表す。
 */
export type LoadSettingsResult = LoadSettingsSuccess | LoadSettingsFailure;

/**
 * settings.jsonから設定を読み込み、
 * 妥当性確認・正規化を行う。
 *
 * @param commandDirectory コマンドを実行したディレクトリ
 * @returns 設定。不正な設定がある場合はnull
 */
export function loadSettings(commandDirectory: string): LoadSettingsResult {
    // VSCodeの設定を取得する。
    const config = vscode.workspace.getConfiguration("sourceCodeCombiner");

    // settings.jsonから追加対象ファイル名一覧を取得する。
    const additionalFileNames = config.get<string[]>("targetFiles.additionalFileNames")!;

    // settings.jsonから結合対象ファイル種別一覧を取得する。
    const fileTypes = config.get<Record<string, string>>("targetFiles.fileTypes")!;

    // 結合対象ファイル種別一覧の妥当性を確認し、
    // 処理で使用できる形式へ正規化する。
    const normalizedFileTypes = normalizeFileTypes(fileTypes);
    if (normalizedFileTypes === null) {
        return {
            success: false,
            error: LoadSettingsError.INVALID_FILE_TYPES,
        };
    }

    // settings.jsonから出力ファイル名を取得する。
    const outputFileName = config.get<string>("outputFile.name")!;

    // settings.jsonから出力先ディレクトリを取得する。
    const outputDirectory = config.get<string>("outputFile.directory")!;

    // 出力先ディレクトリのディレクトリ区切り文字を正規化する。
    const normalizedOutputDirectory = outputDirectory.trim().replace(/[\\/]+/g, path.sep);

    // 実際の出力先ディレクトリを決定する。
    let outputDirectoryPath: string;
    if (normalizedOutputDirectory.length === 0) {
        // 従来どおりコマンド実行ディレクトリへ出力する。
        outputDirectoryPath = commandDirectory;
    } else if (path.isAbsolute(normalizedOutputDirectory)) {
        // 絶対パスが指定されているため、そのディレクトリへ出力する。
        outputDirectoryPath = normalizedOutputDirectory;
    } else {
        // 相対パスはワークスペースルートからの相対パスとして扱う。
        const workspaceRoot = vscode.workspace.workspaceFolders![0].uri.fsPath;
        outputDirectoryPath = path.join(workspaceRoot, normalizedOutputDirectory);
    }

    // settings.jsonからディレクトリツリー文字セット名を取得する。
    const treeStyleConfig = config.get<string>("outputFile.treeStyle")!;

    // ディレクトリツリー文字セット名を正規化・妥当性確認する。
    const treeStyle = normalizeTreeStyle(treeStyleConfig);
    if (treeStyle === null) {
        return {
            success: false,
            error: LoadSettingsError.INVALID_TREE_STYLE,
            detail: treeStyleConfig,
        };
    }

    // settings.jsonから上書き確認を行うかどうかを取得する。
    const confirmOverwrite = config.get<boolean>("outputFile.confirmOverwrite")!;

    // settings.jsonから出力サイズ警告に使うしきい値を取得する。
    const warnOnSizeConfig = config.get<string>("outputFile.warningThreshold")!;

    // 出力サイズ警告に使うしきい値を設定する。
    const warnOnSize = parseToBytes(warnOnSizeConfig);
    if (warnOnSize === null) {
        return {
            success: false,
            error: LoadSettingsError.INVALID_SIZE_THRESHOLD,
            detail: warnOnSizeConfig,
        };
    }

    return {
        success: true,
        settings: {
            additionalFileNames,
            fileTypes: normalizedFileTypes,
            outputFileName,
            outputDirectoryPath,
            treeStyle,
            confirmOverwrite,
            warnOnSize,
        },
    };
}

/**
 * settings.jsonから取得した結合対象ファイル種別一覧を
 * 妥当性確認し、処理で使用できる形式へ正規化する。
 *
 * 拡張子は前後の空白除去と小文字化を行い、
 * Markdown言語は前後の空白を除去する。
 *
 * @param fileTypes settings.jsonから取得した結合対象ファイル種別一覧
 * @returns 正規化後の結合対象ファイル種別一覧。不正な設定がある場合はnull
 */
function normalizeFileTypes(fileTypes: Record<string, string>): Record<string, string> | null {
    // Object以外は不正とする。
    if (typeof fileTypes !== "object" || fileTypes === null || Array.isArray(fileTypes)) {
        return null;
    }

    const normalizedFileTypes: Record<string, string> = {};

    // すべての設定について妥当性確認と正規化を行う。
    for (const [extension, markdownLanguage] of Object.entries(fileTypes)) {
        // 前後の空白を除去し、拡張子は小文字へ統一する。
        const normalizedExtension = extension.trim().toLowerCase();
        const normalizedMarkdownLanguage = markdownLanguage.trim();

        // 拡張子は空文字列ではなく、「.」から始まる必要がある。
        if (normalizedExtension.length === 0 || !normalizedExtension.startsWith(".")) {
            return null;
        }

        // Markdown言語は空文字列ではなく、
        // 改行やバッククォートを含めることはできない。
        if (
            normalizedMarkdownLanguage.length === 0 ||
            /[\r\n]/.test(normalizedMarkdownLanguage) ||
            normalizedMarkdownLanguage.includes("`")
        ) {
            return null;
        }

        normalizedFileTypes[normalizedExtension] = normalizedMarkdownLanguage;
    }

    return normalizedFileTypes;
}

/**
 * settings.jsonから取得したディレクトリツリー文字セットを
 * 妥当性確認し、TreeStyleへ変換する。
 *
 * 前後の空白を除去し、大文字・小文字を区別せず判定する。
 *
 * @param treeStyle settings.jsonから取得した文字列
 * @returns TreeStyle。不正な設定の場合はnull
 */
function normalizeTreeStyle(treeStyle: string): TreeStyle | null {
    const normalizedTreeStyle = treeStyle.trim().toLowerCase();

    for (const value of Object.values(TreeStyle)) {
        if (normalizedTreeStyle === value) {
            return value;
        }
    }

    return null;
}

/**
 * ファイルサイズの単位と倍率の対応表。
 *
 * settings.jsonで指定された容量文字列を
 * バイト数へ変換するために使用する。
 */
const UNIT_MULTIPLIERS: Record<string, number> = {
    "": 1, // 単位なし
    B: 1,
    KB: 1000,
    MB: 1000 ** 2,
    GB: 1000 ** 3,
    KIB: 1024,
    MIB: 1024 ** 2,
    GIB: 1024 ** 3,
};

/**
 * 容量を表す文字列（例: "100MB", "100MiB"）をバイト数に変換する
 * @param sizeStr 変換したい文字列
 * @returns バイト数（パース失敗時は null）
 */
function parseToBytes(sizeStr: string): number | null {
    // 構造のチェックと分解
    const match = sizeStr.trim().match(/^([\d.]+)\s*([a-zA-Z]*)$/);
    if (!match) {
        return null;
    }

    // 単位の正規化とバリデーション（ここで不正な単位を即座に弾く）
    const unit = (match[2] || "").toUpperCase();
    if (!(unit in UNIT_MULTIPLIERS)) {
        return null;
    }

    // 安全な状態になってから数値をパースして計算
    const value = parseFloat(match[1]);
    if (isNaN(value)) {
        return null;
    }

    return value * UNIT_MULTIPLIERS[unit];
}
