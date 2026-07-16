import * as fs from "node:fs/promises";
import * as path from "node:path";

import { FileInfo } from "./fileInfo";
import { IgnoreFilter } from "./ignoreFilter";
import { loadGitIgnore } from "./gitignore";

/**
 * 常に除外するディレクトリ名一覧。
 */
const EXCLUDED_DIRECTORIES = new Set([".git", "node_modules", ".venv", "__pycache__"]);

/**
 * 指定されたディレクトリ配下のファイル一覧を再帰的に収集する。
 *
 * @param rootPath 収集開始ディレクトリ
 * @param additionalFileNames settings.jsonで追加指定されたファイル名一覧
 * @param fileTypes 結合対象ファイル種別一覧
 * @param outputFileName 出力するMarkdownファイル名
 * @param gitignoreFilter ルートディレクトリの.gitignoreフィルタ
 * @returns 収集したファイル一覧
 */
export async function collectFiles(
    rootPath: string,
    additionalFileNames: readonly string[],
    fileTypes: Readonly<Record<string, string>>,
    outputFileName: string,
    ignoreFilter: IgnoreFilter,
): Promise<FileInfo[]> {
    const files: FileInfo[] = [];

    await collectDirectory(
        rootPath,
        rootPath,
        additionalFileNames,
        fileTypes,
        outputFileName,
        ignoreFilter,
        files,
    );

    return files;
}

/**
 * 指定されたディレクトリを再帰的に走査し、
 * 結合対象となるファイル一覧を収集する。
 *
 * 親ディレクトリから引き継いだIgnoreFilterへ、
 * 現在のディレクトリの.gitignoreを追加しながら
 * Gitと同じルールで対象ファイルを判定する。
 *
 * @param rootPath 収集開始ディレクトリの絶対パス
 * @param currentPath 現在走査中のディレクトリの絶対パス
 * @param additionalFileNames settings.jsonで追加指定されたファイル名一覧
 * @param fileTypes 結合対象ファイル種別一覧
 * @param outputFileName 出力するMarkdownファイル名
 * @param ignoreFilter 現在のディレクトリに適用するIgnoreFilter
 * @param files 収集したファイル一覧
 */
async function collectDirectory(
    rootPath: string,
    currentPath: string,
    additionalFileNames: readonly string[],
    fileTypes: Readonly<Record<string, string>>,
    outputFileName: string,
    ignoreFilter: IgnoreFilter,
    files: FileInfo[],
): Promise<void> {
    // 親ディレクトリのIgnoreFilterを引き継ぐ。
    const currentIgnoreFilter = ignoreFilter.clone();

    // 現在のディレクトリの.gitignoreを読み込む。
    await loadGitIgnore(currentPath, currentIgnoreFilter);

    // 現在のディレクトリに含まれるファイル・ディレクトリ一覧を取得する。
    const entries = await fs.readdir(currentPath, {
        withFileTypes: true,
    });

    for (const entry of entries) {
        // エントリの絶対パスを生成する。
        const absolutePath = path.join(currentPath, entry.name);

        // ルートからの相対パスを取得する。
        // .gitignoreの判定やMarkdown出力で使用する。
        const relativePath = path.relative(rootPath, absolutePath);

        // ディレクトリの場合は再帰的に走査する。
        if (entry.isDirectory()) {
            // ベース除外ディレクトリは走査しない。
            if (EXCLUDED_DIRECTORIES.has(entry.name)) {
                continue;
            }

            // .gitignoreで除外されるディレクトリは走査しない。
            if (currentIgnoreFilter.ignores(relativePath)) {
                continue;
            }

            await collectDirectory(
                rootPath,
                absolutePath,
                additionalFileNames,
                fileTypes,
                outputFileName,
                currentIgnoreFilter,
                files,
            );

            continue;
        }

        // 通常ファイル以外は対象外とする。
        if (!entry.isFile()) {
            continue;
        }

        // 出力するMarkdownファイル自身は結合対象にしない。
        if (entry.name === outputFileName) {
            continue;
        }

        // .gitignoreで除外されるファイルは収集しない。
        if (currentIgnoreFilter.ignores(relativePath)) {
            continue;
        }

        // ファイル名が追加対象に登録されていれば結合対象とする。
        // ファイル名は大文字小文字を区別して比較する。
        if (!additionalFileNames.includes(entry.name)) {
            // ファイルの拡張子を取得する。
            const extension = path.extname(entry.name);

            // 結合対象ファイル種別一覧へ登録されている拡張子のみ結合対象とする。
            if (!(extension in fileTypes)) {
                continue;
            }
        }

        const stat = await fs.stat(absolutePath);

        files.push({
            absolutePath,
            relativePath: path.relative(rootPath, absolutePath),
            name: entry.name,
            extension: path.extname(entry.name),
            size: stat.size,
        });
    }
}
