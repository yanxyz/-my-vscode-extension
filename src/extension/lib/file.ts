import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as makeDir from 'make-dir';
import * as pify from 'pify';
import Cache from './cache';

const cache = new Cache();

export async function createFile() {
  const paths = await getPaths();
  if (!paths) return;
  const target = paths.target;

  try {
    await makeDir(path.dirname(target));
    await pify(fs.appendFile)(target, Buffer.from(''));
    await open(target);
    return;
  } catch (err) {
    return showError(err.message);
  }
}

export async function copyFile() {
  const paths = await getPaths('copy');
  if (!paths) return;
  const target = paths.target;

  try {
    await makeDir(path.dirname(target));
    await copy(paths.current, target);
    await open(target);
    return;
  } catch (err) {
    return showError(err.message);
  }
}

export async function moveFile() {
  const paths = await getPaths();
  if (!paths) return;
  const target = paths.target;

  try {
    await makeDir(path.dirname(target));
    await pify(fs.rename)(paths.current, target);
    await open(target);
    return;
  } catch (err) {
    return showError(err.message);
  }
}

async function getPaths(action?: string) {
  /**
   * Get the active document
   */

  const editor = vscode.window.activeTextEditor;
  // TODO: 当前 Tab 不是 editor，比如图片预览，怎么办?
  if (!editor) {
    return showError('Please open a file first.');
  }
  const document = editor.document;
  if (document.isUntitled || document.isDirty) {
    return showError('Please save file first.');
  }
  const current = document.fileName;
  let target: string;

  /**
   * handle input
   */

  const value: string = cache.get() || (action === 'copy' && path.basename(current))
  let input = await vscode.window.showInputBox({
    prompt: 'File Name',
    value
  });

  if (!input) return; // 用户取消输入时为 undefined
  input = input.trim();
  if (!input) return; // 用户输入为空白

  // 缓存 input，若这次操作出错方便下次修改
  cache.set(input);

  input = input.replace(/\\/g, '/');

  // 以 `/` 开始表示相对于当前文件所在的 workspace folder
  if (input.startsWith('/')) {
    if (!vscode.workspace.workspaceFolders) {
      return showError(`Please open a folder first.`);
    }

    const workspaceRoot = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceRoot) {
      return showError('Please open a file first.');
    }

    target = path.join(workspaceRoot.uri.fsPath, input);
  }
  // windows 包含 driver 的绝对路径
  else if (/^[a-z]:/i.test(input)) {
    target = input;
  }
  // 其它情况表示相对于当前文件所在目录
  else {
    target = path.join(current, '..', input);
  }

  try {
    await pify(fs.access)(target);
    return showError('Target exsits!');
  } catch (error) {
    // not exsits
  }

  return {
    current,
    target
  };
}

function showError(message: string) {
  vscode.window.showErrorMessage(message);
}

function copy(src: string, dest: string) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(src)
      .pipe(fs.createWriteStream(dest))
      .on('close', resolve)
      .on('error', reject);
  });
}

function open(fileName: string) {
  return vscode.commands.executeCommand('vscode.open', vscode.Uri.file(fileName))
    .then(() => cache.clear());
}
