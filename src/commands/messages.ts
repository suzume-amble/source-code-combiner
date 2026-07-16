import { l10n } from "vscode";

// --- エラー・完了通知メッセージ ---
// ワークスペースが開かれていません。
export const ERR_NO_WORKSPACE = l10n.t("No workspace folder is opened.");

// "結合対象ファイル種別一覧の設定が不正です。\n\n" +
// "拡張子は「.」で始まる文字列、Markdown言語は改行・バッククォートを含まない文字列を指定してください。"
export const ERR_INVALID_FILE_TYPES = l10n.t(
    `The target file types configuration is invalid.\n\nExtensions must start with '.' and Markdown languages must not contain newlines or backticks.`,
);

// `ディレクトリツリー文字セットの設定が不正です。(${treeStyle})\n\n
// 使用可能な値: pipe, unicode, heavy, plus, indent`
export function ERR_INVALID_TREE_STYLE(value: string): string {
    return l10n.t(
        "The directory tree style is invalid. ({0})\n\nAvailable values: pipe, unicode, heavy, plus, indent",
        value,
    );
}

// `出力サイズ警告しきい値の形式が不正です。(${warnOnSizeConfig})\n\n例: "10MB", "512KiB", "1024"`
export function ERR_INVALID_SIZE_THRESHOLD(value: string): string {
    return l10n.t(
        `The output size threshold format is invalid. ({0})\n\nExample: "10MB", "512KiB", "1024"`,
        value,
    );
}

// `${outputFileName} を出力しました。`
export function INFO_SUCCESS_GENERATED(value: string): string {
    return l10n.t("Successfully generated {0}.", value);
}

// --- プログレスバー関連 ---
export const PROGRESS_TITLE = l10n.t("Combining source files"); // ソースファイルの結合
export const PROGRESS_LOADING_CONFIG = l10n.t("Loading configuration..."); // 設定を読み込み中...
export const PROGRESS_COLLECTING_FILES = l10n.t("Collecting target files..."); // 対象ファイルを収集中...
export const PROGRESS_ESTIMATING_SIZE = l10n.t("Estimating output size..."); // 出力サイズを推定中...
export const PROGRESS_GENERATING_TREE = l10n.t("Generating directory tree..."); // ディレクトリツリーを生成中...
export const PROGRESS_GENERATING_MARKDOWN = l10n.t("Generating Markdown..."); // Markdownを生成中...
export const PROGRESS_SAVING_MARKDOWN = l10n.t("Saving Markdown..."); // Markdownを保存中...

// --- ダイアログのボタン名 ---
//export const BTN_CANCEL = l10n.t("Cancel"); // キャンセル
export const BTN_PROCEED = l10n.t("Proceed"); // 続行
export const BTN_CREATE = l10n.t("Create"); // 作成
export const BTN_OVERWRITE = l10n.t("Overwrite"); // 上書き

// --- 出力サイズ警告ダイアログ関連 ---
// 推定される出力サイズは ${formatFileSize(estimatedSize)} です。\n\n
// 続行しますか？
export function WARN_ESTIMATED_SIZE(value: string): string {
    return l10n.t(`The estimated output size is {0}.\n\nDo you want to proceed?`, value);
}

// --- 新規ディレクトリ作成確認ダイアログ関連 ---
// 次のディレクトリは存在しません。\n\n
// `${directoryPath}\n\n`
// 作成しますか？
export function WARN_CREATE_DIRECTORY(value: string): string {
    return l10n.t(
        "The following directory does not exist.\n\n{0}\n\nDo you want to create it?",
        value,
    );
}

// --- 上書き確認ダイアログ関連 ---
// `${path.basename(outputPath)} は既に存在します。\n\n
// 上書きしますか？`
export function WARN_FILE_EXISTS(value: string): string {
    return l10n.t(`'{0}' already exists.\n\nDo you want to overwrite it?`, value);
}
