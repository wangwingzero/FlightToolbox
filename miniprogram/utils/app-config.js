/**
 * 应用全局配置
 * 包含广告、API等配置信息
 */

var AppConfig = {
  // 广告配置
  ad: {
    // 激励视频广告单元ID（仅使用1个广告位）
    // ⚠️ 重要：仅使用已申请的激励视频广告位，否则无收益
    rewardVideoIds: [
      'adunit-079d7e04aeba0625'   // 资料查询（唯一激励广告位）
    ],
    // 当前使用的广告单元ID
    rewardVideoId: 'adunit-079d7e04aeba0625',

    // 是否在开发环境显示测试广告
    useTestAd: false  // 改为false，使用真实广告
  },

  // 其他配置...
};

module.exports = AppConfig;