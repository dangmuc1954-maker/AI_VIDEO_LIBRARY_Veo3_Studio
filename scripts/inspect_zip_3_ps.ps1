Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = 'C:\Users\admin\Downloads\AI_VIDEO_LIBRARY_Setup_v3.0.exe (3).zip'
$archive = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$archive.Entries | Format-List FullName, Length, CompressedLength
$archive.Dispose()
