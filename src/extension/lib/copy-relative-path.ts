import * as vscode from 'vscode';
import { copy } from 'copy-paste';
import { getFilePath } from './utils';

export default function copyRelativePath(uri: vscode.Uri) {
  const fsPath = getFilePath(uri);
  if (!fsPath) return;

  const relativePath = vscode.workspace.asRelativePath(fsPath).replace(/\\/g, '/');
  copy(relativePath);
}
