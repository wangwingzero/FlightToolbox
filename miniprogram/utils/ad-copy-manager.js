/**
 * 广告文案管理器
 * 提供随机变化的广告文案，提升用户体验和转化率
 */

/**
 * 观看前的吸引文案（10组）
 * 风格：幽默、接地气、江湖气息
 */
var beforeAdCopies = [
  { title: '江湖规矩，看个广告支持一下', desc: '维护不易，1小时清爽体验' },
  { title: '按江湖规矩，请您赏个脸', desc: '看个视频，清爽1小时' },
  { title: '作者靠这个吃饭，帮帮忙呗', desc: '1分钟换1小时无广告' },
  { title: '朋友，来都来了，看个广告呗', desc: '就当交个朋友，1小时不扰' },
  { title: '维护不易，江湖救急', desc: '您的支持是最大动力' },
  { title: '老铁，点一下就行', desc: '1分钟广告换1小时清净' },
  { title: '您大人有大量，帮衬一下', desc: '小程序全靠各位大佬养活' },
  { title: '兄弟，赏口饭吃呗', desc: '看完广告，清爽1小时' },
  { title: '搬砖不易，赏个机会呗', desc: '用1分钟成全作者的KPI' },
  { title: '帮个忙，就当认识一场', desc: '广告完=1小时VIP体验' }
];

/**
 * 观看后的感谢文案（10组）
 * 风格：幽默、感恩、情绪价值
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
  { title: '遇到您真是我的福气！', icon: '🍀' }
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

