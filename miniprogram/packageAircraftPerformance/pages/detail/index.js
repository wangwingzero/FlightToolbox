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
      // 从公式卡片数据中查找
      var entries = require('../../aircraft-performance-formula-cards.js');
      var found = entries.find(function(item) { return item.id === id; });
      if (!found) {
        wx.showToast({ title: '未找到条目', icon: 'none' });
        return;
      }

      // 克隆一份条目数据，避免直接修改原始数据源
      var entry = JSON.parse(JSON.stringify(found));

      // 若原始数据中没有 figures，则自动挂载一张与 id 同名的图片
      if (!entry.figures || entry.figures.length === 0) {
        entry.figures = [
          {
            id: entry.id + '-main',
            imagePath: '../../images/' + entry.id + '.png',
            captionZh: entry.titleZh
          }
        ];
      }

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

      // 将中文说明按行拆分做简单结构化，便于前端分行展示
      if (entry.contentZh) {
        var rawContent = entry.contentZh.replace(/\r\n/g, "\n");
        var lines = rawContent
          .split("\n")
          .map(function(line) {
            return (line || "").trim();
          })
          .filter(function(text) {
            return !!text;
          });

        if (lines.length > 1) {
          var structured = lines.map(function(text) {
            var isHeading = false;
            if (text.length > 0) {
              var lastIndexCn = text.lastIndexOf("：");
              var lastIndexEn = text.lastIndexOf(":");
              var lastIndex = Math.max(lastIndexCn, lastIndexEn);
              if (lastIndex === text.length - 1) {
                isHeading = true;
              }
            }

            return {
              text: isHeading ? text : "• " + text,
              type: isHeading ? "heading" : "line"
            };
          });

          entry.contentZhStructured = structured;
        }
      }

      this.setData({ entry: entry });
    } catch (error) {
      console.error('❌ 加载性能条目失败:', error);
      wx.showToast({ title: '数据加载失败', icon: 'none' });
    }
  },

  // 预览图表/图片大图
  onFigurePreview: function(e) {
    var src = e.currentTarget.dataset.src;
    if (!src) {
      return;
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    wx.getImageInfo({
      src: src,
      success: function(res) {
        wx.hideLoading();
        var path = res && res.path ? res.path : src;
        wx.previewImage({
          current: path,
          urls: [path]
        });
      },
      fail: function() {
        wx.hideLoading();
        wx.previewImage({
          current: src,
          urls: [src]
        });
      }
    });
  }
};

Page(BasePage.createPage(pageConfig));
