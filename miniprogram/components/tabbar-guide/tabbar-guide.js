/**
 * TabBar蒙版引导组件
 * 用于首次使用时引导用户发现底部TabBar
 */

Component({
  properties: {
    // 是否显示引导
    visible: {
      type: Boolean,
      value: false
    }
  },

  data: {
    // TabBar配置（5个Tab）
    tabs: [
      { label: '我的首页', icon: '🏠', position: '10%' },
      { label: '资料查询', icon: '🔍', position: '30%' },
      { label: '驾驶舱', icon: '✈️', position: '50%' },
      { label: '航班运行', icon: '🛫', position: '70%' },
      { label: '计算工具', icon: '🧮', position: '90%' }
    ],

    // 当前聚焦的Tab索引
    currentTabIndex: 0,

    // 手指位置（直接指向TabBar图标中心）
    fingerPosition: {
      left: '10%',
      bottom: '20rpx'
    },

    // 标签位置（在TabBar上方显示）
    labelPosition: {
      left: '10%',
      bottom: '140rpx'
    },

    // 当前Tab标签
    currentTabLabel: '我的首页',

    // 动画定时器
    animationTimer: null
  },

  lifetimes: {
    attached: function() {
      console.log('TabBar引导组件已加载');
    },

    detached: function() {
      // 清理定时器
      if (this.data.animationTimer) {
        clearInterval(this.data.animationTimer);
      }
    }
  },

  observers: {
    'visible': function(visible) {
      if (visible) {
        // 显示时开始动画
        this.startAnimation();
      } else {
        // 隐藏时停止动画
        this.stopAnimation();
      }
    }
  },

  methods: {
    /**
     * 开始手指指向动画
     */
    startAnimation: function() {
      var self = this;
      var currentIndex = 0;

      // 初始化第一个Tab
      this.updateFingerPosition(0);

      // 每2秒切换到下一个Tab
      var timer = setInterval(function() {
        currentIndex = (currentIndex + 1) % self.data.tabs.length;
        self.updateFingerPosition(currentIndex);
      }, 2000);

      this.setData({
        animationTimer: timer
      });
    },

    /**
     * 停止动画
     */
    stopAnimation: function() {
      if (this.data.animationTimer) {
        clearInterval(this.data.animationTimer);
        this.setData({
          animationTimer: null
        });
      }
    },

    /**
     * 更新手指位置
     */
    updateFingerPosition: function(index) {
      var tab = this.data.tabs[index];

      this.setData({
        currentTabIndex: index,
        fingerPosition: {
          left: tab.position,
          bottom: '20rpx'  // 直接指向TabBar图标中心
        },
        labelPosition: {
          left: tab.position,
          bottom: '140rpx'  // 标签在TabBar上方显示
        },
        currentTabLabel: tab.icon + ' ' + tab.label
      });

      console.log('手指指向:', tab.label);
    },

    /**
     * 点击蒙版关闭
     */
    onMaskTap: function() {
      this.closeGuide();
    },

    /**
     * 点击跳过按钮
     */
    onSkip: function() {
      this.closeGuide();
    },

    /**
     * 关闭引导
     */
    closeGuide: function() {
      this.stopAnimation();

      // 触发关闭事件
      this.triggerEvent('close');

      console.log('关闭TabBar引导');
    }
  }
});
