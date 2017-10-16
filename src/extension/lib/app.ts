import * as vscode from 'vscode';
import { dirname } from 'path';
import { getFilePath, open } from './utils';

/**
 * Reveal current file/dir in Total Commander
 */

export function openTotalcmd(fileUri?: vscode.Uri) {
  const fsPath = getFilePath(fileUri);
  if (!fsPath) return;

  const config = vscode.workspace.getConfiguration('my');
  const app = config.get<string>('totalcmd');
  const args = config.get<string[]>('totalcmdArgs');
  const argv = args.map(x => x.replace('{path}', fsPath));
  open(app, argv);
}

/**
 * Open ConEmu at current file's directory
 */

export function openConEmu(fileUri?: vscode.Uri) {
  const fsPath = getFilePath(fileUri);
  if (!fsPath) return;

  const config = vscode.workspace.getConfiguration('my');
  const app = config.get<string>('conemu');
  const args = config.get<string[]>('conemuArgs');
  const dir = dirname(fsPath);
  open(app, args, { cwd: dir });
}

/**
 * Open current file in Sublime Text
 */

export function openSubl(fileUri?: vscode.Uri) {
  const fileName = getFilePath(fileUri);
  if (!fileName) return;

  const editor = vscode.window.activeTextEditor;
  const rootPath = vscode.workspace.rootPath;
  let { line: ln, character: col } = editor.selection.active;
  const app = vscode.workspace.getConfiguration('my').get<string>('subl');
  open(app, ['-n', '-w', '-a', `${rootPath}`, `${fileName}:${++ln}:${++col}`]);
}

/**
 * Open Integrated Terminal at current file's directory
 * https://github.com/formulahendry/vscode-terminal/blob/master/src/extension.ts#L90
 */

export function openIntegratedTerminal(fileUri?: vscode.Uri) {
  const fsPath = getFilePath(fileUri);
  if (!fsPath) return;

  const terminal = vscode.window.createTerminal();
  terminal.show(false);
  terminal.sendText(`cd "${dirname(fsPath)}"`);
}
