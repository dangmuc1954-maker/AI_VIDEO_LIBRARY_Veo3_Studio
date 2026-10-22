$wsh = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath('Desktop')
Get-ChildItem $desktop -Filter *.lnk | ForEach-Object {
    if ($_.Name -like "*AI*" -or $_.Name -like "*Video*") {
        $sc = $wsh.CreateShortcut($_.FullName)
        Write-Host "$($_.Name) ===> $($sc.TargetPath)"
    }
}
