@echo off
chcp 65001 >nul
title 一键清除 Cursor 缓存

echo 🚀 一键清除 Cursor 缓存中...

:: 强制关闭 Cursor 进程
taskkill /f /im "Cursor.exe" >nul 2>&1
taskkill /f /im "cursor.exe" >nul 2>&1
timeout /t 1 >nul

:: 快速清除主要缓存目录
echo 🗑️  正在清除缓存...
rd /s /q "%APPDATA%\Cursor\User\workspaceStorage" >nul 2>&1
rd /s /q "%APPDATA%\Cursor\User\globalStorage" >nul 2>&1
rd /s /q "%APPDATA%\Cursor\logs" >nul 2>&1
rd /s /q "%LOCALAPPDATA%\Cursor" >nul 2>&1
rd /s /q "%APPDATA%\Cursor\User\languageServer" >nul 2>&1
rd /s /q "%APPDATA%\Cursor\User\typescript" >nul 2>&1
rd /s /q "%APPDATA%\Cursor\CrashDumps" >nul 2>&1

:: 清除临时文件
for /d %%i in ("%TEMP%\cursor*") do rd /s /q "%%i" >nul 2>&1
del /f /q "%TEMP%\*.tsbuildinfo" >nul 2>&1

echo ✅ 缓存清除完成！
echo 🚀 正在启动 Cursor...

:: 自动启动 Cursor
start "" "cursor" >nul 2>&1

echo ✨ 完成！Cursor 应该更流畅了
timeout /t 3 