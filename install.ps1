# package this extension
# and install it to default extensions dir

# npm install -g vsce
vsce package
# if error then exit
if (!$?) { exit }

# remove already installed extension
$ext = Get-Item *.vsix
$json = Get-Content "package.json" -Raw | ConvertFrom-Json
$install = "$HOME\.vscode\extensions\$($json.publisher).$($ext.BaseName)"
Write-Host "Install path: $install"
if (Test-Path $install) { Remove-Item $install -Recurse }

# install extension
code --install-extension $ext.Name
