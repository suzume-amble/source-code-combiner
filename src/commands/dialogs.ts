import * as vscode from "vscode";
import * as path from "node:path";
import * as fs from "node:fs/promises";

import * as msg from "./messages";

/**
 * 推定される出力サイズがしきい値を超えた場合に、
 * 処理を続行するかどうかをユーザーへ確認する。
 *
 * @param estimatedSize 推定される出力サイズ(Byte)
 * @returns 続行する場合はtrue、キャンセルされた場合はfalse
 */
export async function confirmEstimatedSize(estimatedSize: number): Promise<boolean> {
    const result = await vscode.window.showWarningMessage(
        msg.WARN_ESTIMATED_SIZE(formatFileSize(estimatedSize)),
        {
            modal: true,
        },
        msg.BTN_PROCEED,
    );

    return result === msg.BTN_PROCEED;
}

/**
 * 必要に応じて出力先ディレクトリの作成確認を行う。
 *
 * 出力先ディレクトリが存在しない場合のみ
 * ユーザーへ確認ダイアログを表示する。
 *
 * @param directoryPath 出力先ディレクトリ
 * @returns 作成して続行する場合はtrue、キャンセルされた場合はfalse
 */
export async function confirmCreateDirectory(directoryPath: string): Promise<boolean> {
    // 出力先ディレクトリが存在する場合は、そのまま保存を続行する。
    try {
        await fs.access(directoryPath);
        return true;
    } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code !== "ENOENT") {
            throw error;
        }
    }

    // 出力先ディレクトリが存在しないため、作成確認を行う。
    const result = await vscode.window.showWarningMessage(
        msg.WARN_CREATE_DIRECTORY(directoryPath),
        {
            modal: true,
        },
        msg.BTN_CREATE,
    );

    return result === msg.BTN_CREATE;
}

/**
 * 必要に応じて既存ファイルの上書き確認を行う。
 *
 * 出力ファイルが存在し、上書き確認が有効な場合のみ
 * ユーザーへ確認ダイアログを表示する。
 *
 * @param outputPath 出力ファイルパス
 * @param confirmOverwrite 上書き確認を行うかどうか
 * @returns 保存を続行する場合はtrue、キャンセルされた場合はfalse
 */
export async function confirmOverwrite(
    outputPath: string,
    confirmOverwrite: boolean,
): Promise<boolean> {
    // 上書き確認が無効な場合は、そのまま保存を続行する。
    if (!confirmOverwrite) {
        return true;
    }

    // 出力ファイルが存在しない場合は、そのまま保存を続行する。
    try {
        await fs.access(outputPath);
    } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code === "ENOENT") {
            return true;
        }

        throw error;
    }

    // 出力ファイルが存在するため、上書き確認を行う。
    const result = await vscode.window.showWarningMessage(
        msg.WARN_FILE_EXISTS(path.basename(outputPath)),
        {
            modal: true,
        },
        msg.BTN_OVERWRITE,
    );

    return result === msg.BTN_OVERWRITE;
}

/**
 * バイト数をユーザー向けの表示文字列へ変換する。
 *
 * 推定出力サイズを警告ダイアログへ表示するために使用する。
 *
 * @param size バイト数
 * @returns フォーマット済みサイズ
 */
function formatFileSize(size: number): string {
    if (size < 1_000) {
        return `${size} B`;
    }

    if (size < 1_000_000) {
        return `${(size / 1_000).toFixed(1)} KB`;
    }

    return `${(size / 1_000_000).toFixed(1)} MB`;
}
