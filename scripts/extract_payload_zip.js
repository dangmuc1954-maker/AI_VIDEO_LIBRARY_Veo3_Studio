const cp = require('child_process');
const path = require('path');
const fs = require('fs');

const zip = path.resolve('scratch/extracted_payload.zip');
const out = path.resolve('scratch/zip3_source_app');

if (fs.existsSync(out)) fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const ps = `\uFEFF
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory('${zip.replace(/'/g, "''")}', '${out.replace(/'/g, "''")}')
`;
fs.writeFileSync('temp_extract.ps1', ps, 'utf8');

try {
  cp.execSync('powershell -ExecutionPolicy Bypass -File temp_extract.ps1', { stdio: 'inherit' });
  console.log('✅ Extracted payload successfully to:', out);
} finally {
  if (fs.existsSync('temp_extract.ps1')) fs.unlinkSync('temp_extract.ps1');
}
