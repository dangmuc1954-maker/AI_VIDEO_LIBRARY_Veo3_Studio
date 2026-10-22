@echo off
:: Tự động yêu cầu quyền Administrator (UAC Prompt)
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo Đang yêu cầu quyền Administrator...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    pushd "%CD%"
    CD /D "%~dp0"
    chcp 65001 >nul

echo ======================================================================
echo   ⚡ MỞ KHÓA TOÀN BỘ QUYỀN GHI Ổ ĐĨA D: CHO AI VIDEO LIBRARY ⚡
echo ======================================================================
echo.
echo Đang cấp quyền ghi (Modify/Full Control) cho Users trên ổ D:...
echo.

if exist "D:\" (
    icacls "D:\" /grant "Users":(OI)(CI)M
    icacls "D:\" /grant "Authenticated Users":(OI)(CI)M
    if exist "D:\ảnh" (
        icacls "D:\ảnh" /grant "Users":(OI)(CI)F /T
        icacls "D:\ảnh" /grant "Authenticated Users":(OI)(CI)F /T
        attrib -r "D:\ảnh" /s /d >nul 2>&1
    )
    if exist "D:\video" (
        icacls "D:\video" /grant "Users":(OI)(CI)F /T
        icacls "D:\video" /grant "Authenticated Users":(OI)(CI)F /T
        attrib -r "D:\video" /s /d >nul 2>&1
    )
    echo.
    echo ✅ ĐÃ MỞ KHÓA THÀNH CÔNG Ổ ĐĨA D: VÀ CÁC THƯ MỤC ẢNH / VIDEO!
    echo Bây giờ bạn có thể chọn lưu video và ảnh vào bất kỳ thư mục nào trên ổ D:!
) else (
    echo Ổ D: không tồn tại trên máy tính này.
)

echo.
echo ======================================================================
echo Nhấn phím bất kỳ để thoát...
pause >nul
