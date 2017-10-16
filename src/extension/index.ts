import * as vscode from 'vscode';
import * as app from './lib/app';
import * as file from './lib/file';
import copyRelativePath from './lib/copy-relative-path';

function register(context: vscode.ExtensionContext, handler: any) {
  const command = `extension.${handler.name}`;
  const disposable = vscode.commands.registerCommand(command, handler);
  context.subscriptions.push(disposable);
}

export function activate(context: vscode.ExtensionContext) {
  register(context, app.openTotalcmd);
  register(context, app.openConEmu);
  register(context, app.openSubl);
  register(context, app.openIntegratedTerminal);
  register(context, file.createFile);
  register(context, file.copyFile);
  register(context, file.moveFile);
  register(context, copyRelativePath);
}

export function deactivate() {
}
