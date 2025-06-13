@echo off
echo Attempting to terminate any running parcina-slideshow.exe...
taskkill /F /IM parcina-slideshow.exe >nul 2>&1

echo Building parcina-slideshow...
npx electron-packager . parcina-slideshow --platform=win32 --arch=x64 --out=dist --overwrite --icon=icon.ico

echo Build complete. Press any key to close.
pause