/**
 * 分步引导组件
 * 提供可复用的分步引导功能，参考RODEX解码器设计模式
 * 严格遵循ES5语法
 */

Component({
  /**
   * 组件属性
   */
  properties: {
    // 步骤配置数组
    steps: {
      type: Array,
      value: [],
      observer: function(newVal) {
        if (newVal && newVal.length > 0) {
          this.setData({
            totalSteps: newVal.length
          });
        }
      }
    },
    
    // 当前步骤
    currentStep: {
      type: Number,
      value: 1,
      observer: function(newVal) {
        this.triggerEvent('stepchange', { 
          currentStep: newVal,
          totalSteps: this.data.totalSteps 
        });
      }
    },
    
    // 是否允许点击导航
    allowNavigation: {
      type: Boolean,
      value: true
    },
    
    // 是否显示实时预览
    showPreview: {
      type: Boolean,
      value: false
    },
    
    // 预览标题
    previewTitle: {
      type: String,
      value: '实时预览'
    },
    
    // 是否显示导航按钮
    showNavigation: {
      type: Boolean,
      value: true
    },
    
    // 禁用上一步按钮
    disablePrev: {
      type: Boolean,
      value: false
    },
    
    // 禁用下一步按钮
    disableNext: {
      type: Boolean,
      value: false
    },
    
    // 自定义按钮文字
    prevButtonText: {
      type: String,
      value: ''
    },
    
    nextButtonText: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件数据
   */
  data: {
    totalSteps: 0
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached: function() {
      console.log('🎯 分步引导组件已挂载');
      
      // 初始化总步数
      if (this.data.steps && this.data.steps.length > 0) {
        this.setData({
          totalSteps: this.data.steps.length
        });
      }
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 跳转到指定步骤
     */
    goToStep: function(event) {
      if (!this.data.allowNavigation) {
        return;
      }
      
      var targetStep = parseInt(event.currentTarget.dataset.step, 10);
      
      // 只允许跳转到已完成的步骤或当前步骤
      if (targetStep <= this.data.currentStep) {
        this.setData({
          currentStep: targetStep
        });
        
        this.triggerEvent('goto', {
          targetStep: targetStep,
          previousStep: this.data.currentStep
        });
      }
    },

    /**
     * 上一步
     */
    prevStep: function() {
      var currentStep = this.data.currentStep;
      
      if (currentStep > 1 && !this.data.disablePrev) {
        var newStep = currentStep - 1;
        this.setData({
          currentStep: newStep
        });
        
        this.triggerEvent('prev', {
          currentStep: newStep,
          previousStep: currentStep
        });
      }
    },

    /**
     * 下一步
     */
    nextStep: function() {
      var currentStep = this.data.currentStep;
      
      if (currentStep < this.data.totalSteps && !this.data.disableNext) {
        var newStep = currentStep + 1;
        this.setData({
          currentStep: newStep
        });
        
        this.triggerEvent('next', {
          currentStep: newStep,
          previousStep: currentStep
        });
      } else if (currentStep === this.data.totalSteps && !this.data.disableNext) {
        // 最后一步，触发完成事件
        this.triggerEvent('complete', {
          totalSteps: this.data.totalSteps
        });
      }
    },

    /**
     * 更新当前步骤（外部调用）
     */
    updateCurrentStep: function(step) {
      if (step >= 1 && step <= this.data.totalSteps) {
        this.setData({
          currentStep: step
        });
      }
    },

    /**
     * 重置到第一步
     */
    resetToFirstStep: function() {
      this.setData({
        currentStep: 1
      });
      
      this.triggerEvent('reset', {
        currentStep: 1
      });
    },

    /**
     * 检查当前步骤是否有效
     */
    isValidStep: function(step) {
      return step >= 1 && step <= this.data.totalSteps;
    },

    /**
     * 获取步骤进度百分比
     */
    getProgress: function() {
      return Math.round((this.data.currentStep / this.data.totalSteps) * 100);
    }
  }
});