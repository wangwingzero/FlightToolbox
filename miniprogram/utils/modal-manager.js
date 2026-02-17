/**
 * 弹窗管理器
 * 统一管理页面中的各种弹窗状态和操作
 */

class ModalManager {
  constructor() {
    this.pageInstance = null;
  }

  /**
   * 初始化绑定页面实例
   * @param {Object} page 页面实例
   */
  init(page) {
    this.pageInstance = page;
    console.log('🎯 弹窗管理器已初始化');
  }


  /**
   * 显示产品理念弹窗
   */
  showProductPhilosophyModal() {
    if (!this.pageInstance) return;

    this.pageInstance.setData({
      showProductPhilosophyModal: true
    });
  }

  /**
   * 关闭产品理念弹窗
   */
  closeProductPhilosophyModal() {
    if (!this.pageInstance) return;

    this.pageInstance.setData({
      showProductPhilosophyModal: false
    });
  }

  /**
   * 显示公众号二维码弹窗
   */
  showQRCodeModal() {
    if (!this.pageInstance) return;

    this.pageInstance.setData({
      showQRCodeModal: true
    });
  }

  /**
   * 关闭公众号二维码弹窗
   */
  closeQRCodeModal() {
    if (!this.pageInstance) return;

    this.pageInstance.setData({
      showQRCodeModal: false
    });
  }

  /**
   * 显示离线数据状态弹窗
   */
  showOfflineStatusModal() {
    if (!this.pageInstance) return;

    this.pageInstance.setData({
      showOfflineStatusModal: true
    });
  }

  /**
   * 关闭离线数据状态弹窗
   */
  closeOfflineStatusModal() {
    if (!this.pageInstance) return;

    this.pageInstance.setData({
      showOfflineStatusModal: false
    });
  }

  /**
   * 从产品理念弹窗跳转到公众号二维码
   */
  showQRCodeFromPhilosophy() {
    if (!this.pageInstance) return;

    // 先关闭产品理念弹窗
    this.closeProductPhilosophyModal();
    
    // 延迟打开公众号弹窗，确保动画流畅
    setTimeout(() => {
      this.showQRCodeModal();
    }, 300);
  }


  /**
   * 显示用户引导弹窗
   * @param {string} type 引导类型
   * @param {Object} options 选项参数
   */
  showUserGuideModal(type, options = {}) {
    if (!this.pageInstance) return;

    const guideConfig = {
      'first-time': {
        title: '欢迎使用飞行工具箱',
        content: '这里为您准备了最实用的飞行工具，开始探索吧！',
        confirmText: '开始体验'
      },
      'qualification-empty': {
        title: '开始管理您的飞行资质',
        content: '证照到期提醒，让飞行更安心。现在就添加您的第一个资质吧！',
        confirmText: '立即添加'
      }
    };

    const config = guideConfig[type];
    if (!config) {
      console.warn('⚠️ 未知的引导类型:', type);
      return;
    }

    wx.showModal({
      title: config.title,
      content: config.content,
      confirmText: config.confirmText,
      cancelText: '稍后再说',
      success: (res) => {
        if (res.confirm && options.onConfirm) {
          options.onConfirm();
        }
      }
    });
  }

  /**
   * 显示成功提示Toast
   * @param {string} message 提示消息
   * @param {number} duration 持续时间（毫秒）
   */
  showSuccessToast(message, duration = 2000) {
    wx.showToast({
      title: message,
      icon: 'success',
      duration: duration
    });
  }

  /**
   * 显示错误提示Toast
   * @param {string} message 错误消息
   * @param {number} duration 持续时间（毫秒）
   */
  showErrorToast(message, duration = 2000) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: duration
    });
  }

  /**
   * 显示加载中弹窗
   * @param {string} title 加载提示文字
   * @param {boolean} mask 是否显示透明蒙层
   */
  showLoading(title = '加载中...', mask = true) {
    wx.showLoading({
      title: title,
      mask: mask
    });
  }

  /**
   * 隐藏加载中弹窗
   */
  hideLoading() {
    wx.hideLoading();
  }

  /**
   * 显示确认对话框
   * @param {Object} options 对话框选项
   * @returns {Promise} Promise对象
   */
  showConfirmModal(options) {
    return new Promise((resolve) => {
      wx.showModal({
        title: options.title || '确认',
        content: options.content || '',
        confirmText: options.confirmText || '确定',
        cancelText: options.cancelText || '取消',
        success: (res) => {
          resolve(res.confirm);
        },
        fail: () => {
          resolve(false);
        }
      });
    });
  }

  /**
   * 批量关闭所有弹窗
   */
  closeAllModals() {
    if (!this.pageInstance) return;

    this.pageInstance.setData({
      showProductPhilosophyModal: false,
      showQRCodeModal: false,
      showOfflineStatusModal: false
    });

    console.log('🎯 所有弹窗已关闭');
  }
}

// 创建单例实例
const modalManager = new ModalManager();

module.exports = modalManager;