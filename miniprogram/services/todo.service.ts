/**
 * TODO待办清单服务
 * 提供待办事项的增删改查功能，支持时间提醒
 */

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string; // ISO 8601 格式
  advanceReminderMinutes?: number; // 提前提醒分钟数
  createdAt: string;
  updatedAt: string;
  category?: string;
  tags?: string[];
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  dueToday: number;
  dueTomorrow: number;
}

export class TodoService {
  // 使用静态方法代替静态字段
  private static getStorageKey(): string {
    return 'flight_toolbox_todos';
  }
  
  private static getReminderKey(): string {
    return 'todo_reminders';
  }

  /**
   * 获取所有待办事项
   */
  static getAllTodos(): TodoItem[] {
    try {
      const data = wx.getStorageSync(this.getStorageKey());
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('获取待办事项失败:', error);
      return [];
    }
  }

  /**
   * 获取待办事项统计
   */
  static getTodoStats(): TodoStats {
    const todos = this.getAllTodos();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const stats: TodoStats = {
      total: todos.length,
      completed: 0,
      pending: 0,
      overdue: 0,
      dueToday: 0,
      dueTomorrow: 0
    };

    todos.forEach(todo => {
      if (todo.completed) {
        stats.completed++;
      } else {
        stats.pending++;
        
        if (todo.dueDate) {
          const dueDate = new Date(todo.dueDate);
          const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
          
          if (dueDateOnly < today) {
            stats.overdue++;
          } else if (dueDateOnly.getTime() === today.getTime()) {
            stats.dueToday++;
          } else if (dueDateOnly.getTime() === tomorrow.getTime()) {
            stats.dueTomorrow++;
          }
        }
      }
    });

    return stats;
  }

  /**
   * 添加待办事项
   */
  static addTodo(todoData: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): TodoItem {
    const now = new Date().toISOString();
    // 创建基本对象
    const newTodo: TodoItem = {
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
      title: todoData.title || '',
      description: todoData.description || '',
      priority: todoData.priority || 'medium',
      completed: todoData.completed !== undefined ? todoData.completed : false,
      category: todoData.category || '',
      tags: todoData.tags || [],
      advanceReminderMinutes: todoData.advanceReminderMinutes || 0
    };
    
    // 添加可选字段
    if (todoData.dueDate) {
      newTodo.dueDate = todoData.dueDate;
    }

    const todos = this.getAllTodos();
    todos.unshift(newTodo); // 添加到开头
    
    this.saveTodos(todos);
    
    // 如果设置了提前提醒时间，注册提醒
    if (newTodo.dueDate && newTodo.advanceReminderMinutes && newTodo.advanceReminderMinutes > 0) {
      this.scheduleReminder(newTodo);
    }

    return newTodo;
  }

  /**
   * 更新待办事项
   */
  static updateTodo(id: string, updates: Partial<TodoItem>): boolean {
    try {
      const todos = this.getAllTodos();
      const index = todos.findIndex(todo => todo.id === id);
      
      if (index === -1) {
        return false;
      }

      const oldTodo = todos[index];
      
      // 创建更新后的对象
      const updatedTodo = Object.assign({}, oldTodo);
      
      // 应用更新
      if (updates.title !== undefined) updatedTodo.title = updates.title;
      if (updates.description !== undefined) updatedTodo.description = updates.description;
      if (updates.priority !== undefined) updatedTodo.priority = updates.priority;
      if (updates.completed !== undefined) updatedTodo.completed = updates.completed;
      if (updates.category !== undefined) updatedTodo.category = updates.category;
      if (updates.tags !== undefined) updatedTodo.tags = updates.tags;
      if (updates.dueDate !== undefined) updatedTodo.dueDate = updates.dueDate;
      if (updates.advanceReminderMinutes !== undefined) updatedTodo.advanceReminderMinutes = updates.advanceReminderMinutes;
      
      // 更新时间戳
      updatedTodo.updatedAt = new Date().toISOString();

      todos[index] = updatedTodo;
      this.saveTodos(todos);

      // 更新提醒
      this.updateReminder(oldTodo, updatedTodo);

      return true;
    } catch (error) {
      console.error('更新待办事项失败:', error);
      return false;
    }
  }

