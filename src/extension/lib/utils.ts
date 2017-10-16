import * as vscode from 'vscode';
import { execFile } from 'child_process';

/**
 * Get the path of current file
 */
export function getFilePath(fileUri?: vscode.Uri) {
  let scheme: string, fsPath: string;
  if (fileUri) { // context
    scheme = fileUri.scheme;
    fsPath = fileUri.fsPath;
  } else { // command palette, fileUri is undefined
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      scheme = editor.document.uri.scheme;
      fsPath = editor.document.fileName;
    } else {
      vscode.window.showErrorMessage('Please open a file first.');
      return;
    }
  }

  if (scheme === 'untitled') {
    vscode.window.showErrorMessage('Please save file first.');
    return;
  }
  if (scheme !== 'file') {
    vscode.window.showErrorMessage('Current edit is not a file.');
    return;
  }

  return fsPath;
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
