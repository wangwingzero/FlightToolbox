/**
 * 单个填报字段的定义
 */
export interface ReportField {
  id: string; // 唯一标识，用于数据绑定
  label: string; // 显示的标签
  placeholder?: string; // 输入提示
  type: 'text' | 'textarea' | 'number' | 'datetime' | 'select'; // 输入框类型
  options?: string[];
  required: boolean; // 是否必填
}

/**
 * 单个事件类型的完整定义
 */
export interface EventType {
  id: string;
  name: string;
  urgency: '紧急' | '非紧急';
  deadline: {
    domestic: string;
    international: string;
  };
  fields: ReportField[];
  template: string;
}

/**
 * 事件分类
 */
export interface EventCategory {
  id: string;
  name: string;
  eventTypes: EventType[];
}

/**
 * 用户预设信息
 */
export interface UserProfile {
  name?: string;
  company?: string;
  aircraftModel?: string;
  urgentDeadline?: string;      // 紧急事件填报时限
  nonUrgentDeadline?: string;   // 非紧急事件填报时限
}

/**
 * 报告数据
 */
export interface ReportData {
  eventType: EventType;
  formData: Record<string, any>;
  generatedText: string;
  timestamp: string;
} 