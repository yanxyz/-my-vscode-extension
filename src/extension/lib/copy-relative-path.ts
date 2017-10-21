// VSCode 目前没有 copy to clipboard API
// https://github.com/Microsoft/vscode/issues/217

import * as vscode from 'vscode';
import { copy } from 'copy-paste';
import { getUri } from './utils';

export default function copyRelativePath(uri?: vscode.Uri) {
  uri = getUri(uri);
  if (!uri) return;

  const relativePath = vscode.workspace.asRelativePath(uri).replace(/\\/g, '/');
  copy(relativePath);
}
