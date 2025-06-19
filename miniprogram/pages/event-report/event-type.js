"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_data_1 = require("../../services/event.data");
Page({
    data: {
        category: null,
        eventTypes: []
    },
    onLoad(options) {
        const categoryId = options.categoryId;
        const category = (0, event_data_1.getCategoryById)(categoryId);
        if (category) {
            this.setData({
                category: category,
                eventTypes: category.eventTypes
            });
        }
        else {
            wx.showToast({
                title: '分类不存在',
                icon: 'error'
            });
            setTimeout(() => {
                wx.navigateBack();
            }, 1500);
        }
    },
    // 选择事件类型
    selectEventType(e) {
        const eventTypeId = e.currentTarget.dataset.eventTypeId;
        wx.navigateTo({
            url: `/pages/event-report/event-form?eventTypeId=${eventTypeId}`
        });
    }
});
