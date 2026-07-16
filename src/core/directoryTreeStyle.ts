/**
 * ディレクトリツリーで使用する文字セット名。
 */
export enum TreeStyle {
    PIPE = "pipe",
    UNICODE = "unicode",
    HEAVY = "heavy",
    PLUS = "plus",
    INDENT = "indent",
}

/**
 * 指定されたツリー文字セットで使用する文字一覧。
 *
 * Indentスタイルでは接続文字を使用しないため、
 * branch系の文字列は空文字列となる。
 */
export interface TreeStylePreset {
    /** 通常ノードの接続文字 */
    branch?: string;

    /** 最終ノードの接続文字 */
    lastBranch?: string;

    /** 通常ノードのインデント */
    indent: string;

    /** 最終ノードのインデント */
    lastIndent: string;
}

/**
 * ツリー文字セット一覧。
 *
 * settings.jsonで指定されたTreeStyleに応じて、
 * 使用する接続文字・インデント文字列を切り替える。
 */
export const TREE_STYLE_PRESETS: Record<TreeStyle, TreeStylePreset> = {
    [TreeStyle.PIPE]: {
        branch: "|-- ",
        lastBranch: "`-- ",
        indent: "|   ",
        lastIndent: "    ",
    },
    [TreeStyle.UNICODE]: {
        branch: "├── ",
        lastBranch: "└── ",
        indent: "│   ",
        lastIndent: "    ",
    },
    [TreeStyle.HEAVY]: {
        branch: "┣━━ ",
        lastBranch: "┗━━ ",
        indent: "┃   ",
        lastIndent: "    ",
    },
    [TreeStyle.PLUS]: {
        branch: "+-- ",
        lastBranch: "\\-- ",
        indent: "|   ",
        lastIndent: "    ",
    },
    [TreeStyle.INDENT]: {
        indent: "  ",
        lastIndent: "  ",
    },
};
