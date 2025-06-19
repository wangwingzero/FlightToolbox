"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_service_1 = require("../../services/storage.service");
Page({
    data: {
        profile: {
            name: '',
            company: '',
            aircraftModel: '',
            urgentDeadline: '境内：24小时内',
            nonUrgentDeadline: '48小时内填报'
        }
    },
    onLoad() {
        // 加载已保存的预设信息
        const savedProfile = storage_service_1.StorageService.getUserProfile();
        if (savedProfile) {
            // 合并默认值和保存的值
            const profile = {
                name: savedProfile.name || '',
                company: savedProfile.company || '',
                aircraftModel: savedProfile.aircraftModel || '',
                urgentDeadline: savedProfile.urgentDeadline || '境内：24小时内',
                nonUrgentDeadline: savedProfile.nonUrgentDeadline || '48小时内填报'
            };
            this.setData({ profile });
        }
    },
    // 字段值变化
    onFieldChange(e) {
        const field = e.currentTarget.dataset.field;
        const value = e.detail.value || e.detail;
        this.setData({
            [`profile.${field}`]: value
        });
    },
    // 保存预设
    saveProfile() {
        const success = storage_service_1.StorageService.setUserProfile(this.data.profile);
        if (success) {
            wx.showToast({
                title: '预设已保存',
                icon: 'success'
            });
            setTimeout(() => {
                wx.navigateBack();
            }, 1500);
        }
        else {
            wx.showToast({
                title: '保存失败',
                icon: 'error'
            });
        }
    },
    // 清除预设
    clearProfile() {
        wx.showModal({
            title: '确认清除',
            content: '确定要清除所有预设信息吗？',
            success: (res) => {
                if (res.confirm) {
                    this.setData({
                        profile: {
                            name: '',
                            company: '',
                            aircraftModel: '',
                            urgentDeadline: '境内：24小时内',
                            nonUrgentDeadline: '48小时内填报'
                        }
                    });
                    // 清除存储的预设
                    storage_service_1.StorageService.setUserProfile({});
                    wx.showToast({
                        title: '预设已清除',
                        icon: 'success'
                    });
                }
            }
        });
    }
});
