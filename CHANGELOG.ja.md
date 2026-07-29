# Change Log

All notable changes to the "Source Code Combiner" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-07-29

### Fixed
- **拡張機能の説明文の修正**: `package.json` 内に説明文を直接インラインで記述する形に修正。

## [1.0.0] - 2026-07-28

### Added
- **日本語ドキュメントの追加**: 言語切り替えリンクを含む日本語マニュアル（`README.ja.md`）を追加。
- **拡張機能アイコンの追加**: Marketplace等の表示用アイコンアセット（`icon.png`, `icon.svg`）を追加。

### Changed
- **ドキュメント・メタデータの刷新**: `README.md` を全面的に書き換え、機能解説や使用方法を拡充。`package.json` のバージョンを `1.0.0` に変更し、キーワード・カテゴリ・リポジトリ等のメタデータを更新。
- **Markdown出力フォーマットの調整**: ディレクトリツリーおよびファイル見出し直後の改行コードを `\n\n` から `\n` に変更し、よりコンパクトで読みやすい出力に調整。
- **拡張機能名の変更**: 拡張機能の名称を `code-combiner` から `source-code-combiner` へ変更（ソースコード、ドキュメント、多言語化ファイル、設定ファイルを一元更新）。

## [0.9.0] - 2026-07-23

### Added
- **シンボリックリンクのサポート**: リンク先ディレクトリの再帰的な探索を行わずにシンボリックリンク情報を収集・表示する機能を追加。ディレクトリーツリー出力へのリンク先表記（`name -> target`）を追加。
- **ネストされた `.gitignore` の階層解析**: ワークスペースルートから実行ディレクトリまでのネストされた `.gitignore` ルールを正しく継承・適用する機能を追加 (`createIgnoreFilter`)。

### Fixed
- **ファイル読み込みエラーハンドリング**: Markdown生成時に読み込みエラーが発生した場合のクラッシュを防止（エラー発生時はフォーマットされたエラーメッセージを出力し、言語識別子を `text` にフォールバック）。
- **クロスプラットフォーム対応のパス区切り文字正規化**: 生成されるMarkdown内のファイル見出しのディレクトリパス区切り文字を `/` に統一。

### Changed
- **ファイルソートロジックのリファクタリング**: ファイルソート処理（`compareFileInfo`）を `collectFiles` 内に移動し、冗長な `sortTree` 処理を削減。
- **`.gitignore` 処理関数のリファクタリング**: `loadGitIgnore` を `applyGitIgnore` に名称変更および再設計し、内部ロジックのカプセル化を強化。

### Security / Maintenance (Chore & Build)
- **esbuild の統合**: ビルドおよびバンドル処理に esbuild を導入し、エントリポイントを `./dist/extension.js` に変更。
- **開発環境の整備**: 共有VS Code設定（`launch.json`, `tasks.json` 等）の追加、および `.gitignore` / `.vscodeignore` の調整。
- **ドキュメントおよびライセンス設定**: MITライセンスの追加、READMEの刷新、および `package.json` へのメタデータ追加。
