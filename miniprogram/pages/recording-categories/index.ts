// 录音分类选择页面
Page({
  data: {
    isDarkMode: false,
    regionId: '',
    regionName: '',
    regionFlag: '',
    recordingCategories: []
  },

  onLoad(options: any) {
    const { regionId = '', regionName = '', regionFlag = '' } = options;
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: `${decodeURIComponent(regionFlag)} ${decodeURIComponent(regionName)}`
    });
    
    this.setData({
      regionId: regionId,
      regionName: decodeURIComponent(regionName),
      regionFlag: decodeURIComponent(regionFlag)
    });

    this.loadCategories();
  },

  // 加载分类数据
  loadCategories() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      // 模拟分类数据，实际应该从配置文件或服务器加载
      const categories = [
        {
          id: '进近',
          name: '进近',
          icon: '🛬',
          color: '#3B82F6',
          clips: this.generateMockClips('进近', 15)
        },
        {
          id: '塔台',
          name: '塔台',
          icon: '🗼',
          color: '#8B5CF6',
          clips: this.generateMockClips('塔台', 12)
        },
        {
          id: '地面',
          name: '地面',
          icon: '🚛',
          color: '#F59E0B',
          clips: this.generateMockClips('地面', 10)
        },
        {
          id: '放行',
          name: '放行',
          icon: '📋',
          color: '#EF4444',
          clips: this.generateMockClips('放行', 8)
        }
      ];

      this.setData({
        recordingCategories: categories
      });

      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      console.error('❌ 加载分类数据失败:', error);
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      });
    }
  },

  // 生成模拟录音数据
  generateMockClips(category: string, count: number) {
    const clips = [];
    for (let i = 1; i <= count; i++) {
      clips.push({
        id: `${category}_${i}`,
        label: category,
        full_transcript: `${category}通话录音示例 ${i}`,
        translation_cn: `这是${category}通话的中文翻译示例 ${i}`,
        mp3_file: `${category.toLowerCase()}_${i}.mp3`,
        isLearned: false
      });
    }
    return clips;
  },

  // 选择分类
  selectCategory(e: any) {
    const categoryId = e.currentTarget.dataset.category;
    const category = this.data.recordingCategories.find(cat => cat.id === categoryId);
    
    if (category) {
      // 跳转到录音列表页面
      wx.navigateTo({
        url: `/pages/recording-clips/index?regionId=${this.data.regionId}&regionName=${encodeURIComponent(this.data.regionName)}&regionFlag=${encodeURIComponent(this.data.regionFlag)}&categoryId=${categoryId}&categoryName=${encodeURIComponent(category.name)}&allClipsJson=${encodeURIComponent(JSON.stringify(category.clips))}`
      });
    }
  }
});