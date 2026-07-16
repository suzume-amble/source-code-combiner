import * as fs from "node:fs/promises";
import * as path from "node:path";
import { IgnoreFilter } from "./ignoreFilter";

/**
 * 指定されたディレクトリの .gitignore を読み込み、
 * IgnoreFilterへルールを追加する。
 *
 * .gitignore が存在しない場合は何もしない。
 *
 * @param directoryPath ディレクトリの絶対パス
 * @param filter 追加先のIgnoreFilter
 */
export async function loadGitIgnore(directoryPath: string, filter: IgnoreFilter): Promise<void> {
    // .gitignoreの絶対パスを生成する。
    const gitignorePath = path.join(directoryPath, ".gitignore");

    try {
        // .gitignoreを読み込む。
        const content = await fs.readFile(gitignorePath, "utf-8");

        // 行単位でルールを追加する。
        const rules = content
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        filter.add(rules);
    } catch {
        // .gitignoreが存在しない場合は何もしない。
    }
}
