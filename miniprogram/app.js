"use strict";
// app.ts
const dataManager = require('./utils/data-manager.js');
App({
    globalData: {
        userInfo: null,
        theme: 'light',
        dataPreloadStarted: false,
        dataPreloadCompleted: false
    },
    onLaunch() {
        console.log('App Launch');
        // 获取设备信息
        const systemInfo = wx.getSystemInfoSync();
        console.log('系统信息:', systemInfo);
        // 获取启动场景
        const launchOptions = wx.getLaunchOptionsSync();
        console.log('启动场景:', launchOptions);
        // 延迟预加载数据，避免影响启动性能
        setTimeout(() => {
            this.preloadQueryData();
        }, 2000); // 2秒后开始预加载
    },
    onShow() {
        console.log('App Show');
    },
    onHide() {
        console.log('App Hide');
    },
    onError(error) {
        console.error('App Error:', error);
    },
    // 预加载万能查询数据
    async preloadQueryData() {
        if (this.globalData.dataPreloadStarted) {
            return;
        }
        this.globalData.dataPreloadStarted = true;
        console.log('🚀 开始预加载万能查询数据...');
        try {
            // 并行预加载所有数据，但不阻塞主流程
            const preloadPromises = [
                this.preloadWithTimeout(dataManager.loadAbbreviationsData(), 'abbreviations', 5000),
                this.preloadWithTimeout(dataManager.loadDefinitionsData(), 'definitions', 5000),
                this.preloadWithTimeout(dataManager.loadAirportData(), 'airports', 5000),
                this.preloadWithTimeout(dataManager.loadIcaoData(), 'icao', 5000)
            ];
            // 等待所有预加载完成（或超时）
            await Promise.allSettled(preloadPromises);
            this.globalData.dataPreloadCompleted = true;
            console.log('✅ 万能查询数据预加载完成');
            // 通知页面数据已预加载完成
            wx.setStorageSync('queryDataPreloaded', true);
        }
        catch (error) {
            console.error('❌ 数据预加载失败:', error);
        }
    },
    // 带超时的预加载
    async preloadWithTimeout(promise, dataType, timeout) {
        try {
            const result = await Promise.race([
                promise,
                new Promise((_, reject) => setTimeout(() => reject(new Error(`${dataType} 预加载超时`)), timeout))
            ]);
            console.log(`✅ ${dataType} 数据预加载成功`);
            return result;
        }
        catch (error) {
            console.warn(`⚠️ ${dataType} 数据预加载失败:`, error);
            return null;
        }
    },
    // 检查数据是否已预加载
    isDataPreloaded() {
        return this.globalData.dataPreloadCompleted || wx.getStorageSync('queryDataPreloaded');
    },
    // 获取预加载状态
    getPreloadStatus() {
        return {
            started: this.globalData.dataPreloadStarted,
            completed: this.globalData.dataPreloadCompleted,
            cacheStatus: dataManager.getCacheStatus()
        };
    }
});
