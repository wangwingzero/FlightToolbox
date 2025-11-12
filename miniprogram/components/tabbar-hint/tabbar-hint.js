/**
 * TabBar提示组件 - 轻量级替代方案
 * 用简单的横幅提示替代复杂的蒙版引导
 */

Component({
  properties: {
    // 是否显示提示
    visible: {
      type: Boolean,
      value: false
    }
  },

  data: {},

  methods: {
    /**
     * 关闭提示
     */
    onClose() {
      // 通知父组件关闭
      this.triggerEvent('close');
    }
  }
});
