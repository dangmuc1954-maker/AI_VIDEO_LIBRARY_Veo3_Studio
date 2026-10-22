Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$exePath = 'D:\dự án antigravity\AIForge_Veo3_Studio\scratch\zip3_extracted\AI_VIDEO_LIBRARY_Setup_v3.0.exe'
$destDir = 'D:\dự án antigravity\AIForge_Veo3_Studio\scratch\zip3_app_unpacked'

$bytes = [System.IO.File]::ReadAllBytes($exePath)
$assembly = [System.Reflection.Assembly]::Load($bytes)
$resourceStream = $assembly.GetManifestResourceStream('AppPayload.zip')
if ($resourceStream -eq $null) {
    Write-Error 'Resource AppPayload.zip not found!'
    exit 1
}

$zipArchive = New-Object System.IO.Compression.ZipArchive($resourceStream, [System.IO.Compression.ZipArchiveMode]::Read)

Write-Host "Total entries in AppPayload: $($zipArchive.Entries.Count)"

foreach ($entry in $zipArchive.Entries) {
    if ($entry.FullName -like "*resources/app/out/*" -or $entry.FullName -like "*resources\app\out\*") {
        $targetPath = [System.IO.Path]::Combine($destDir, $entry.FullName)
        if ([string]::IsNullOrEmpty($entry.Name)) {
            [System.IO.Directory]::CreateDirectory($targetPath) | Out-Null
        } else {
            $parent = [System.IO.Path]::GetDirectoryName($targetPath)
            if (-not [System.IO.Directory]::Exists($parent)) {
                [System.IO.Directory]::CreateDirectory($parent) | Out-Null
            }
            [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $targetPath, $true)
        }
    }
}
$zipArchive.Dispose()
$resourceStream.Dispose()
Write-Host 'Extraction completed successfully!'
