@echo off
echo ====================================
echo FlightToolbox 完整清理和重启指南
echo ====================================

echo.
echo ✅ 发现问题已解决：
echo    - miniprogram_npm 目录已存在且完整
echo    - Vant 组件文件都在正确位置
echo    - pages/operations/index.js 文件确实存在

echo.
echo 🔧 现在请按以下步骤操作：
echo ====================================

echo.
echo 1. 关闭微信开发者工具
echo    - 完全退出程序

echo.
echo 2. 清理缓存（可选但推荐）
echo    - 删除：%APPDATA%\微信开发者工具\Default\*
echo    - 或者直接重启电脑

echo.
echo 3. 重新打开微信开发者工具
echo    - 导入项目：D:\FlightToolbox\miniprogram
echo    - 注意：是 miniprogram 目录，不是 FlightToolbox 目录

echo.
echo 4. 编译项目
echo    - 点击编译按钮
echo    - 应该不会再出现组件文件找不到的错误

echo.
echo 5. 如果还有问题，尝试：
echo    - 工具 → 构建npm （重新构建）
echo    - 项目 → 清除缓存
echo    - 重新编译

echo.
echo 📊 预期结果：
echo ✅ 不再显示 pages/operations/index.js 找不到的错误
echo ✅ 不再显示 Vant 组件文件找不到的错误
echo ✅ 控制台干净，编译成功
echo ✅ 小程序能正常运行和预览

echo.
echo 💡 提示：
echo    - 如果编译成功但预览时仍有问题，可能是真机缓存
echo    - 可以尝试更换预览二维码或清除手机微信缓存
echo.
pause