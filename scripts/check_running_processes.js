const { execSync } = require('child_process');

try {
  const out = execSync('powershell "Get-Process | Where-Object { $_.MainWindowTitle -ne \'\' } | Select-Object Id, ProcessName, MainWindowTitle"', { encoding: 'utf8' });
  console.log(out);
} catch (e) {
  console.error(e.message);
}
