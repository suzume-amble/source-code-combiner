# Change Log

All notable changes to the "Source Code Combiner" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-07-29

### Fixed
- **Extension Description**: Fixed extension description localization by inlining the description string directly in `package.json`.

## [1.0.0] - 2026-07-28

### Added
- **Japanese Documentation**: Added `README.ja.md` with language switching link for Japanese users.
- **Extension Icons**: Added icon assets (`icon.png` and `icon.svg`) for the extension Marketplace display.

### Changed
- **Documentation & Metadata**: Rewrote `README.md` to provide comprehensive feature descriptions and usage guides. Updated `package.json` metadata (version `1.0.0`, keywords, categories, and repository information).
- **Markdown Output Formatting**: Adjusted line breaks after directory tree and file headings from `\n\n` to `\n` for tighter, cleaner layout.
- **Extension Renamed**: Renamed extension from `code-combiner` to `source-code-combiner` across code, documentation, localization, and configuration files.

## [0.9.0] - 2026-07-23

### Added
- **Symbolic Link Support**: Added functionality to collect and display symbolic links without recursively traversing target directories. Display target paths (`name -> target`) in directory tree output.
- **Nested `.gitignore` Resolution**: Introduced `createIgnoreFilter` to walk down from the workspace root to the command execution directory, ensuring all hierarchical `.gitignore` rules are properly inherited.

### Fixed
- **File Read Error Handling**: Prevented crashes when file read errors occur during Markdown generation. Output formatted error messages and fallback language identifier to `text` upon read failures.
- **Cross-Platform Path Normalization**: Normalized directory path separators to forward slashes (`/`) for file headings in generated Markdown output.

### Changed
- **File Sorting Refactoring**: Moved file sorting logic (`compareFileInfo`) into `collectFiles` and eliminated redundant tree sorting (`sortTree`).
- **`.gitignore` Internal Logic Refactoring**: Renamed `loadGitIgnore` to `applyGitIgnore` and unexported internal helpers to improve encapsulation.

### Security / Maintenance
- **esbuild Integration**: Integrated esbuild for bundling and updated main entry point to `./dist/extension.js`.
- **Development Environment Setup**: Added shared VS Code workspace configurations (`launch.json`, `tasks.json`, etc.) and updated `.gitignore` / `.vscodeignore`.
- **Documentation & License**: Added MIT License, updated `package.json` metadata, and rewrote `README.md` with detailed extension features.
