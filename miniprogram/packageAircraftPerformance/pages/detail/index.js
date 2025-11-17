// 飞机性能条目详情页
var BasePage = require('../../../utils/base-page.js');

var pageConfig = {
  data: {
    entry: null
  },

  customOnLoad: function(options) {
    var id = options && options.id ? decodeURIComponent(options.id) : '';
    this.loadEntry(id);
  },

  loadEntry: function(id) {
    if (!id) {
      wx.showToast({ title: '无效条目', icon: 'none' });
      return;
    }

    try {
      // 从当前分包的数据文件加载
      var entries = require('../../data/aircraft-performance-entries.js');
      var found = entries.find(function(item) { return item.id === id; });
      if (!found) {
        wx.showToast({ title: '未找到条目', icon: 'none' });
        return;
      }

      // 克隆一份条目数据，避免直接修改原始数据源
      var entry = JSON.parse(JSON.stringify(found));

      // 预处理公式说明，将包含 LaTeX 的部分包装为 mp-html 可识别的格式
      if (entry.formulas && entry.formulas.length > 0) {
        entry.formulas.forEach(function(formula) {
          if (formula.explainZh && formula.explainZh.length > 0) {
            var explainZhHtml = formula.explainZh.map(function(line) {
              if (typeof line !== 'string') {
                return line;
              }
              // 查找中文或英文冒号，用于分隔“符号部分”和“说明文字”
              var index = line.indexOf('：');
              if (index === -1) {
                index = line.indexOf(':');
              }
              // 以反斜杠开头且包含冒号，视为含 LaTeX 的说明行，例如 "\\dot{W}_{fuel}：燃油消耗率"
              if (line.charAt(0) === '\\' && index > 0) {
                var latexPart = line.slice(0, index);
                var textPart = line.slice(index); // 包含冒号和后续中文说明
                // 使用单个 $ 包裹，使其作为行内公式渲染，后面紧跟中文说明
                return '$ ' + latexPart + ' $' + textPart;
              }
              return line;
            });
            formula.explainZhHtml = explainZhHtml;
          }
        });
      }

      this.setData({ entry: entry });
    } catch (error) {
      console.error('❌ 加载性能条目失败:', error);
      wx.showToast({ title: '数据加载失败', icon: 'none' });
    }
  }
};

Page(BasePage.createPage(pageConfig));
