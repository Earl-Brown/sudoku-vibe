@echo off
setlocal
cd /d "%~dp0"
call "%~dp0stop-server.bat"
if exist ".next" powershell -NoProfile -ExecutionPolicy Bypass -Command "Remove-Item '.next' -Recurse -Force"
if exist "out" powershell -NoProfile -ExecutionPolicy Bypass -Command "Remove-Item 'out' -Recurse -Force"
call "C:\Program Files\nodejs\npm.cmd" run build
