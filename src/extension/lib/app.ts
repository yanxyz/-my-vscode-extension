import * as vscode from 'vscode';
import { dirname } from 'path';
import { getUri, open } from './utils';

/**
 * Reveal current file/dir in Total Commander
 */

export function openTotalcmd(uri?: vscode.Uri) {
  uri = getUri(uri);
  if (!uri) return;

  const config = vscode.workspace.getConfiguration('my');
  const app = config.get<string>('totalcmd');
  const args = config.get<string[]>('totalcmdArgs');
  const argv = args.map(x => x.replace('{path}', uri.fsPath));
  open(app, argv);
}

/**
 * Open ConEmu at current file's directory
 */

export function openConEmu(uri?: vscode.Uri) {
  uri = getUri(uri);
  if (!uri) return;

  const config = vscode.workspace.getConfiguration('my');
  const app = config.get<string>('conemu');
  const args = config.get<string[]>('conemuArgs');
  const dir = dirname(uri.fsPath);
  open(app, args, { cwd: dir });
}

/**
 * Open current file in Sublime Text
 */

export function openSubl(uri?: vscode.Uri) {
  uri = getUri(uri);
  if (!uri) return;

  const editor = vscode.window.activeTextEditor;
  const rootPath = vscode.workspace.getWorkspaceFolder(uri).uri.fsPath || '';
  let { line: ln, character: col } = editor.selection.active;
  const app = vscode.workspace.getConfiguration('my').get<string>('subl');
  open(app, ['-n', '-w', '-a', rootPath, `${uri.fsPath}:${++ln}:${++col}`]);
}

/**
 * Open Integrated Terminal at current file's directory
 * https://github.com/formulahendry/vscode-terminal/blob/master/src/extension.ts#L90
 */

export function openIntegratedTerminal(uri?: vscode.Uri) {
  uri = getUri(uri);
  if (!uri) return;

  const terminal = vscode.window.createTerminal();
  terminal.show(false);
  terminal.sendText(`cd "${dirname(uri.fsPath)}"`);
}
