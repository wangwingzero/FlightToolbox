/**
 * 骨架屏组件
 * 
 * 用于TabBar页面加载状态显示，确保100ms内显示骨架屏
 * 
 * 支持的布局类型：
 * - grid: 卡片网格布局（资料查询、计算工具、通信页面）
 * - list: 列表布局
 * - profile: 个人中心布局（我的首页）
 * - cockpit: 驾驶舱布局（GPS驾驶舱）
 * - default: 使用Vant骨架屏
 * 
 * Requirements: 1.5, 9.1 - 100ms内显示骨架屏
 * 
 * @example
 * // 在页面WXML中使用
 * <skeleton-screen type="grid" loading="{{loading}}" />
 * 
 * // 在页面JS中
 * data: {
 *   loading: true  // 初始值为true，确保骨架屏立即显示
 * },
 * customOnLoad: function() {
 *   // 数据加载完成后
 *   this.setData({ loading: false });
 * }
 */
'use strict';

Component({
  /**
   * 组件属性
   */
  properties: {
    /**
     * 是否显示骨架屏
     * 默认为true，确保页面加载时立即显示
     */
    loading: {
      type: Boolean,
      value: true
    },
    
    /**
     * 骨架屏布局类型
     * - grid: 卡片网格（默认）
     * - list: 列表
     * - profile: 个人中心
     * - cockpit: 驾驶舱
     * - default: Vant骨架屏
     */
    type: {
      type: String,
      value: 'grid'
    },
    
    /**
     * 网格布局的卡片数量
     * 默认6个，适合大多数TabBar页面
     */
    gridCount: {
      type: Number,
      value: 6
    },
    
    /**
     * 列表布局的项目数量
     * 默认5个
     */
    listCount: {
      type: Number,
      value: 5
    },
    
    /**
     * Vant骨架屏的行数
     * 仅在type为default时生效
     */
    row: {
      type: Number,
      value: 3
    }
  },

  /**
   * 组件数据
   */
  data: {
    // 组件内部状态
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached: function() {
      // 组件挂载时的逻辑
      // 骨架屏应该立即显示，无需额外处理
    },
    
    detached: function() {
      // 组件卸载时的清理
    }
  },

  /**
   * 组件方法
   */
  methods: {
    // 预留扩展方法
  }
});
