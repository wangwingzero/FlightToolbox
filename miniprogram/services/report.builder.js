"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportBuilder = void 0;
const storage_service_1 = require("./storage.service");
/**
 * 报告生成器服务
 */
class ReportBuilder {
    /**
     * 根据事件类型和表单数据生成报告文本
     */
    static generateReport(eventType, formData) {
        let template = eventType.template;
        // 替换模板中的占位符（同时支持字段ID和字段标签）
        for (const field of eventType.fields) {
            const value = formData[field.id] || '';
            // 使用字段ID替换
            const placeholderById = `【${field.id}】`;
            template = template.replace(new RegExp(placeholderById.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
            // 使用字段标签替换
            const placeholderByLabel = `【${field.label}】`;
            template = template.replace(new RegExp(placeholderByLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
        }
        // 替换事件名称占位符
        template = template.replace(/【name】/g, eventType.name);
        // 添加报告人信息
        const userProfile = storage_service_1.StorageService.getUserProfile();
        if (userProfile) {
            let reporterInfo = '';
            if (userProfile.name) {
                reporterInfo += `报告人：${userProfile.name}`;
            }
            if (userProfile.company) {
                reporterInfo += userProfile.name ? `，所属单位：${userProfile.company}` : `所属单位：${userProfile.company}`;
            }
            if (reporterInfo) {
                template += `\n\n${reporterInfo}。`;
            }
        }
        return template;
    }
    /**
     * 创建完整的报告数据对象
     */
    static createReportData(eventType, formData) {
        const generatedText = this.generateReport(eventType, formData);
        return {
            eventType,
            formData,
            generatedText,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * 验证表单数据完整性
     */
    static validateFormData(eventType, formData) {
        const missingFields = [];
        for (const field of eventType.fields) {
            if (field.required && !formData[field.id]) {
                missingFields.push(field.label);
            }
        }
        return {
            isValid: missingFields.length === 0,
            missingFields
        };
    }
}
exports.ReportBuilder = ReportBuilder;
