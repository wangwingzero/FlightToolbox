// 通信失效处理程序页面
// 引入BasePage基类，遵循项目架构规范
const BasePage = require('../../utils/base-page.js')

/**
 * TypeScript接口定义
 */
interface Region {
  type: string
  icon: string
  title: string
  titleEn: string
  scope: string
  procedureType: string
  className: string
  keywords: string[]
  route: string
}

interface PageData {
  searchText: string
  regions: Region[]
  filteredRegions: Region[]
  searchTimer: number | null
}

interface SearchInputEvent {
  detail: {
    value: string
  }
}

interface TapEvent {
  currentTarget: {
    dataset: {
      type: string
    }
  }
}

/**
 * 页面配置
 */
const pageConfig = {
  data: {
    searchText: '',  // 搜索文本
    searchTimer: null as number | null,  // 搜索防抖定时器
    regions: [
      {
        type: 'domestic',
        icon: '🇨🇳',
        title: '国内通信失效程序',
        titleEn: 'Domestic Communication Failure',
        scope: '国内航班',
        procedureType: '基础程序',
        className: 'domestic-card',
        keywords: ['国内', '中国', 'domestic', 'china', 'cn', '国内航班'],
        route: '/pages/communication-failure/domestic/index'
      },
      {
        type: 'international',
        icon: '🌍',
        title: '国际通信失效程序',
        titleEn: 'International Communication Failure',
        scope: '国际航班',
        procedureType: '基础程序',
        className: 'international-card',
        keywords: ['国际', 'international', '国际航班'],
        route: '/pages/communication-failure/international/index'
      },
      {
        type: 'pacific',
        icon: '🌊',
        title: '太平洋地区',
        titleEn: 'Pacific Region',
        scope: '太平洋地区',
        procedureType: '地区差异',
        className: 'pacific-card',
        keywords: ['太平洋', 'pacific', '美国', '加拿大', '澳大利亚', '新西兰', 'usa', 'canada', 'australia', 'new zealand'],
        route: '/pages/communication-failure/regions/pacific/index'
      },
      {
        type: 'eastern_europe',
        icon: '🏰',
        title: '东欧地区',
        titleEn: 'Eastern Europe Region',
        scope: '东欧地区',
        procedureType: '地区差异',
        className: 'eastern-europe-card',
        keywords: ['东欧', 'eastern europe', '俄罗斯', '波兰', '乌克兰', 'russia', 'poland', 'ukraine'],
        route: '/pages/communication-failure/regions/eastern-europe/index'
      },
      {
        type: 'europe',
        icon: '🏛️',
        title: '欧洲地区',
        titleEn: 'Europe Region',
        scope: '欧洲地区',
        procedureType: '地区差异',
        className: 'europe-card',
        keywords: ['欧洲', 'europe', '英国', '法国', '德国', '意大利', 'uk', 'france', 'germany', 'italy'],
        route: '/pages/communication-failure/regions/europe/index'
      },
      {
        type: 'middle_east',
        icon: '🕌',
        title: '中东地区',
        titleEn: 'Middle East Region',
        scope: '中东地区',
        procedureType: '地区差异',
        className: 'middle-east-card',
        keywords: ['中东', 'middle east', '阿联酋', '沙特', '卡塔尔', 'uae', 'saudi', 'qatar', 'dubai'],
        route: '/pages/communication-failure/regions/middle-east/index'
      },
      {
        type: 'north_america',
        icon: '🗽',
        title: '北美地区',
        titleEn: 'North America Region',
        scope: '北美地区',
        procedureType: '地区差异',
        className: 'north-america-card',
        keywords: ['北美', 'north america', '美国', '加拿大', '墨西哥', 'usa', 'canada', 'mexico'],
        route: '/pages/communication-failure/regions/north-america/index'
      },
      {
        type: 'south_america',
        icon: '🌎',
        title: '南美地区',
        titleEn: 'South America Region',
        scope: '南美地区',
        procedureType: '地区差异',
        className: 'south-america-card',
        keywords: ['南美', 'south america', '巴西', '阿根廷', 'brazil', 'argentina'],
        route: '/pages/communication-failure/regions/south-america/index'
      },
      {
        type: 'africa',
        icon: '🦁',
        title: '非洲地区',
        titleEn: 'Africa Region',
        scope: '非洲地区',
        procedureType: '地区差异',
        className: 'africa-card',
        keywords: ['非洲', 'africa', '埃及', '南非', 'egypt', 'south africa'],
        route: '/pages/communication-failure/regions/africa/index'
      }
    ] as Region[],
    filteredRegions: [] as Region[]  // 过滤后的地区列表
  },

  /**
   * 页面加载
   */
  customOnLoad: function(options: any): void {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '通信失效处理程序'
    })

    // 初始化时显示所有地区
    this.setData({
      filteredRegions: this.data.regions
    })
  },

  /**
   * 页面显示
   */
  customOnShow: function(): void {
    // 页面显示时的操作
  },

  /**
   * 页面卸载
   */
  onUnload: function(): void {
    // 清理定时器，防止内存泄漏
    if (this.data.searchTimer) {
      clearTimeout(this.data.searchTimer)
    }
  },

  /**
   * 搜索输入处理（带防抖优化）
   */
  onSearchInput: function(e: SearchInputEvent): void {
    const searchText = e.detail.value.toLowerCase().trim()
    this.setData({ searchText })

    // 清除之前的定时器
    if (this.data.searchTimer) {
      clearTimeout(this.data.searchTimer)
    }

    // 300ms防抖：用户停止输入300ms后才执行搜索
    const timer = setTimeout(() => {
      this.filterRegions(searchText)
    }, 300)

    this.setData({ searchTimer: timer })
  },

  /**
   * 清空搜索
   */
  clearSearch: function(): void {
    // 清除定时器
    if (this.data.searchTimer) {
      clearTimeout(this.data.searchTimer)
    }

    this.setData({
      searchText: '',
      filteredRegions: this.data.regions,
      searchTimer: null
    })
  },

  /**
   * 过滤地区
   */
  filterRegions: function(searchText: string): void {
    if (!searchText) {
      // 如果搜索文本为空，显示所有地区
      this.setData({
        filteredRegions: this.data.regions
      })
      return
    }

    // 根据搜索文本过滤地区
    const filtered = this.data.regions.filter((region: Region) => {
      // 检查标题、英文标题和关键词
      const matchTitle = region.title.toLowerCase().includes(searchText)
      const matchTitleEn = region.titleEn.toLowerCase().includes(searchText)
      const matchKeywords = region.keywords.some((keyword: string) =>
        keyword.toLowerCase().includes(searchText)
      )

      return matchTitle || matchTitleEn || matchKeywords
    })

    this.setData({
      filteredRegions: filtered
    })
  },

  /**
   * 选择程序类型（数据驱动路由）
   */
  selectProcedure: function(e: TapEvent): void {
    const type = e.currentTarget.dataset.type
    const region = this.data.regions.find((r: Region) => r.type === type)

    if (region?.route) {
      wx.navigateTo({
        url: region.route
      })
    } else {
      // 使用BasePage的handleError方法
      this.handleError(new Error('未找到对应的路由'), '页面跳转')
    }
  },

  /**
   * 广告加载成功
   */
  adLoad: function(): void {
    console.log('[通信失效页面] 横幅广告加载成功')
  },

  /**
   * 广告加载失败
   */
  adError: function(err: any): void {
    console.error('[通信失效页面] 横幅广告加载失败', err)
    // 使用BasePage的handleError方法
    this.handleError(err, '广告加载')
  },

  /**
   * 广告关闭
   */
  adClose: function(): void {
    console.log('[通信失效页面] 横幅广告关闭')
  }
}

// ✅ 使用BasePage.createPage()创建页面，符合项目架构规范
Page(BasePage.createPage(pageConfig))
