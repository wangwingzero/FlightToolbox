import { getCategoryById } from '../../services/event.data';
import { EventCategory, EventType } from '../../services/event.types';

Page({
  data: {
    category: null as EventCategory | null,
    eventTypes: [] as EventType[],
    filteredEvents: [] as EventType[],
    displayEvents: [] as EventType[],
    searchValue: '',
    showSearch: false,
    filterType: 'all' // 'all', 'urgent', 'normal'
  },

  onLoad(options: any) {
    const categoryId = options.categoryId;
    const category = getCategoryById(categoryId);
    
    if (category) {
      this.setData({
        category: category,
        eventTypes: category.eventTypes,
        displayEvents: category.eventTypes
      });
    } else {
      wx.showToast({
        title: '分类不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 切换搜索栏显示
  toggleSearch() {
    this.setData({
      showSearch: !this.data.showSearch
    });
    
    if (!this.data.showSearch) {
      this.setData({
        searchValue: '',
        filteredEvents: []
      });
      this.updateDisplayEvents();
    }
  },

  // 搜索事件
  onSearch(e: any) {
    this.filterEvents(e.detail);
  },

  // 搜索变化事件
  onSearchChange(e: any) {
    this.setData({ searchValue: e.detail });
    this.filterEvents(e.detail);
  },

  // 清除搜索
  onSearchClear() {
    this.setData({ 
      searchValue: '',
      filteredEvents: []
    });
    this.updateDisplayEvents();
  },

  // 清除搜索（按钮）
  clearSearch() {
    this.setData({
      searchValue: '',
      filteredEvents: [],
      showSearch: false
    });
    this.updateDisplayEvents();
  },

  // 过滤事件
  filterEvents(searchValue: string) {
    if (!searchValue || !searchValue.trim()) {
      this.setData({ filteredEvents: [] });
      this.updateDisplayEvents();
      return;
    }

    const filtered = this.data.eventTypes.filter(event => 
      event.name.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1
    );
    
    this.setData({ filteredEvents: filtered });
    this.updateDisplayEvents();
  },

  // 设置过滤器
  setFilter(e: any) {
    const filterType = e.currentTarget.dataset.type;
    this.setData({ filterType });
    this.updateDisplayEvents();
  },

  // 更新显示的事件列表
  updateDisplayEvents() {
    let events = this.data.searchValue ? this.data.filteredEvents : this.data.eventTypes;
    
    // 应用过滤器
    if (this.data.filterType === 'urgent') {
      events = events.filter(event => event.urgency === '紧急');
    } else if (this.data.filterType === 'normal') {
      events = events.filter(event => event.urgency === '非紧急');
    }
    
    this.setData({ displayEvents: events });
  },

  // 选择事件
  selectEvent(e: any) {
    const eventId = e.currentTarget.dataset.eventId;
    wx.navigateTo({
      url: `/pages/event-report/event-form?eventTypeId=${eventId}`
    });
  },

  // 前往历史记录
  goToHistory() {
    wx.navigateTo({
      url: '/pages/event-report/event-history'
    });
  },

  // 获取分类图标
  getCategoryIcon(categoryId: string): string {
    const iconMap: Record<string, string> = {
      'urgent-ops': '🚨',
      'non-urgent-ops': '📋'
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
      title: `${this.data.category?.name || '事件类型'} - 航空事件报告`,
      desc: '专业的航空事件报告填写工具',
      path: `/pages/event-report/event-type?categoryId=${this.data.category?.id}`
    };
  }
});