  /**
   * 删除待办事项
   */
  static deleteTodo(id: string): boolean {
    try {
      const todos = this.getAllTodos();
      const todo = todos.find(t => t.id === id);
      
      if (!todo) {
        return false;
      }

      const filteredTodos = todos.filter(todo => todo.id !== id);
      this.saveTodos(filteredTodos);

      // 取消提醒
      this.cancelReminder(todo);

      return true;
    } catch (error) {
      console.error('删除待办事项失败:', error);
      return false;
    }
  }

  /**
   * 切换完成状态
   */
  static toggleComplete(id: string): boolean {
    const todos = this.getAllTodos();
    const todo = todos.find(t => t.id === id);
    
    if (!todo) {
      return false;
    }

    return this.updateTodo(id, { completed: !todo.completed });
  }

  /**
   * 获取今日待办
   */
  static getTodayTodos(): TodoItem[] {
    const todos = this.getAllTodos();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // 添加调试日志
    console.log('📅 获取今日待办，今日日期:', todayStr);
    console.log('📅 所有待办数量:', todos.length);

    // 过滤出今日待办
    const todayTodos = todos.filter(todo => {
      // 跳过已完成的待办
      if (todo.completed) return false;
      
      // 如果有截止日期，检查是否是今天
      if (todo.dueDate) {
        const dueDate = todo.dueDate.split('T')[0];
        const isToday = dueDate === todayStr;
        return isToday;
      }
      
      // 如果没有截止日期，也显示在今日待办中
      // 这样新创建的待办事项也会显示
      return true;
    });
    
    console.log('📅 今日待办数量:', todayTodos.length);
    return todayTodos;
  }

  /**
   * 获取即将到期的待办（3天内）
   */
  static getUpcomingTodos(): TodoItem[] {
    const todos = this.getAllTodos();
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    return todos.filter(todo => {
      if (todo.completed || !todo.dueDate) return false;
      
      const dueDate = new Date(todo.dueDate);
      return dueDate >= now && dueDate <= threeDaysLater;
    }).sort((a, b) => {
      const dateA = new Date(a.dueDate || '');
      const dateB = new Date(b.dueDate || '');
      return dateA.getTime() - dateB.getTime();
    });
  }

  /**
   * 获取过期待办
   */
  static getOverdueTodos(): TodoItem[] {
    const todos = this.getAllTodos();
    const now = new Date();

    return todos.filter(todo => {
      if (todo.completed || !todo.dueDate) return false;
      
      const dueDate = new Date(todo.dueDate);
      return dueDate < now;
    }).sort((a, b) => {
      const dateA = new Date(a.dueDate || '');
      const dateB = new Date(b.dueDate || '');
      return dateA.getTime() - dateB.getTime();
    });
  }

  /**
   * 保存待办事项到存储
   */
  private static saveTodos(todos: TodoItem[]): void {
    try {
      wx.setStorageSync(this.getStorageKey(), todos);
    } catch (error) {
      console.error('保存待办事项失败:', error);
      throw error;
    }
  }

