const { execSync } = require('child_process');
const out = execSync('powershell "Get-CimInstance Win32_Process -Filter \\"name=\'AI VIDEO LIBRARY.exe\'\\" | Select-Object ProcessId, CreationDate, Path | Format-Table -AutoSize"', { encoding: 'utf8' });
console.log(out);
