# Source Code Combiner

[English](README.md) | 日本語

Source Code Combiner は、Visual Studio Code のエクスプローラーからディレクトリ内のソースコードを収集し、AIへの入力用に最適化された1つの Markdown ファイルとして出力する拡張機能です。
ソースコードだけでなく、ディレクトリ構造やファイルパスも Markdown に出力するため、AI への入力だけでなく、コードレビューやソースコード共有などにも利用できます。
完全にローカル環境で動作し、Git の仕様に厳密に準拠した多階層 `.gitignore` の動的解析・除外機能を備えています。

## ✨ 主な特徴
- **コンテキストメニューからの簡単実行**
  * エクスプローラーからディレクトリを選択して Markdown を生成
  * 特定サブディレクトリを選択して Markdown を生成
- **自動ディレクトリツリー生成**
  * ディレクトリ構造をツリー形式で出力
  * シンボリックリンクを `名前 -> リンク先` の形式で表示（リンク先の中身は探索・結合の対象外）
- **適切な Markdown の生成**
  * ソースコードをファイル単位で Markdown のコードブロックとして出力
  * ファイル拡張子ごとに適切な Markdown の言語識別子を付与
  * Markdown が壊れないようコードフェンス長を自動調整
- **`.gitignore` を考慮した対象ファイルの収集**
  * Git の仕様に準拠した多階層 `.gitignore` を動的に解析
- **一般的な不要ディレクトリ・出力ファイルを自動除外**
  * `.git`、`node_modules`、`.venv`、`__pycache__`、生成した Markdown ファイルを自動除外
- **安全でカスタマイズ可能な出力処理**
  * 出力対象のファイル拡張子を設定可能
  * 拡張子に依存しない追加ファイル名を設定可能
  * 出力先ディレクトリを設定可能
  * 出力ファイル名を設定可能
  * 推定出力サイズが設定値を超える場合に確認ダイアログを表示
  * 出力ファイルの上書き確認を設定可能
  * 複数のディレクトリツリー表示形式に対応

## 📦 インストール方法

### マーケットプレイスからインストール
1.  Visual Studio Code を起動します。
2.  「拡張機能」ビューを開きます（`Ctrl+Shift+X` または `Cmd+Shift+X`）。
3.  検索バーに `Source Code Combiner` と入力します。
4.  「インストール」ボタンをクリックします。

### VSIX からインストール
1.  GitHubのリリースページ等から `.vsix` ファイルをダウンロードします。
2.  VSCodeの「拡張機能」ビューを開きます。
3.  ビュー右上にある「...」（その他の操作）をクリックし、「VSIX からインストール...」を選択します。
4.  ダウンロードした `.vsix` ファイルを選択してインストールします。

## 🚀 使い方

以下のいずれかの方法で実行できます。

*   **コンテキストメニューから実行**: VSCodeのエクスプローラー上で、結合したいディレクトリを右クリックし、「ソースファイルを結合 (Markdown)」を選択します。
*   **アイコンから実行**: サイドバーのエクスプローラーにあるプロジェクト名の横に表示される専用アイコンをクリックして実行します。
*   **完了後の確認**: 処理完了後、指定されたディレクトリ（デフォルトは実行したディレクトリ直下）に `combined_code.md` が生成されます。

## 📝 出力ファイル例

生成されるファイルは以下のような構造になります。
````markdown
# Directory Tree
```text
src/
|-- commands/
|   |-- combineCommand.ts
|   |-- dialogs.ts
|   `-- messages.ts
|-- core/
|   |-- collectFiles.ts
|   |-- directoryTree.ts
|   |-- directoryTreeStyle.ts
|   |-- estimateOutputSize.ts
|   |-- fileInfo.ts
|   |-- gitignore.ts
|   |-- ignoreFilter.ts
|   |-- markdownGenerator.ts
|   `-- settings.ts
|-- extension.ts
|-- lib/ -> /usr/local/lib
`-- test/
    `-- extension.test.ts
```

# src/commands/combineCommand.ts
```typescript
import * as vscode from "vscode";
import * as path from "node:path";
import * as fs from "node:fs/promises";
// ソースコード
```
・・・
````

## 📄 収集対象となる拡張子

デフォルトでは、主要なプログラミング言語、マークアップ言語、および設定ファイルが出力対象です。

- プログラミング言語: Dart、TypeScript、JavaScript、Python、Java、C/C++、C#、Go、Rust、PHP、Ruby、Swift、Kotlin
- マークアップ: HTML、CSS、Markdown
- 設定ファイル: JSON、YAML、TOML
- スクリプト: Shell、PowerShell、Batch

出力対象のファイル拡張子は `sourceCodeCombiner.targetFiles.fileTypes` で変更できます。
また、拡張子に関係なく出力対象へ含めるファイルは `sourceCodeCombiner.targetFiles.additionalFileNames` で指定できます。

## 🚫 自動的に除外されるファイル・ディレクトリ

以下のファイル・ディレクトリは設定内容に関係なく常に収集対象外です。

- `.git`
- `node_modules`
- `.venv`
- `__pycache__`
- 出力ファイル（既定では `combined_code.md`）

## ⚙️ 設定項目

`settings.json` で変更できる設定項目の一覧です。

