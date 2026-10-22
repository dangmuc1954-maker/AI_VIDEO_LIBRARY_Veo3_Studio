const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const zipPath = 'C:/Users/admin/Downloads/AI_VIDEO_LIBRARY_Setup_v3.0.exe (3).zip';
const tempDir = path.resolve(__dirname, '../scratch/zip3_extracted');
const appOutDir = path.resolve(__dirname, '../scratch/zip3_app_unpacked');

if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
if (fs.existsSync(appOutDir)) fs.rmSync(appOutDir, { recursive: true, force: true });

fs.mkdirSync(tempDir, { recursive: true });
fs.mkdirSync(appOutDir, { recursive: true });

console.log('[1] Extracting exe from zip container...');
const ps1 = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory('${zipPath.replace(/'/g, "''")}', '${tempDir.replace(/'/g, "''")}')
`;
cp.execSync(`powershell -NoProfile -Command "${ps1}"`, { stdio: 'inherit' });

const extractedExe = path.join(tempDir, 'AI_VIDEO_LIBRARY_Setup_v3.0.exe');
console.log('[2] Extracted exe exists:', fs.existsSync(extractedExe), fs.statSync(extractedExe).size);

console.log('[3] Extracting AppPayload.zip from exe assembly...');
const ps2 = `
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$assembly = [System.Reflection.Assembly]::LoadFile('${extractedExe.replace(/'/g, "''")}')
$resourceStream = $assembly.GetManifestResourceStream('AppPayload.zip')
if ($resourceStream -eq $null) {
    Write-Error 'Resource AppPayload.zip not found!'
    exit 1
}

$zipArchive = New-Object System.IO.Compression.ZipArchive($resourceStream, [System.IO.Compression.ZipArchiveMode]::Read)
$destDir = '${appOutDir.replace(/'/g, "''")}'

foreach ($entry in $zipArchive.Entries) {
    # Only extract resources/app/out to be fast
    if ($entry.FullName -like "*resources/app/out/*" -or $entry.FullName -like "*resources\\app\\out\\*") {
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
Write-Host 'Done extracting app/out from exe!'
`;
cp.execSync(`powershell -NoProfile -Command "${ps2}"`, { stdio: 'inherit' });
console.log('✅ Finished unpacking zip 3 app/out!');
