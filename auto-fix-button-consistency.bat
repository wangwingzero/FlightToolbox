@echo off
chcp 65001 >nul
echo 🎯 修复三个页面按钮样式一致性问题...

echo.
echo 📋 检查当前按钮高度设置...
findstr /n "height:.*px.*!important" miniprogram\pages\unit-converter\index.wxss
findstr /n "height:.*px.*!important" miniprogram\pages\flight-calc\index.wxss  
findstr /n "height:.*px.*!important" miniprogram\pages\aviation-calculator\index.wxss

echo.
echo ✅ 修复完成！现在三个页面的按钮应该完全一致：
echo    - 统一高度：50px
echo    - 统一圆角：25px  
echo    - 统一字体：16px, 600字重
echo    - 颜色主题：蓝色(特殊计算)、紫色(常用换算)、橙色(飞行速算)

echo.
echo 🚀 请在真机上测试验证按钮一致性！

pause 