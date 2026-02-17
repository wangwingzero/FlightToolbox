// 国内通信失效程序页面逻辑
// 使用BasePage基类，符合项目架构规范
const BasePage = require('../../../utils/base-page.js');
const { communicationDataManager } = require('../../../utils/communication-manager.js');

/**
 * TypeScript接口定义
 */
interface ProcedureData {
  chinaCommFailureProcedure?: any;
}

interface TransponderEvent {
  currentTarget: {
    dataset: {
      code: string;
    };
  };
}

interface TypeEvent {
  currentTarget: {
    dataset: {
      type: string;
    };
  };
}

/**
 * 页面配置
 */
const pageConfig = {
  data: {
    loading: false,  // BasePage加载状态
    procedureData: {},
    selectedAirspace: 'surveillance', // 'surveillance' or 'non-surveillance'
    selectedIntention: 'return' // 'return', 'takeoff-alternate', 'destination-alternate'
  },

  /**
   * 页面加载（使用BasePage的customOnLoad）
   */
  customOnLoad: function(options: any): void {
    const self = this;

    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '国内通信失效程序'
    });

    // 使用BasePage的loadDataWithLoading方法加载数据
    this.loadDataWithLoading(
      function() {
        // 返回Promise进行数据加载
        return communicationDataManager.getChinaCommFailure();
      },
      {
        context: '加载国内通信失效程序数据',
        dataKey: 'rawData'  // 先加载到临时字段
      }
    ).then(function(data: ProcedureData) {
      // 手动提取chinaCommFailureProcedure字段
      if (data && data.chinaCommFailureProcedure) {
        console.log('✅ 国内通信失效程序数据加载成功');
        self.setData({
          procedureData: data.chinaCommFailureProcedure,
          rawData: null  // 清除临时数据
        });
      } else {
        throw new Error('程序数据格式错误');
      }
    }).catch(function(error) {
      // BasePage已经处理了错误显示，这里只需记录日志
      console.error('❌ 国内通信失效程序数据加载失败:', error);
      self.handleError(error, '加载国内通信失效程序数据');
    });
  },

  /**
   * 页面显示
   */
  customOnShow: function(): void {
    // 页面显示时的操作
  },

  /**
   * 设置应答机
   */
  setTransponder: function(e: TransponderEvent): void {
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

  /**
   * 选择空域类型
   */
  selectAirspace: function(e: TypeEvent): void {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedAirspace: type
    });
  },

  /**
   * 选择飞行意图
   */
  selectIntention: function(e: TypeEvent): void {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedIntention: type
    });
  },

  /**
   * 广告事件处理
   */
  adLoad: function(): void {
    console.log('横幅广告加载成功');
  },

  adError: function(err: any): void {
    console.error('横幅广告加载失败', err);
  },

  adClose: function(): void {
    console.log('横幅广告关闭');
  }
};

// ✅ 使用BasePage.createPage()创建页面，符合项目架构规范
Page(BasePage.createPage(pageConfig));
