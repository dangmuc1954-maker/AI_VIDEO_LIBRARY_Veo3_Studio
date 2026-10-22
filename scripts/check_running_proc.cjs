const { execSync } = require('child_process');
try {
  const out = execSync(`powershell -NoProfile -Command "Get-CimInstance -ClassName Win32_Process | Where-Object { $_.Name -like '*VIDEO*' } | Select-Object ProcessId, ExecutablePath, CommandLine | Format-List"`, { encoding: 'utf8' });
  console.log(out);
} catch (e) {
  console.error(e.message);
}
