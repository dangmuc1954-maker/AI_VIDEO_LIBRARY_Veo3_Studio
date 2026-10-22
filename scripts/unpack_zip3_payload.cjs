const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const exePath = path.resolve(__dirname, '../scratch/zip3_analysis/AI_VIDEO_LIBRARY_Setup_v3.0.exe');
const outDir = path.resolve(__dirname, '../scratch/zip3_analysis/unpacked_payload');

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

console.log('[*] Extracting AppPayload.zip from:', exePath);

const psScript = `
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$assembly = [System.Reflection.Assembly]::LoadFile('${exePath.replace(/\\/g, "\\\\").replace(/'/g, "''")}')
$resourceStream = $assembly.GetManifestResourceStream('AppPayload.zip')
if ($resourceStream -eq $null) {
    Write-Error 'Resource AppPayload.zip not found!'
    exit 1
}

$zipArchive = New-Object System.IO.Compression.ZipArchive($resourceStream, [System.IO.Compression.ZipArchiveMode]::Read)
$destDir = '${outDir.replace(/\\/g, "\\\\").replace(/'/g, "''")}'

foreach ($entry in $zipArchive.Entries) {
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
$zipArchive.Dispose()
$resourceStream.Dispose()
Write-Host 'Extraction completed successfully!'
`;

try {
  cp.execSync(`powershell -NoProfile -Command "${psScript}"`, { stdio: 'inherit' });
  console.log('✅ Unpacked successfully to:', outDir);
} catch (e) {
  console.error('Extraction failed:', e.message);
  process.exit(1);
}
