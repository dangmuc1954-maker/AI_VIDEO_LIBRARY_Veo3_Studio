const { execSync } = require('child_process');
const fs = require('fs');

const psScript = `
$wsh = New-Object -ComObject WScript.Shell
$sc = $wsh.CreateShortcut('C:\\Users\\admin\\Desktop\\AIForge Studio.lnk')
[PSCustomObject]@{
    TargetPath = $sc.TargetPath
    Arguments = $sc.Arguments
    WorkingDirectory = $sc.WorkingDirectory
} | ConvertTo-Json
`;

fs.writeFileSync('temp_sc.ps1', psScript);
try {
    const out = execSync('powershell -ExecutionPolicy Bypass -File temp_sc.ps1').toString();
    console.log('Shortcut info:', out);
} catch (e) {
    console.error(e);
} finally {
    if (fs.existsSync('temp_sc.ps1')) fs.unlinkSync('temp_sc.ps1');
}
