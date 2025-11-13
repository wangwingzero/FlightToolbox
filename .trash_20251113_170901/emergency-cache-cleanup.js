/**
 * 🚨 一键清理受污染缓存脚本（安全版本）
 *
 * 使用场景：发布版本用户受到真机调试版本缓存污染，需要紧急清理
 *
 * 使用方法：
 * 1. 在发布版本的任意页面 console 中复制执行此脚本
 * 2. 脚本会先显示将要清理的内容
 * 3. 在控制台执行 confirmCleanup() 确认清理
 * 4. 或执行 cancelCleanup() 取消操作
 *
 * @created 2025-01-08
 * @updated 2025-01-13 添加确认机制，防止误操作
 * @purpose 紧急清理受污染的缓存，恢复正常功能
 */

(function() {
  console.log('==========================================');
  console.log('🚨 缓存清理脚本（安全版本）');
  console.log('==========================================');
  console.log('⚠️ 警告：此操作将清理以下缓存：');
  console.log('  - 图片缓存索引（绕机检查）');
  console.log('  - 音频缓存索引（航线录音）');
  console.log('  - 预加载状态（1-9区域）');
  console.log('  - 数据索引（CCAR、ICAO等6个数据集）');
  console.log('  - 音频预热状态');
  console.log('');
  console.log('📝 请在控制台执行以下命令：');
  console.log('  confirmCleanup()  - ✅ 确认清理');
  console.log('  cancelCleanup()   - ❌ 取消操作');
  console.log('==========================================');

  // 执行清理的核心函数
  function executeCleanup() {
    console.log('');
    console.log('==========================================');
    console.log('🚀 开始执行清理操作...');
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

      // 3. 清理预加载状态（动态获取所有预加载状态）
      try {
        var storageInfo = wx.getStorageInfoSync();
        var allKeys = storageInfo.keys || [];

        allKeys.forEach(function(key) {
          if (key.indexOf('walkaround_preload_completed_') === 0) {
            try {
              wx.removeStorageSync(key);
              cleared.preloads++;
            } catch (err) {
              console.warn('⚠️ 清理预加载状态失败:', key, err);
            }
          }
        });
        console.log('✅ 已清理预加载状态 (' + cleared.preloads + '个区域)');
      } catch (err) {
        console.warn('⚠️ 动态清理预加载状态失败，使用固定范围:', err);
        // 降级：使用固定范围 1-9
        for (var i = 1; i <= 9; i++) {
          try {
            wx.removeStorageSync('walkaround_preload_completed_' + i);
            cleared.preloads++;
          } catch (err2) {
            console.warn('⚠️ 清理预加载状态失败 (区域' + i + '):', err2);
          }
        }
        console.log('✅ 已清理预加载状态 (' + cleared.preloads + '个区域)');
      }

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

      // 6. 可选：删除缓存文件（默认不删除，保留文件减少重新下载）
      console.log('💾 保留缓存文件，仅清理索引（下次访问会自动关联）');
      console.log('   如需删除文件，请设置 CLEAN_FILES = true');

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
  }

  // 定义全局确认函数
  window.confirmCleanup = function() {
    console.log('');
    console.log('✅ 用户已确认，开始清理...');
    executeCleanup();

    // 清理完成后删除全局函数
    delete window.confirmCleanup;
    delete window.cancelCleanup;
  };

  // 定义全局取消函数
  window.cancelCleanup = function() {
    console.log('');
    console.log('==========================================');
    console.log('❌ 用户已取消操作');
    console.log('==========================================');

    // 删除全局函数
    delete window.confirmCleanup;
    delete window.cancelCleanup;
  };
})();

// 使用说明（安全版本）：
// 1. 复制整个脚本到微信开发者工具的 Console 或真机调试的 vConsole
// 2. 脚本会显示将要清理的内容
// 3. 在控制台输入 confirmCleanup() 确认清理
// 4. 或输入 cancelCleanup() 取消操作
//
// ⚠️ 注意：
// - 不建议在 app.js 中直接调用，避免误删用户数据
// - 此脚本仅用于紧急修复受污染的缓存
// - 清理后建议立即删除此脚本
//
// 改进记录：
// - 2025-01-13: 添加确认机制，防止误操作
// - 2025-01-13: 改进预加载状态清理为动态获取
// - 2025-01-13: 添加清理文件选项说明
