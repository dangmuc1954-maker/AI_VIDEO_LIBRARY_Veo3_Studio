const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const cookiePath = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA', 'Partitions', 'aivideo%3Aveo3-1789186636412', 'Network', 'Cookies');
console.log('Target cookie file:', cookiePath);

// PowerShell script with FileShare ReadWrite | Delete
const ps = `
$src = '${cookiePath.replace(/'/g, "''")}';
$dst = 'temp_cookies_copy.db';
try {
  $file = [System.IO.File]::Open($src, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite -bor [System.IO.FileShare]::Delete)
  $out = [System.IO.File]::Create($dst)
  $file.CopyTo($out)
  $file.Close()
  $out.Close()
  Write-Host "SUCCESS_COPIED"
} catch {
  Write-Host "ERR: $($_.Exception.Message)"
}
`;

fs.writeFileSync('copy_cookie.ps1', ps);
const out = cp.execSync('powershell -ExecutionPolicy Bypass -File copy_cookie.ps1').toString();
console.log('PS output:', out);

if (fs.existsSync('temp_cookies_copy.db')) {
  try {
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync('temp_cookies_copy.db', { open: true, readOnly: true });
    const rows = db.prepare('SELECT host_key, name, path, expires_utc, length(encrypted_value) as enc_len FROM cookies').all();
    console.log('Total cookies found:', rows.length);
    for (const r of rows) {
      if (r.name.includes('auth') || r.name.includes('token') || r.name.includes('session') || r.name.includes('SID') || r.name.includes('flow') || r.name.includes('google')) {
        console.log(r);
      }
    }
  } catch (e) {
    console.error('SQLite read error:', e.message);
  }
}
