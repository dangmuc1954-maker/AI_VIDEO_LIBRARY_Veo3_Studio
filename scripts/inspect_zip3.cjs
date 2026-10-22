const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const zipPath = 'C:\\Users\\admin\\Downloads\\AI_VIDEO_LIBRARY_Setup_v3.0.exe (3).zip';
const outDir = path.resolve(__dirname, '../scratch/zip3_analysis');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('[*] Expanding zip archive to:', outDir);
const cmd = `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${outDir}' -Force"`;
cp.execSync(cmd, { stdio: 'inherit' });

console.log('✅ Unzipped zip archive successfully!');
const files = fs.readdirSync(outDir);
console.log('Contents of zip3_analysis:', files);
