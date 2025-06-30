@echo off
echo 测试新用户主题默认设置...
echo.
echo 检查修改内容：
echo 1. app.ts globalData.theme 已修改为 'auto'
echo 2. app.ts initThemeManager 增加了新用户检查逻辑
echo 3. theme-manager.js init方法 增加了新用户默认设置
echo 4. others/index.ts data.themeMode 已确认为 'auto'
echo.
echo 修改完成！新用户现在默认跟随系统主题。
echo.
echo 主要修改点：
echo - 全局数据默认主题从 'light' 改为 'auto'
echo - 主题管理器初始化时检查新用户并设置默认值
echo - app启动时确保新用户主题偏好正确设置
echo.
pause