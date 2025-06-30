@echo off
echo 测试弹窗空内容闪现修复...
echo.
echo 修复内容：
echo 1. 时序优化：先关闭弹窗，等动画完成后再重置数据
echo 2. 延迟重置：使用300ms延迟确保弹窗关闭动画完成
echo 3. 条件渲染：只有在有数据时才显示弹窗内容
echo 4. 分步操作：分离弹窗关闭和数据重置操作
echo.
echo 修复逻辑：
echo 1. 用户点击关闭按钮或遮罩层
echo 2. 立即设置showPopup=false（开始关闭动画）
echo 3. 等待300ms让关闭动画完成
echo 4. 重置selectedData={}（清空数据）
echo 5. 重置弹窗位置信息
echo.
echo 请在微信开发者工具中测试以下场景：
echo 1. 打开万能查询页面
echo 2. 点击任意缩写/定义/机场/通信项目
echo 3. 确认弹窗正常打开，内容完整显示
echo 4. 点击关闭按钮或点击遮罩层关闭弹窗
echo 5. 观察关闭过程，确认没有空内容弹窗闪现
echo 6. 再次点击其他项目，确认弹窗可以正常重新打开
echo.
echo 预期效果：
echo ✅ 弹窗打开：内容完整显示
echo ✅ 弹窗关闭：平滑关闭，无空内容闪现
echo ✅ 重新打开：可以正常重复使用
echo ✅ 内容滚动：长内容可以正常滚动查看
echo.
echo 如果仍有问题，可能需要：
echo 1. 调整延迟时间（当前300ms）
echo 2. 使用wx.nextTick()替代setTimeout
echo 3. 检查Vant组件的关闭动画时长
echo 4. 考虑使用不同的状态管理策略
echo.
pause