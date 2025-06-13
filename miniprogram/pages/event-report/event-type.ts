import { getCategoryById } from '../../services/event.data';
import { EventCategory, EventType } from '../../services/event.types';

Page({
  data: {
    category: null as EventCategory | null,
    eventTypes: [] as EventType[]
  },

  onLoad(options: any) {
    const categoryId = options.categoryId;
    const category = getCategoryById(categoryId);
    
    if (category) {
      this.setData({
        category: category,
        eventTypes: category.eventTypes
      });
    } else {
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
  selectEventType(e: any) {
    const eventTypeId = e.currentTarget.dataset.eventTypeId;
    wx.navigateTo({
      url: `/pages/event-report/event-form?eventTypeId=${eventTypeId}`
    });
  }
}); 