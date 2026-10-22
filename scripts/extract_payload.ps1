Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$exePath = "D:\dự án antigravity\AIForge_Veo3_Studio\scratch\restored_from_yesterday_zip\AI_VIDEO_LIBRARY_Setup_v3.0.exe"
$outDir = "D:\dự án antigravity\AIForge_Veo3_Studio\scratch\yesterday_source_unpacked"

$bytes = [System.IO.File]::ReadAllBytes($exePath)
$assembly = [System.Reflection.Assembly]::Load($bytes)
$resNames = $assembly.GetManifestResourceNames()
Write-Host "Resources found: $($resNames -join ', ')"

$stream = $assembly.GetManifestResourceStream("AppPayload.zip")
if ($stream -eq $null) {
    Write-Host "Stream AppPayload.zip is null!"
    exit 1
}

$zipPath = "D:\dự án antigravity\AIForge_Veo3_Studio\scratch\yesterday_AppPayload.zip"
$fileStream = [System.IO.File]::Create($zipPath)
$stream.CopyTo($fileStream)
$fileStream.Close()
$stream.Close()

Write-Host "Saved zip to $zipPath ($((Get-Item $zipPath).Length) bytes)"
[System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $outDir)
Write-Host "Extracted to $outDir successfully!"
