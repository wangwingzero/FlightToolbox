// 国内通信失效程序页面逻辑
const { communicationDataManager } = require('../../../utils/communication-manager.js');

Page({
  data: {
    isDarkMode: false,
    procedureData: {},
    selectedAirspace: 'surveillance', // 'surveillance' or 'non-surveillance'
    selectedIntention: 'return' // 'return', 'takeoff-alternate', 'destination-alternate'
  },

  onLoad() {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '国内通信失效程序'
    });
    
    // 加载程序数据
    this.loadProcedureData();
    
    // 检查主题状态
    this.checkThemeStatus();
  },

  onShow() {
    // 每次显示页面时检查主题状态
    this.checkThemeStatus();
  },

  // 加载程序数据
  loadProcedureData() {
    const self = this;
    
    try {
      // 从主包数据管理器获取数据
      const chinaCommFailureData = communicationDataManager.getChinaCommFailure();
      
      if (chinaCommFailureData && chinaCommFailureData.chinaCommFailureProcedure) {
        self.setData({
          procedureData: chinaCommFailureData.chinaCommFailureProcedure
        });
        console.log('✅ 国内通信失效程序数据加载成功');
      } else {
        console.error('❌ 国内通信失效程序数据格式错误');
        wx.showToast({
          title: '程序数据加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('❌ 加载国内通信失效程序数据失败:', error);
      wx.showToast({
        title: '程序数据加载失败',
        icon: 'none'
      });
    }
  },

  // 检查主题状态
  checkThemeStatus() {
    const isDarkMode = wx.getStorageSync('isDarkMode') || false;
    this.setData({ isDarkMode });
  },

  // 设置应答机
  setTransponder(e: any) {
    const code = e.currentTarget.dataset.code;
    let title = '';
    let content = '';
    
    switch (code) {
      case '7600':
        title = '7600 - 通信失效';
        content = '请立即将应答机设置为 7600\n\n使用场景：\n• 在主用、备用、紧急(121.5MHz)、上一和下一频率均无法建立联系后\n• 判定为通信失效时立即设置\n\n注意：\n• 如需紧急改变高度，可先设置7600，再进行操作\n• 这是通信失效的基本编码';
        break;
      case '7601':
        title = '7601 - 返回起飞机场';
        content = '7601编码用于表示返回起飞机场意图\n\n使用方法：\n• 应答机编码在7600和7601间以30秒间隔重复调整2次\n• 最终设为7600直至着陆\n\n飞行路径：\n• 按照标准仪表离场(SID)至少飞至SID终点\n• 根据最后收到的通播中着陆跑道就近选择标准仪表进场(STAR)\n• 从STAR起点加入程序\n• 如无STAR，选择最短路径飞向最近的起始进近定位点';
        break;
      case '7602':
        title = '7602 - 飞往备降场';
        content = '7602编码用于表示飞往起飞备降机场意图\n\n使用方法：\n• 应答机编码在7600和7602间以30秒间隔重复调整2次\n• 最终设为7600直至着陆\n\n飞行路径：\n• 按照标准仪表离场(SID)至少飞到SID终点\n• 沿常规航路、航线飞往起飞备降机场\n• 完成正常的仪表进近程序';
        break;
      default:
        title = '应答机设置';
        content = '请选择合适的应答机编码';
    }
    
    wx.showModal({
      title: title,
      content: content,
      showCancel: false,
      confirmText: '已了解'
    });
  },



  // 选择空域类型
  selectAirspace(e: any) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedAirspace: type
    });
  },

  // 选择飞行意图
  selectIntention(e: any) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedIntention: type
    });
  }
});