@echo off
echo FlightToolbox 微信小程序问题修复脚本
echo ==========================================

echo.
echo 1. 重新安装npm依赖...
cd miniprogram
call npm install

echo.
echo 2. 清理npm缓存...
call npm cache clean --force

echo.
echo 3. 删除旧的miniprogram_npm目录...
if exist miniprogram_npm rmdir /s /q miniprogram_npm

echo.
echo 4. 检查Vant版本...
call npm list @vant/weapp

echo.
echo 5. 修复完成！
echo.
echo 📢 接下来请手动完成以下步骤:
echo ==========================================
echo 1. 打开微信开发者工具
echo 2. 点击菜单: 工具 → 构建npm
echo 3. 确认构建成功后重新编译项目
echo.
echo 🎯 这将解决组件文件缺失和控制台警告问题
echo.
pause