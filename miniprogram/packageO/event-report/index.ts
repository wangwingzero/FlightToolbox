import { eventCategories } from '../../services/event.data';
import { EventCategory, EventType } from '../../services/event.types';

Page({
  data: {
    categories: [] as EventCategory[],
    searchValue: '',
    filteredEventTypes: [] as EventType[]
  },

  onLoad() {
    this.setData({
      categories: eventCategories
    });
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
      url: `/packageO/event-report/event-form?eventTypeId=${eventTypeId}`
    });
  },

  // 选择事件分类
  selectCategory(e: any) {
    const categoryId = e.currentTarget.dataset.categoryId;
    wx.navigateTo({
      url: `/packageO/event-report/event-type?categoryId=${categoryId}`
    });
  },

  // 打开个人预设
  openProfile() {
    wx.navigateTo({
      url: '/packageO/event-report/event-profile'
    });
  },

  // 打开历史记录
  openHistory() {
    wx.navigateTo({
      url: '/packageO/event-report/event-history'
    });
  },

  // 快速搜索标签
  quickSearch(e: any) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ searchValue: keyword });
    this.filterEventTypes(keyword);
  },

  // 获取分类图标
  getCategoryIcon(categoryId: string): string {
    const iconMap: { [key: string]: string } = {
      'urgent-ops': '🚨',
      'non-urgent-ops': '📋',
      'urgent-transport': '🚨',
      'non-urgent-transport': '✈️'
    };
    return iconMap[categoryId] || '📄';
  },

  // 获取紧急事件数量
  getUrgentCount(eventTypes: EventType[]): number {
    return eventTypes.filter(event => event.urgency === '紧急').length;
  },

  // 转发功能
  onShareAppMessage() {
    return {
      title: '航空事件报告助手',
      desc: '专业的航空事件报告填写工具',
      path: '/packageO/event-report/index'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '航空事件报告助手 - 专业事件报告工具',
      query: 'from=timeline'
    };
  }
});