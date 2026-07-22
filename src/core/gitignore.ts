import * as fs from "node:fs/promises";
import * as path from "node:path";

import { IgnoreFilter } from "./ignoreFilter";

/**
 * ワークスペースルートからコマンド実行ディレクトリまでの.gitignoreを読み込み、
 * 初期IgnoreFilterを生成する。
 *
 * 親ディレクトリのルールは子ディレクトリへ引き継がれるため、
 * ワークスペースルートから順番に各ディレクトリの.gitignoreを読み込む。
 *
 * @param workspaceRoot ワークスペースルートのディレクトリパス
 * @param commandDirectory コマンドを実行したディレクトリパス
 * @returns 初期化済みIgnoreFilter
 */
export async function createIgnoreFilter(
    workspaceRoot: string,
    commandDirectory: string,
): Promise<IgnoreFilter> {
    // IgnoreFilterを生成する。
    const filter = new IgnoreFilter();

    // コマンド実行ディレクトリまでの相対パスを取得する。
    const relativePath = path.relative(workspaceRoot, commandDirectory);

    // ワークスペースルートからコマンド実行ディレクトリまでの
    // 相対ディレクトリ名一覧を取得する。
    const directories = relativePath.split(path.sep).filter((directory) => directory.length > 0);

    // ワークスペースルートの.gitignoreを読み込む。
    await applyGitIgnore(workspaceRoot, filter);

    // ワークスペースルートからコマンド実行ディレクトリまで
    // 順番に.gitignoreを読み込む。
    let currentPath = workspaceRoot;

    for (const directory of directories) {
        currentPath = path.join(currentPath, directory);

        await applyGitIgnore(currentPath, filter);
    }

    return filter;
}

/**
 * 指定されたディレクトリの .gitignore を読み込み、
 * IgnoreFilterへルールを適用する。
 *
 * .gitignore が存在しない場合は何もしない。
 *
 * @param directoryPath .gitignoreを読み込むディレクトリパス
 * @param filter ルールを適用するIgnoreFilter
 */
export async function applyGitIgnore(directoryPath: string, filter: IgnoreFilter): Promise<void> {
    // .gitignoreの絶対パスを生成する。
    const gitignorePath = path.join(directoryPath, ".gitignore");

    try {
        // .gitignoreを読み込む。
        const content = await fs.readFile(gitignorePath, "utf-8");

        // 空行を除外してIgnoreFilterへルールを適用する。
        const rules = content.split(/\r?\n/).filter((line) => line.length > 0);

        filter.add(rules);
    } catch (error: unknown) {
        // .gitignoreが存在しない場合は読み飛ばす。
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
            throw error;
        }
    }
}
