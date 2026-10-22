import os
import subprocess

script = r'''
$sh = New-Object -ComObject WScript.Shell
$lnkPath = 'C:\Users\admin\Desktop\AlexBright Muse Workbench.lnk'
if (Test-Path $lnkPath) {
    $target = $sh.CreateShortcut($lnkPath).TargetPath
    Write-Output "TARGET:$target"
} else {
    Write-Output "NOT_FOUND"
}
'''

res = subprocess.run(['powershell', '-NoProfile', '-Command', script], capture_output=True, text=True)
print(res.stdout)
print(res.stderr)
