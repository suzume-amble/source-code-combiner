# Change Log

All notable changes to the "code-combiner" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
