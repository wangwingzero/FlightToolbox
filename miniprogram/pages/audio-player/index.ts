// 音频播放页面
Page({
  data: {
    // 传递的参数
    regionId: '',
    regionName: '',
    categoryId: '',
    categoryName: '',
    clipIndex: 0,
    
    // 录音数据
    allClips: [],
    currentClip: null,
    
    // 播放器状态
    isPlaying: false,
    isLooping: false,
    volume: 100,
    showSubtitles: false,
    subtitleLang: 'cn',
    audioContext: null,
    audioProgress: 0,
    currentTimeText: '00:00',
    totalTimeText: '00:00',
    currentAudioSrc: '',
    
    // 学习状态
    learnedClips: [],
    showLearnedNames: false,
    
    // 音频播放状态
    isFirstPlay: true,
    retryCount: 0,
    maxRetryCount: 3,
    isDevTools: false,
    simulationInterval: null
  },

  onLoad(options: any) {
    console.log('🎵 音频播放页面加载', options);
    
    // 检测是否在开发者工具环境
    this.checkDevToolsEnvironment();
    
    // 解析传递的参数
    const {
      regionId = '',
      regionName = '',
      categoryId = '',
      categoryName = '',
      clipIndex = '0',
      allClipsJson = '[]'
    } = options;

    try {
      const allClips = JSON.parse(decodeURIComponent(allClipsJson));
      const index = parseInt(clipIndex);
      const currentClip = allClips[index] || null;
      
      this.setData({
        regionId: regionId,
        regionName: decodeURIComponent(regionName),
        categoryId: categoryId,
        categoryName: decodeURIComponent(categoryName),
        clipIndex: index,
        allClips: allClips,
        currentClip: currentClip
      });

      // 加载学习状态
      this.loadLearnedClips();
      
      // 设置音频源
      if (currentClip) {
        this.setAudioSource(currentClip);
      }
    } catch (error) {
      console.error('❌ 解析参数失败:', error);
      wx.showToast({
        title: '页面数据错误',
        icon: 'none'
      });
    }
  },

  // 检测开发者工具环境
  checkDevToolsEnvironment() {
    const systemInfo = wx.getSystemInfoSync();
    const isDevTools = systemInfo.platform === 'devtools';
    
    this.setData({
      isDevTools: isDevTools
    });
    
    if (isDevTools) {
      console.log('⚠️ 检测到开发者工具环境，音频播放可能受限');
    }
  },

  onUnload() {
    // 页面卸载时清理音频资源
    if (this.data.audioContext) {
      this.data.audioContext.destroy();
    }
    
    // 清理模拟播放定时器
    if (this.data.simulationInterval) {
      clearInterval(this.data.simulationInterval);
    }
  },

  // 加载用户学习状态
  loadLearnedClips() {
    try {
      const learnedClips = wx.getStorageSync('learnedClips') || [];
      
      // 更新所有录音的学习状态
      const updatedClips = this.data.allClips.map(clip => ({
        ...clip,
        isLearned: learnedClips.includes(this.generateClipId(clip, this.data.regionId))
      }));
      
      this.setData({
        learnedClips: learnedClips,
        allClips: updatedClips,
        currentClip: updatedClips[this.data.clipIndex] || null
      });
    } catch (error) {
      console.error('❌ 加载学习状态失败:', error);
    }
  },

  // 保存学习状态
  saveLearnedClips() {
    try {
      wx.setStorageSync('learnedClips', this.data.learnedClips);
    } catch (error) {
      console.error('❌ 保存学习状态失败:', error);
    }
  },

  // 生成录音唯一ID
  generateClipId(clip: any, regionId: string) {
    return `${regionId}_${clip.mp3_file || clip.label}_${clip.full_transcript.slice(0, 20)}`;
  },

  // 设置音频源
  setAudioSource(clip: any) {
    if (!clip || !clip.mp3_file) {
      console.error('❌ 无效的录音数据');
      this.setData({ currentAudioSrc: '' });
      return;
    }

    // 根据架构文档，使用 regionPathMap 构建路径
    const regionPathMap: { [key: string]: string } = {
      'japan': '/packageJapan/',
      'philippines': '/packagePhilippines/',
      'korea': '/packageKorean/',
      'singapore': '/packageSingapore/',
      'thailand': '/packageThailand/',
      'germany': '/packageGermany/',
      'usa': '/packageUSA/',
      'australia': '/packageAustralia/',
      'south-africa': '/packageSouthAfrica/'
    };

    const basePath = regionPathMap[this.data.regionId];
    if (!basePath) {
      console.error(`❌ 未找到地区ID "${this.data.regionId}" 的路径映射`);
      this.setData({ currentAudioSrc: '' });
      return;
    }
    
    const audioPath = `${basePath}${clip.mp3_file}`;

    console.log(`🎵 设置音频源: ${audioPath}`);

    this.setData({
      currentAudioSrc: audioPath,
      currentClip: clip,
      isFirstPlay: true,
      retryCount: 0
    });

    // 销毁旧的音频上下文
    if (this.data.audioContext) {
      this.data.audioContext.destroy();
    }

    // 创建新的音频上下文
    this.createAudioContext();
  },

  // 创建音频上下文
  createAudioContext() {
    if (!this.data.currentAudioSrc) {
      console.error('❌ 无法创建音频上下文：音频源为空');
      return;
    }

    console.log('🎵 正在创建音频上下文:', this.data.currentAudioSrc);

    // 销毁旧的音频上下文
    if (this.data.audioContext) {
      this.data.audioContext.destroy();
    }

    // 确保分包已加载
    this.ensureSubpackageLoaded(() => {
      const audioContext = wx.createInnerAudioContext();
      audioContext.src = this.data.currentAudioSrc;
      audioContext.loop = this.data.isLooping;
      audioContext.volume = this.data.volume / 100;
      
      // 真机播放兼容性设置
      audioContext.autoplay = false;
      audioContext.obeyMuteSwitch = false;
      
      // 重置重试计数
      this.setData({ retryCount: 0 });
      
      this.bindAudioEvents(audioContext);
    });
  },

  // 确保分包已加载
  ensureSubpackageLoaded(callback: () => void) {
    const subpackageMap: { [key: string]: string } = {
      'japan': 'japanAudioPackage',
      'philippines': 'philippineAudioPackage',
      'korea': 'koreaAudioPackage',
      'singapore': 'singaporeAudioPackage',
      'thailand': 'thailandAudioPackage'
    };

    const subpackageName = subpackageMap[this.data.regionId];
    if (!subpackageName) {
      console.log('🎵 无需加载分包，直接创建音频上下文');
      callback();
      return;
    }

    // 检查分包是否已加载
    this.checkSubpackageStatus(subpackageName, (isLoaded) => {
      if (isLoaded) {
        console.log(`✅ 分包已加载: ${subpackageName}`);
        callback();
        return;
      }

      // 显示加载提示
      wx.showLoading({
        title: '正在加载音频资源...',
        mask: true
      });

      if (typeof wx.loadSubpackage === 'function') {
        wx.loadSubpackage({
          name: subpackageName,
          success: () => {
            console.log(`✅ 分包加载成功: ${subpackageName}`);
            wx.hideLoading();
            callback();
          },
          fail: (error) => {
            console.error(`❌ 分包加载失败: ${subpackageName}`, error);
            wx.hideLoading();
            
            wx.showModal({
              title: '资源加载失败',
              content: '音频资源加载失败，请检查网络连接后重试。',
              showCancel: true,
              cancelText: '取消',
              confirmText: '重试',
              success: (res) => {
                if (res.confirm) {
                  // 重试加载
                  this.ensureSubpackageLoaded(callback);
                } else {
                  // 取消时仍尝试创建音频上下文
                  callback();
                }
              }
            });
          }
        });
      } else {
        console.log('⚠️ 当前环境不支持分包加载，直接创建音频上下文');
        wx.hideLoading();
        callback();
      }
    });
  },

  // 检查分包加载状态
  checkSubpackageStatus(packageName: string, callback: (isLoaded: boolean) => void) {
    // 通过尝试require分包中的文件来检查分包是否已加载
    try {
      const packageRootMap: { [key: string]: string } = {
        'japanAudioPackage': 'packageJapan',
        'philippineAudioPackage': 'packagePhilippines',
        'koreaAudioPackage': 'packageKorean',
        'singaporeAudioPackage': 'packageSingapore',
        'thailandAudioPackage': 'packageThailand'
      };

      const packageRoot = packageRootMap[packageName];
      if (!packageRoot) {
        callback(false);
        return;
      }

      // 检查分包是否可访问
      wx.getFileSystemManager().access({
        path: `/${packageRoot}/`,
        success: () => {
          console.log(`📦 分包 ${packageName} 已加载`);
          callback(true);
        },
        fail: () => {
          console.log(`📦 分包 ${packageName} 未加载`);
          callback(false);
        }
      });
    } catch (error) {
      console.log(`📦 检查分包状态时出错: ${error}`);
      callback(false);
    }
  },

  // 绑定音频事件
  bindAudioEvents(audioContext: any) {
    // 绑定事件
    audioContext.onPlay(() => {
      console.log('🎵 音频开始播放');
      this.setData({ isPlaying: true });
    });

    audioContext.onPause(() => {
      console.log('⏸️ 音频暂停播放');
      this.setData({ isPlaying: false });
    });

    audioContext.onStop(() => {
      console.log('⏹️ 音频停止播放');
      this.setData({ isPlaying: false, audioProgress: 0 });
    });

    audioContext.onEnded(() => {
      console.log('🏁 音频播放结束');
      this.setData({ isPlaying: false, audioProgress: 0 });
    });

    audioContext.onTimeUpdate(() => {
      if (audioContext.duration > 0) {
        const progress = (audioContext.currentTime / audioContext.duration) * 100;
        const currentTime = this.formatTime(audioContext.currentTime);
        const totalTime = this.formatTime(audioContext.duration);
        
        this.setData({ 
          audioProgress: progress,
          currentTimeText: currentTime,
          totalTimeText: totalTime
        });
      }
    });

    audioContext.onError((error) => {
      console.error('❌ 音频播放错误:', error);
      this.setData({ isPlaying: false });
      
      // 开发者工具环境特殊处理
      if (this.data.isDevTools) {
        this.handleDevToolsAudioError(error);
        return;
      }
      
      // 检查重试次数
      if (this.data.retryCount < this.data.maxRetryCount) {
        const newRetryCount = this.data.retryCount + 1;
        this.setData({ retryCount: newRetryCount });
        
        console.log(`🔄 第${newRetryCount}次重试创建音频上下文...`);
        
        setTimeout(() => {
          this.createAudioContext();
        }, 1000 * newRetryCount);
        
        wx.showToast({
          title: `音频播放失败，正在重试(${newRetryCount}/${this.data.maxRetryCount})...`,
          icon: 'none',
          duration: 2000
        });
      } else {
        wx.showModal({
          title: '音频播放失败',
          content: '无法播放此音频文件，可能是分包未加载或网络问题。请稍后再试。',
          showCancel: false,
          confirmText: '知道了'
        });
      }
    });

    audioContext.onCanplay(() => {
      console.log('✅ 音频文件可以播放');
    });

    this.setData({ audioContext });
  },

  // 处理开发者工具音频错误
  handleDevToolsAudioError(error: any) {
    console.log('🛠️ 开发者工具音频播放错误，这是正常现象');
    
    // 显示开发者工具专用提示
    if (this.data.retryCount === 0) {
      wx.showModal({
        title: '开发者工具提示',
        content: '当前在开发者工具环境，分包音频无法播放。请在真机上测试音频功能。\n\n您可以继续使用其他功能。',
        showCancel: true,
        cancelText: '知道了',
        confirmText: '模拟播放',
        success: (res) => {
          if (res.confirm) {
            // 模拟播放状态
            this.simulateAudioPlayback();
          }
        }
      });
      
      this.setData({ retryCount: 999 }); // 防止重复弹窗
    }
  },

  // 模拟音频播放（仅用于开发者工具测试UI）
  simulateAudioPlayback() {
    console.log('🎭 模拟音频播放开始');
    
    this.setData({ 
      isPlaying: true,
      currentTimeText: '00:00',
      totalTimeText: '00:30',
      audioProgress: 0
    });

    // 模拟播放进度
    let progress = 0;
    const interval = setInterval(() => {
      progress += 3.33; // 每300ms增加3.33%，约30秒播放完成
      
      const currentTime = Math.floor((progress / 100) * 30); // 模拟30秒音频
      const currentTimeText = this.formatTime(currentTime);
      
      this.setData({
        audioProgress: progress,
        currentTimeText: currentTimeText
      });

      if (progress >= 100) {
        clearInterval(interval);
        this.setData({ 
          isPlaying: false,
          audioProgress: 0,
          currentTimeText: '00:00'
        });
        console.log('🎭 模拟音频播放结束');
        
        wx.showToast({
          title: '模拟播放完成',
          icon: 'success',
          duration: 1500
        });
      }
    }, 300);

    // 存储定时器引用以便清理
    this.setData({ simulationInterval: interval });
  },

  // 格式化时间
  formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  // 播放/暂停切换
  togglePlayPause() {
    console.log('🎯 点击播放/暂停按钮');
    
    // 开发者工具环境下的模拟播放控制
    if (this.data.isDevTools && this.data.simulationInterval) {
      if (this.data.isPlaying) {
        // 暂停模拟播放
        clearInterval(this.data.simulationInterval);
        this.setData({ 
          isPlaying: false,
          simulationInterval: null
        });
        console.log('🎭 模拟播放已暂停');
      } else {
        // 恢复模拟播放
        this.simulateAudioPlayback();
      }
      return;
    }
    
    // 确保音频上下文存在
    if (!this.data.audioContext && this.data.currentAudioSrc) {
      this.createAudioContext();
      // 等待音频上下文创建完成
      setTimeout(() => {
        this.playAudio();
      }, 100);
      return;
    }
    
    if (this.data.audioContext) {
      if (this.data.isPlaying) {
        this.data.audioContext.pause();
      } else {
        this.playAudio();
      }
    } else {
      wx.showToast({
        title: '播放器初始化失败',
        icon: 'none'
      });
    }
  },

  // 播放音频的独立方法
  playAudio() {
    if (!this.data.audioContext) {
      console.error('❌ 音频上下文不存在');
      return;
    }

    try {
      // 直接尝试播放
      this.data.audioContext.play();
      
      // 如果是首次播放，给予友好提示
      if (this.data.isFirstPlay) {
        this.setData({ isFirstPlay: false });
        
        // 延迟检查播放状态
        setTimeout(() => {
          if (!this.data.isPlaying && !this.data.isDevTools) {
            console.log('⚠️ 首次播放可能需要等待分包加载或用户交互');
            wx.showToast({
              title: '正在加载音频，请稍候...',
              icon: 'loading',
              duration: 3000
            });
          }
        }, 1000);
      }
    } catch (error) {
      console.error('❌ 播放音频时发生错误:', error);
      
      if (this.data.isDevTools) {
        wx.showToast({
          title: '开发者工具环境，请在真机测试',
          icon: 'none',
          duration: 2000
        });
      } else {
        wx.showToast({
          title: '播放失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    }
  },

  // 上一个录音
  previousClip() {
    const currentIndex = this.data.clipIndex;
    if (currentIndex > 0) {
      this.selectClip({ currentTarget: { dataset: { index: currentIndex - 1 } } });
    } else {
      wx.showToast({
        title: '已经是第一个录音',
        icon: 'none'
      });
    }
  },

  // 下一个录音
  nextClip() {
    const currentIndex = this.data.clipIndex;
    if (currentIndex < this.data.allClips.length - 1) {
      this.selectClip({ currentTarget: { dataset: { index: currentIndex + 1 } } });
    } else {
      wx.showToast({
        title: '已经是最后一个录音',
        icon: 'none'
      });
    }
  },

  // 选择录音
  selectClip(e: any) {
    const index = parseInt(e.currentTarget.dataset.index);
    const clip = this.data.allClips[index];
    
    if (!clip) return;

    // 停止当前播放
    if (this.data.audioContext) {
      this.data.audioContext.stop();
    }

    this.setData({
      clipIndex: index,
      currentClip: clip,
      isPlaying: false,
      audioProgress: 0
    });

    // 设置新的音频源
    this.setAudioSource(clip);
  },

  // 切换循环模式
  toggleLoop() {
    const newLooping = !this.data.isLooping;
    this.setData({ isLooping: newLooping });
    
    if (this.data.audioContext) {
      this.data.audioContext.loop = newLooping;
    }
    
    wx.showToast({
      title: newLooping ? '已开启循环播放' : '已关闭循环播放',
      icon: 'success',
      duration: 1500
    });
  },

  // 音量调节
  onVolumeChange(e: any) {
    const volume = e.detail.value;
    this.setData({ volume });
    
    if (this.data.audioContext) {
      this.data.audioContext.volume = volume / 100;
    }
  },

  // 切换字幕显示
  toggleSubtitles(e: any) {
    this.setData({ showSubtitles: e.detail.value });
  },

  // 选择字幕语言
  selectSubtitleLang(e: any) {
    const lang = e.currentTarget.dataset.lang;
    this.setData({ subtitleLang: lang });
  },


  // 切换当前录音的学习状态
  toggleCurrentClipLearned() {
    if (!this.data.currentClip) return;

    const clipId = this.generateClipId(this.data.currentClip, this.data.regionId);
    const learnedClips = [...this.data.learnedClips];
    const index = learnedClips.indexOf(clipId);
    
    let isLearned = false;
    if (index > -1) {
      learnedClips.splice(index, 1);
    } else {
      learnedClips.push(clipId);
      isLearned = true;
    }

    // 更新当前录音状态
    const updatedCurrentClip = {
      ...this.data.currentClip,
      isLearned: isLearned
    };

    // 更新所有录音列表中的状态
    const updatedAllClips = [...this.data.allClips];
    updatedAllClips[this.data.clipIndex] = updatedCurrentClip;

    this.setData({
      learnedClips: learnedClips,
      currentClip: updatedCurrentClip,
      allClips: updatedAllClips
    });

    this.saveLearnedClips();
    
    console.log(`✅ 播放页面状态更新完成: ${clipId} - 已学会: ${isLearned}`);
    console.log(`📚 当前学习状态列表:`, learnedClips);

    wx.showToast({
      title: isLearned ? '已标记为学会' : '已标记为未学会',
      icon: 'success',
      duration: 1500
    });
  }
});