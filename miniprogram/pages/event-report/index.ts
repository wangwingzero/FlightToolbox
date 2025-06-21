import { eventCategories } from '../../services/event.data';
import { EventCategory, EventType } from '../../services/event.types';
const adManagerUtil = require('../../utils/ad-manager.js');

Page({
  data: {
    categories: [] as EventCategory[],
    searchValue: '',
    filteredEventTypes: [] as EventType[],
    // 🎯 基于Context7最佳实践：广告相关数据
    showEventReportAd: false,
    eventReportAdUnitId: ''
  },

  onLoad() {
    this.setData({
      categories: eventCategories
    });
    
    // 🎯 基于Context7最佳实践：初始化广告
    this.initEventReportAd();
  },

  // 搜索事件
  onSearch(e: any) {
    this.filterEventTypes(e.detail);
  },

  // 搜索变化事件
  onSearchChange(e: any) {
    this.setData({ searchValue: e.detail });
    this.filterEventTypes(e.detail);
  },

  // 清除搜索
  onSearchClear() {
    this.setData({ 
      searchValue: '',
      filteredEventTypes: []
    });
  },

  // 过滤事件类型（全局搜索）
  filterEventTypes(searchValue: string) {
    if (!searchValue || !searchValue.trim()) {
      this.setData({ filteredEventTypes: [] });
      return;
    }

    // 从所有分类中搜索事件类型
    const allEventTypes: EventType[] = [];
    this.data.categories.forEach(category => {
      allEventTypes.push(...category.eventTypes);
    });

    const filtered = allEventTypes.filter(eventType => 
      eventType.name.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1
    );
    
    this.setData({ filteredEventTypes: filtered });
  },

  // 选择事件类型（从搜索结果）
  selectEventType(e: any) {
    const eventTypeId = e.currentTarget.dataset.eventTypeId;
    wx.navigateTo({
      url: `/pages/event-report/event-form?eventTypeId=${eventTypeId}`
    });
  },

  // 选择事件分类
  selectCategory(e: any) {
    const categoryId = e.currentTarget.dataset.categoryId;
    wx.navigateTo({
      url: `/pages/event-report/event-type?categoryId=${categoryId}`
    });
  },

  // 打开个人预设
  openProfile() {
    wx.navigateTo({
      url: '/pages/event-report/event-profile'
    });
  },

  // 打开历史记录
  openHistory() {
    wx.navigateTo({
      url: '/pages/event-report/event-history'
    });
  },

  // 转发功能
  onShareAppMessage() {
    return {
      title: '事件样例填报工具',
      desc: '专业的航空事件报告填写工具',
      path: '/pages/event-report/index'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '事件样例填报工具 - 专业航空事件报告',
      query: 'from=timeline'
    };
  },

  // 🎯 基于Context7最佳实践：事件填报页面广告相关方法
  initEventReportAd() {
    try {
      console.log('🎯 开始初始化事件填报页面广告...');
      const adManager = new adManagerUtil();
      const adUnit = adManager.getBestAdUnit('event-report');
      console.log('事件填报广告单元:', adUnit);
      
      if (adUnit) {
        this.setData({
          showEventReportAd: true,
          eventReportAdUnitId: adUnit.id
        });
        console.log('✅ 事件填报广告初始化成功:', adUnit.id);
      } else {
        console.log('❌ 事件填报广告初始化失败：未获取到广告单元');
      }
    } catch (error) {
      console.log('❌ 事件填报广告初始化失败:', error);
    }
  },

  // 事件填报广告事件处理
  onEventReportAdLoad() {
    try {
      const adManager = new adManagerUtil();
      adManager.recordAdShown(this.data.eventReportAdUnitId);
      console.log('✅ 事件填报广告加载成功');
    } catch (error) {
      console.log('❌ 事件填报广告记录失败:', error);
    }
  },

  onEventReportAdError() {
    this.setData({ showEventReportAd: false });
    console.log('❌ 事件填报广告加载失败，已隐藏');
  }
}); 