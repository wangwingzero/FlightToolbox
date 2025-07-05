import { StorageService } from '../../services/storage.service';
import { ReportData } from '../../services/event.types';

Page({
  data: {
    reports: [] as ReportData[],
    showReportDetail: false,
    selectedReport: null as ReportData | null
  },

  onLoad() {
    this.loadReports();
  },

  onShow() {
    // 每次显示页面时重新加载，以防有新的报告
    this.loadReports();
  },

  // 加载历史记录
  loadReports() {
    const reports = StorageService.getSavedReports();
    this.setData({ reports });
  },

  // 格式化时间显示
  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate());
    const hours = String(date.getHours());
    const minutes = String(date.getMinutes());
    return `${date.getFullYear()}-${month.length === 1 ? '0' + month : month}-${day.length === 1 ? '0' + day : day} ${hours.length === 1 ? '0' + hours : hours}:${minutes.length === 1 ? '0' + minutes : minutes}`;
  },

  // 查看报告详情
  viewReport(e: any) {
    const index = e.currentTarget.dataset.index;
    const report = this.data.reports[index];
    this.setData({
      selectedReport: report,
      showReportDetail: true
    });
  },

  // 关闭报告详情
  closeReportDetail() {
    this.setData({
      showReportDetail: false,
      selectedReport: null
    });
  },

  // 删除单个报告
  deleteReport(e: any) {
    e.stopPropagation(); // 阻止事件冒泡
    const index = e.currentTarget.dataset.index;
    const report = this.data.reports[index];
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个报告吗？',
      success: (res) => {
        if (res.confirm) {
          const success = StorageService.deleteReport(report.timestamp);
          if (success) {
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            this.loadReports(); // 重新加载列表
          } else {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 清空所有记录
  clearAllReports() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync('saved_reports');
            this.setData({ reports: [] });
            wx.showToast({
              title: '清空成功',
              icon: 'success'
            });
          } catch (error) {
            wx.showToast({
              title: '清空失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 复制选中的报告
  copySelectedReport() {
    if (this.data.selectedReport) {
      wx.setClipboardData({
        data: this.data.selectedReport.generatedText,
        success: () => {
          wx.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          });
          this.closeReportDetail();
        }
      });
    }
  },

  // 删除选中的报告
  deleteSelectedReport() {
    if (this.data.selectedReport) {
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这个报告吗？',
        success: (res) => {
          if (res.confirm) {
            const success = StorageService.deleteReport(this.data.selectedReport!.timestamp);
            if (success) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
              this.closeReportDetail();
              this.loadReports(); // 重新加载列表
            } else {
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              });
            }
          }
        }
      });
    }
  },

  // 前往创建新报告
  goToCreate() {
    wx.navigateTo({
      url: '/packageO/event-report/index'
    });
  },

  // 转发功能
  onShareAppMessage() {
    return {
      title: '事件样例填报工具',
      desc: '专业的航空事件报告填写工具',
      path: '/packageO/event-report/index'
    };
  }
}); 