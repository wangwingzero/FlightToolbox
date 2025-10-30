// 事件报告历史记录页面
Page({
  data: {
    isAdFree: false, // 无广告状态

    // 历史记录列表
    historyList: [],

    // 加载状态
    loading: false,

    // 详情弹窗
    showDetailModal: false,
    selectedReport: null,

    // 搜索
    searchValue: '',
    filteredList: []
  },

  onLoad() {
    this.loadHistory();
  },

  onShow() {
    // 检查无广告状态
    this.checkAdFreeStatus();

    // 每次显示时重新加载，以防有新的报告
    this.loadHistory();
  },

  // 加载历史记录
  loadHistory() {
    this.setData({ loading: true });
    
    try {
      const history = wx.getStorageSync('event_report_history') || [];
      // 预处理数据，添加模板需要的格式化字段
      const processedHistory = history.map(item => {
        return Object.assign({}, item, {
          submitTimeFormatted: this.formatTime(item.submitTime),
          eventDescriptionShort: item.eventDescription && item.eventDescription.length > 60 
            ? item.eventDescription.substring(0, 60) + '...' 
            : item.eventDescription
        });
      });
      
      this.setData({ 
        historyList: processedHistory,
        filteredList: processedHistory,
        loading: false 
      });
    } catch (error) {
      console.error('加载历史记录失败:', error);
      this.setData({ 
        historyList: [],
        filteredList: [],
        loading: false 
      });
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  // 搜索处理
  onSearch(e) {
    const keyword = e.detail;
    this.filterHistory(keyword);
  },

  onSearchChange(e) {
    const keyword = e.detail;
    this.setData({ searchValue: keyword });
    this.filterHistory(keyword);
  },

  onSearchClear() {
    this.setData({ 
      searchValue: '',
      filteredList: this.data.historyList 
    });
  },

  // 过滤历史记录
  filterHistory(keyword) {
    if (!keyword || !keyword.trim()) {
      this.setData({ filteredList: this.data.historyList });
      return;
    }

    const filtered = this.data.historyList.filter(item => {
      const searchText = [
        item.flightNumber,
        item.route,
        item.aircraftType,
        item.aircraftReg,
        item.location,
        item.flightPhase,
        item.eventDescription
      ].join(' ').toLowerCase();
      
      return searchText.indexOf(keyword.toLowerCase()) !== -1;
    });

    // 确保过滤后的数据也有格式化字段
    const processedFiltered = filtered.map(item => {
      if (item.submitTimeFormatted && item.eventDescriptionShort) {
        return item; // 已经预处理过了
      }
      return Object.assign({}, item, {
        submitTimeFormatted: this.formatTime(item.submitTime),
        eventDescriptionShort: item.eventDescription && item.eventDescription.length > 60 
          ? item.eventDescription.substring(0, 60) + '...' 
          : item.eventDescription
      });
    });

    this.setData({ filteredList: processedFiltered });
  },

  // 查看详情
  viewDetail(e) {
    const index = e.currentTarget.dataset.index;
    const report = this.data.filteredList[index];
    this.setData({
      selectedReport: report,
      showDetailModal: true
    });
  },

  // 关闭详情弹窗
  closeDetailModal() {
    this.setData({
      showDetailModal: false,
      selectedReport: null
    });
  },

  // 复制报告内容
  copyReport() {
    if (!this.data.selectedReport) return;
    
    wx.setClipboardData({
      data: this.data.selectedReport.reportText,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  // 删除报告
  deleteReport() {
    if (!this.data.selectedReport) return;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条报告记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          try {
            const reportId = this.data.selectedReport.id;
            const newHistory = this.data.historyList.filter(item => item.id !== reportId);
            
            wx.setStorageSync('event_report_history', newHistory);
            
            this.setData({
              historyList: newHistory,
              filteredList: newHistory.filter(item => {
                if (!this.data.searchValue) return true;
                const searchText = [
                  item.flightNumber,
                  item.route,
                  item.aircraftType,
                  item.aircraftReg,
                  item.location,
                  item.flightPhase,
                  item.eventDescription
                ].join(' ').toLowerCase();
                return searchText.indexOf(this.data.searchValue.toLowerCase()) !== -1;
              }),
              showDetailModal: false,
              selectedReport: null
            });
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          } catch (error) {
            console.error('删除失败:', error);
            wx.showToast({
              title: '删除失败',
              icon: 'error'
            });
          }
        }
      }
    });
  },

  // 清空所有记录
  clearAllHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync('event_report_history');
            this.setData({
              historyList: [],
              filteredList: [],
              searchValue: ''
            });
            wx.showToast({
              title: '已清空',
              icon: 'success'
            });
          } catch (error) {
            console.error('清空失败:', error);
            wx.showToast({
              title: '清空失败',
              icon: 'error'
            });
          }
        }
      }
    });
  },

  // 格式化时间显示
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天 ' + date.toTimeString().slice(0, 5);
    } else if (diffDays === 1) {
      return '昨天 ' + date.toTimeString().slice(0, 5);
    } else if (diffDays < 7) {
      return diffDays + '天前';
    } else {
      return date.toLocaleDateString();
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadHistory();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 检查无广告状态
  checkAdFreeStatus() {
    const adFreeManager = require('../../utils/ad-free-manager.js');
    try {
      const isAdFree = adFreeManager.isAdFreeToday();
      this.setData({ isAdFree });
      console.log('📅 无广告状态:', isAdFree ? '今日无广告' : '显示广告');
    } catch (error) {
      console.error('❌ 检查无广告状态失败:', error);
    }
  }
});