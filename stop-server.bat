@echo off
setlocal
cd /d "%~dp0"
"C:\Program Files\nodejs\node.exe" scripts\dev-server.cjs stop
