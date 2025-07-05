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
    volume: 80,
    showSubtitles: false,
    subtitleLang: 'cn',
    audioContext: null,
    audioProgress: 0,
    currentTimeText: '00:00',
    totalTimeText: '00:00',
    currentAudioSrc: '',
    
    // 学习状态
    learnedClips: [],
    showLearnedNames: false
  },

  onLoad(options: any) {
    console.log('🎵 音频播放页面加载', options);
    
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
      
      this.setData({
        regionId: regionId,
        regionName: decodeURIComponent(regionName),
        categoryId: categoryId,
        categoryName: decodeURIComponent(categoryName),
        clipIndex: index,
        allClips: allClips,
        currentClip: allClips[index] || null
      });

      // 加载学习状态
      this.loadLearnedClips();
      
      // 设置音频源
      if (allClips[index]) {
        this.setAudioSource(allClips[index]);
      }
    } catch (error) {
      console.error('❌ 解析参数失败:', error);
      wx.showToast({
        title: '页面数据错误',
        icon: 'none'
      });
    }
  },

  onUnload() {
    // 页面卸载时清理音频资源
    if (this.data.audioContext) {
      this.data.audioContext.destroy();
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
      return;
    }

    // 根据地区确定音频路径
    let audioPath = '';
    const regionPathMap: { [key: string]: string } = {
      'japan': '/packageJ/',
      'philippines': '/packageK/',
      'korea': '/packageKorean/',
      'germany': '/packageP/',
      'usa': '/packageM/',
      'australia': '/packageN/',
      'south-africa': '/packageO/'
    };

    const basePath = regionPathMap[this.data.regionId] || '/packageI/';
    audioPath = `${basePath}${clip.mp3_file}`;

    console.log(`🎵 设置音频源: ${audioPath}`);

    this.setData({
      currentAudioSrc: audioPath,
      currentClip: clip
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

    const audioContext = wx.createInnerAudioContext();
    audioContext.src = this.data.currentAudioSrc;
    audioContext.loop = this.data.isLooping;
    audioContext.volume = this.data.volume / 100;

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
      if (!this.data.isLooping) {
        this.nextClip();
      }
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
      wx.showToast({
        title: `音频播放失败: ${error.errMsg || '未知错误'}`,
        icon: 'none',
        duration: 3000
      });
      this.setData({ isPlaying: false });
    });

    audioContext.onCanplay(() => {
      console.log('✅ 音频文件可以播放');
    });

    this.setData({ audioContext });
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
    
    if (!this.data.audioContext && this.data.currentAudioSrc) {
      this.createAudioContext();
    }
    
    if (this.data.audioContext) {
      if (this.data.isPlaying) {
        this.data.audioContext.pause();
      } else {
        this.data.audioContext.play();
      }
    } else {
      wx.showToast({
        title: '播放器初始化失败',
        icon: 'none'
      });
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