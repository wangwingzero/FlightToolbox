/**
 * 广告文案管理器
 * 提供随机变化的广告文案，提升用户体验和转化率
 */

/**
 * 观看前的吸引文案（20组）
 * 风格：幽默、接地气、江湖气息 + 情绪价值
 * 新增：巧妙融入观看时长(30秒)和奖励(1小时无广告)
 */
var beforeAdCopies = [
  { title: '江湖规矩，看30秒支持一下', desc: '换1小时清爽，够意思吧' },
  { title: '按江湖规矩，赏个30秒的脸', desc: '回敬您1小时VIP待遇' },
  { title: '作者靠这个吃饭，30秒帮帮忙', desc: '感谢大佬，送您1小时清净' },
  { title: '朋友，来都来了，看30秒呗', desc: '1小时不扰，就当交个朋友' },
  { title: '维护不易，30秒江湖救急', desc: '知恩图报，1小时无打扰' },
  { title: '老铁，30秒点一下就行', desc: '良心回馈1小时清爽' },
  { title: '您大人有大量，帮衬30秒', desc: '小程序靠您养活，1小时谢礼' },
  { title: '兄弟，30秒赏口饭吃呗', desc: '感恩戴德，送您1小时清净' },
  { title: '搬砖不易，30秒赏个机会', desc: '成全作者KPI，回馈1小时VIP' },
  { title: '帮个30秒的忙，就当认识一场', desc: '广告完=1小时无打扰' },
  { title: '大哥，30秒施舍点流量呗', desc: '报答您1小时清净世界' },
  { title: '行行好，30秒救济一下', desc: '好人一生平安，1小时无广告' },
  { title: '老板，30秒慷慨解囊一下', desc: '发大财！1小时VIP回馈' },
  { title: '30秒给小的一口饭吃', desc: '这恩情记下了，1小时答谢' },
  { title: '好心人，30秒帮个忙呗', desc: '您的善意，1小时回报' },
  { title: '大侠留步，30秒就好', desc: '小的感激不尽，送1小时清净' },
  { title: '打扰30秒，求个生路', desc: '滴水之恩，1小时相报' },
  { title: '高抬贵手，30秒就够', desc: '感激涕零，1小时清爽奉上' },
  { title: '30秒，就当做个善事', desc: '功德无量，1小时福报' },
  { title: '有缘人，30秒结个善缘', desc: '善有善报，1小时清净' }
];

/**
 * 观看后的感谢文案（20组）
 * 风格：幽默、感恩、情绪价值 + 接地气
 */
var afterAdCopies = [
  { title: '江湖有你，真好！', icon: '✨' },
  { title: '您就是我的衣食父母！', icon: '🙏' },
  { title: '大佬威武，霸气侧漏！', icon: '💪' },
  { title: '您这一看，够我吃三天饭！', icon: '🍚' },
  { title: '好人一生平安！', icon: '🎉' },
  { title: '您的支持就是最大动力！', icon: '❤️' },
  { title: '感谢老板慷慨解囊！', icon: '💰' },
  { title: '这个恩情记下了！', icon: '📝' },
  { title: '您真是个热心肠！', icon: '🔥' },
  { title: '遇到您真是我的福气！', icon: '🍀' },
  { title: '大哥大气，佩服佩服！', icon: '👍' },
  { title: '这份情义，小的铭记于心！', icon: '💝' },
  { title: '您的善举，功德无量！', icon: '🙌' },
  { title: '遇见您，三生有幸！', icon: '🌟' },
  { title: '老铁给力，没毛病！', icon: '💯' },
  { title: '您这格局，我服了！', icon: '🎯' },
  { title: '跟着您，有肉吃！', icon: '🥩' },
  { title: '这辈子记住您了！', icon: '💖' },
  { title: '您就是传说中的贵人！', icon: '👑' },
  { title: '滴水之恩，涌泉相报！', icon: '🌊' }
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

