$sh = New-Object -ComObject WScript.Shell
$sc = $sh.CreateShortcut('C:\Users\admin\Desktop\AIForge Studio.lnk')
$sc.TargetPath
