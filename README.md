# Code Combiner

English | [日本語](README.ja.md)

Code Combiner is a Visual Studio Code extension that collects source code in a directory from the Explorer and outputs it as a single Markdown file optimized for AI input.
In addition to source code, it also outputs directory structure and file paths in Markdown, making it useful not only for AI input but also for code reviews and source code sharing.
It operates completely in a local environment and features dynamic parsing and exclusion of multi-level `.gitignore` files strictly complying with Git specifications.

## ✨ Features

- **Easy execution from context menu**
  * Select directory from Explorer to generate Markdown
  * Select specific subdirectory to generate Markdown
- **Automatic directory tree generation**
  * Outputs directory structure in tree format
  * Displays symbolic links in the format `Name -> Link target` (contents of link targets are excluded from traversal and combination)
- **Appropriate Markdown Generation**
  * Outputs source code on a per-file basis as Markdown code blocks
  * Assigns appropriate Markdown language identifiers for each file extension
  * Automatically adjusts code fence lengths so Markdown does not break
- **Target file collection considering `.gitignore`**
  * Dynamically parses multi-level `.gitignore` files complying with Git specifications
- **Automatic exclusion of common directories and output files**
  * Automatically excludes `.git`, `node_modules`, `.venv`, `__pycache__`, and generated Markdown files
- **Safe and customizable output processing**
  * Configurable target file extensions
  * Configurable additional file names independent of extensions
  * Configurable output directory
  * Configurable output file name
  * Displays confirmation dialog when estimated output size exceeds threshold
  * Configurable confirmation dialog for overwriting when output file exists
  * Supports multiple directory tree display styles

## 📦 Installation

### Install from Marketplace

1. Launch Visual Studio Code.
2. Open the "Extensions" view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3. Type `Code Combiner` in the search box.
4. Click the "Install" button.

### Install from VSIX

1. Download the `.vsix` file from GitHub Releases page, etc.
2. Open the "Extensions" view in VSCode.
3. Click "..." (Views and More Actions) at the top right of the view and select "Install from VSIX...".
4. Select the downloaded `.vsix` file to install.

## 🚀 How to Use

You can execute it using any of the following methods:

- **Execute from context menu**: Right-click the directory you want to combine in VSCode Explorer and select "Combine Source Files (Markdown)".
- **Execute from icon**: Click the dedicated icon displayed next to the project name in sidebar Explorer.
- **After completion**: When processing completes, `combined_code.md` is generated in the specified directory (by default, directly under the target directory).

## 📝 Example Output File

