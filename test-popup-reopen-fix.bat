@echo off
echo 测试弹窗重复打开修复...
echo.
echo 修复内容：
echo 1. 完全重置弹窗状态：在关闭弹窗时重置selectedAbbreviation、popupTop、popupLeft
echo 2. 添加调试日志：在打开和关闭弹窗时输出状态信息
echo 3. 确保事件绑定正常：添加pointer-events: auto确保事件不被阻止
echo 4. 简化CSS修改：移除可能导致冲突的overflow和display设置
echo 5. 保持弹窗可见性：确保visibility: visible
echo.
echo 请在微信开发者工具中测试以下场景：
echo 1. 打开万能查询页面
echo 2. 点击任意缩写/定义/机场/通信项目，查看弹窗是否正常打开
echo 3. 关闭弹窗（点击遮罩层或关闭按钮）
echo 4. 再次点击相同或不同的项目
echo 5. 确认弹窗可以重复正常打开
echo 6. 检查控制台日志，确认状态变化正常
echo.
echo 调试信息：
echo - 打开弹窗时会显示："🔍 点击显示缩写详情，当前弹窗状态: false"
echo - 状态更新后会显示："✅ 缩写弹窗状态已更新: true"
echo - 关闭弹窗时会显示："❌ 关闭缩写详情弹窗"
echo - 关闭完成后会显示："✅ 缩写弹窗已关闭，状态: false"
echo.
echo 如果问题仍然存在，可能的原因：
echo 1. Vant组件内部状态管理问题
echo 2. 微信小程序框架的渲染机制问题
echo 3. 事件冒泡或捕获问题
echo 4. 数据绑定的异步更新问题
echo.
pause