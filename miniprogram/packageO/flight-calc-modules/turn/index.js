// 转弯半径计算页面 - 符合项目规范版本

var BasePage = require('../../../utils/base-page.js');

// ✈️ 物理常量定义
var KNOTS_TO_MS = 0.514444;      // 节转米/秒的转换系数
var GRAVITY = 9.81;              // 重力加速度 m/s²
var METERS_TO_NM = 1852;         // 米转海里的转换系数
var DEG_TO_RAD = Math.PI / 180;  // 角度转弧度
var RAD_TO_DEG = 180 / Math.PI;  // 弧度转角度

// 输入验证范围
var MIN_BANK_ANGLE = 0;          // 最小飞机坡度角（度）
var MAX_BANK_ANGLE = 90;         // 最大飞机坡度角（度）
var MIN_GROUND_SPEED = 0;        // 最小地速（节）
var MAX_GROUND_SPEED = 600;      // 最大地速（节）- 参考驾驶舱config配置

/**
 * 页面配置对象
 */
var pageConfig = {
  /**
   * 页面数据
   */
  data: {
    turn: {
      bankAngle: '',
      groundSpeed: '',
      radiusMeters: '',
      turnRate: ''
    }
  },

  /**
   * 页面加载
   * @param {Object} options 页面参数
   */
  customOnLoad: function(options) {
    console.log('📄 转弯半径计算页面加载');
  },

  /**
   * 页面显示
   */
  customOnShow: function() {
    console.log('📄 转弯半径计算页面显示');
  },

  /**
   * 飞机坡度角输入变化事件
   * @param {Object} event 输入事件对象
   */
  onBankAngleChange: function(event) {
    this.setData({
      'turn.bankAngle': event.detail
    });
  },

  /**
   * 地速输入变化事件
   * @param {Object} event 输入事件对象
   */
  onGroundSpeedChange: function(event) {
    this.setData({
      'turn.groundSpeed': event.detail
    });
  },

  /**
   * 计算转弯半径和转弯率
   *
   * 使用航空标准公式：
   * 1. 转弯半径公式：R = V² / (g × tan(θ))
   *    - R: 转弯半径 (m)
   *    - V: 地速 (m/s)
   *    - g: 重力加速度 (9.81 m/s²)
   *    - θ: 飞机坡度角 (rad)
   *
   * 2. 转弯率公式：ω = (g × tan(θ)) / V
   *    - ω: 转弯率 (rad/s)
   *    - 转换为度/秒：rad/s × (180/π) = °/s
   *
   * 参考：FAA Pilot's Handbook of Aeronautical Knowledge
   */
  calculateTurn: function() {
    var self = this;

    // 步骤1：输入值预检查（空值检查）
    if (!this.data.turn.bankAngle || !this.data.turn.groundSpeed) {
      this.showError('请输入飞机坡度角和地速');
      return;
    }

    // 步骤2：解析输入值
    var bankAngle = parseFloat(this.data.turn.bankAngle);
    var groundSpeed = parseFloat(this.data.turn.groundSpeed);

    // 步骤3：数值有效性检查
    if (isNaN(bankAngle) || isNaN(groundSpeed)) {
      this.showError('请输入有效的数值');
      return;
    }

    // 步骤4：飞机坡度角范围验证
    if (bankAngle <= MIN_BANK_ANGLE || bankAngle >= MAX_BANK_ANGLE) {
      this.showError('飞机坡度角必须在0到90度之间');
      return;
    }

    // 步骤5：地速范围验证
    if (groundSpeed <= MIN_GROUND_SPEED) {
      this.showError('地速必须大于0');
      return;
    }

    // 步骤6：地速合理性检查
    if (groundSpeed > MAX_GROUND_SPEED) {
      this.showError('地速值过大（超过' + MAX_GROUND_SPEED + '节），请检查输入');
      return;
    }

    // 步骤7：单位转换
    // 将地速从节转换为米/秒
    var groundSpeedMs = groundSpeed * KNOTS_TO_MS;

    // 将飞机坡度角从度转换为弧度
    var bankAngleRad = bankAngle * DEG_TO_RAD;

    // 步骤8：计算转弯半径
    /**
     * 转弯半径计算公式（标准航空物理公式）
     * R = V² / (g × tan(θ))
     *
     * 物理原理：
     * - 飞机转弯时，升力的水平分量提供向心力
     * - 向心力 = m × V² / R
     * - 升力水平分量 = L × sin(θ) ≈ m × g × tan(θ) (小角度近似)
     * - 两者相等，解出 R = V² / (g × tan(θ))
     */
    var radiusMeters = (groundSpeedMs * groundSpeedMs) / (GRAVITY * Math.tan(bankAngleRad));

    // 将转弯半径从米转换为海里 (1海里 = 1852米)
    var radiusNauticalMiles = radiusMeters / METERS_TO_NM;

    // 步骤9：计算转弯率
    /**
     * 转弯率计算公式
     * ω = (g × tan(θ)) / V
     *
     * 物理原理：
     * - 转弯率是飞机航向变化的角速度
     * - 从转弯半径公式推导：ω = V / R
     * - 代入 R = V² / (g × tan(θ))
     * - 得到 ω = (g × tan(θ)) / V
     */
    var turnRate = (GRAVITY * Math.tan(bankAngleRad)) / groundSpeedMs * RAD_TO_DEG;

    // 步骤10：更新结果到页面
    this.setData({
      'turn.radiusMeters': this.formatNumber(radiusNauticalMiles),
      'turn.turnRate': this.formatNumber(turnRate)
    }, function() {
      // 数据更新完成后，滚动到结果区域
      wx.pageScrollTo({
        selector: '#result-section',
        duration: 300,
        offsetTop: -20
      });
    });

    // 步骤11：显示成功提示
    this.showSuccess('转弯半径计算完成');
  },

  /**
   * 清空所有输入和结果数据
   */
  clearTurn: function() {
    this.setData({
      'turn.bankAngle': '',
      'turn.groundSpeed': '',
      'turn.radiusMeters': '',
      'turn.turnRate': ''
    });
    this.showSuccess('数据已清空');
  },

  /**
   * 格式化数值显示
   * 根据数值大小自动调整精度
   *
   * @param {Number} num 要格式化的数值
   * @return {String} 格式化后的字符串
   */
  formatNumber: function(num) {
    // 输入验证
    if (!isFinite(num) || isNaN(num)) {
      console.warn('⚠️ formatNumber收到无效数值:', num);
      return '0.00';
    }

    // 根据数值大小动态调整精度
    // 对于海里值，根据大小决定小数位数
    if (num >= 10) {
      return num.toFixed(1);      // >= 10: 保留1位小数 (例：15.3)
    } else if (num >= 1) {
      return num.toFixed(2);      // >= 1: 保留2位小数 (例：2.45)
    } else {
      return num.toFixed(3);      // < 1: 保留3位小数 (例：0.567)
    }
  }
};

// 使用BasePage创建页面实例
Page(BasePage.createPage(pageConfig));
