@echo off
echo ==============================================
echo FlightToolbox Vant组件路径修复脚本
echo ==============================================

echo.
echo 第1步: 清理旧的构建文件...
cd miniprogram
if exist miniprogram_npm rmdir /s /q miniprogram_npm
if exist node_modules rmdir /s /q node_modules

echo.
echo 第2步: 重新安装npm依赖...
call npm install

echo.
echo 第3步: 验证安装结果...
call npm list @vant/weapp

echo.
echo 第4步: 清理npm缓存...
call npm cache clean --force

echo.
echo 修复完成！
echo ==============================================
echo 📢 接下来请按以下步骤操作:
echo ==============================================
echo 1. 打开微信开发者工具
echo 2. 点击菜单: 工具 → 构建npm
echo 3. 确认构建成功（会生成miniprogram_npm目录）
echo 4. 重新编译项目
echo 5. 清除缓存后重新预览
echo.
echo ✅ 配置已修复: 
echo    - project.config.json 中的 npm 构建路径
echo    - 组件引用路径格式
echo.
echo ⚠️ 重要提醒:
echo    构建npm后应该会在miniprogram下生成miniprogram_npm目录
echo    如果还有路径错误，请检查该目录是否存在
echo.
pause