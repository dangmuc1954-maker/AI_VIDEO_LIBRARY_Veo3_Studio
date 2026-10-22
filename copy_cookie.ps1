
$src = 'C:\Users\admin\AppData\Roaming\AI_VIDEO_LIBRARY_DATA\Partitions\aivideo%3Aveo3-1789186636412\Network\Cookies';
$dst = 'temp_cookies_copy.db';
try {
  $file = [System.IO.File]::Open($src, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite -bor [System.IO.FileShare]::Delete)
  $out = [System.IO.File]::Create($dst)
  $file.CopyTo($out)
  $file.Close()
  $out.Close()
  Write-Host "SUCCESS_COPIED"
} catch {
  Write-Host "ERR: $($_.Exception.Message)"
}
