const cp = require('child_process');
const path = require('path');

const exe = path.resolve(__dirname, '../scratch/zip3_analysis/AI_VIDEO_LIBRARY_Setup_v3.0.exe');
const script = `
$bytes = [System.IO.File]::ReadAllBytes('${exe.replace(/\\/g, '\\\\')}')
$assembly = [System.Reflection.Assembly]::Load($bytes)
$names = $assembly.GetManifestResourceNames()
foreach ($n in $names) {
    Write-Host "RESOURCE: $n"
    $s = $assembly.GetManifestResourceStream($n)
    Write-Host "LENGTH: $($s.Length)"
}
`;

try {
  const out = cp.execSync(`powershell -NoProfile -Command "${script}"`, { encoding: 'utf8' });
  console.log(out);
} catch (e) {
  console.error(e.message);
}
