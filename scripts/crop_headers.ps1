Add-Type -AssemblyName System.Drawing
$imgDir = 'C:\Users\admin\.gemini\antigravity-ide\brain\7d7f2db8-fb73-4d7f-893d-f20b85f4ea4c\.user_uploaded'
$latest = Get-ChildItem $imgDir -Filter *.png | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$bmp = [System.Drawing.Bitmap]::FromFile($latest.FullName)

$rect = New-Object System.Drawing.Rectangle(1700, 270, 215, 250)
$crop = New-Object System.Drawing.Bitmap 215, 250
$g = [System.Drawing.Graphics]::FromImage($crop)
$g.DrawImage($bmp, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
$crop.Save('C:\Users\admin\Desktop\crop_headers.png', [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$crop.Dispose()
$bmp.Dispose()
Write-Host 'Cropped headers successfully to Desktop!'