The generated file has the following structure.
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
// Source code
```
・・・
````

## 📄 Target File Extensions

By default, major programming languages, markup languages, and configuration files are targeted for combination.

- **Programming Languages**: Dart, TypeScript, JavaScript, Python, Java, C/C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin
- **Markup**: HTML, CSS, Markdown
- **Configuration Files**: JSON, YAML, TOML
- **Scripting Languages**: Shell, PowerShell, Batch

Target file extensions can be changed in `codeCombiner.targetFiles.fileTypes`.
Files to include regardless of extension can be specified in `codeCombiner.targetFiles.additionalFileNames`.

## 🚫 Automatically Excluded Files and Directories

Regardless of settings, the following files and directories are always excluded from collection:

- `.git`
- `node_modules`
- `.venv`
- `__pycache__`
- Output files (default is `combined_code.md`)

## ⚙️ Settings

List of items configurable in `settings.json`.

| Setting | Description |
| --- | --- |
| `codeCombiner.targetFiles.fileTypes` | Maps target file extensions (keys) to the language identifiers (values) used in Markdown code blocks. |
| `codeCombiner.targetFiles.additionalFileNames` | Exact match list added to target files by file name, such as files without extensions or specific configuration files. |
| `codeCombiner.outputFile.name` | File name of the output Markdown file to generate. |
| `codeCombiner.outputFile.directory` | Output target directory of the generated Markdown file. |
| `codeCombiner.outputFile.treeStyle` | Display format and character set used for directory tree. |
| `codeCombiner.outputFile.warningThreshold` | Threshold to display confirmation dialog when estimated file size exceeds this value. |
| `codeCombiner.outputFile.confirmOverwrite` | Whether to display an overwrite confirmation dialog if the output file exists. |

## 🔧 Details of Each Setting Item

### `codeCombiner.targetFiles.fileTypes`

Sets file extensions (keys) to target for combination and language identifiers (values) specified in code blocks during Markdown output.

- Default value: Major programming languages and configuration files (27 types such as `.ts`: `typescript`, `.py`: `python`)
- Example setting:
  ```json
  "codeCombiner.targetFiles.fileTypes": {
    ".ts": "typescript",
    ".py": "python",
    ".go": "go"
  }
  ```

### `codeCombiner.targetFiles.additionalFileNames`

Adds files to the target list by file name, including files without extensions or specific configuration files. Judged by exact match distinguishing uppercase and lowercase.

- Default value: `[]`
- Example setting:
  ```json
  "codeCombiner.targetFiles.additionalFileNames": [
    "Dockerfile",
    "Makefile",
    "LICENSE"
  ]
  ```

### `codeCombiner.outputFile.name`

Specifies the file name of the Markdown file to generate and output.

- Default value: `"combined_code.md"`
- Example setting:
  ```json
  "codeCombiner.outputFile.name": "prompt_context.md"
  ```

### `codeCombiner.outputFile.directory`

Specifies output target directory of the Markdown file to generate. If this is an empty string, it is output to command execution directory where right-clicked. Relative paths (workspace root base) and absolute paths can be specified.

- Default value: `""`
- Example setting:
  ```json
  "codeCombiner.outputFile.directory": "docs/ai"
  ```

### `codeCombiner.outputFile.treeStyle`

Specifies display format and character set used for directory tree automatically created at top of output file.

- Default value: `"pipe"`
- Selectable values:
  - `"pipe"`: Tree using ASCII characters (default)
    ```text
    project/
    |-- src/
    |   `-- main.ts
    `-- package.json
    ```
  - `"unicode"`: Tree using Unicode box-drawing characters
    ```text
    project/
    ├── src/
    │   └── main.ts
    └── package.json
    ```
  - `"heavy"`: Tree using heavy Unicode box-drawing characters
    ```text
    project/
    ┣━━ src/
    ┃   ┗━━ main.ts
    ┗━━ package.json
    ```
  - `"plus"`: Tree using `+--` or `--`
    ```text
    project/
    +-- src/
    |   \-- main.ts
    \-- package.json
    ```
  - `"indent"`: Tree using indentation only, without connecting characters.
    ```text
    project/
      src/
        main.ts
    package.json
    ```
- Example setting:
  ```json
  "codeCombiner.outputFile.treeStyle": "unicode"
  ```

### `codeCombiner.outputFile.warningThreshold`

Displays confirmation dialog before starting processing if estimated size of generated Markdown file exceeds this setting value. If unit is omitted, interpreted as bytes.

- Default value: `"100MB"`
- Selectable units: `B`, `KB`, `MB`, `GB`, `KiB`, `MiB`, `GiB`
- Example setting:
  ```json
  "codeCombiner.outputFile.warningThreshold": "50MB"
  ```

### `codeCombiner.outputFile.confirmOverwrite`

Specifies whether to display overwrite confirmation dialog before saving if output target file already exists. If set to `false`, overwrites directly without confirmation.

- Default value: `true`
- Example setting:
  ```json
  "codeCombiner.outputFile.confirmOverwrite": false
  ```

## 🔒 Security & Privacy

This extension operates entirely in the local environment. Code data and directory structures are never transmitted to external networks or servers.

## 📄 License

This project is licensed under the MIT License. For details, please refer to the `LICENSE` file.
