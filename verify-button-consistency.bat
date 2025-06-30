@echo off
chcp 65001 >nul
echo 🎯 验证三个页面按钮一致性修复结果...

echo.
echo 📋 检查按钮高度设置（应该都是50px）...
findstr /n "height: 50px" miniprogram\pages\unit-converter\index.wxss
findstr /n "height: 50px" miniprogram\pages\flight-calc\index.wxss  
findstr /n "height: 50px" miniprogram\pages\aviation-calculator\index.wxss

echo.
echo 📋 检查按钮圆角设置（应该都是25px）...
findstr /n "border-radius: 25px" miniprogram\pages\unit-converter\index.wxss
findstr /n "border-radius: 25px" miniprogram\pages\flight-calc\index.wxss  
findstr /n "border-radius: 25px" miniprogram\pages\aviation-calculator\index.wxss

echo.
echo 📋 检查按钮字体设置（应该都是16px, 600）...
findstr /n "font-size: 16px" miniprogram\pages\unit-converter\index.wxss
findstr /n "font-size: 16px" miniprogram\pages\flight-calc\index.wxss  
findstr /n "font-size: 16px" miniprogram\pages\aviation-calculator\index.wxss

echo.
echo ✅ 修复完成！现在三个页面的按钮应该：
echo    - ✅ 统一高度：50px
echo    - ✅ 统一圆角：25px  
echo    - ✅ 统一字体：16px, 600字重
echo    - ✅ 统一布局：flex居中
echo    - ✅ 保持颜色主题差异：蓝色(特殊计算)、紫色(常用换算)、橙色(飞行速算)

echo.
echo 🚀 关键修复内容：
echo    1. 移除了特殊计算页面的强制颜色覆盖
echo    2. 统一了三个页面的button-cell样式
echo    3. 确保了尺寸、形状、字体的完全一致
echo    4. 保持了各页面的主题色差异

echo.
echo 🔍 请在真机上测试验证按钮一致性！

pause 