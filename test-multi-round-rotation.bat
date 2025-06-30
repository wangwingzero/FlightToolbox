@echo off
echo 测试多轮换班逻辑
echo.
echo 测试场景：
echo - 总飞行时间：12小时
echo - 机组套数：3套
echo - 换班轮数：2轮
echo.
echo 预期计算：
echo 12小时 ÷ 3套机组 ÷ 2轮 = 2小时/段
echo.
echo 预期安排：
echo 第1套机组(起飞): 2小时-1小时 = 1小时
echo 第2套机组(巡航): 2小时
echo 第3套机组(巡航): 2小时
echo 第2套机组(巡航): 2小时
echo 第3套机组(巡航): 2小时
echo 第1套机组(着陆): 1小时
echo.
echo 请在微信开发者工具中测试以上场景
pause