| 設定項目 | 説明 |
| --- | --- |
| `sourceCodeCombiner.targetFiles.fileTypes` | 結合対象とする拡張子と、Markdown コードフェンスで使用する言語識別子のマッピング。 |
| `sourceCodeCombiner.targetFiles.additionalFileNames` | 拡張子に関わらず結合対象へ追加するファイル名（完全一致）。 |
| `sourceCodeCombiner.outputFile.name` | 出力する Markdown ファイル名。 |
| `sourceCodeCombiner.outputFile.directory` | ファイルの出力先ディレクトリ（相対パスまたは絶対パス）。 |
| `sourceCodeCombiner.outputFile.treeStyle` | ディレクトリツリーで使用する文字セット・表示スタイル。 |
| `sourceCodeCombiner.outputFile.warningThreshold` | 推定出力サイズがこの値を超えた場合に警告ダイアログを表示するしきい値。 |
| `sourceCodeCombiner.outputFile.confirmOverwrite` | 出力ファイルが存在する場合に上書き確認ダイアログを表示するかどうか。 |

### 🔧 各設定項目の詳細

#### `sourceCodeCombiner.targetFiles.fileTypes`
結合対象とするファイル拡張子（キー）と、Markdown 出力時にコードブロックで指定する言語識別子（値）を設定します。

- デフォルト値: 主要なプログラミング言語・設定ファイル（`.ts`: `typescript`, `.py`: `python` など 27 種類）
- 設定例:
  ```json
  "sourceCodeCombiner.targetFiles.fileTypes": {
    ".ts": "typescript",
    ".py": "python",
    ".go": "go"
  }
  ```

#### `sourceCodeCombiner.targetFiles.additionalFileNames`
拡張子を持たないファイルや特定の設定ファイルを指定することで、ファイル名単位で結合対象に追加します。大文字・小文字を区別して完全一致で判定されます。

- デフォルト値: `[]`
- 設定例:
  ```json
  "sourceCodeCombiner.targetFiles.additionalFileNames": [
    "Dockerfile",
    "Makefile",
    "LICENSE"
  ]
  ```

#### `sourceCodeCombiner.outputFile.name`
生成し出力する Markdown ファイルのファイル名を指定します。

- デフォルト値: `"combined_code.md"`
- 設定例:
  ```json
  "sourceCodeCombiner.outputFile.name": "prompt_context.md"
  ```

#### `sourceCodeCombiner.outputFile.directory`
生成する Markdown ファイルの出力先ディレクトリを指定します。空文字列の場合は、右クリックで実行したコマンド実行ディレクトリへ出力されます。相対パス（ワークスペースルート基準）および絶対パスを指定できます。

- デフォルト値: `""`
- 設定例:
  ```json
  "sourceCodeCombiner.outputFile.directory": "docs/ai"
  ```

#### `sourceCodeCombiner.outputFile.treeStyle`
出力ファイル冒頭に自動作成されるディレクトリツリーの表示形式・使用文字セットを指定します。

- デフォルト値: `"pipe"`
- 選択可能な値:
  - `"pipe"`: ASCII 文字を使用したツリー（デフォルト）
    ```text
    project/
    |-- src/
    |   `-- main.ts
    `-- package.json
    ```
  - `"unicode"`: Unicode 罫線文字を使用したツリー
    ```text
    project/
    ├── src/
    │   └── main.ts
    └── package.json
    ```
  - `"heavy"`: 太い Unicode 罫線文字を使用したツリー
    ```text
    project/
    ┣━━ src/
    ┃   ┗━━ main.ts
    ┗━━ package.json
    ```
  - `"plus"`: `+--` や `--` を使用した ASCII ツリー
    ```text
    project/
    +-- src/
    |   \-- main.ts
    \-- package.json
    ```
  - `"indent"`: 接続文字を使用せず、インデントのみで表現するツリー
    ```text
    project/
      src/
        main.ts
    package.json
    ```
- 設定例:
  ```json
  "sourceCodeCombiner.outputFile.treeStyle": "unicode"
  ```

#### `sourceCodeCombiner.outputFile.warningThreshold`
生成される Markdown ファイルの推定サイズがこの設定値を超えた場合、ファイル生成を開始する前に確認ダイアログを表示します。単位を省略した場合は Byte として扱われます。

- デフォルト値: `"100MB"`
- 使用可能な単位: `B`, `KB`, `MB`, `GB`, `KiB`, `MiB`, `GiB`
- 設定例:
  ```json
  "sourceCodeCombiner.outputFile.warningThreshold": "50MB"
  ```

#### `sourceCodeCombiner.outputFile.confirmOverwrite`
出力先ファイルが既に存在する場合に、保存前に上書き確認ダイアログを表示するかどうかを指定します。`false` に設定すると確認なしで直接上書きします。

- デフォルト値: `true`
- 設定例:
  ```json
  "sourceCodeCombiner.outputFile.confirmOverwrite": false
  ```

## 🔒 セキュリティ・プライバシー

本拡張機能は完全にローカル環境で動作します。コードデータやディレクトリ構造が外部ネットワークや外部サーバーへ送信されることはありません。

## 📄 ライセンス

このプロジェクトは MIT License のもとで公開されています。
詳細は `LICENSE` を参照してください。
