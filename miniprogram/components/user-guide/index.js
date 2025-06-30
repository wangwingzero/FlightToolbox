/**
 * FlightToolbox 智能用户引导组件 v2.1
 * 基于移动端UX最佳实践，提供渐进式、个性化的用户引导体验
 */
Component({
  properties: {
    // 是否显示引导
    show: {
      type: Boolean,
      value: false
    },
    // 引导类型：welcome(欢迎), feature(功能发现), advanced(高级功能)
    guideType: {
      type: String,
      value: 'welcome'
    }
  },

  data: {
    // 当前引导步骤
    currentStep: 0,
    // 用户角色（自动识别）
    userProfile: 'pilot', // pilot, student, mechanic
    // 引导步骤配置
    guideConfigs: {
      welcome: [
        {
          title: '🛩️ 欢迎来到FlightToolbox！',
          content: '专为飞行员设计的专业工具箱\n让每次飞行都更安心、更专业',
          icon: '🛩️',
          type: 'welcome',
          target: null,
          emotion: 'excited'
        },
        {
          title: '💎 积分获取指南',
          content: '📅 每日签到：15-50积分（连续签到奖励更丰厚）\n📺 观看广告：40-20积分（每日15次，递减奖励）\n🎁 新用户礼包：50积分（已到账）\n\n💡 建议：每天签到+看3个广告 = 稳定积分来源',
          icon: '💎',
          type: 'guide',
          target: '.points-section, .signin-section',
          emotion: 'informative'
        },
        {
          title: '📋 功能消费清单',
          content: '🆓 免费功能：个人检查单、资质管理\n💰 1积分：常用换算、飞行速算\n💰 2积分：万能查询、特殊计算、夜航计算\n💰 3积分：事件报告、雪情通告、危险品查询\n\n💡 推荐：优先使用高价值功能（查询、计算）',
          icon: '📋',
          type: 'guide',
          target: null,
          emotion: 'practical'
        },
        {
          title: '🔍 万能查询 (2积分)',
          content: '📚 包含内容：\n• ICAO通信词汇和代码\n• 全球机场信息查询\n• 航空缩写和术语\n• 专业定义和规范\n\n🎯 使用技巧：支持中英文搜索，离线可用',
          icon: '🔍',
          type: 'feature',
          target: '.nav-item[data-page="abbreviations"]',
          emotion: 'confident'
        },
        {
          title: '📐 常用换算 (1积分)',
          content: '⚡ 换算类型：\n• 长度：英尺↔米、海里↔公里\n• 重量：磅↔公斤、吨换算\n• 速度：节↔公里/小时\n• 压力：英寸汞柱↔百帕\n\n🎯 使用技巧：结果可复制，历史记录保存',
          icon: '📐',
          type: 'feature', 
          target: '.nav-item[data-page="unit-converter"]',
          emotion: 'professional'
        },
        {
          title: '🧮 特殊计算 (2积分)',
          content: '✈️ 计算功能：\n• 飞行性能计算\n• 燃油消耗分析\n• 起降距离计算\n• 重心位置计算\n\n🎯 使用技巧：专业数据，计算精确可靠',
          icon: '🧮',
          type: 'feature',
          target: '.nav-item[data-page="aviation-calculator"]',
          emotion: 'reliable'
        },
        {
          title: '🏠 我的首页 (免费)',
          content: '🎯 核心功能：\n• 每日签到和积分管理\n• 资质到期提醒\n• 高级工具快捷入口\n• 个人检查单管理\n\n🎯 使用技巧：建议设为常用页面',
          icon: '🏠',
          type: 'feature',
          target: '.qualification-section',
          emotion: 'secure'
        },
        {
          title: '📱 离线可用',
          content: '🛩️ 核心优势：\n• 所有功能离线可用\n• 650KB+数据本地存储\n• 驾驶舱、偏远机场无忧\n• 积分消费仅在使用时扣除\n\n💡 FlightToolbox = 您的离线飞行助手',
          icon: '📱',
          type: 'benefit',
          target: null,
          emotion: 'reassuring'
        }
      ],
      featureDiscovery: [
        {
          title: '🎯 高级功能完整清单',
          content: '看起来您已经熟悉了基础功能\n让我为您详细介绍所有高级功能',
          icon: '🎯',
          type: 'discovery',
          target: null,
          emotion: 'helpful'
        },
        {
          title: '✈️ 我的首页高级工具',
          content: '🌅 日出日落计算：精确计算夜航时间\n📊 分飞行时间：多机型飞行时间分配\n🛩️ 双发复飞梯度：性能计算分析\n🌍 长航线换班：国际航线换班计划\n📋 事件报告样例：标准事件报告模板\n❄️ 雪情通告解码：SNOWTAM专业解读\n⚠️ 危险品查询：危险品运输规范',
          icon: '✈️',
          type: 'feature',
          target: '.advanced-tools-section',
          emotion: 'comprehensive'
        },
        {
          title: '🔍 万能查询数据库',
          content: '📡 ICAO通信：标准通信词汇和代码\n🏢 机场信息：全球机场详细资料\n📖 航空缩写：专业术语和缩写对照\n📚 定义查询：航空专业定义解释\n\n💡 搜索技巧：支持模糊搜索、中英文混合',
          icon: '🔍',
          type: 'feature',
          target: '.nav-item[data-page="abbreviations"]',
          emotion: 'informative'
        },
        {
          title: '📐 换算工具详解',
          content: '📏 长度换算：英尺、米、海里、公里\n⚖️ 重量换算：磅、公斤、吨位转换\n🚀 速度换算：节、公里/小时、马赫数\n🌡️ 温度换算：摄氏度、华氏度、开尔文\n💨 压力换算：英寸汞柱、百帕、毫巴\n\n💡 实用功能：一键复制结果、历史记录',
          icon: '📐',
          type: 'feature',
          target: '.nav-item[data-page="unit-converter"]',
          emotion: 'detailed'
        },
        {
          title: '🧮 专业计算工具',
          content: '✈️ 飞行性能：起降距离、爬升性能\n⛽ 燃油计算：消耗分析、航程规划\n⚖️ 重心计算：载重平衡、重心位置\n🌪️ 风速分析：侧风、顺逆风影响\n🌡️ 低温修正：高原机场温度修正\n\n💡 专业数据：基于真实飞行手册',
          icon: '🧮',
          type: 'feature',
          target: '.nav-item[data-page="aviation-calculator"]',
          emotion: 'professional'
        },
        {
          title: '💡 使用技巧总结',
          content: '⭐ 积分获取：每天签到+看3个广告\n🎯 功能选择：优先使用高价值功能\n📱 离线使用：所有功能都支持离线\n💾 数据保存：历史记录自动保存\n🔄 批量操作：支持连续计算换算\n\n💡 最佳实践：建立日常使用习惯',
          icon: '💡',
          type: 'tips',
          target: null,
          emotion: 'practical'
        }
      ],
      advanced: [
        {
          title: '高级功能解锁',
          content: '您是FlightToolbox的熟练用户了！\n这些高级功能将进一步提升您的效率',
          icon: '🚀',
          type: 'advanced',
          target: null,
          emotion: 'achievement'
        },
        {
          title: '📊 积分数据分析',
          content: '深度了解您的使用习惯：\n• 积分收支明细和趋势分析\n• 功能使用频率统计\n• 个人效率报告生成\n\n🎖️ 高级用户专享：数据驱动的使用优化建议',
          icon: '📊',
          type: 'advanced',
          target: '.points-detail-btn',
          emotion: 'analytical'
        },
        {
          title: '🎯 智能推荐系统',
          content: '基于使用行为的个性化推荐：\n• 根据飞行任务推荐相关功能\n• 智能预测您可能需要的计算\n• 个性化的功能快捷方式\n\n🎖️ 让FlightToolbox更懂您的需求',
          icon: '🎯',
          type: 'advanced',
          target: null,
          emotion: 'intelligent'
        },
        {
          title: '⚡ 高效操作模式',
          content: '专为熟练用户设计的快捷操作：\n• 批量操作和快速切换\n• 自定义常用功能组合\n• 一键重复上次操作\n\n🎖️ 提升工作效率的秘密武器',
          icon: '⚡',
          type: 'advanced',
          target: null,
          emotion: 'powerful'
        },
        {
          title: '🏆 积分成就系统',
          content: '解锁更多成就和奖励：\n• 连续签到里程碑奖励\n• 功能使用专家认证\n• 积分消费等级提升\n\n🎖️ 展示您的FlightToolbox专业水平',
          icon: '🏆',
          type: 'advanced',
          target: '.achievement-section',
          emotion: 'prestigious'
        }
      ]
    },
    // 用户角色配置
    userProfiles: {
      pilot: {
        name: "飞行员",
        keyFeatures: ["每日签到", "资质管理", "航空计算", "ICAO查询", "积分系统"],
        welcomeMessage: "欢迎，飞行员！让我们为您介绍专业的飞行工具",
        pointsStrategy: "建议优先使用资质管理和航空计算功能，这些是您工作中的核心需求",
        signinMotivation: "每日签到帮助您养成使用习惯，确保重要的资质提醒不被错过"
      },
      student: {
        name: "飞行学员", 
        keyFeatures: ["每日签到", "单位换算", "理论计算", "缩写查询", "积分系统"],
        welcomeMessage: "欢迎，飞行学员！这些工具将助力您的学习",
        pointsStrategy: "建议多使用换算和查询功能练习，通过观看广告获得足够积分支持学习",
        signinMotivation: "每日签到获得积分，支持您的日常学习和练习需求"
      },
      mechanic: {
        name: "机务人员",
        keyFeatures: ["每日签到", "技术查询", "单位换算", "规范查询", "积分系统"], 
        welcomeMessage: "欢迎，机务人员！专业的技术查询工具为您服务",
        pointsStrategy: "建议重点使用查询功能获取技术规范，合理分配积分支持工作需求",
        signinMotivation: "每日签到确保您始终有足够积分查询最新的技术规范和标准"
      }
    },
    // 指向动画位置
    arrowPosition: {
      show: false,
      top: 0,
      left: 0
    },
    // 当前步骤信息
    currentStepInfo: null,
    // 引导进度
    totalSteps: 0,
    // 引导开始时间（用于跟踪）
    guideStartTime: null,
    // 新增：情境化引导数据
    contextualGuides: {},
    
    // 新增：个性化推荐
    personalizedRecommendations: [],
    
    // 新增：引导效果分析
    analyticsData: {
      startTime: 0,
      interactions: [],
      completionRate: 0
    }
  },

  lifetimes: {
    attached() {
      console.log('🎯 FlightToolbox智能引导组件v2.1已加载');
      this.detectUserProfile();
    }
  },

  observers: {
    'show': function(show) {
      if (show) {
        this.startGuide();
      }
    }
  },

  methods: {
    // 检测用户角色
    detectUserProfile() {
      const usage = wx.getStorageSync('feature_usage') || {};
      const qualifications = wx.getStorageSync('pilot_qualifications_v2') || [];
      
      // 简单的用户角色识别逻辑
      if (qualifications.length > 0) {
        this.setData({ userProfile: 'pilot' });
      } else if (usage['unit-converter'] > usage['aviation-calculator']) {
        this.setData({ userProfile: 'student' });
      } else {
        this.setData({ userProfile: 'pilot' }); // 默认
      }
      
      console.log('🎯 检测到用户角色:', this.data.userProfile);
    },

    // 开始引导
    startGuide() {
      console.log('🎯 开始智能引导, 类型:', this.data.guideType);
      
      const steps = this.data.guideConfigs[this.data.guideType] || this.data.guideConfigs.welcome;
      
      this.setData({
        currentStep: 0,
        totalSteps: steps.length,
        guideStartTime: Date.now()
      });

      // 记录引导开始事件
      this.recordAnalytics('guide_started', {
        guideType: this.data.guideType,
        userProfile: this.data.userProfile,
        timestamp: Date.now()
      });

      this.showCurrentStep();
    },

    // 显示当前步骤
    showCurrentStep() {
      const steps = this.data.guideConfigs[this.data.guideType] || this.data.guideConfigs.welcome;
      const step = steps[this.data.currentStep];
      
      if (!step) {
        this.completeGuide();
        return;
      }

      // 个性化处理第一步欢迎信息
      if (this.data.currentStep === 0 && step.type === 'welcome') {
        const profile = this.data.userProfiles[this.data.userProfile];
        step.content = profile.welcomeMessage + '\n\n' + step.content;
      }

      this.setData({
        currentStepInfo: step
      });

      // 如果有目标元素，显示指向箭头
      if (step.target) {
        this.showArrow(step.target);
      } else {
        this.hideArrow();
      }

      // 记录步骤查看事件
      this.recordAnalytics('step_viewed', {
        step: this.data.currentStep,
        title: step.title,
        type: step.type
      });
    },

    // 显示指向箭头
    showArrow(selector) {
      setTimeout(() => {
        const selectors = selector.split(',');
        this.trySelectorsForArrow(selectors, 0);
      }, 300); // 增加延迟确保动画完成
    },

    // 尝试多个选择器
    trySelectorsForArrow(selectors, index) {
      if (index >= selectors.length) {
        console.log('🎯 所有选择器都无法找到目标元素');
        this.hideArrow();
        return;
      }

      const currentSelector = selectors[index].trim();
      const query = wx.createSelectorQuery().in(this);
      query.select(currentSelector).boundingClientRect();
      
      query.exec((res) => {
        const rect = res[0];
        if (rect && rect.width > 0 && rect.height > 0) {
          const arrowTop = rect.top + rect.height + 30;
          const arrowLeft = rect.left + rect.width / 2;
          
          this.setData({
            arrowPosition: {
              show: true,
              top: arrowTop,
              left: arrowLeft
            }
          });
        } else {
          this.trySelectorsForArrow(selectors, index + 1);
        }
      });
    },

    // 隐藏指向箭头
    hideArrow() {
      this.setData({
        'arrowPosition.show': false
      });
    },

    // 下一步
    nextStep() {
      this.recordAnalytics('guide_step_completed', {
        step: this.data.currentStep,
        guideType: this.data.guideType
      });
      
      if (this.data.currentStep >= this.data.totalSteps - 1) {
        this.completeGuide();
      } else {
        const nextStep = this.data.currentStep + 1;
        
        this.setData({
          currentStep: nextStep,
          stepStartTime: Date.now()
        });
        
        this.showCurrentStep();
        
        this.recordAnalytics('guide_step_advanced', {
          step: nextStep,
          guideType: this.data.guideType
        });
      }
    },

    // 🎯 修改：跳过引导 - 确保跳过时也正确标记状态
    skipGuide() {
      console.log('⏭️ 跳过引导');
      
      this.recordAnalytics('guide_skipped', {
        step: this.data.currentStep,
        guideType: this.data.guideType,
        totalSteps: this.data.totalSteps
      });
      
      // 🎯 标记引导已跳过（视为完成）
      const completedGuides = wx.getStorageSync('completed_guides') || [];
      if (!completedGuides.includes(this.data.guideType)) {
        completedGuides.push(this.data.guideType);
        wx.setStorageSync('completed_guides', completedGuides);
      }
      
      // 🎯 如果是新用户引导被跳过，也标记用户已入门
      if (this.data.guideType === 'welcome') {
        wx.setStorageSync('user_onboarded', true);
        console.log('🎯 新用户引导被跳过，标记用户已入门');
      }
      
      this.setData({
        show: false
      });
      
      this.triggerEvent('guideSkipped', {
        step: this.data.currentStep,
        guideType: this.data.guideType,
        userProfile: this.data.userProfile
      });
    },

    // 🎯 修改：完成引导 - 确保正确标记用户状态
    completeGuide() {
      console.log('🎉 引导完成');
      
      this.recordAnalytics('guide_completed', {
        guideType: this.data.guideType,
        totalSteps: this.data.totalSteps,
        completionTime: Date.now() - this.data.analyticsData.startTime
      });
      
      // 🎯 标记引导完成状态
      const completedGuides = wx.getStorageSync('completed_guides') || [];
      if (!completedGuides.includes(this.data.guideType)) {
        completedGuides.push(this.data.guideType);
        wx.setStorageSync('completed_guides', completedGuides);
      }
      
      // 🎯 如果是新用户引导，标记用户已完成入门
      if (this.data.guideType === 'welcome') {
        wx.setStorageSync('user_onboarded', true);
        console.log('🎯 新用户引导完成，标记用户已入门');
      }
      
      // 发放奖励积分
      this.awardCompletionPoints();
      
      this.setData({
        show: false
      });
      
      // 触发完成事件
      this.triggerEvent('guideCompleted', {
        guideType: this.data.guideType,
        userProfile: this.data.userProfile,
        analytics: this.getAnalyticsReport()
      });
    },



    // 🎯 修改：智能引导触发检查 - 确保只在新用户第一次进入时显示
    checkGuideConditions() {
      const usage = wx.getStorageSync('feature_usage') || {};
      const completedGuides = wx.getStorageSync('completed_guides') || [];
      const userOnboarded = wx.getStorageSync('user_onboarded') || false;
      const guideShownBefore = wx.getStorageSync('guide_shown_before') || false;
      
      const conditions = {
        newUser: {
          condition: () => {
            // 🎯 新逻辑：只有真正的新用户且从未显示过引导才触发
            return !userOnboarded && !guideShownBefore && !completedGuides.includes('welcome');
          },
          priority: 1,
          type: 'welcome'
        },
        featureDiscovery: {
          condition: () => {
            return Object.keys(usage).length < 3 && !completedGuides.includes('featureDiscovery') && userOnboarded;
          },
          priority: 2,
          type: 'featureDiscovery'
        },
        advancedFeatures: {
          condition: () => {
            const basicUsage = (usage['unit-converter'] || 0) + (usage['abbreviations'] || 0);
            return basicUsage > 10 && !completedGuides.includes('advanced') && userOnboarded;
          },
          priority: 3,
          type: 'advanced'
        }
      };
      
      // 找到优先级最高的满足条件的引导
      for (let key in conditions) {
        const condition = conditions[key];
        if (condition.condition()) {
          // 🎯 标记引导已显示过
          if (key === 'newUser') {
            wx.setStorageSync('guide_shown_before', true);
          }
          return condition.type;
        }
      }
      
      return null;
    },

    /**
     * 新增：情境化引导检查
     * 根据用户当前页面和行为提供相关引导
     */
    checkContextualGuide(pageName, userAction) {
      console.log('🎯 检查情境化引导:', { pageName, userAction });
      
      const contextualGuides = {
        // 我的首页 - 积分系统引导
        'others': {
          firstSignin: {
            type: 'contextual',
            icon: '⭐',
            title: '首次签到奖励',
            content: '恭喜完成首次签到！每日签到可获得15-50积分奖励。\n连续签到天数越多，奖励越丰厚。建议每天打开应用时先签到。',
            emotion: 'rewarding',
            trigger: 'firstSignin'
          },
          lowPoints: {
            type: 'contextual',
            icon: '💎',
            title: '积分不足提醒',
            content: '当前积分较少，建议：\n• 观看广告快速获得积分\n• 每日签到稳定积分来源\n• 合理规划功能使用',
            emotion: 'helpful',
            trigger: 'lowPoints'
          },
          adWatched: {
            type: 'contextual',
            icon: '📺',
            title: '广告观看技巧',
            content: '观看广告有递减奖励机制：\n• 前3次：40积分/次\n• 第4-7次：30积分/次\n• 建议分散观看，最大化收益',
            emotion: 'strategic',
            trigger: 'adWatched'
          },
          pointsSpent: {
            type: 'contextual',
            icon: '💰',
            title: '积分消费提醒',
            content: '功能使用消费了积分。记住：\n• 万能查询：2积分\n• 特殊计算：2-3积分\n• 单位换算：1积分\n\n合理使用，让积分发挥最大价值',
            emotion: 'informative',
            trigger: 'pointsSpent'
          }
        },
        
        // 单位换算页面引导
        'unit-converter': {
          firstVisit: {
            type: 'contextual',
            icon: '📏',
            title: '单位换算小技巧',
            content: '长按换算结果可以复制到剪贴板，双击输入框可以清空内容。\n消费1积分，性价比很高的功能！',
            emotion: 'helpful',
            trigger: 'firstVisit'
          },
          multipleCalculations: {
            type: 'contextual',
            icon: '🔄',
            title: '批量换算功能',
            content: '您已经进行了多次换算，试试批量换算功能可以更高效！\n频繁使用建议保持足够积分余额。',
            emotion: 'discovery',
            trigger: 'usage'
          }
        },
        
        // 航空计算器引导
        'aviation-calculator': {
          firstCalculation: {
            type: 'contextual',
            icon: '✈️',
            title: '专业计算提示',
            content: '计算结果会自动保存到历史记录，您可以随时查看之前的计算。\n专业计算消费2积分，物有所值！',
            emotion: 'professional',
            trigger: 'firstUse'
          },
          advancedFeatures: {
            type: 'contextual',
            icon: '🎯',
            title: '高级功能解锁',
            content: '您已经熟练使用基础功能，试试高级计算功能吧！\n高级功能可能消费更多积分，但功能更强大。',
            emotion: 'achievement',
            trigger: 'mastery'
          }
        },

        // 万能查询引导
        'abbreviations': {
          searchTips: {
            type: 'contextual',
            icon: '🔍',
            title: '搜索小技巧',
            content: '支持中英文搜索，可以搜索缩写、全称或相关关键词。\n查询功能消费2积分，但数据价值很高！',
            emotion: 'helpful',
            trigger: 'searchAttempt'
          },
          dataScope: {
            type: 'contextual',
            icon: '📚',
            title: '数据范围说明',
            content: '包含ICAO、机场、缩写、定义等650KB+的离线数据，无需网络即可查询。\n一次付费，全天候使用！',
            emotion: 'informative',
            trigger: 'multipleSearches'
          }
        }
      };

      const pageGuides = contextualGuides[pageName];
      if (pageGuides && pageGuides[userAction]) {
        this.showContextualGuide(pageGuides[userAction]);
      }
    },

    /**
     * 新增：显示情境化引导
     */
    showContextualGuide(guideData) {
      console.log('📍 显示情境化引导:', guideData);
      
      this.setData({
        currentStepInfo: guideData,
        show: true,
        currentStep: 0,
        totalSteps: 1,
        guideType: 'contextual'
      });

      // 记录引导显示
      this.recordAnalytics('contextual_guide_shown', {
        guideType: guideData.type,
        trigger: guideData.trigger
      });
    },

    /**
     * 新增：生成个性化推荐
     */
    generatePersonalizedRecommendations(userProfile) {
      console.log('🎯 生成个性化推荐:', userProfile);
      
      const { role, usagePattern, preferredFeatures, skillLevel } = userProfile;
      const recommendations = [];
      
      // 🎯 优先推荐：积分系统相关功能
      const pointsManagerUtil = require('../../utils/points-manager.js');
      const currentPoints = pointsManagerUtil.getCurrentPoints();
      const signInStatus = pointsManagerUtil.getSignInStatus();
      const adInfo = pointsManagerUtil.getNextAdRewardInfo();
      
      // 签到推荐逻辑
      if (!signInStatus.hasSignedToday) {
        recommendations.push({
          type: 'action',
          icon: '⭐',
          title: '今日签到',
          content: `还没有签到哦！今日签到可获得${signInStatus.nextReward}积分。\n连续签到${signInStatus.currentStreak + 1}天，奖励更丰厚！`,
          priority: 'urgent',
          category: 'daily',
          action: 'signin'
        });
      } else if (signInStatus.currentStreak >= 7) {
        recommendations.push({
          type: 'achievement',
          icon: '🔥',
          title: '签到连击达人',
          content: `恭喜！您已连续签到${signInStatus.currentStreak}天。\n保持这个好习惯，连续30天可获得50积分奖励！`,
          priority: 'high',
          category: 'achievement'
        });
      }
      
      // 广告观看推荐逻辑
      if (currentPoints < 20 && adInfo.currentCount < 3) {
        recommendations.push({
          type: 'action',
          icon: '📺',
          title: '观看广告补充积分',
          content: `当前积分：${currentPoints}，建议观看广告补充。\n前3次观看每次可获得40积分，性价比最高！`,
          priority: 'high',
          category: 'points',
          action: 'watchAd'
        });
      } else if (adInfo.currentCount < adInfo.maxDailyCount && adInfo.currentReward >= 30) {
        recommendations.push({
          type: 'tip',
          icon: '💰',
          title: '高收益广告机会',
          content: `今日还可观看${adInfo.maxDailyCount - adInfo.currentCount}次广告。\n当前奖励：${adInfo.currentReward}积分/次，机会难得！`,
          priority: 'medium',
          category: 'opportunity'
        });
      }
      
      // 积分使用建议
      if (currentPoints > 50) {
        const profile = this.data.userProfiles[this.data.userProfile];
        recommendations.push({
          type: 'strategy',
          icon: '💎',
          title: '积分使用建议',
          content: `当前积分充足（${currentPoints}分）。\n${profile.pointsStrategy}`,
          priority: 'medium',
          category: 'strategy'
        });
      }
      
      // 基于用户角色的推荐
      if (role === 'pilot') {
        recommendations.push({
          type: 'feature',
          icon: '🛩️',
          title: '双发复飞梯度',
          content: '专为飞行员设计的性能计算工具，支持多机型数据查询。',
          priority: 'high',
          category: 'professional'
        });
        
        recommendations.push({
          type: 'feature',
          icon: '🌅',
          title: '日出日落计算',
          content: '精确计算夜航时间，符合民航规章要求。',
          priority: 'high',
          category: 'navigation'
        });
      }
      
      if (role === 'student') {
        recommendations.push({
          type: 'feature',
          icon: '📚',
          title: '万能查询',
          content: '学习必备工具，包含丰富的航空术语和缩写。',
          priority: 'high',
          category: 'learning'
        });
        
        recommendations.push({
          type: 'feature',
          icon: '📏',
          title: '单位换算',
          content: '快速进行各种航空单位换算，提升计算效率。',
          priority: 'medium',
          category: 'utility'
        });
      }
      
      // 基于使用模式的推荐
      if (usagePattern === 'frequent') {
        recommendations.push({
          type: 'tip',
          icon: '⚡',
          title: '快捷操作技巧',
          content: '长按主要按钮可以快速访问历史记录和收藏功能。',
          priority: 'medium',
          category: 'efficiency'
        });
      }
      
      // 基于技能水平的推荐
      if (skillLevel === 'advanced') {
        recommendations.push({
          type: 'feature',
          icon: '🔧',
          title: '高级计算功能',
          content: '探索更多专业计算工具，提升工作效率。',
          priority: 'medium',
          category: 'advanced'
        });
      }
      
      // 按优先级排序
      recommendations.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
      
      this.setData({
        personalizedRecommendations: recommendations
      });
      
      return recommendations;
    },

    /**
     * 新增：显示个性化推荐引导
     */
    showPersonalizedGuide(recommendations) {
      console.log('💡 显示个性化推荐引导');
      
      if (!recommendations || recommendations.length === 0) {
        return;
      }
      
      const guideSteps = recommendations.map((rec, index) => ({
        type: 'recommendation',
        icon: rec.icon,
        title: rec.title,
        content: rec.content,
        emotion: 'discovery',
        category: rec.category,
        priority: rec.priority
      }));
      
      this.setData({
        guideSteps: guideSteps,
        currentStep: 0,
        totalSteps: guideSteps.length,
        currentStepInfo: guideSteps[0],
        show: true,
        guideType: 'personalized'
      });
      
      this.recordAnalytics('personalized_guide_started', {
        recommendationCount: recommendations.length,
        categories: recommendations.map(r => r.category)
      });
    },

    /**
     * 新增：引导效果分析
     */
    recordAnalytics(eventType, eventData = {}) {
      const timestamp = Date.now();
      const interaction = {
        type: eventType,
        timestamp: timestamp,
        data: eventData
      };
      
      console.log('📊 记录引导分析数据:', interaction);
      
      const interactions = this.data.analyticsData.interactions || [];
      interactions.push(interaction);
      
      this.setData({
        'analyticsData.interactions': interactions
      });
      
      // 同步到本地存储
      try {
        const analyticsHistory = wx.getStorageSync('guide_analytics') || [];
        analyticsHistory.push(interaction);
        
        // 只保留最近100条记录
        if (analyticsHistory.length > 100) {
          analyticsHistory.splice(0, analyticsHistory.length - 100);
        }
        
        wx.setStorageSync('guide_analytics', analyticsHistory);
      } catch (error) {
        console.error('❌ 保存引导分析数据失败:', error);
      }
    },

    /**
     * 新增：计算引导完成率
     */
    calculateCompletionRate() {
      const interactions = this.data.analyticsData.interactions || [];
      const startEvents = interactions.filter(i => i.type.includes('started')).length;
      const completeEvents = interactions.filter(i => i.type.includes('completed')).length;
      
      const completionRate = startEvents > 0 ? (completeEvents / startEvents * 100) : 0;
      
      this.setData({
        'analyticsData.completionRate': completionRate
      });
      
      return completionRate;
    },

    /**
     * 新增：获取引导效果报告
     */
    getAnalyticsReport() {
      const interactions = this.data.analyticsData.interactions || [];
      const completionRate = this.calculateCompletionRate();
      
      const report = {
        totalInteractions: interactions.length,
        completionRate: completionRate,
        mostCommonGuideType: this.getMostCommonGuideType(interactions),
        averageGuideTime: this.getAverageGuideTime(interactions),
        skipRate: this.getSkipRate(interactions),
        lastAnalyzed: new Date().toISOString()
      };
      
      console.log('📈 引导效果报告:', report);
      return report;
    },

    /**
     * 新增：获取最常见的引导类型
     */
    getMostCommonGuideType(interactions) {
      const typeCounts = {};
      interactions.forEach(interaction => {
        const type = (interaction.data && interaction.data.guideType) || 'unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      
      return Object.keys(typeCounts).reduce((a, b) => 
        typeCounts[a] > typeCounts[b] ? a : b, 'none');
    },

    /**
     * 新增：获取平均引导时间
     */
    getAverageGuideTime(interactions) {
      const startEvents = interactions.filter(i => i.type.includes('started'));
      const endEvents = interactions.filter(i => 
        i.type.includes('completed') || i.type.includes('skipped'));
      
      if (startEvents.length === 0 || endEvents.length === 0) {
        return 0;
      }
      
      const totalTime = endEvents.reduce((sum, endEvent) => {
        const startEvent = startEvents.find(s => 
          Math.abs(s.timestamp - endEvent.timestamp) < 300000); // 5分钟内
        if (startEvent) {
          return sum + (endEvent.timestamp - startEvent.timestamp);
        }
        return sum;
      }, 0);
      
      return totalTime / endEvents.length;
    },

    /**
     * 新增：获取跳过率
     */
    getSkipRate(interactions) {
      const startEvents = interactions.filter(i => i.type.includes('started')).length;
      const skipEvents = interactions.filter(i => i.type.includes('skipped')).length;
      
      return startEvents > 0 ? (skipEvents / startEvents * 100) : 0;
    },

    /**
     * 新增：发放完成奖励积分
     */
    awardCompletionPoints() {
      const pointsMap = {
        'welcome': 15,
        'featureDiscovery': 8,
        'advanced': 12,
        'contextual': 5,
        'personalized': 10
      };
      
      const points = pointsMap[this.data.guideType] || 5;
      
      try {
        const pointsManager = require('../../utils/points-manager.js');
        pointsManager.addPoints(points, `完成${this.data.guideType}引导`);
        
        wx.showToast({
          title: `获得${points}积分！`,
          icon: 'success',
          duration: 2000
        });
      } catch (error) {
        console.error('❌ 发放引导完成积分失败:', error);
      }
    }
  }
});