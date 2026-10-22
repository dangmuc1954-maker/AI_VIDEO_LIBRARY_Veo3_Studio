const fs = require('fs');
const { execSync } = require('child_process');

const ps = `
$wsh = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath('Desktop')
Get-ChildItem $desktop -Filter *.lnk | ForEach-Object {
    if ($_.Name -like "*AI*" -or $_.Name -like "*Video*") {
        $sc = $wsh.CreateShortcut($_.FullName)
        Write-Host "Shortcut: $($_.Name)"
        Write-Host "  TargetPath: $($sc.TargetPath)"
        Write-Host "  Arguments:  $($sc.Arguments)"
        Write-Host "  IconLocation: $($sc.IconLocation)"
        Write-Host "---"
    }
}
`;

try {
  const out = execSync(`powershell -Command "${ps.replace(/"/g, '\\"')}"`).toString();
  console.log(out);
} catch(e) {
  console.log('Error:', e.message);
}
