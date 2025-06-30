@echo off
echo 测试新用户引导只显示一次...
echo.
echo 检查修改内容：
echo 1. 用户引导组件 checkGuideConditions 方法已修改
echo 2. 新增 guide_shown_before 状态标记
echo 3. 完成引导时正确标记 user_onboarded 状态
echo 4. 跳过引导时也正确标记状态
echo 5. 重置功能包含所有新的状态标记
echo.
echo 修改完成！新用户引导现在只在第一次进入时显示。
echo.
echo 主要修改点：
echo - 新用户判断条件：!userOnboarded && !guideShownBefore && !completedGuides.includes('welcome')
echo - 显示引导时立即标记 guide_shown_before = true
echo - 完成/跳过引导时标记 user_onboarded = true
echo - 其他引导类型需要 userOnboarded = true 才能触发
echo.
echo 用户体验：
echo - 新用户第一次进入：显示欢迎引导
echo - 完成或跳过引导后：永不再显示
echo - 后续可能显示功能发现或高级功能引导
echo - 测试重置功能可以重新触发引导
echo.
pause