  /**
   * 生成唯一ID
   */
  private static generateId(): string {
    return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 安排提醒
   */
  private static scheduleReminder(todo: TodoItem): void {
    try {
      const reminders = wx.getStorageSync(this.getReminderKey()) || [];
      
      // 只处理提前提醒
      if (todo.dueDate && todo.advanceReminderMinutes && todo.advanceReminderMinutes > 0) {
        const dueDate = new Date(todo.dueDate);
        const advanceReminderTime = new Date(dueDate.getTime() - todo.advanceReminderMinutes * 60 * 1000);
        
        const advanceReminder = {
          todoId: todo.id,
          title: todo.title,
          reminderTime: advanceReminderTime.toISOString(),
          scheduled: true,
          type: 'advance',
          advanceMinutes: todo.advanceReminderMinutes,
          dueDate: todo.dueDate
        };
        reminders.push(advanceReminder);
      }

      wx.setStorageSync(this.getReminderKey(), reminders);
      console.log('待办提醒已安排:', reminders.filter(r => r.todoId === todo.id));
    } catch (error) {
      console.error('安排提醒失败:', error);
    }
  }

  /**
   * 更新提醒
   */
  private static updateReminder(oldTodo: TodoItem, newTodo: TodoItem): void {
    // 如果提前提醒时间或截止日期发生变化，更新提醒
    if (oldTodo.advanceReminderMinutes !== newTodo.advanceReminderMinutes || 
        oldTodo.dueDate !== newTodo.dueDate) {
      this.cancelReminder(oldTodo);
      if (newTodo.dueDate && newTodo.advanceReminderMinutes && newTodo.advanceReminderMinutes > 0) {
        this.scheduleReminder(newTodo);
      }
    }
  }

  /**
   * 取消提醒
   */
  private static cancelReminder(todo: TodoItem): void {
    try {
      const reminders = wx.getStorageSync(this.getReminderKey()) || [];
      const filteredReminders = reminders.filter((r: any) => r.todoId !== todo.id);
      wx.setStorageSync(this.getReminderKey(), filteredReminders);
    } catch (error) {
      console.error('取消提醒失败:', error);
    }
  }

  /**
   * 检查并触发到期提醒（Modal版本，用于后台检查）
   */
  static checkReminders(): void {
    try {
      const reminders = wx.getStorageSync(this.getReminderKey()) || [];
      const now = new Date();
      const triggeredReminders: any[] = [];

      reminders.forEach((reminder: any) => {
        const reminderTime = new Date(reminder.reminderTime);
        
        // 如果提醒时间已到（允许5分钟误差）
        if (reminderTime <= now && (now.getTime() - reminderTime.getTime()) < 5 * 60 * 1000) {
          // 显示提醒
          let content = `您有一个待办事项需要处理：\n\n${reminder.title}`;
          
          if (reminder.type === 'advance') {
            const dueDate = new Date(reminder.dueDate);
            const dueDateStr = this.formatDateTime(dueDate);
            content = `您有一个待办事项将在${reminder.advanceMinutes}分钟后到期：\n\n${reminder.title}\n\n到期时间：${dueDateStr}`;
          }
          
          wx.showModal({
            title: '📋 待办提醒',
            content: content,
            confirmText: '查看详情',
            cancelText: '稍后处理',
            success: (res) => {
              if (res.confirm) {
                // 跳转到TODO页面
                wx.navigateTo({
                  url: '/packageO/todo-manager/index'
                });
              }
            }
          });

          triggeredReminders.push(reminder);
        }
      });

      // 移除已触发的提醒
      if (triggeredReminders.length > 0) {
        const remainingReminders = reminders.filter((r: any) => 
          !triggeredReminders.some(tr => tr.todoId === r.todoId)
        );
        wx.setStorageSync(this.getReminderKey(), remainingReminders);
      }
    } catch (error) {
      console.error('检查提醒失败:', error);
    }
  }

  /**
   * 检查提醒并返回待显示的提醒信息（Toast版本，用于首页）
   */
  static checkRemindersForHomePage(): { title: string; content: string; type: string } | null {
    try {
      const reminders = wx.getStorageSync(this.getReminderKey()) || [];
      const now = new Date();

      for (const reminder of reminders) {
        const reminderTime = new Date(reminder.reminderTime);
        
        // 如果提醒时间已到（允许5分钟误差）
        if (reminderTime <= now && (now.getTime() - reminderTime.getTime()) < 5 * 60 * 1000) {
          // 移除这个提醒
          const remainingReminders = reminders.filter((r: any) => r.todoId !== reminder.todoId);
          wx.setStorageSync(this.getReminderKey(), remainingReminders);
          
          // 返回提醒信息
          if (reminder.type === 'advance') {
            return {
              title: `⏰ ${reminder.title}`,
              content: `还有${reminder.advanceMinutes}分钟到期`,
              type: 'advance'
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('检查提醒失败:', error);
      return null;
    }
  }

  /**
   * 格式化日期时间显示
   */
  private static formatDateTime(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日 ${hours}:${minutes}`;
  }

  /**
   * 格式化提前提醒时间
   */
  private static formatAdvanceReminderTime(minutes: number): string {
    if (minutes >= 1440) {
      return `${Math.floor(minutes / 1440)}天`;
    } else if (minutes >= 60) {
      return `${Math.floor(minutes / 60)}小时`;
    } else {
      return `${minutes}分钟`;
    }
  }

  /**
   * 清理过期提醒
   */
  static cleanupExpiredReminders(): void {
    try {
      const reminders = wx.getStorageSync(this.getReminderKey()) || [];
      const now = new Date();
      const validReminders = reminders.filter((reminder: any) => {
        const reminderTime = new Date(reminder.reminderTime);
        // 保留未来的提醒和过去24小时内的提醒
        return reminderTime > new Date(now.getTime() - 24 * 60 * 60 * 1000);
      });

      wx.setStorageSync(this.getReminderKey(), validReminders);
    } catch (error) {
      console.error('清理过期提醒失败:', error);
    }
  }

  /**
   * 导出待办数据为详细格式
   */
  static exportTodos(): string {
    const todos = this.getAllTodos();
    
    if (todos.length === 0) {
      return '📋 暂无待办事项';
    }
    
    let result = '📋 TODO待办清单\n';
    result += `导出时间：${this.formatDateTime(new Date())}\n`;
    result += `总计：${todos.length}项\n\n`;
    
    // 按状态分组
    const pendingTodos = todos.filter(todo => !todo.completed);
    const completedTodos = todos.filter(todo => todo.completed);
    
    // 待完成的待办
    if (pendingTodos.length > 0) {
      result += `🔥 待完成 (${pendingTodos.length}项)\n`;
      result += '========================\n';
      
      pendingTodos.forEach((todo, index) => {
        result += `${index + 1}. ${todo.title}\n`;
        
        // 描述
        if (todo.description && todo.description.trim()) {
          result += `   📝 描述：${todo.description}\n`;
        }
        
        // 优先级
        const priorityText = this.getPriorityText(todo.priority);
        result += `   ${priorityText}\n`;
        
        // 分类
        if (todo.category && todo.category.trim()) {
          result += `   📂 分类：${todo.category}\n`;
        }
        
        // 截止日期
        if (todo.dueDate) {
          const dueDate = new Date(todo.dueDate);
          result += `   ⏰ 截止：${this.formatDateTime(dueDate)}\n`;
        }
        
        // 提前提醒
        if (todo.advanceReminderMinutes && todo.advanceReminderMinutes > 0) {
          const reminderText = this.formatAdvanceReminderTime(todo.advanceReminderMinutes);
          result += `   🔔 提醒：提前${reminderText}\n`;
        }
        
        // 标签
        if (todo.tags && todo.tags.length > 0) {
          result += `   🏷️ 标签：${todo.tags.join(' ')}\n`;
        }
        
        result += '\n';
      });
    }
    
    // 已完成的待办
    if (completedTodos.length > 0) {
      result += `✅ 已完成 (${completedTodos.length}项)\n`;
      result += '========================\n';
      
      completedTodos.forEach((todo, index) => {
        result += `${index + 1}. ~~${todo.title}~~\n`;
        
        // 描述
        if (todo.description && todo.description.trim()) {
          result += `   📝 描述：${todo.description}\n`;
        }
        
        // 优先级
        const priorityText = this.getPriorityText(todo.priority);
        result += `   ${priorityText}\n`;
        
        // 分类
        if (todo.category && todo.category.trim()) {
          result += `   📂 分类：${todo.category}\n`;
        }
        
        // 截止日期
        if (todo.dueDate) {
          const dueDate = new Date(todo.dueDate);
          result += `   ⏰ 截止：${this.formatDateTime(dueDate)}\n`;
        }
        
        // 标签
        if (todo.tags && todo.tags.length > 0) {
          result += `   🏷️ 标签：${todo.tags.join(' ')}\n`;
        }
        
        result += '\n';
      });
    }
    
    result += '---\n';
    result += '📱 来自飞行工具箱 TODO待办清单';
    
    return result.trim();
  }

  /**
   * 获取优先级文本
   */
  private static getPriorityText(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'high': '🔴 高优先级',
      'medium': '🟡 中优先级',
      'low': '🟢 低优先级'
    };
    return priorityMap[priority] || '🟡 中优先级';
  }

  /**
   * 导入待办数据（支持JSON和简化文本格式）
   */
  static importTodos(inputData: string): boolean {
    try {
      // 首先尝试JSON格式导入（向后兼容）
      if (inputData.trim().startsWith('{') || inputData.trim().startsWith('[')) {
        return this.importFromJSON(inputData);
      }
      
      // 尝试简化文本格式导入
      return this.importFromText(inputData);
      
    } catch (error) {
      console.error('导入待办数据失败:', error);
      return false;
    }
  }

  /**
   * 从JSON格式导入（向后兼容）
   */
  private static importFromJSON(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.todos || !Array.isArray(data.todos)) {
        throw new Error('无效的JSON数据格式');
      }

      // 验证数据格式
      const validTodos = data.todos.filter((todo: any) => 
        todo.id && todo.title && typeof todo.completed === 'boolean'
      );

      if (validTodos.length === 0) {
        throw new Error('没有有效的待办数据');
      }

      // 合并现有数据
      const existingTodos = this.getAllTodos();
      const existingIds = new Set(existingTodos.map(t => t.id));
      
      const newTodos = validTodos.filter((todo: TodoItem) => !existingIds.has(todo.id));
      const mergedTodos = existingTodos.concat(newTodos);

      this.saveTodos(mergedTodos);
      return true;
    } catch (error) {
      console.error('JSON导入失败:', error);
      return false;
    }
  }

  /**
   * 从简化文本格式导入
   */
  private static importFromText(textData: string): boolean {
    try {
      const lines = textData.split('\n').map(line => line.trim()).filter(line => line);
      const newTodos: TodoItem[] = [];
      
      for (const line of lines) {
        // 跳过markdown标题和分隔符
        if (line.startsWith('#') || line.startsWith('**') || line.startsWith('---') || 
            line.startsWith('>') || line.startsWith('-') || line.length < 2) {
          continue;
        }
        
        // 解析待办项目
        let title = line;
        let completed = false;
        let priority: 'low' | 'medium' | 'high' = 'medium';
        
        // 检查是否已完成（删除线格式）
        if (line.includes('~~')) {
          completed = true;
          title = line.replace(/~~/g, '').trim();
        }
        
        // 移除序号
        title = title.replace(/^\d+\.\s*/, '').trim();
        
        // 检查优先级标识
        if (title.includes('🔴') || title.includes('高优先级')) {
          priority = 'high';
          title = title.replace(/🔴|高优先级/g, '').trim();
        } else if (title.includes('🟢') || title.includes('低优先级')) {
          priority = 'low';
          title = title.replace(/🟢|低优先级/g, '').trim();
        }
        
        // 清理标题
        title = title.replace(/🟡|中优先级/g, '').trim();
        
        if (title.length > 0) {
          const newTodo: TodoItem = {
            id: this.generateId(),
            title: title,
            description: '',
            completed: completed,
            priority: priority,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            category: '',
            tags: []
          };
          
          newTodos.push(newTodo);
        }
      }
      
      if (newTodos.length === 0) {
        throw new Error('没有找到有效的待办事项');
      }
      
      // 合并到现有数据
      const existingTodos = this.getAllTodos();
      const mergedTodos = existingTodos.concat(newTodos);
      
      this.saveTodos(mergedTodos);
      return true;
      
    } catch (error) {
      console.error('文本导入失败:', error);
      return false;
    }
  }
}