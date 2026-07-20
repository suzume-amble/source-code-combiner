import * as vscode from "vscode";
import * as path from "node:path";
import * as fs from "node:fs/promises";

import * as msg from "./messages";
import { confirmEstimatedSize, confirmCreateDirectory, confirmOverwrite } from "./dialogs";

import { loadSettings, LoadSettingsError } from "../core/settings";
import { createIgnoreFilter } from "../core/gitignore";
import { collectFiles } from "../core/collectFiles";
import { estimateOutputSize } from "../core/estimateOutputSize";
import { createDirectoryTree } from "../core/directoryTree";
import { generateMarkdown } from "../core/markdownGenerator";

/**
 * Code Combinerのメイン処理を実行する。
 *
 * エクスプローラーの右クリックメニューまたは
 * ビュータイトルのアイコンから呼び出され、
 * 対象ディレクトリ配下のソースファイル収集以降の
 * 一連の処理を制御する。
 *
 * @param uri 処理対象ディレクトリ。未指定の場合はワークスペースルートを使用する。
 */
export async function combineCommand(uri?: vscode.Uri): Promise<void> {
    // 対象フォルダを決定する。
    if (!uri) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        // ワークスペースが開かれていない場合はエラー
        if (!workspaceFolder) {
            vscode.window.showErrorMessage(msg.ERR_NO_WORKSPACE);
            return;
        }
        uri = workspaceFolder.uri;
    }

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: msg.PROGRESS_TITLE,
            cancellable: false,
        },
        async (progress) => {
            progress.report({
                message: msg.PROGRESS_LOADING_CONFIG,
            });

            // settings.jsonから設定を読み込み、
            // 妥当性確認・正規化を行う。
            const result = loadSettings(uri.fsPath);
            if (!result.success) {
                switch (result.error) {
                    case LoadSettingsError.INVALID_FILE_TYPES:
                        vscode.window.showErrorMessage(msg.ERR_INVALID_FILE_TYPES);
                        return;
                    case LoadSettingsError.INVALID_TREE_STYLE:
                        const treeStyle = result.detail ?? "[Directory Tree Style] Undefined Value";
                        vscode.window.showErrorMessage(msg.ERR_INVALID_TREE_STYLE(treeStyle));
                        return;
                    case LoadSettingsError.INVALID_SIZE_THRESHOLD:
                        const sizeThreshold =
                            result.detail ?? "[Invalid Size Threshold] Undefined Value";
                        vscode.window.showErrorMessage(
                            msg.ERR_INVALID_SIZE_THRESHOLD(sizeThreshold),
                        );
                        return;
                }
            }
            const settings = result.settings;

            progress.report({
                message: msg.PROGRESS_COLLECTING_FILES,
            });

            // ワークスペースルートを取得する。
            const workspaceRoot = vscode.workspace.getWorkspaceFolder(uri)!.uri.fsPath;

            // ワークスペースルートからコマンド実行ディレクトリまでの
            // .gitignoreを読み込み、初期IgnoreFilterを生成する。
            const ignoreFilter = await createIgnoreFilter(workspaceRoot, uri.fsPath);

            // ファイル一覧を収集する。
            const files = await collectFiles(
                uri.fsPath,
                settings.additionalFileNames,
                settings.fileTypes,
                settings.outputFileName,
                ignoreFilter,
            );

            progress.report({
                message: msg.PROGRESS_ESTIMATING_SIZE,
            });

            // 出力されるMarkdownファイルのおおよそのサイズを推定する。
            const estimatedSize = estimateOutputSize(files);

            // 推定サイズがwarnOnSizeを超える場合は、
            // 大きなMarkdownが生成される可能性があるため
            // ユーザーへ続行確認を行う。
            if (estimatedSize > settings.warnOnSize) {
                const proceed = await confirmEstimatedSize(estimatedSize);
                // キャンセルが選択された場合は処理を終了する。
                if (!proceed) {
                    return;
                }
            }

            progress.report({
                message: msg.PROGRESS_GENERATING_TREE,
            });

            // ディレクトリツリーを生成する。
            const rootDirectoryName = path.basename(uri.fsPath);
            const directoryTree = createDirectoryTree(rootDirectoryName, files, settings.treeStyle);

            progress.report({
                message: msg.PROGRESS_GENERATING_MARKDOWN,
            });

            // ディレクトリツリーとソースコードからMarkdownを生成する。
            const markdown = await generateMarkdown(
                rootDirectoryName,
                directoryTree,
                files,
                settings.fileTypes,
            );

            progress.report({
                message: msg.PROGRESS_SAVING_MARKDOWN,
            });

            // Markdownファイルの出力先を決定する。
            const outputPath = path.join(settings.outputDirectoryPath, settings.outputFileName);

            // 必要に応じて出力先ディレクトリの作成確認を行う。
            const createDirectory = await confirmCreateDirectory(settings.outputDirectoryPath);
            // 作成がキャンセルされた場合は処理を終了する。
            if (!createDirectory) {
                return;
            }

            // 出力先ディレクトリが存在しない場合は作成する。
            await fs.mkdir(settings.outputDirectoryPath, {
                recursive: true,
            });

            // 既存ファイルの上書き確認を行う。
            const overwrite = await confirmOverwrite(outputPath, settings.confirmOverwrite);
            // 上書きがキャンセルされた場合は処理を終了する。
            if (!overwrite) {
                return;
            }

            // 生成したMarkdownをUTF-8で保存する。
            await fs.writeFile(outputPath, markdown, "utf8");

            vscode.window.showInformationMessage(
                msg.INFO_SUCCESS_GENERATED(settings.outputFileName),
            );
        },
    );
}
