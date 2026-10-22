const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const exe = path.resolve(__dirname, '../scratch/zip3_analysis/AI_VIDEO_LIBRARY_Setup_v3.0.exe');
const zipOut = path.resolve(__dirname, '../scratch/zip3_analysis/extracted_payload.zip');
const unpackDir = path.resolve(__dirname, '../scratch/zip3_analysis/extracted_app_files');

console.log('[*] Slicing zip from offset 4764...');
const readStream = fs.createReadStream(exe, { start: 4764 });
const writeStream = fs.createWriteStream(zipOut);

readStream.pipe(writeStream).on('finish', () => {
  console.log('✅ Created extracted_payload.zip! Size:', fs.statSync(zipOut).size);
  
  if (fs.existsSync(unpackDir)) {
    fs.rmSync(unpackDir, { recursive: true, force: true });
  }
  fs.mkdirSync(unpackDir, { recursive: true });

  console.log('[*] Extracting with PowerShell...');
  const cmd = `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipOut}' -DestinationPath '${unpackDir}' -Force"`;
  try {
    cp.execSync(cmd, { stdio: 'inherit' });
    console.log('🎉 Extracted successfully to:', unpackDir);
  } catch (e) {
    console.error('PowerShell Expand-Archive failed:', e.message);
  }
});
