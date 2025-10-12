/**
 * TabBar小红点管理器
 * 用于新手引导，在未访问的TabBar项上显示小红点
 */

// TabBar配置（与app.json保持一致）
var TAB_CONFIG = [
  { index: 0, text: '资料查询', pagePath: 'pages/search/index' },
  { index: 1, text: '计算工具', pagePath: 'pages/flight-calculator/index' },
  { index: 2, text: '驾驶舱', pagePath: 'pages/cockpit/index' },
  { index: 3, text: '通信', pagePath: 'pages/operations/index' },
  { index: 4, text: '我的首页', pagePath: 'pages/home/index' }
];

// 存储键
var STORAGE_KEY = 'tabbar_visited_pages';

/**
 * 获取已访问的页面列表
 */
function getVisitedPages() {
  try {
    var visited = wx.getStorageSync(STORAGE_KEY);
    return visited || [];
  } catch (error) {
    console.error('获取TabBar访问记录失败:', error);
    return [];
  }
}

/**
 * 标记页面已访问
 * @param {string} pagePath 页面路径
 */
function markPageVisited(pagePath) {
  try {
    var visited = getVisitedPages();

    // 标准化路径（去掉开头的斜杠）
    pagePath = pagePath.replace(/^\//, '');

    // 如果未访问过，添加到列表
    if (visited.indexOf(pagePath) === -1) {
      visited.push(pagePath);
      wx.setStorageSync(STORAGE_KEY, visited);
      console.log('✅ 标记TabBar页面已访问:', pagePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('标记TabBar页面访问失败:', error);
    return false;
  }
}

/**
 * 检查页面是否已访问
 * @param {string} pagePath 页面路径
 */
function isPageVisited(pagePath) {
  var visited = getVisitedPages();
  pagePath = pagePath.replace(/^\//, '');
  return visited.indexOf(pagePath) !== -1;
}

/**
 * 显示所有未访问页面的小红点
 */
function showBadgesForUnvisited() {
  var visited = getVisitedPages();

  TAB_CONFIG.forEach(function(tab) {
    if (visited.indexOf(tab.pagePath) === -1) {
      // 未访问的页面显示小红点
      wx.showTabBarRedDot({
        index: tab.index,
        success: function() {
          console.log('✅ 显示TabBar小红点:', tab.text);
        },
        fail: function(error) {
          console.warn('显示TabBar小红点失败:', tab.text, error);
        }
      });
    }
  });
}

/**
 * 隐藏指定页面的小红点
 * @param {string} pagePath 页面路径
 */
function hideBadgeForPage(pagePath) {
  pagePath = pagePath.replace(/^\//, '');

  var tab = TAB_CONFIG.find(function(t) {
    return t.pagePath === pagePath;
  });

  if (tab) {
    wx.hideTabBarRedDot({
      index: tab.index,
      success: function() {
        console.log('✅ 隐藏TabBar小红点:', tab.text);
      },
      fail: function(error) {
        console.warn('隐藏TabBar小红点失败:', tab.text, error);
      }
    });
  }
}

/**
 * 页面进入时自动处理小红点
 * 调用此方法：标记已访问 + 隐藏小红点 + 显示其他未访问的小红点
 * @param {string} pagePath 当前页面路径
 */
function handlePageEnter(pagePath) {
  pagePath = pagePath.replace(/^\//, '');

  // 标记当前页面已访问
  var isNewVisit = markPageVisited(pagePath);

  // 隐藏当前页面的小红点
  hideBadgeForPage(pagePath);

  // 显示其他未访问页面的小红点
  showBadgesForUnvisited();

  if (isNewVisit) {
    console.log('🎯 首次访问TabBar页面:', pagePath);
  }
}

/**
 * 重置所有访问记录（调试用）
 */
function resetAllVisits() {
  try {
    wx.removeStorageSync(STORAGE_KEY);
    console.log('🔄 已重置TabBar访问记录');

    // 隐藏所有小红点
    TAB_CONFIG.forEach(function(tab) {
      wx.hideTabBarRedDot({ index: tab.index });
    });
  } catch (error) {
    console.error('重置TabBar访问记录失败:', error);
  }
}

/**
 * 获取访问统计
 */
function getVisitStatistics() {
  var visited = getVisitedPages();
  var total = TAB_CONFIG.length;
  var visitedCount = visited.length;
  var unvisitedCount = total - visitedCount;

  return {
    total: total,
    visited: visitedCount,
    unvisited: unvisitedCount,
    visitedPages: visited,
    completionRate: (visitedCount / total * 100).toFixed(1) + '%'
  };
}

module.exports = {
  TAB_CONFIG: TAB_CONFIG,
  getVisitedPages: getVisitedPages,
  markPageVisited: markPageVisited,
  isPageVisited: isPageVisited,
  showBadgesForUnvisited: showBadgesForUnvisited,
  hideBadgeForPage: hideBadgeForPage,
  handlePageEnter: handlePageEnter,
  resetAllVisits: resetAllVisits,
  getVisitStatistics: getVisitStatistics
};
