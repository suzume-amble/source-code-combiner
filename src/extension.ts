import * as vscode from "vscode";

import { combineCommand } from "./commands/combineCommand";

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "code-combiner" is now active!');

    const disposable = vscode.commands.registerCommand("code-combiner.combine", combineCommand);

    context.subscriptions.push(disposable);
}

export function deactivate() {}
