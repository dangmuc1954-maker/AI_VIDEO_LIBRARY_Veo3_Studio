@echo off
title Reset AIForge Shop Data
echo =========================================================
echo   Xoa du lieu cu cua App Shop (AIForge Studio)
echo   De App Shop khoi dong nhu may moi 100%%
echo =========================================================
echo.

set "SHOP_DIR=%APPDATA%\aiforge-studio"

if exist "%SHOP_DIR%" (
    echo [*] Dang don dep: %SHOP_DIR%
    rmdir /S /Q "%SHOP_DIR%" 2>nul
    echo [OK] Da xoa sach du lieu cu cua App Shop thanh cong!
) else (
    echo [INFO] Thu muc du lieu cua App Shop da sach se, khong can xoa.
)

echo.
echo Gio ban co the mo app cua shop (file .exe tai ve) de chay doc lap 100%%!
pause
