// TODO待办清单管理页面
import { TodoService, TodoItem, TodoStats } from '../../services/todo.service';

Page({
  data: {
    // 待办数据
    todos: [] as TodoItem[],
    stats: {} as TodoStats,
    completionPercentage: 0, // 添加完成百分比
    
    // 筛选和排序
    currentFilter: 'all', // all, pending, completed, overdue, today
    sortBy: 'dueDate', // dueDate, priority, createdAt
    
    // 界面状态
    showAddModal: false,
    showEditModal: false,
    showStatsModal: false,
    editingTodo: null as TodoItem | null,
    
    // 新增/编辑表单
    form: {
      title: '',
      description: '',
      priority: 'medium' as 'low' | 'medium' | 'high',
      dueDate: '',
      dueTime: '',
      advanceReminderMinutes: 0,
      category: '',
      tags: ''
    },
    
    // 提前提醒选项
    advanceReminderOptions: [
      { value: 0, label: '不提醒' },
      { value: 15, label: '提前15分钟' },
      { value: 30, label: '提前30分钟' },
      { value: 60, label: '提前1小时' },
      { value: 120, label: '提前2小时' },
      { value: 360, label: '提前6小时' },
      { value: 720, label: '提前12小时' },
      { value: 1440, label: '提前1天' },
      { value: 2880, label: '提前2天' },
      { value: 10080, label: '提前1周' }
    ],
    
    // 分类选项
    categories: [
      '飞行准备', '培训学习', '证照管理', '健康检查', 
      '设备维护', '文档整理', '会议安排', '其他'
    ],
    
    // 优先级选项
    priorities: [
      { value: 'high', label: '高优先级', color: '#ff4757', icon: '🔴' },
      { value: 'medium', label: '中优先级', color: '#ffa502', icon: '🟡' },
      { value: 'low', label: '低优先级', color: '#2ed573', icon: '🟢' }
    ],
    
    // 筛选选项
    filters: [
      { value: 'all', label: '全部', icon: '📋' },
      { value: 'pending', label: '待完成', icon: '⏳' },
      { value: 'today', label: '今日', icon: '📅' },
      { value: 'overdue', label: '已过期', icon: '⚠️' },
      { value: 'completed', label: '已完成', icon: '✅' }
    ],
    
    // 主题模式
    isDarkMode: false,
    
    // 搜索
    searchText: '',
    showSearch: false,
    
    // 批量操作
    selectionMode: false,
    selectedTodos: [] as string[],
    
    // 导入导出
    showImportModal: false,
    importData: ''
  },

  onLoad() {
    console.log('📋 TODO管理页面加载');
    this.initTheme();
    this.loadTodos();
    this.startReminderCheck();
  },

  onShow() {
    this.loadTodos();
    // 清理过期提醒
    TodoService.cleanupExpiredReminders();
  },

  onUnload() {
    // 清理定时器
    if (this.reminderTimer) {
      clearInterval(this.reminderTimer);
    }
  },

  // 初始化主题
  initTheme() {
    try {
      const themeManager = require('../../utils/theme-manager.js');
      this.themeCleanup = themeManager.initPageTheme(this);
    } catch (error) {
      console.error('主题初始化失败:', error);
    }
  },

  // 加载待办数据
  loadTodos() {
    try {
      const todos = TodoService.getAllTodos();
      const stats = TodoService.getTodoStats();
      
      // 为每个待办项添加格式化的提前提醒时间
      const todosWithFormattedReminder = todos.map(todo => ({
        ...todo,
        formattedAdvanceReminder: todo.advanceReminderMinutes && todo.advanceReminderMinutes > 0 
          ? this.formatAdvanceReminderTime(todo.advanceReminderMinutes) 
          : ''
      }));
      
      // 计算完成百分比
      const completionPercentage = stats.total > 0 ? Math.floor((stats.completed / stats.total) * 100) : 0;
      
      this.setData({
        todos: this.filterAndSortTodos(todosWithFormattedReminder),
        stats: stats,
        completionPercentage: completionPercentage
      });
      
      console.log('📋 待办数据加载完成:', { total: todos.length, stats, completionPercentage });
    } catch (error) {
      console.error('加载待办数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 筛选和排序待办
  filterAndSortTodos(todos: TodoItem[]): TodoItem[] {
    let filtered = todos;
    
    // 搜索筛选
    if (this.data.searchText) {
      const searchLower = this.data.searchText.toLowerCase();
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(searchLower) ||
        (todo.description && todo.description.toLowerCase().includes(searchLower)) ||
        (todo.category && todo.category.toLowerCase().includes(searchLower))
      );
    }
    
    // 状态筛选
    switch (this.data.currentFilter) {
      case 'pending':
        filtered = filtered.filter(todo => !todo.completed);
        break;
      case 'completed':
        filtered = filtered.filter(todo => todo.completed);
        break;
      case 'today':
        filtered = TodoService.getTodayTodos();
        break;
      case 'overdue':
        filtered = TodoService.getOverdueTodos();
        break;
    }
    
    // 排序
    filtered.sort((a, b) => {
      switch (this.data.sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        
        case 'priority':
          const priorityOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    return filtered;
  },

  // 切换筛选器
  switchFilter(event: any) {
    const filter = event.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter });
    this.loadTodos();
  },

  // 切换排序方式
  switchSort(event: any) {
    const sortBy = event.currentTarget.dataset.sort;
    this.setData({ sortBy: sortBy });
    this.loadTodos();
  },

  // 显示添加待办弹窗
  showAddTodo() {
    console.log('📋 显示添加待办弹窗...');
    
    // 确保表单数据正确初始化，避免null值
    const formData = {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      dueTime: '',
      advanceReminderMinutes: 0,
      category: '',
      tags: ''
    };
    
    console.log('📋 准备设置的表单数据:', formData);
    
    this.setData({ 
      showAddModal: true,
      showEditModal: false,
      editingTodo: null,
      form: formData
    }, () => {
      // 在setData完成后验证数据
      console.log('📋 setData完成后的表单数据:', this.data.form);
    });
    
    console.log('📋 弹窗状态已设置:', { showAddModal: true });
  },

  // 显示编辑待办弹窗
  showEditTodo(event: any) {
    const todoId = event.currentTarget.dataset.id;
    const todo = this.data.todos.find(t => t.id === todoId);
    
    if (!todo) return;
    
    // 填充表单，确保所有字段都是字符串或数字，避免null值
    const form = {
      title: todo.title || '',
      description: todo.description || '',
      priority: todo.priority || 'medium',
      dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : '',
      dueTime: todo.dueDate ? (todo.dueDate.split('T')[1] ? todo.dueDate.split('T')[1].substring(0, 5) : '') : '',
      advanceReminderMinutes: todo.advanceReminderMinutes || 0,
      category: todo.category || '',
      tags: todo.tags ? todo.tags.join(' ') : ''
    };
    
    this.setData({
      editingTodo: todo,
      form: form,
      showEditModal: true
    });
  },

  // 重置表单
  resetForm() {
    this.setData({
      form: {
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        dueTime: '',
        advanceReminderMinutes: 0,
        category: '',
        tags: ''
      },
      editingTodo: null
    });
  },

  // 表单输入处理 - 通用方法，但我们现在使用专门的处理函数
  onFormInput(event: any) {
    const field = event.currentTarget.dataset.field;
    const { value } = event.detail;
    
    console.log('📋 表单输入:', { field, value });
    
    if (!field) {
      console.log('❌ 字段名为空，无法更新表单');
      return;
    }
    
    this.updateFormField(field, value);
  },

  // 更新表单字段的通用方法
  updateFormField(field: string, value: any) {
    // 获取当前表单数据
    const currentForm = this.data.form || {};
    
    // 更新指定字段
    const updatedForm = Object.assign({}, currentForm);
    updatedForm[field] = value;
    
    console.log('📋 更新字段:', field, '=', value);
    
    this.setData({
      form: updatedForm
    });
    
    console.log('📋 表单已更新');
  },

  // 标题输入处理
  onTitleInput(event: any) {
    // 从日志看，输入值直接在event.detail中，而不是event.detail.value
    const value = event.detail;
    console.log('📋 标题输入:', value);
    
    // 直接更新表单数据
    const currentForm = this.data.form || {};
    const updatedForm = Object.assign({}, currentForm);
    updatedForm.title = value;
    
    console.log('📋 更新前表单:', currentForm);
    console.log('📋 更新后表单:', updatedForm);
    
    this.setData({
      form: updatedForm
    }, () => {
      console.log('📋 setData完成，当前表单:', this.data.form);
    });
  },

  // 描述输入处理
  onDescriptionInput(event: any) {
    // 从日志看，输入值直接在event.detail中
    const value = event.detail;
    console.log('📋 描述输入:', value);
    
    const currentForm = this.data.form || {};
    const updatedForm = Object.assign({}, currentForm);
    updatedForm.description = value;
    
    this.setData({
      form: updatedForm
    }, () => {
      console.log('📋 描述更新完成:', this.data.form.description);
    });
  },

  // 标签输入处理
  onTagsInput(event: any) {
    // 从日志看，输入值直接在event.detail中
    const value = event.detail;
    console.log('📋 标签输入:', value);
    
    const currentForm = this.data.form || {};
    const updatedForm = Object.assign({}, currentForm);
    updatedForm.tags = value;
    
    this.setData({
      form: updatedForm
    }, () => {
      console.log('📋 标签更新完成:', this.data.form.tags);
    });
  },

  // 选择优先级
  selectPriority(event: any) {
    const priority = event.currentTarget.dataset.priority;
    this.setData({
      'form.priority': priority
    });
  },

  // 选择分类
  selectCategory(event: any) {
    const category = event.currentTarget.dataset.category;
    this.setData({
      'form.category': category
    });
  },

  // 选择提前提醒时间
  selectAdvanceReminder(event: any) {
    const minutes = parseInt(event.currentTarget.dataset.minutes);
    this.setData({
      'form.advanceReminderMinutes': minutes
    });
    console.log('📋 选择提前提醒时间:', minutes, '分钟');
  },

  // 保存待办
  saveTodo() {
    console.log('📋 开始保存待办事项...');
    const form = this.data.form;
    
    console.log('📋 当前表单数据:', form);
    
    // 验证表单数据是否存在
    if (!form) {
      console.log('❌ 表单数据不存在');
      wx.showToast({
        title: '表单数据错误，请重新打开',
        icon: 'none'
      });
      return;
    }
    
    // 验证必填字段
    if (!form.title) {
      console.log('❌ 标题为空，保存失败');
      wx.showToast({
        title: '请输入待办标题',
        icon: 'none'
      });
      return;
    }
    
    try {
      // 构建待办数据
      const todoData = {
        title: form.title ? form.title.trim() : '',
        description: form.description ? form.description.trim() : '',
        priority: form.priority || 'medium',
        completed: false,
        category: form.category || '',
        tags: [],
        advanceReminderMinutes: form.advanceReminderMinutes || 0,
        dueDate: ''
      };
      
      // 处理标签
      if (form.tags) {
        const tagArray = form.tags.split(' ');
        const trimmedTags = [];
        for (let i = 0; i < tagArray.length; i++) {
          const trimmed = tagArray[i].trim();
          if (trimmed) {
            trimmedTags.push(trimmed);
          }
        }
        todoData.tags = trimmedTags;
      }
      
      // 处理截止日期
      if (form.dueDate) {
        const dueDateTime = form.dueTime ? 
          `${form.dueDate}T${form.dueTime}:00` : 
          `${form.dueDate}T23:59:59`;
        todoData.dueDate = new Date(dueDateTime).toISOString();
      }
      
      console.log('📋 待办数据:', todoData);
      
      if (this.data.editingTodo) {
        // 更新现有待办
        console.log('📝 更新现有待办...');
        const success = TodoService.updateTodo(this.data.editingTodo.id, todoData);
        if (success) {
          console.log('✅ 更新成功');
          wx.showToast({
            title: '更新成功',
            icon: 'success'
          });
        } else {
          throw new Error('更新失败');
        }
      } else {
        // 添加新待办
        console.log('➕ 添加新待办...');
        const newTodo = TodoService.addTodo(todoData);
        console.log('✅ 添加成功:', newTodo);
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        });
      }
      
      this.closeModal();
      this.loadTodos();
      
    } catch (error) {
      console.error('❌ 保存待办失败:', error);
      wx.showToast({
        title: '保存失败: ' + error.message,
        icon: 'none',
        duration: 3000
      });
    }
  },

  // 关闭弹窗
  closeModal() {
    console.log('📋 关闭弹窗...');
    this.setData({
      showAddModal: false,
      showEditModal: false,
      showStatsModal: false,
      showImportModal: false
    });
    this.resetForm();
    console.log('📋 弹窗已关闭');
  },

  // 切换完成状态
  toggleComplete(event: any) {
    const todoId = event.currentTarget.dataset.id;
    const success = TodoService.toggleComplete(todoId);
    
    if (success) {
      this.loadTodos();
      wx.showToast({
        title: '状态已更新',
        icon: 'success',
        duration: 1000
      });
    }
  },

  // 删除待办
  deleteTodo(event: any) {
    const todoId = event.currentTarget.dataset.id;
    const todo = this.data.todos.find(t => t.id === todoId);
    
    if (!todo) return;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除待办"${todo.title}"吗？`,
      success: (res) => {
        if (res.confirm) {
          const success = TodoService.deleteTodo(todoId);
          if (success) {
            this.loadTodos();
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          }
        }
      }
    });
  },

  // 显示统计信息
  showStats() {
    this.setData({ showStatsModal: true });
  },

  // 搜索功能
  toggleSearch() {
    this.setData({ 
      showSearch: !this.data.showSearch,
      searchText: ''
    });
    if (!this.data.showSearch) {
      this.loadTodos();
    }
  },

  onSearchInput(event: any) {
    this.setData({ searchText: event.detail.value });
    this.loadTodos();
  },

  // 批量操作
  toggleSelectionMode() {
    this.setData({
      selectionMode: !this.data.selectionMode,
      selectedTodos: []
    });
  },

  toggleTodoSelection(event: any) {
    const todoId = event.currentTarget.dataset.id;
    const selected = this.data.selectedTodos;
    
    if (selected.includes(todoId)) {
      this.setData({
        selectedTodos: selected.filter(id => id !== todoId)
      });
    } else {
      this.setData({
        selectedTodos: [...selected, todoId]
      });
    }
  },

  batchComplete() {
    if (this.data.selectedTodos.length === 0) return;
    
    wx.showModal({
      title: '批量完成',
      content: `确定要将选中的${this.data.selectedTodos.length}个待办标记为完成吗？`,
      success: (res) => {
        if (res.confirm) {
          this.data.selectedTodos.forEach(todoId => {
            TodoService.toggleComplete(todoId);
          });
          
          this.setData({
            selectedTodos: [],
            selectionMode: false
          });
          this.loadTodos();
          
          wx.showToast({
            title: '批量操作完成',
            icon: 'success'
          });
        }
      }
    });
  },

  batchDelete() {
    if (this.data.selectedTodos.length === 0) return;
    
    wx.showModal({
      title: '批量删除',
      content: `确定要删除选中的${this.data.selectedTodos.length}个待办吗？此操作不可撤销。`,
      success: (res) => {
        if (res.confirm) {
          this.data.selectedTodos.forEach(todoId => {
            TodoService.deleteTodo(todoId);
          });
          
          this.setData({
            selectedTodos: [],
            selectionMode: false
          });
          this.loadTodos();
          
          wx.showToast({
            title: '批量删除完成',
            icon: 'success'
          });
        }
      }
    });
  },

  // 导出数据
  exportTodos() {
    try {
      const exportData = TodoService.exportTodos();
      
      wx.setClipboardData({
        data: exportData,
        success: () => {
          wx.showModal({
            title: '📤 导出成功',
            content: '待办清单已导出为简洁的文本格式并复制到剪贴板！\n\n您可以：\n• 粘贴到微信、QQ等聊天工具分享\n• 保存到备忘录作为备份\n• 直接编辑后重新导入',
            confirmText: '知道了',
            showCancel: false
          });
        }
      });
    } catch (error) {
      console.error('导出失败:', error);
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      });
    }
  },

  // 显示导入弹窗
  showImport() {
    this.setData({ showImportModal: true });
  },

  // 导入数据输入
  onImportInput(event: any) {
    this.setData({ importData: event.detail.value });
  },

  // 执行导入
  importTodos() {
    if (!this.data.importData.trim()) {
      wx.showModal({
        title: '📥 导入提示',
        content: '请输入要导入的数据。支持以下格式：\n\n• 简单文本：每行一个待办事项\n• Markdown：导出的完整格式\n• JSON：技术用户专用格式',
        confirmText: '知道了',
        showCancel: false
      });
      return;
    }
    
    const success = TodoService.importTodos(this.data.importData);
    
    if (success) {
      this.closeModal();
      this.loadTodos();
      wx.showModal({
        title: '📥 导入成功',
        content: '待办事项已成功导入！新的待办事项已添加到您的清单中。',
        confirmText: '查看清单',
        showCancel: false
      });
    } else {
      wx.showModal({
        title: '📥 导入失败',
        content: '数据格式不正确。请确保：\n\n• 简单文本：每行一个待办事项\n• 完整数据：粘贴导出的原始内容\n• 格式正确：检查是否有特殊字符',
        confirmText: '重新尝试',
        showCancel: false
      });
    }
  },

  // 启动提醒检查
  startReminderCheck() {
    // 立即检查一次
    TodoService.checkReminders();
    
    // 每分钟检查一次提醒
    this.reminderTimer = setInterval(() => {
      TodoService.checkReminders();
    }, 60000);
  },

  // 格式化日期显示
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (dateOnly.getTime() === today.getTime()) {
      return '今天';
    } else if (dateOnly.getTime() === tomorrow.getTime()) {
      return '明天';
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  },

  // 格式化时间显示
  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 获取优先级样式
  getPriorityStyle(priority: string): string {
    const styles: { [key: string]: string } = {
      high: 'color: #ff4757; font-weight: bold;',
      medium: 'color: #ffa502; font-weight: 500;',
      low: 'color: #2ed573; font-weight: normal;'
    };
    return styles[priority] || styles.medium;
  },

  // 格式化提前提醒时间显示
  formatAdvanceReminderTime(minutes: number): string {
    if (minutes >= 1440) {
      return `${Math.floor(minutes / 1440)}天`;
    } else if (minutes >= 60) {
      return `${Math.floor(minutes / 60)}小时`;
    } else {
      return `${minutes}分钟`;
    }
  },


  // 日期选择器变化事件
  onDateChange(event: any) {
    const field = event.currentTarget.dataset.field;
    const value = event.detail.value;
    
    this.setData({
      [`form.${field}`]: value
    });
  },

  // 时间选择器变化事件
  onTimeChange(event: any) {
    const field = event.currentTarget.dataset.field;
    const value = event.detail.value;
    
    this.setData({
      [`form.${field}`]: value
    });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: 'TODO待办清单 - 飞行工具箱',
      path: '/packageO/todo-manager/index'
    };
  },

  // 定时器引用
  reminderTimer: null as any,
  themeCleanup: null as any
});