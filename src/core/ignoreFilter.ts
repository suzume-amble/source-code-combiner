import ignore, { Ignore } from "ignore";

/**
 * ignoreライブラリのラッパークラス
 *
 * 追加したルールを保持することで、安全にクローンを作成できる。
 */
export class IgnoreFilter {
    /** 追加したルール一覧 */
    private readonly _rules: string[];

    /** ignoreライブラリのインスタンス */
    private readonly _instance: Ignore;

    /**
     * コンストラクタ
     *
     * @param rules 初期ルール一覧
     */
    constructor(rules: readonly string[] = []) {
        this._rules = [...rules];
        this._instance = ignore();

        if (this._rules.length > 0) {
            this._instance.add(this._rules);
        }
    }

    /**
     * フィルタのクローンを作成する。
     *
     * @returns クローンしたフィルタ
     */
    public clone(): IgnoreFilter {
        return new IgnoreFilter(this._rules);
    }

    /**
     * 除外ルールを追加する。
     *
     * @param rules 追加するルール
     * @returns 自身
     */
    public add(rules: string | readonly string[]): this {
        const newRules = Array.isArray(rules) ? [...rules] : [rules];

        this._rules.push(...newRules);
        this._instance.add(newRules);

        return this;
    }

    /**
     * 指定されたパスが除外対象か判定する。
     *
     * @param path ルートディレクトリからの相対パス
     * @returns 除外対象ならtrue
     */
    public ignores(path: string): boolean {
        return this._instance.ignores(path);
    }

    /**
     * 登録されているルール一覧を取得する。
     */
    public get rules(): readonly string[] {
        return this._rules;
    }
}
