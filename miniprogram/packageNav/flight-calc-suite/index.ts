interface CalculatorItem {
  id: string;
  module: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  group: 'flight' | 'convert' | 'meteo';
  tag: string;
}

interface CategoryItem {
  key: 'all' | 'flight' | 'convert' | 'meteo';
  title: string;
  count: number;
}

Page({
  data: {
    activeCategory: 'all' as CategoryItem['key'],
    categoryList: [
      { key: 'all', title: '全部', count: 11 },
      { key: 'flight', title: '飞行几何', count: 4 },
      { key: 'convert', title: '单位换算', count: 3 },
      { key: 'meteo', title: '天气', count: 4 }
    ] as CategoryItem[],
    calculators: [
      {
        id: 'crosswind',
        module: 'crosswind',
        icon: '🌪️',
        title: '侧风分量',
        subtitle: '航向 / 风向 / 风速一键算侧风',
        description: '帮助你快速评估跑道侧风与顶风分量，掌握偏流角和地速变化。',
        group: 'meteo',
        tag: '风向风速'
      },
      {
        id: 'pressure',
        module: 'pressure',
        icon: '🌡️',
        title: '气压换算',
        subtitle: 'QNH / QFE 一键换算',
        description: '在不同气压表达之间快速换算，支持 QNH、QFE 等常用单位。',
        group: 'meteo',
        tag: '气压'
      },
      {
        id: 'temperature',
        module: 'temperature',
        icon: '🌡️',
        title: '温度换算',
        subtitle: '摄氏 / 华氏 / 开尔文互换',
        description: '飞行前后将温度在不同单位之间快速转换，便于阅读各类资料。',
        group: 'meteo',
        tag: '温度'
      },
      {
        id: 'isa',
        module: 'isa',
        icon: '🌡️',
        title: 'ISA温度',
        subtitle: '给定高度 / OAT 计算 ISA 偏差',
        description: '根据高度和外界温度计算 ISA 标准温度和偏差，用于性能与气象评估。',
        group: 'meteo',
        tag: '温度偏差'
      },
      {
        id: 'descent',
        module: 'descent',
        icon: '📉',
        title: '下降率计算',
        subtitle: '高度差 / 距离 / 地速 → FPM',
        description: '根据当前高度、目标高度、相距距离和地速，计算所需下降率、角度和时间。',
        group: 'flight',
        tag: '下滑率'
      },
      {
        id: 'glideslope',
        module: 'glideslope',
        icon: '📐',
        title: '五边高度',
        subtitle: '下滑角 + 距离 → 五边高度',
        description: '结合下滑角、跑道距离与机场标高，估算进近阶段各点的下滑高度。',
        group: 'flight',
        tag: '进近几何'
      },
      {
        id: 'gradient',
        module: 'gradient',
        icon: '📐',
        title: '梯度计算',
        subtitle: '爬升 / 下降梯度一目了然',
        description: '根据高度差和水平距离计算爬升或下降梯度，辅助性能与程序评估。',
        group: 'flight',
        tag: '梯度'
      },
      {
        id: 'turn',
        module: 'turn',
        icon: '🔄',
        title: '转弯半径',
        subtitle: '坡度角 + 地速 → 半径 / 转弯率',
        description: '输入飞行坡度角和地速，获取转弯半径与转弯率，辅助规划飞行轨迹。',
        group: 'flight',
        tag: '航迹设计'
      },
      {
        id: 'distance',
        module: 'distance',
        icon: '📏',
        title: '距离换算',
        subtitle: '米 / 千米 / 海里互换',
        description: '快速在米、千米和海里之间换算，适配不同文档与操作习惯。',
        group: 'convert',
        tag: '长度单位'
      },
      {
        id: 'speed',
        module: 'speed',
        icon: '⚡',
        title: '速度换算',
        subtitle: '节 / 公里每小时互换',
        description: '在节、千米/时等速度单位之间快速换算，适配不同运行规范。',
        group: 'convert',
        tag: '速度单位'
      },
      {
        id: 'weight',
        module: 'weight',
        icon: '⚖️',
        title: '重量换算',
        subtitle: '克 / 千克 / 磅互换',
        description: '在公制与英制重量之间一键换算，适应多国运行文件。',
        group: 'convert',
        tag: '重量单位'
      }
    ] as CalculatorItem[],
    displayList: [] as CalculatorItem[]
  },

  onLoad() {
    this.filterCalculators('all');
  },

  onCategoryChange(e: any) {
    const key = (e.currentTarget.dataset.key || 'all') as CategoryItem['key'];
    this.filterCalculators(key);
  },

  filterCalculators(key: CategoryItem['key']) {
    try {
      const list = (this.data as any).calculators as CalculatorItem[];
      let filtered: CalculatorItem[] = [];

      if (key === 'all') {
        filtered = list.slice();
      } else {
        filtered = list.filter(function(item) {
          return item.group === key;
        });
      }

      this.setData({
        activeCategory: key,
        displayList: filtered
      });
    } catch (error) {
      console.error('过滤飞行计算工具列表失败:', error);
      this.setData({
        activeCategory: 'all',
        displayList: (this.data as any).calculators || []
      });
    }
  },

  openCalculator(e: any) {
    try {
      const moduleId = (e.currentTarget.dataset.module || '') as string;
      if (!moduleId) {
        return;
      }

      const modulePathMap: { [key: string]: string } = {
        // 目前 7 个模块的目录名与 module 一致，预留映射表便于未来扩展
      };
      const modulePath = modulePathMap[moduleId] || moduleId;

      wx.navigateTo({
        url: `/packageCalcModules/${modulePath}/index`
      });
    } catch (error) {
      console.error('打开飞行计算模块失败:', error);
    }
  }
});
