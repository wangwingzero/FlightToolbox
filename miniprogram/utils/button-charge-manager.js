/**
 * 按钮收费管理器
 * 统一管理所有按钮的积分扣费逻辑
 * 基于Context7最佳实践：集中式错误处理和async/await模式
 * 
 * 使用方式：
 * 1. 直接调用：buttonChargeManager.executeWithCharge(buttonId, description, callback)
 * 2. 装饰器模式：buttonChargeManager.wrapMethod(this, 'methodName', buttonId, description)
 */

const pointsManager = require('./points-manager.js');

// 基于Context7最佳实践：自定义应用错误类
class ButtonChargeError extends Error {
  constructor(message, isOperational = true, errorCode = null) {
    super(message);
    this.name = 'ButtonChargeError';
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, ButtonChargeError);
  }
}

class ButtonChargeManager {
  constructor() {
    console.log('📊 ButtonChargeManager 已初始化');
  }

  /**
   * 执行带扣费的操作
   * 基于Context7最佳实践：使用async/await和集中式错误处理
   * @param {string} buttonId 按钮标识符
   * @param {string} description 操作描述
   * @param {Function} callback 执行的操作
   */
  async executeWithCharge(buttonId, description = '', callback = null) {
    try {
      const result = await pointsManager.consumePointsForButton(buttonId, description, callback);
      return result;
    } catch (error) {
      return this.handleError(error, 'executeWithCharge', { buttonId, description });
    }
  }

  /**
   * 基于Context7最佳实践：集中式错误处理方法
   * @param {Error} error 错误对象
   * @param {string} context 错误上下文
   * @param {object} metadata 错误元数据
   */
  handleError(error, context = 'unknown', metadata = {}) {
    console.error(`按钮收费管理器错误 [${context}]:`, error);
    console.error('错误元数据:', metadata);
    
    // 检查是否为操作型错误
    if (error && error.isOperational) {
      // 操作型错误，显示具体错误信息
      wx.showToast({
        title: error.message || '操作失败',
        icon: 'none',
        duration: 2000
      });
      return { 
        success: false, 
        message: error.message,
        errorCode: error.errorCode,
        isOperational: true
      };
    } else {
      // 程序错误，显示通用错误信息
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none',
        duration: 2000
      });
      return { 
        success: false, 
        message: '操作失败',
        isOperational: false
      };
    }
  }

  /**
   * 包装方法，使其支持扣费
   * @param {Object} pageInstance 页面实例
   * @param {string} methodName 方法名
   * @param {string} buttonId 按钮标识符
   * @param {string} description 操作描述
   */
  wrapMethod(pageInstance, methodName, buttonId, description = '') {
    if (!pageInstance[methodName] || typeof pageInstance[methodName] !== 'function') {
      console.error(`方法 ${methodName} 不存在或不是函数`);
      return;
    }

    // 保存原始方法
    const originalMethod = pageInstance[methodName].bind(pageInstance);
    
    // 创建包装后的方法
    pageInstance[methodName] = async (...args) => {
      await this.executeWithCharge(buttonId, description, () => {
        originalMethod(...args);
      });
    };
  }

  /**
   * 为页面批量包装方法
   * @param {Object} pageInstance 页面实例
   * @param {Array} methodConfigs 方法配置数组 [{method, buttonId, description}]
   */
  wrapPageMethods(pageInstance, methodConfigs) {
    methodConfigs.forEach(config => {
      this.wrapMethod(pageInstance, config.method, config.buttonId, config.description);
    });
  }

  /**
   * 检查按钮状态
   * @param {string} buttonId 按钮标识符
   */
  getButtonStatus(buttonId) {
    return pointsManager.checkButtonAccess(buttonId);
  }

  /**
   * 获取按钮所需积分
   * @param {string} buttonId 按钮标识符
   */
  getButtonCost(buttonId) {
    return Math.abs(pointsManager.BUTTON_RULES[buttonId] || 0);
  }

  /**
   * 检查并显示按钮状态提示
   * @param {string} buttonId 按钮标识符
   * @param {string} buttonName 按钮名称（用于提示）
   */
  showButtonStatusTip(buttonId, buttonName = '该功能') {
    const status = this.getButtonStatus(buttonId);
    const cost = this.getButtonCost(buttonId);
    
    if (cost === 0) {
      wx.showToast({
        title: `${buttonName}免费使用`,
        icon: 'success',
        duration: 1500
      });
    } else if (status.hasAccess) {
      wx.showToast({
        title: `${buttonName}需要 ${cost} 积分`,
        icon: 'none',
        duration: 1500
      });
    } else {
      wx.showToast({
        title: `积分不足，需要 ${cost} 积分`,
        icon: 'none',
        duration: 1500
      });
    }
  }

  /**
   * 搜索按钮专用方法
   * 带防抖和特殊处理
   */
  async executeSearchWithCharge(buttonId, searchValue, description, callback) {
    console.log('🔍 executeSearchWithCharge 调用:', { buttonId, searchValue, description });
    
    // 搜索前检查
    if (!searchValue || searchValue.trim().length === 0) {
      console.log('❌ 搜索内容为空');
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      });
      return;
    }

    // 搜索内容太短时提示
    if (searchValue.trim().length < 1) {
      console.log('❌ 搜索内容太短:', searchValue.trim().length);
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      });
      return;
    }

    console.log('✅ 搜索内容验证通过，开始扣费');
    
    // 执行扣费搜索
    const result = await this.executeWithCharge(buttonId, `${description}: ${searchValue}`, callback);
    console.log('🔍 搜索扣费结果:', result);
    return result;
  }

  /**
   * 计算按钮专用方法
   * 带参数验证
   */
  async executeCalculateWithCharge(buttonId, validateParams, description, callback) {
    // 参数验证
    if (validateParams && typeof validateParams === 'function') {
      const validation = validateParams();
      if (!validation.valid) {
        wx.showToast({
          title: validation.message || '参数不完整',
          icon: 'none'
        });
        return;
      }
    }

    // 执行扣费计算
    await this.executeWithCharge(buttonId, description, callback);
  }
}

// 创建单例实例
const buttonChargeManager = new ButtonChargeManager();

module.exports = buttonChargeManager; 