const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const zipPath = 'C:\\Users\\admin\\Downloads\\AI_VIDEO_LIBRARY_Setup_v3.0.exe (1).zip';
const dest = path.resolve(__dirname, '../scratch/restored_from_yesterday_zip');

if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true, force: true });
}
fs.mkdirSync(dest, { recursive: true });

console.log('Extracting from:', zipPath);
console.log('To:', dest);

const psCommand = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${zipPath.replace(/'/g, "''")}', '${dest.replace(/'/g, "''")}')`;

cp.execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: 'inherit' });

console.log('Extraction complete! Checking directory structure:');
const items = fs.readdirSync(dest);
console.log('Root items in zip:', items);
