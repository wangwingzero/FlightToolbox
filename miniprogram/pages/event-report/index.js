"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_data_1 = require("../../services/event.data");
Page({
    data: {
        categories: [],
        searchValue: '',
        filteredEventTypes: []
    },
    onLoad() {
        this.setData({
            categories: event_data_1.eventCategories
        });
    },
    // 搜索事件
    onSearch(e) {
        this.filterEventTypes(e.detail);
    },
    // 搜索变化事件
    onSearchChange(e) {
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
    filterEventTypes(searchValue) {
        if (!searchValue || !searchValue.trim()) {
            this.setData({ filteredEventTypes: [] });
            return;
        }
        // 从所有分类中搜索事件类型
        const allEventTypes = [];
        this.data.categories.forEach(category => {
            allEventTypes.push(...category.eventTypes);
        });
        const filtered = allEventTypes.filter(eventType => eventType.name.toLowerCase().includes(searchValue.toLowerCase()));
        this.setData({ filteredEventTypes: filtered });
    },
    // 选择事件类型（从搜索结果）
    selectEventType(e) {
        const eventTypeId = e.currentTarget.dataset.eventTypeId;
        wx.navigateTo({
            url: `/pages/event-report/event-form?eventTypeId=${eventTypeId}`
        });
    },
    // 选择事件分类
    selectCategory(e) {
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
    }
});
