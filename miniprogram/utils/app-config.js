/**
 * 应用全局配置
 * 包含广告、API等配置信息
 */

var AppConfig = {
  // 广告配置
  ad: {
    // 激励视频广告单元ID列表（支持多个广告位轮换）
    rewardVideoIds: [
      'adunit-079d7e04aeba0625',  // 主广告位（新）
      'adunit-316c5630d7a1f9ef',  // 备用广告位1
      'adunit-190474fb7b19f51e'   // 备用广告位2
    ],
    // 当前使用的广告单元ID（默认使用第一个）
    rewardVideoId: 'adunit-079d7e04aeba0625',
    
    // 是否在开发环境显示测试广告
    useTestAd: false  // 改为false，使用真实广告
  },
  
  // 其他配置...
};

module.exports = AppConfig;