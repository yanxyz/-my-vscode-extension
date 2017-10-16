import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as makeDir from 'make-dir';
import * as pify from 'pify';
import { getFilePath } from './utils';

export async function createFile() {
  const entry = await getPath();
  if (!entry) return;

  try {
    // 路径末尾 '/' 表示目录
    if (entry.targetFilePath.endsWith('/')) {
      await makeDir(entry);
      return;
    }

    await makeDir(path.dirname(entry.targetFilePath));
    await pify(fs.appendFile)(entry.targetFilePath, Buffer.from(''));
    const textDocument = await vscode.workspace.openTextDocument(entry.targetFilePath);
    vscode.window.showTextDocument(textDocument);
    return;
  } catch (err) {
    showError(err.message);
    return;
  }
}

export async function copyFile() {
  const entry = await getPath();
  if (!entry) return;
  const { currentFilePath, targetFilePath } = entry;

  if (entry.targetFilePath.endsWith('/')) {
    showError('File name should not end with "/".');
    return;
  }

  try {
    await makeDir(path.dirname(targetFilePath));
    await copy(currentFilePath, targetFilePath);
    await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(targetFilePath));
    return;
  } catch (err) {
    showError(err.message);
    return;
  }
}

export async function moveFile() {
  const entry = await getPath();
  if (!entry) return;
  const { currentFilePath, targetFilePath } = entry;

  if (targetFilePath.endsWith('/')) {
    showError('File name should not end with "/".');
    return;
  }

  try {
    await makeDir(path.dirname(targetFilePath));
    await pify(fs.rename)(currentFilePath, targetFilePath);
    await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(targetFilePath));
    return;
  } catch (err) {
    showError(err.message);
    return;
  }
}

export interface IEntry {
  currentFilePath: string;
  targetFilePath: string;
}

async function getPath(): Promise<IEntry> {
  const input = await vscode.window.showInputBox({
    prompt: 'File Name',
    placeHolder: 'Filename or relative path to file'
  });

  if (!input) return;

  const currentFilePath = getFilePath();
  if (!currentFilePath) return;

  let targetFilePath: string;
  // 路径以 '/' 开始表示相对于 workspace root
  if (input.startsWith('/')) {
    const root = vscode.workspace.rootPath;
    if (!root) {
      showError('Please open a folder first');
      return;
    }
    targetFilePath = path.join(root, input.slice(1));
  }
  // 其它情况表示相对于当前文件
  else {
    targetFilePath = path.resolve(path.dirname(currentFilePath), input);
  }

  try {
    await pify(fs.access)(targetFilePath);
    showError('Target exsits!');
    return;
  } catch (error) {
    // not exsits
  }

  return { currentFilePath, targetFilePath };
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
