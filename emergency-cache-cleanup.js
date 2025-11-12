/**
 * 🚨 一键清理受污染缓存脚本
 *
 * 使用场景：发布版本用户受到真机调试版本缓存污染，需要紧急清理
 *
 * 使用方法：
 * 1. 在发布版本的任意页面 console 中复制执行此脚本
 * 2. 或在 app.js 的 onLaunch 中临时添加此代码（调试完后删除）
 *
 * @created 2025-01-08
 * @purpose 紧急清理受污染的缓存，恢复正常功能
 */

(function() {
  console.log('==========================================');
  console.log('🚨 开始清理受污染的缓存...');
  console.log('==========================================');

  var cleared = {
    images: 0,
    audios: 0,
    indexes: 0,
    preloads: 0,
    total: 0
  };

  try {
    // 1. 清理图片缓存索引
    try {
      wx.removeStorageSync('walkaround_image_cache_index');
      cleared.images++;
      console.log('✅ 已清理图片缓存索引');
    } catch (err) {
      console.warn('⚠️ 清理图片缓存索引失败:', err);
    }

    // 2. 清理音频缓存索引
    try {
      wx.removeStorageSync('flight_audio_cache_index');
      cleared.audios++;
      console.log('✅ 已清理音频缓存索引');
    } catch (err) {
      console.warn('⚠️ 清理音频缓存索引失败:', err);
    }

    // 3. 清理预加载状态（1-9区域）
    for (var i = 1; i <= 9; i++) {
      try {
        wx.removeStorageSync('walkaround_preload_completed_' + i);
        cleared.preloads++;
      } catch (err) {
        console.warn('⚠️ 清理预加载状态失败 (区域' + i + '):', err);
      }
    }
    console.log('✅ 已清理预加载状态 (' + cleared.preloads + '个区域)');

    // 4. 清理数据索引（常见数据集）
    var datasets = ['ccar', 'icao', 'airports', 'abbreviations', 'aircraft', 'dangerous_goods'];
    datasets.forEach(function(name) {
      try {
        wx.removeStorageSync('flight_toolbox_index_' + name);
        cleared.indexes++;
      } catch (err) {
        console.warn('⚠️ 清理数据索引失败 (' + name + '):', err);
      }
    });
    console.log('✅ 已清理数据索引 (' + cleared.indexes + '个数据集)');

    // 5. 清理音频预热状态
    try {
      wx.removeStorageSync('audio_preheat_status');
      wx.removeStorageSync('audio_preheat_timestamp');
      console.log('✅ 已清理音频预热状态');
    } catch (err) {
      console.warn('⚠️ 清理音频预热状态失败:', err);
    }

    // 6. 可选：删除缓存文件（不推荐，会增加重新缓存时间）
    // var fs = wx.getFileSystemManager();
    // try {
    //   fs.rmdirSync(wx.env.USER_DATA_PATH + '/walkaround-images', true);
    //   fs.rmdirSync(wx.env.USER_DATA_PATH + '/audio-recordings', true);
    //   console.log('✅ 已删除缓存文件目录');
    // } catch (err) {
    //   console.warn('⚠️ 删除缓存文件目录失败:', err);
    // }

    // 7. 显示存储使用情况
    wx.getStorageInfo({
      success: function(res) {
        var usedMB = (res.currentSize / 1024).toFixed(2);
        var limitMB = (res.limitSize / 1024).toFixed(2);
        var usagePercent = ((res.currentSize / res.limitSize) * 100).toFixed(1);

        console.log('==========================================');
        console.log('📊 存储使用情况:');
        console.log('   已用: ' + usedMB + 'MB / ' + limitMB + 'MB (' + usagePercent + '%)');
        console.log('   剩余: ' + ((res.limitSize - res.currentSize) / 1024).toFixed(2) + 'MB');
        console.log('==========================================');
      },
      fail: function(err) {
        console.warn('⚠️ 获取存储信息失败:', err);
      }
    });

    // 8. 统计清理结果
    cleared.total = cleared.images + cleared.audios + cleared.indexes + cleared.preloads;

    console.log('==========================================');
    console.log('✅ 清理完成！');
    console.log('📊 清理统计:');
    console.log('   图片缓存: ' + cleared.images);
    console.log('   音频缓存: ' + cleared.audios);
    console.log('   数据索引: ' + cleared.indexes);
    console.log('   预加载状态: ' + cleared.preloads);
    console.log('   总计: ' + cleared.total);
    console.log('==========================================');
    console.log('');
    console.log('📌 下一步操作:');
    console.log('1. 重启小程序（完全关闭后重新打开）');
    console.log('2. 进入绕机检查等功能，缓存会自动重建');
    console.log('3. 验证功能正常后，可以删除此脚本');
    console.log('==========================================');

    // 9. 可选：自动重启小程序
    if (typeof wx.reLaunch === 'function') {
      console.log('');
      console.log('⏳ 3秒后自动重启小程序...');
      setTimeout(function() {
        wx.reLaunch({ url: '/pages/home/index' });
      }, 3000);
    }

  } catch (error) {
    console.error('==========================================');
    console.error('❌ 清理过程发生错误:', error);
    console.error('==========================================');
  }
})();

// 使用说明：
// 1. 复制整个脚本到微信开发者工具的 Console
// 2. 或在真机调试时的 vConsole 中执行
// 3. 或临时添加到 app.js 的 onLaunch 中（记得调试完后删除）
//
// 示例（app.js）：
// App({
//   onLaunch: function() {
//     // 🚨 临时添加：清理受污染的缓存
//     // require('./emergency-cache-cleanup.js');
//   }
// });
