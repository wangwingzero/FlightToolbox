/**
 * 广告文案管理器
 * 提供随机变化的广告文案，提升用户体验和转化率
 * 
 * 📝 2025-12-29 更新：
 * - 激励广告改为"增加经验值"功能
 * - 移除"免广告"相关文案，避免诱导点击
 * - 文案风格：充满情绪价值的感谢用户观看
 */

/**
 * 观看前的吸引文案
 * 风格：幽默、感谢、情绪价值为主，偶尔提经验值
 */
var beforeAdCopies = [
  { title: '帮作者买杯咖啡☕', desc: '30秒视频，你的支持是我更新的动力' },
  { title: '请作者喝杯奶茶🧋', desc: '看个视频，让我继续为你写代码' },
  { title: '支持一下独立开发者', desc: '30秒换一个感谢，值了' },
  { title: '给作者加个鸡腿🍗', desc: '你的支持让这个小程序越来越好' },
  { title: '帮作者交个服务器费', desc: '看视频不花钱，但对我帮助很大' },
  { title: '让作者今晚加个菜', desc: '30秒视频，换一份真诚的感谢' },
  { title: '支持独立开发，人人有责', desc: '开个玩笑，但真的很感谢你' },
  { title: '作者的更新动力来源', desc: '每一次观看都是对我的鼓励' },
  { title: '30秒视频，顺便拿100经验', desc: '支持作者的同时还能升级，双赢' },
  { title: '请作者吃个煎饼果子🥞', desc: '你的支持比煎饼还香' }
];

/**
 * 观看后的感谢文案
 * 风格：幽默、感恩、情绪价值为主
 */
var afterAdCopies = [
  { title: '感谢大佬支持！敬礼！', icon: '🫡' },
  { title: '谢谢你！今晚加班有动力了', icon: '💪' },
  { title: '收到！咖啡钱到账！', icon: '☕' },
  { title: '感动！你是最棒的用户！', icon: '🥹' },
  { title: '谢谢支持！继续努力更新！', icon: '✨' },
  { title: '爱了爱了！感谢有你！', icon: '❤️' },
  { title: '收到打赏！干劲满满！', icon: '🔥' },
  { title: '太感谢了！鞠躬！', icon: '🙇' },
  { title: '你的支持已收到！比心！', icon: '🫶' },
  { title: '谢谢老板！祝航班顺利！', icon: '✈️' }
];

/**
 * 随机获取观看前文案
 * @returns {Object} 包含title和desc的文案对象
 */
function getBeforeAdCopy() {
  var index = Math.floor(Math.random() * beforeAdCopies.length);
  var copy = beforeAdCopies[index];
  console.log('🎯 随机选择观看前文案:', copy.title);
  return copy;
}

/**
 * 随机获取观看后文案
 * @returns {Object} 包含title和icon的文案对象
 */
function getAfterAdCopy() {
  var index = Math.floor(Math.random() * afterAdCopies.length);
  var copy = afterAdCopies[index];
  console.log('🎉 随机选择感谢文案:', copy.title);
  return copy;
}

module.exports = {
  getBeforeAdCopy: getBeforeAdCopy,
  getAfterAdCopy: getAfterAdCopy
};
