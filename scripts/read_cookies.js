const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const cookiePath = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA', 'Partitions', 'aivideo%3Aveo3-1789186636412', 'Network', 'Cookies');
console.log('Reading from:', cookiePath);

const psScript = `
$src = "${cookiePath.replace(/\\/g, '\\\\')}";
$dst = "temp_cookies.db";
$srcStream = [System.IO.File]::Open($src, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite);
$dstStream = [System.IO.File]::Create($dst);
$srcStream.CopyTo($dstStream);
$srcStream.Close();
$dstStream.Close();
`;

fs.writeFileSync('temp_read.ps1', psScript);
try {
  cp.execSync('powershell -ExecutionPolicy Bypass -File temp_read.ps1');
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync('temp_cookies.db', { open: true, readOnly: true });
  const rows = db.prepare('SELECT host_key, name, path, expires_utc FROM cookies').all();
  console.log('Total cookies:', rows.length);
  for (const r of rows) {
    if (r.name.includes('auth') || r.name.includes('token') || r.name.includes('session') || r.name.includes('SID') || r.name.includes('flow')) {
      console.log(r);
    }
  }
} catch (e) {
  console.error('Error:', e.message);
} finally {
  if (fs.existsSync('temp_read.ps1')) fs.unlinkSync('temp_read.ps1');
  if (fs.existsSync('temp_cookies.db')) fs.unlinkSync('temp_cookies.db');
}
