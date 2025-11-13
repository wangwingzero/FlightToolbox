/**
 * 章节详情页
 * 功能：显示章节的子章节和主题列表
 */

var BasePage = require('../../../utils/base-page.js');
var VersionManager = require('../../../utils/version-manager.js');

// 缓存Key
var DATA_CACHE_KEY_BASE = 'performance_data';

var pageConfig = {
  data: {
    loading: true,
    sectionId: '',
    sectionData: {
      id: '',
      code: '',
      title_zh: '',
      title_en: '',
      icon: '',
      description: '',
      page: 0,
      subsections: []
    },
    dataCacheKey: '',
    emptyImgSrc: '../../images/section-empty.png'
  },

  /**
   * 页面加载
   */
  customOnLoad: function(options) {
    var sectionId = options.id;
    var type = options.type || 'section';  // section 或 appendix

    if (!sectionId) {
      wx.showToast({
        title: '参数错误',
        icon: 'none',
        duration: 2000
      });
      setTimeout(function() {
        wx.navigateBack();
      }, 2000);
      return;
    }

    this.setData({
      sectionId: sectionId,
      dataCacheKey: VersionManager.getVersionedKey(DATA_CACHE_KEY_BASE)
    });

    // 加载章节数据
    this.loadSectionData(sectionId, type);
  },

  /**
   * 加载章节数据
   */
  loadSectionData: function(sectionId, type) {
    var self = this;

    // 1. 尝试从缓存加载
    try {
      var cachedData = wx.getStorageSync(this.data.dataCacheKey);
      if (cachedData) {
        var sectionData = this.findSectionById(cachedData, sectionId, type);
        if (sectionData) {
          console.log('✅ 从缓存加载章节数据:', sectionId);
          this.setSectionData(sectionData);
          return;
        }
      }
    } catch (e) {
      console.warn('⚠️ 读取缓存失败:', e);
    }

    // 2. 异步加载分包数据
    console.log('📦 从分包加载章节数据...');
    require('../../data/performance-data.js', function(data) {
      var sectionData = self.findSectionById(data, sectionId, type);
      if (sectionData) {
        console.log('✅ 章节数据加载成功');
        self.setSectionData(sectionData);
      } else {
        wx.showToast({
          title: '章节数据不存在',
          icon: 'none',
          duration: 2000
        });
        setTimeout(function() {
          wx.navigateBack();
        }, 2000);
      }
    }, function(error) {
      console.error('❌ 加载章节数据失败:', error);
      self.handleError(error, '加载数据失败');
      self.setData({ loading: false });
    });
  },

  /**
   * 根据ID查找章节数据
   */
  findSectionById: function(data, sectionId, type) {
    if (type === 'appendix') {
      // 查找附录
      var appendices = data.appendices || [];
      for (var i = 0; i < appendices.length; i++) {
        if (appendices[i].id === sectionId) {
          return appendices[i];
        }
      }
    } else {
      // 查找章节
      var sections = data.sections || [];
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].id === sectionId) {
          return sections[i];
        }
      }
    }
    return null;
  },

  /**
   * 设置章节数据并初始化展开状态
   */
  setSectionData: function(sectionData) {
    // 为每个子章节添加展开状态
    if (sectionData.subsections) {
      sectionData.subsections.forEach(function(subsection) {
        subsection.expanded = false;  // 默认收起
      });
    }

    this.setData({
      sectionData: sectionData,
      loading: false
    });
  },

  /**
   * 子章节点击事件（展开/收起）
   */
  onSubsectionTap: function(e) {
    var index = e.currentTarget.dataset.index;
    var key = 'sectionData.subsections[' + index + '].expanded';
    var expanded = this.data.sectionData.subsections[index].expanded;

    this.setData({
      [key]: !expanded
    });
  },

  /**
   * 主题点击事件
   */
  onTopicTap: function(e) {
    var topic = e.currentTarget.dataset.topic;
    console.log('🎯 点击主题:', topic.code, topic.title_zh);

    // 这里可以扩展：跳转到主题详情页，或显示完整内容
    // 暂时只显示提示
    wx.showToast({
      title: topic.title_zh,
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 返回首页
   */
  onBackToIndex: function() {
    wx.navigateBack();
  },

  /**
   * 空状态图片加载失败时，回退到 svg
   */
  onEmptyImgError: function() {
    if (this.data && typeof this.data.emptyImgSrc === 'string' && /\.png$/i.test(this.data.emptyImgSrc)) {
      this.setData({ emptyImgSrc: '../../images/section-empty.svg' });
    }
  },

  /**
   * 页面分享
   */
  customOnShareAppMessage: function() {
    return {
      title: this.data.sectionData.code + '. ' + this.data.sectionData.title_zh,
      path: '/packagePerformance/pages/section-detail/index?id=' + this.data.sectionId
    };
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));
