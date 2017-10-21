import * as vscode from 'vscode';
import { execFile } from 'child_process';

/**
 * 获取合适的 uri
 *
 * command 在不同的位置调用，回调参数不同
 * context menu 传入 uri; command palette 为空，此时用当前文档的 uri
 */
export function getUri(uri?: vscode.Uri): vscode.Uri {
  if (!uri) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      uri = editor.document.uri;
    } else {
      vscode.window.showErrorMessage('Please open a file first.');
      return;
    }
  }

  const scheme = uri.scheme;
  if (scheme === 'untitled') {
    vscode.window.showErrorMessage('Please save this untitled file first.');
    return;
  }
  if (scheme !== 'file') {
    vscode.window.showErrorMessage('Target is not a file.');
    return;
  }

  return uri;
}

/**
 * Open executable file
 */
export function open(file: string, args: string[], options = {}): void {
  const child = execFile(file, args, options);
  child.once('error', error => {
    vscode.window.showErrorMessage(error.message);
  });
  child.unref();
}
