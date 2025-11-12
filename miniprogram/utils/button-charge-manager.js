/**
 * 按钮计算管理器
 * 统一处理计算按钮的防重复点击、参数验证和计算执行
 */

var ButtonChargeManager = {
  
  // 正在执行的计算任务集合
  runningTasks: new Set(),
  
  /**
   * 执行带有防重复点击保护的计算操作
   * @param {string} taskId - 任务唯一标识
   * @param {function} validateParams - 参数验证函数，返回true表示验证通过
   * @param {string} context - 操作上下文描述，用于错误提示
   * @param {function} performCalculation - 实际计算函数
   */
  executeCalculateWithCharge: function(taskId, validateParams, context, performCalculation) {
    // 防重复点击保护
    if (this.runningTasks.has(taskId)) {
      console.log('[ButtonChargeManager] 计算正在进行中，跳过重复点击:', taskId);
      return;
    }
    
    try {
      // 参数验证
      if (typeof validateParams === 'function' && !validateParams()) {
        console.log('[ButtonChargeManager] 参数验证失败:', context);
        return;
      }
      
      // 标记任务开始
      this.runningTasks.add(taskId);
      console.log('[ButtonChargeManager] 开始执行计算:', context, 'taskId:', taskId);
      
      // 执行计算
      if (typeof performCalculation === 'function') {
        performCalculation();
      }
      
    } catch (error) {
      console.error('[ButtonChargeManager] 计算执行出错:', context, error);
      
      // 触发全局错误处理
      if (typeof getApp === 'function') {
        var app = getApp();
        if (app && app.globalData && app.globalData.errorHandler) {
          app.globalData.errorHandler.handleError(error, context + ' - 计算执行失败');
        }
      }
    } finally {
      // 确保任务标记被清理
      setTimeout(() => {
        this.runningTasks.delete(taskId);
        console.log('[ButtonChargeManager] 计算任务完成，清理标记:', taskId);
      }, 500); // 500ms后清理，防止快速重复点击
    }
  },
  
  /**
   * 手动清理指定任务标记
   * @param {string} taskId - 任务标识
   */
  clearTask: function(taskId) {
    this.runningTasks.delete(taskId);
    console.log('[ButtonChargeManager] 手动清理任务标记:', taskId);
  },
  
  /**
   * 清理所有任务标记
   */
  clearAllTasks: function() {
    this.runningTasks.clear();
    console.log('[ButtonChargeManager] 清理所有任务标记');
  },
  
  /**
   * 检查任务是否正在运行
   * @param {string} taskId - 任务标识
   * @returns {boolean} 是否正在运行
   */
  isTaskRunning: function(taskId) {
    return this.runningTasks.has(taskId);
  },
  
  /**
   * 获取当前运行中的任务数量
   * @returns {number} 运行中任务数量
   */
  getRunningTasksCount: function() {
    return this.runningTasks.size;
  }
};

module.exports = ButtonChargeManager;