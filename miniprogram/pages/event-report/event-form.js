"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_data_1 = require("../../services/event.data");
const storage_service_1 = require("../../services/storage.service");
const report_builder_1 = require("../../services/report.builder");
Page({
    data: {
        eventType: null,
        formData: {},
        showDatePicker: false,
        currentDate: new Date().getTime(),
        currentFieldId: '',
        customDeadline: ''
    },
    onLoad(options) {
        const eventTypeId = options.eventTypeId;
        const eventType = (0, event_data_1.getEventTypeById)(eventTypeId);
        if (eventType) {
            console.log('加载的事件类型:', eventType.name);
            console.log('事件等级:', eventType.urgency);
            // 尝试加载草稿
            let draft = storage_service_1.StorageService.getDraft(eventTypeId) || {};
            // 如果没有草稿，尝试从用户预设中填充
            if (Object.keys(draft).length === 0) {
                const userProfile = storage_service_1.StorageService.getUserProfile();
                console.log('用户预设信息:', userProfile);
                if (userProfile) {
                    // 自动填充机型
                    if (eventType.fields.find((f) => f.id === 'aircraftModel') && userProfile.aircraftModel) {
                        draft.aircraftModel = userProfile.aircraftModel;
                    }
                    // 自动填充姓名
                    if (eventType.fields.find((f) => f.id === 'name') && userProfile.name) {
                        draft.name = userProfile.name;
                    }
                    // 自动填充所属单位
                    if (eventType.fields.find((f) => f.id === 'company') && userProfile.company) {
                        draft.company = userProfile.company;
                    }
                    // 自动填充其他可能的字段
                    eventType.fields.forEach((field) => {
                        if (userProfile[field.id]) {
                            draft[field.id] = userProfile[field.id];
                        }
                    });
                }
                // 自动填充当前时间
                const timeField = eventType.fields.find((f) => f.id === 'eventTime');
                if (timeField) {
                    const now = new Date();
                    draft.eventTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                }
            }
            // 设置自定义填报时限
            const userProfile = storage_service_1.StorageService.getUserProfile();
            let customDeadline = '';
            if (userProfile) {
                if (eventType.urgency === '紧急' && userProfile.urgentDeadline) {
                    customDeadline = userProfile.urgentDeadline;
                }
                else if (eventType.urgency === '非紧急' && userProfile.nonUrgentDeadline) {
                    customDeadline = userProfile.nonUrgentDeadline;
                }
            }
            this.setData({
                eventType: eventType,
                formData: draft,
                customDeadline: customDeadline
            });
            console.log('自动填充的数据:', draft);
        }
        else {
            wx.showToast({
                title: '事件类型不存在',
                icon: 'none'
            });
            setTimeout(() => {
                wx.navigateBack();
            }, 1500);
        }
    },
    // 字段值变化
    onFieldChange(e) {
        const fieldId = e.currentTarget.dataset.fieldId;
        const value = e.detail.value || e.detail;
        this.setData({
            [`formData.${fieldId}`]: value
        });
    },
    // 显示日期时间选择器
    showDateTimePicker(e) {
        const fieldId = e.currentTarget.dataset.fieldId;
        const currentValue = this.data.formData[fieldId];
        let currentDate = new Date().getTime();
        if (currentValue) {
            // 将 "2025-06-09 16:45" 格式转换为 ISO 格式 "2025-06-09T16:45:00"
            const isoFormat = currentValue.replace(' ', 'T') + ':00';
            const parsedDate = new Date(isoFormat);
            if (!isNaN(parsedDate.getTime())) {
                currentDate = parsedDate.getTime();
            }
        }
        this.setData({
            showDatePicker: true,
            currentDate: currentDate,
            currentFieldId: fieldId
        });
    },
    // 关闭日期时间选择器
    closeDateTimePicker() {
        this.setData({
            showDatePicker: false,
            currentFieldId: ''
        });
    },
    // 确认日期时间
    onDateTimeConfirm(e) {
        const date = new Date(e.detail);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        this.setData({
            [`formData.${this.data.currentFieldId}`]: formattedDate,
            showDatePicker: false,
            currentFieldId: ''
        });
    },
    // 生成报告
    generateReport() {
        if (!this.data.eventType)
            return;
        // 验证表单
        const validation = report_builder_1.ReportBuilder.validateFormData(this.data.eventType, this.data.formData);
        if (!validation.isValid) {
            wx.showModal({
                title: '信息不完整',
                content: `请填写以下必填项：\n${validation.missingFields.join('、')}`,
                showCancel: false
            });
            return;
        }
        // 清除草稿
        storage_service_1.StorageService.clearDraft(this.data.eventType.id);
        // 跳转到预览页面
        wx.navigateTo({
            url: '/pages/event-report/event-preview',
            success: (res) => {
                res.eventChannel.emit('reportData', {
                    eventType: this.data.eventType,
                    formData: this.data.formData
                });
            }
        });
    }
});
