/**
 * 🔍 缓存版本隔离完整验证脚本
 *
 * 功能：一键验证所有缓存系统是否正确使用版本隔离
 *
 * 使用方法：
 * 1. 在小程序任意页面的 console 中执行此脚本
 * 2. 或在 app.js 的 onLaunch 中临时添加（调试完后删除）
 *
 * @created 2025-01-08
 * @purpose 验证版本隔离机制是否正常工作
 */

(function() {
  console.log('==========================================');
  console.log('🔍 开始验证缓存版本隔离...');
  console.log('==========================================');

  var VersionManager = require('./utils/version-manager.js');

  // ==================== 第1步：显示版本信息 ====================
  console.log('');
  console.log('【步骤1】版本信息检查');
  console.log('-----------------------------------');

  var versionInfo = VersionManager.getAppVersionInfo();
  console.log('📦 版本号:', versionInfo.version);
  console.log('🏷️  环境类型:', versionInfo.description);
  console.log('🔑 版本前缀:', versionInfo.fullPrefix);

  // ==================== 第2步：验证关键缓存Key ====================
  console.log('');
  console.log('【步骤2】验证关键缓存Key');
  console.log('-----------------------------------');

  var expectedKeys = {
    '图片缓存索引': VersionManager.getVersionedKey('walkaround_image_cache_index'),
    '音频缓存索引': VersionManager.getVersionedKey('flight_audio_cache_index'),
    'CCAR索引': VersionManager.getVersionedKey('flight_toolbox_index_ccar'),
    'ICAO索引': VersionManager.getVersionedKey('flight_toolbox_index_icao'),
    '机场索引': VersionManager.getVersionedKey('flight_toolbox_index_airports')
  };

  var passedCount = 0;
  var totalCount = Object.keys(expectedKeys).length;

  Object.keys(expectedKeys).forEach(function(name) {
    var key = expectedKeys[name];
    var hasVersionPrefix = key.indexOf(versionInfo.fullPrefix) === 0;

    if (hasVersionPrefix) {
      console.log('✅', name + ':', key);
      passedCount++;
    } else {
      console.error('❌', name + ':', key, '（缺少版本前缀！）');
    }
  });

  console.log('');
  console.log('验证结果:', passedCount + '/' + totalCount, passedCount === totalCount ? '✅ 全部通过' : '❌ 存在问题');

  // ==================== 第3步：检查实际Storage ====================
  console.log('');
  console.log('【步骤3】检查实际Storage内容');
  console.log('-----------------------------------');

  try {
    var storageInfo = wx.getStorageInfoSync();
    var allKeys = storageInfo.keys || [];

    var versionedKeys = [];
    var legacyKeys = [];

    allKeys.forEach(function(key) {
      // 检查是否包含版本前缀
      if (key.indexOf('release_') === 0 ||
          key.indexOf('trial_') === 0 ||
          key.indexOf('debug_') === 0 ||
          key.indexOf('dev_') === 0) {
        versionedKeys.push(key);
      } else if (
        key.indexOf('cache') !== -1 ||
        key.indexOf('index') !== -1 ||
        key.indexOf('preload') !== -1 ||
        key.indexOf('walkaround') !== -1 ||
        key.indexOf('audio') !== -1 ||
        key.indexOf('flight_toolbox') !== -1
      ) {
        legacyKeys.push(key);
      }
    });

    console.log('📊 版本化缓存Key数量:', versionedKeys.length);
    if (versionedKeys.length > 0) {
      console.log('版本化Key列表:');
      versionedKeys.forEach(function(key) {
        console.log('  -', key);
      });
    }

    console.log('');
    console.log('📊 旧版本缓存Key数量:', legacyKeys.length);
    if (legacyKeys.length > 0) {
      console.warn('⚠️ 检测到旧版本缓存，建议清理:');
      legacyKeys.forEach(function(key) {
        console.warn('  -', key);
      });
    } else {
      console.log('✅ 无旧版本缓存');
    }

  } catch (error) {
    console.error('❌ 检查Storage失败:', error);
  }

  // ==================== 第4步：统计缓存使用情况 ====================
  console.log('');
  console.log('【步骤4】缓存使用情况统计');
  console.log('-----------------------------------');

  VersionManager.logCacheStatistics();

  // ==================== 第5步：验证缓存目录 ====================
  console.log('');
  console.log('【步骤5】验证缓存目录');
  console.log('-----------------------------------');

  var fs = wx.getFileSystemManager();

  // 检查图片缓存目录
  try {
    fs.accessSync(wx.env.USER_DATA_PATH + '/walkaround-images');
    fs.readdirSync(wx.env.USER_DATA_PATH + '/walkaround-images');
    var imageFiles = fs.readdirSync(wx.env.USER_DATA_PATH + '/walkaround-images');
    console.log('✅ 图片缓存目录存在，文件数量:', imageFiles.length);
  } catch (err) {
    console.warn('⚠️ 图片缓存目录不存在或为空');
  }

  // 检查音频缓存目录
  try {
    fs.accessSync(wx.env.USER_DATA_PATH + '/audio-recordings');
    var audioFiles = fs.readdirSync(wx.env.USER_DATA_PATH + '/audio-recordings');
    console.log('✅ 音频缓存目录存在，文件数量:', audioFiles.length);
  } catch (err) {
    console.warn('⚠️ 音频缓存目录不存在或为空');
  }

  // ==================== 第6步：功能测试建议 ====================
  console.log('');
  console.log('【步骤6】功能测试建议');
  console.log('-----------------------------------');
  console.log('请手动验证以下功能:');
  console.log('1. 访问"绕机检查"，点击任意区域，验证图片正常显示');
  console.log('2. 播放"航线录音"，验证音频正常播放');
  console.log('3. 搜索"CCAR规章"，验证搜索速度快（<100ms）');
  console.log('4. 开启飞行模式，重启小程序，验证离线功能正常');

  // ==================== 最终总结 ====================
  console.log('');
  console.log('==========================================');
  console.log('📊 验证总结');
  console.log('==========================================');

  var finalScore = 0;
  var maxScore = 5;

  // 评分项1：版本前缀正确
  if (passedCount === totalCount) {
    console.log('✅ 版本前缀正确 (+1分)');
    finalScore++;
  } else {
    console.log('❌ 版本前缀错误 (+0分)');
  }

  // 评分项2：版本化Key存在
  if (versionedKeys.length > 0) {
    console.log('✅ 检测到版本化Key (+1分)');
    finalScore++;
  } else {
    console.log('❌ 未检测到版本化Key (+0分)');
  }

  // 评分项3：旧缓存已清理
  if (legacyKeys.length === 0) {
    console.log('✅ 无旧版本缓存 (+1分)');
    finalScore++;
  } else {
    console.log('⚠️ 存在旧版本缓存，建议清理 (+0.5分)');
    finalScore += 0.5;
  }

  // 评分项4：图片缓存目录存在
  try {
    fs.accessSync(wx.env.USER_DATA_PATH + '/walkaround-images');
    console.log('✅ 图片缓存目录正常 (+1分)');
    finalScore++;
  } catch (err) {
    console.log('⚠️ 图片缓存目录不存在 (+0分)');
  }

  // 评分项5：音频缓存目录存在
  try {
    fs.accessSync(wx.env.USER_DATA_PATH + '/audio-recordings');
    console.log('✅ 音频缓存目录正常 (+1分)');
    finalScore++;
  } catch (err) {
    console.log('⚠️ 音频缓存目录不存在 (+0分)');
  }

  console.log('');
  console.log('【最终得分】', finalScore.toFixed(1) + '/' + maxScore);

  if (finalScore >= 4.5) {
    console.log('🎉 优秀！版本隔离机制工作正常');
  } else if (finalScore >= 3) {
    console.log('⚠️ 良好，但建议优化（清理旧缓存等）');
  } else {
    console.log('❌ 存在问题，请检查代码实现');
  }

  console.log('==========================================');

  // ==================== 返回验证结果 ====================
  return {
    passed: finalScore >= 4,
    score: finalScore,
    maxScore: maxScore,
    versionInfo: versionInfo,
    versionedKeysCount: versionedKeys.length,
    legacyKeysCount: legacyKeys.length,
    recommendations: legacyKeys.length > 0 ? ['清理旧版本缓存'] : []
  };
})();

// 使用说明：
// 1. 复制整个脚本到微信开发者工具的 Console
// 2. 或在真机调试时的 vConsole 中执行
// 3. 观察输出结果，确认版本隔离是否正常工作
//
// 预期结果：
// - 版本前缀正确：✅
// - 检测到版本化Key：✅
// - 无旧版本缓存：✅
// - 缓存目录正常：✅
// - 最终得分：≥ 4.5/5.0
