import { UserProfile, ReportData } from './event.types';

/**
 * 本地存储服务
 */
export class StorageService {
  // 将静态属性改为静态方法或在类外定义常量
  private static getUserProfileKey() { return 'user_profile'; }
  private static getDraftPrefix() { return 'draft_'; }
  private static getReportsKey() { return 'saved_reports'; }

  /**
   * 用户预设信息相关
   */
  static getUserProfile(): UserProfile | null {
    try {
      const data = wx.getStorageSync(this.getUserProfileKey());
      return data || null;
    } catch (error) {
      console.error('获取用户预设失败:', error);
      return null;
    }
  }

  static setUserProfile(profile: UserProfile): boolean {
    try {
      wx.setStorageSync(this.getUserProfileKey(), profile);
      return true;
    } catch (error) {
      console.error('保存用户预设失败:', error);
      return false;
    }
  }

  /**
   * 草稿相关
   */
  static getDraft(eventTypeId: string): Record<string, any> | null {
    try {
      const data = wx.getStorageSync(`${this.getDraftPrefix()}${eventTypeId}`);
      return data || null;
    } catch (error) {
      console.error('获取草稿失败:', error);
      return null;
    }
  }

  static saveDraft(eventTypeId: string, formData: Record<string, any>): boolean {
    try {
      wx.setStorageSync(`${this.getDraftPrefix()}${eventTypeId}`, formData);
      return true;
    } catch (error) {
      console.error('保存草稿失败:', error);
      return false;
    }
  }

  static clearDraft(eventTypeId: string): boolean {
    try {
      wx.removeStorageSync(`${this.getDraftPrefix()}${eventTypeId}`);
      return true;
    } catch (error) {
      console.error('清除草稿失败:', error);
      return false;
    }
  }

  /**
   * 报告相关
   */
  static getSavedReports(): ReportData[] {
    try {
      const data = wx.getStorageSync(this.getReportsKey());
      return data || [];
    } catch (error) {
      console.error('获取保存的报告失败:', error);
      return [];
    }
  }

  static saveReport(report: ReportData): boolean {
    try {
      const reports = this.getSavedReports();
      reports.unshift(report); // 添加到开头
      
      // 限制保存数量，最多保存50个
      if (reports.length > 50) {
        reports.splice(50);
      }
      
      wx.setStorageSync(this.getReportsKey(), reports);
      return true;
    } catch (error) {
      console.error('保存报告失败:', error);
      return false;
    }
  }

  static deleteReport(timestamp: string): boolean {
    try {
      const reports = this.getSavedReports();
      const filteredReports = reports.filter(report => report.timestamp !== timestamp);
      wx.setStorageSync(this.getReportsKey(), filteredReports);
      return true;
    } catch (error) {
      console.error('删除报告失败:', error);
      return false;
    }
  }
} 