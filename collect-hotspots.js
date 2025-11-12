// 热点坐标采集工具
// 在小程序页面中使用此代码收集坐标

// 1. 在小程序开发者工具控制台中运行此脚本
// 2. 点击飞机图上的24个位置
// 3. 脚本会自动记录坐标并生成更新代码

(function() {
  console.log('🎯 热点坐标采集工具已启动');
  console.log('请依次点击飞机图上的24个区域位置（按顺序：1→2→3...→24）');
  console.log('');

  var collectedPoints = [];
  var currentAreaIndex = 1;
  var canvasWidth = null;
  var canvasHeight = null;

  // 区域名称列表
  var areaNames = [
    '1-左前机身', '2-机头部分', '3-前起落架', '4-右前机身',
    '5-中下机身', '6-右中机翼', '7-2号发动机左侧', '8-2号发动机右侧',
    '9-右翼前缘', '10-右翼翼尖', '11-右翼后缘', '12-右主起落架',
    '13-中机身', '14-右后机身', '15-尾部', '16-APU',
    '17-左后机身', '18-左主起落架', '19-左翼后缘', '20-左翼翼尖',
    '21-左翼前缘', '22-1号发动机右侧', '23-1号发动机左侧', '24-左中机翼'
  ];

  // 获取Canvas尺寸
  var query = wx.createSelectorQuery();
  query.select('#walkaround-canvas').boundingClientRect(function(rect) {
    if (rect) {
      canvasWidth = rect.width;
      canvasHeight = rect.height;
      console.log('📐 Canvas尺寸:', canvasWidth, 'x', canvasHeight);
      console.log('');
    }
  }).exec();

  // 劫持handleCanvasTap方法来记录坐标
  var page = getCurrentPages()[getCurrentPages().length - 1];
  var originalHandleCanvasTap = page.handleCanvasTap;

  page.handleCanvasTap = function(event) {
    var detail = event.detail || (event.touches && event.touches[0]);

    if (detail && canvasWidth && canvasHeight) {
      var x = detail.x;
      var y = detail.y;

      // 计算归一化坐标
      var cx = (x / canvasWidth).toFixed(3);
      var cy = (y / canvasHeight).toFixed(3);

      collectedPoints.push({
        areaId: currentAreaIndex,
        name: areaNames[currentAreaIndex - 1],
        cx: parseFloat(cx),
        cy: parseFloat(cy),
        r: 0.05  // 默认半径
      });

      console.log(`✅ 区域 ${currentAreaIndex} (${areaNames[currentAreaIndex - 1]}): cx=${cx}, cy=${cy}`);

      currentAreaIndex++;

      if (currentAreaIndex <= 24) {
        console.log(`👉 请点击区域 ${currentAreaIndex}: ${areaNames[currentAreaIndex - 1]}`);
      } else {
        console.log('');
        console.log('🎉 所有24个区域坐标已采集完成！');
        console.log('');
        console.log('📋 复制以下坐标数据发送给我：');
        console.log('');
        console.log(JSON.stringify(collectedPoints, null, 2));
        console.log('');

        // 恢复原方法
        page.handleCanvasTap = originalHandleCanvasTap;
      }
    }

    // 继续执行原方法
    return originalHandleCanvasTap.call(this, event);
  };

  console.log(`👉 请点击区域 ${currentAreaIndex}: ${areaNames[currentAreaIndex - 1]}`);
})();
