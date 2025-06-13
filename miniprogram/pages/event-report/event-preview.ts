import { ReportBuilder } from '../../services/report.builder';
import { StorageService } from '../../services/storage.service';
import { ReportData, EventType } from '../../services/event.types';

Page({
  data: {
    reportData: null as ReportData | null
  },

  onLoad() {
    // 通过事件通道接收数据
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('reportData', (data: { eventType: EventType, formData: Record<string, any> }) => {
      const reportData = ReportBuilder.createReportData(data.eventType, data.formData);
      
      // 添加格式化后的时间
      const reportDataWithFormattedTime = {
        ...reportData,
        formattedTime: this.formatTime(reportData.timestamp)
      };
      
      this.setData({ reportData: reportDataWithFormattedTime });
    });
  },

  // 格式化时间显示
  formatTime(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return '时间格式错误';
      }
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch (error) {
      console.error('时间格式化错误:', error);
      return '时间格式错误';
    }
  },

  // 复制并保存报告
  copyAndSaveReport() {
    if (this.data.reportData) {
      // 先保存报告
      const saveSuccess = StorageService.saveReport(this.data.reportData);
      
      // 再复制到剪贴板
      wx.setClipboardData({
        data: this.data.reportData.generatedText,
        success: () => {
          if (saveSuccess) {
            wx.showToast({
              title: '已复制内容，可直接粘贴',
              icon: 'success',
              duration: 2000
            });
          } else {
            wx.showToast({
              title: '已复制，但保存失败',
              icon: 'none',
              duration: 2000
            });
          }
        },
        fail: () => {
          if (saveSuccess) {
            wx.showToast({
              title: '报告已保存，复制失败',
              icon: 'none'
            });
          } else {
            wx.showToast({
              title: '复制和保存都失败',
              icon: 'error'
            });
          }
        }
      });
    }
  },

  // 重新编辑
  editReport() {
    wx.navigateBack();
  }
}); 