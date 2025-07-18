// 个人检查单页面

interface ChecklistItem {
  id: string;
  text: string;
}

interface Checklist {
  id: string;
  name: string;
  items: ChecklistItem[];
  completedItems: string[];
  createdAt: number;
  updatedAt: number;
  // 🎯 新增字段用于UI增强
  isCompleted?: boolean;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  // 🎯 预计算的显示字段
  progressPercentage?: number;
  completedCount?: number;
}

Page({
  // 添加类型定义
  themeCleanup: null as (() => void) | null,
  
  data: {
    checklists: [] as Checklist[],
    currentChecklist: {} as Checklist,
    showChecklistDetail: false,
    showEditDialog: false,
    editMode: 'create' as 'create' | 'edit',
    editingChecklist: {
      id: '',
      name: '',
      items: [] as ChecklistItem[]
    },
    newItemText: '',
    checkedItems: [] as string[],
    editingItemIndex: -1,
    editingItemText: '',
    focusAddInput: false,
    dragStartIndex: -1,
    dragEndIndex: -1,
    
    // 🎯 基于Context7最佳实践：操作菜单相关数据
    showItemActionSheet: false,
    currentItemIndex: -1,
    itemActions: [] as any[],
    
    // 🎯 新增：统计数据字段
    completedChecklistsCount: 0,
    inProgressChecklistsCount: 0,
    totalChecklistsCount: 0,
    
    // 🎯 主题管理
    isDarkMode: false,
    themeMode: 'light' as 'auto' | 'light' | 'dark',
    themeClass: 'light',
    pageThemeClass: 'theme-light',
    containerClass: 'container theme-light',
    
    // 🎯 编辑页面增强功能
    isDragging: false,
    dragItemData: null as any
  },

  onLoad() {
    console.log('个人检查单页面加载')
    this.initTheme()
    this.loadChecklists();
    
  },

  onShow() {
    this.loadChecklists()
  },

  onUnload() {
    // 清理主题监听器
    if (this.themeCleanup && typeof this.themeCleanup === 'function') {
      this.themeCleanup()
    }
  },

  // 加载检查单数据
  loadChecklists() {
    try {
      let checklists = wx.getStorageSync('personal_checklists') || []
      
      // 如果是第一次使用，自动创建默认检查单
      if (checklists.length === 0) {
        this.createInitialChecklists()
        return
      }
      
      // 🎯 使用新的数据富化方法
      checklists = checklists.map((checklist: Checklist) => this.enrichChecklistData(checklist))
      
      // 🎯 计算统计数据
      this.updateStatistics(checklists)
      
      this.setData({ checklists })
    } catch (error) {
      console.error('加载检查单失败:', error)
      this.setData({ checklists: [] })
    }
  },

  // 创建初始默认检查单（仅在第一次使用时）
  createInitialChecklists() {
    const defaultChecklists: Checklist[] = [
      {
        id: this.generateId(),
        name: '出门检查单',
        items: [
          { id: this.generateId(), text: '身份证' },
          { id: this.generateId(), text: '登机牌' },
          { id: this.generateId(), text: '手机充电器' }
        ],
        completedItems: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: this.generateId(),
        name: '飞行准备',
        items: [
          { id: this.generateId(), text: '任务书' },
          { id: this.generateId(), text: '体检合格证' },
          { id: this.generateId(), text: '护照' }
        ],
        completedItems: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: this.generateId(),
        name: '关门前检查',
        items: [
          { id: this.generateId(), text: '飞行计划' },
          { id: this.generateId(), text: '飞行记录本' },
          { id: this.generateId(), text: '舱单' },
          { id: this.generateId(), text: '油单' }
        ],
        completedItems: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: this.generateId(),
        name: '离机检查',
        items: [
          { id: this.generateId(), text: '飞行记录本' },
          { id: this.generateId(), text: '充电器' },
          { id: this.generateId(), text: '眼镜' }
        ],
        completedItems: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]

    // 🎯 富化默认检查单数据
    const enrichedChecklists = defaultChecklists.map(checklist => this.enrichChecklistData(checklist))
    
    // 🎯 计算统计数据
    this.updateStatistics(enrichedChecklists)
    
    this.setData({ checklists: enrichedChecklists })
    this.saveChecklists()
    
    console.log('已自动创建默认检查单')
  },

  // 保存检查单数据
  saveChecklists() {
    try {
      wx.setStorageSync('personal_checklists', this.data.checklists)
    } catch (error) {
      console.error('保存检查单失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  // 生成唯一ID
  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  },

  // 新建自定义检查单
  createCustomChecklist() {
    this.setData({
      editMode: 'create',
      editingChecklist: {
        id: '',
        name: '',
        items: []
      },
      newItemText: '',
      showEditDialog: true
    })
  },

  // 编辑检查单
  editChecklist(event: any) {
    const checklistId = event.currentTarget.dataset.id
    let checklist = null;
    for (let i = 0; i < this.data.checklists.length; i++) {
      if (this.data.checklists[i].id === checklistId) {
        checklist = this.data.checklists[i];
        break;
      }
    }
    
    if (checklist) {
      this.setData({
        editMode: 'edit',
        editingChecklist: {
          id: checklist.id,
          name: checklist.name,
          items: [...checklist.items]
        },
        newItemText: '',
        showEditDialog: true
      })
    }
  },

  // 删除检查单
  deleteChecklist(event: any) {
    const checklistId = event.currentTarget.dataset.id
    let checklist = null;
    for (let i = 0; i < this.data.checklists.length; i++) {
      if (this.data.checklists[i].id === checklistId) {
        checklist = this.data.checklists[i];
        break;
      }
    }
    
    if (checklist) {
      wx.showModal({
        title: '确认删除',
        content: `确定要删除检查单"${checklist.name}"吗？`,
        success: (res) => {
          if (res.confirm) {
            const newChecklists = this.data.checklists.filter(item => item.id !== checklistId)
            // 🎯 富化数据后设置
            const enrichedChecklists = newChecklists.map(checklist => this.enrichChecklistData(checklist))
            
            // 🎯 更新统计数据
            this.updateStatistics(enrichedChecklists)
            
            this.setData({ checklists: enrichedChecklists })
            this.saveChecklists()
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
          }
        }
      })
    }
  },

  // 打开检查单详情
  openChecklist(event: any) {
    const checklistId = event.currentTarget.dataset.id
    let checklist = null;
    for (let i = 0; i < this.data.checklists.length; i++) {
      if (this.data.checklists[i].id === checklistId) {
        checklist = this.data.checklists[i];
        break;
      }
    }
    
    if (checklist) {
      // 🎯 富化当前检查单数据
      const enrichedChecklist = this.enrichChecklistData(checklist)
      this.setData({
        currentChecklist: enrichedChecklist,
        checkedItems: Array.isArray(checklist.completedItems) ? checklist.completedItems : [],
        showChecklistDetail: true
      })
    }
  },

  // 关闭检查单详情
  closeChecklistDetail() {
    this.setData({ 
      showChecklistDetail: false,
      checkedItems: []
    })
  },

  // 编辑当前检查单
  editCurrentChecklist() {
    const currentChecklist = this.data.currentChecklist
    this.setData({
      editMode: 'edit',
      editingChecklist: {
        id: currentChecklist.id,
        name: currentChecklist.name,
        items: [...currentChecklist.items]
      },
      newItemText: '',
      showChecklistDetail: false,
      showEditDialog: true
    })
  },

  // 切换复选框状态
  toggleCheckbox(event: any) {
    const itemId = event.currentTarget.dataset.itemId
    const checkedItems = [...this.data.checkedItems]
    
    const index = checkedItems.indexOf(itemId)
    if (index > -1) {
      checkedItems.splice(index, 1)
    } else {
      checkedItems.push(itemId)
    }
    
    this.setData({ checkedItems })
    this.updateChecklistProgress(checkedItems)
  },

  // 复选框组变化
  onCheckboxChange(event: any) {
    const checkedItems = event.detail
    this.setData({ checkedItems })
    this.updateChecklistProgress(checkedItems)
  },

  // 更新检查单进度
  updateChecklistProgress(checkedItems: string[]) {
    const currentChecklist = this.data.currentChecklist
    const checklists = this.data.checklists.map(checklist => {
      if (checklist.id === currentChecklist.id) {
        const updated = {
          ...checklist,
          completedItems: checkedItems,
          updatedAt: Date.now()
        }
        // 🎯 使用新的数据富化方法
        return this.enrichChecklistData(updated)
      }
      return checklist
    })
    
    // 更新当前检查单
    let updatedCurrentChecklist = null;
    for (let i = 0; i < checklists.length; i++) {
      if (checklists[i].id === currentChecklist.id) {
        updatedCurrentChecklist = checklists[i];
        break;
      }
    }
    if (updatedCurrentChecklist) {
      this.setData({ 
        checklists,
        currentChecklist: updatedCurrentChecklist
      })
    }
    
    this.saveChecklists()
    
    // 检查是否全部完成（简化的完成提示）
    if (checkedItems.length === currentChecklist.items.length && currentChecklist.items.length > 0) {
      wx.showToast({
        title: '检查单全部完成',
        icon: 'success',
        duration: 1500
      })
    }
  },

  // 重置检查单
  resetChecklist() {
    wx.showModal({
      title: '重置检查单',
      content: '确定要重置当前检查单吗？所有已完成的项目将被清除。',
      success: (res) => {
        if (res.confirm) {
          this.setData({ checkedItems: [] })
          this.updateChecklistProgress([])
          wx.showToast({
            title: '检查单已重置',
            icon: 'success'
          })
        }
      }
    })
  },

  // 关闭编辑对话框
  closeEditDialog() {
    this.setData({ 
      showEditDialog: false,
      editingItemIndex: -1,
      editingItemText: ''
    })
  },

  // 检查单名称变化
  onNameChange(event: any) {
    const value = event.detail
    console.log('检查单名称变化:', value, event)
    this.setData({
      'editingChecklist.name': value
    })
  },

  // 新项目文本变化
  onNewItemChange(event: any) {
    const value = event.detail
    console.log('新项目文本变化:', value, event)
    this.setData({ newItemText: value })
  },

  // 添加新项目（增强版）
  addNewItem() {
    const newItemText = this.data.newItemText.trim()
    if (!newItemText) {
      wx.showToast({
        title: '请输入检查项目',
        icon: 'none'
      })
      this.setData({ focusAddInput: true })
      return
    }
    
    const newItem: ChecklistItem = {
      id: this.generateId(),
      text: newItemText
    }
    
    const editingChecklist = this.data.editingChecklist
    editingChecklist.items.push(newItem)
    
    this.setData({
      editingChecklist,
      newItemText: '',
      focusAddInput: false
    })
    
    wx.showToast({
      title: '已添加',
      icon: 'success',
      duration: 1000
    })
  },

  // 删除编辑中的项目
  deleteEditItem(event: any) {
    const index = event.currentTarget.dataset.index
    const editingChecklist = this.data.editingChecklist
    editingChecklist.items.splice(index, 1)
    
    this.setData({ 
      editingChecklist,
      editingItemIndex: -1,
      editingItemText: ''
    })
  },

  // 编辑项目文本
  editItemText(event: any) {
    const index = event.currentTarget.dataset.index
    const item = this.data.editingChecklist.items[index]
    
    this.setData({
      editingItemIndex: index,
      editingItemText: item.text
    })
  },

  // 编辑项目文本变化
  onEditingItemTextChange(event: any) {
    const value = event.detail
    console.log('编辑项目文本变化:', value, event)
    this.setData({ editingItemText: value })
  },

  // 保存项目文本
  saveItemText() {
    const index = this.data.editingItemIndex
    const newText = this.data.editingItemText.trim()
    
    if (!newText) {
      wx.showToast({
        title: '项目名称不能为空',
        icon: 'none'
      })
      return
    }
    
    const editingChecklist = this.data.editingChecklist
    editingChecklist.items[index].text = newText
    
    this.setData({
      editingChecklist,
      editingItemIndex: -1,
      editingItemText: ''
    })
  },

  // 向上移动项目
  moveItemUp(event: any) {
    const index = event.currentTarget.dataset.index
    if (index <= 0) return
    
    const editingChecklist = this.data.editingChecklist
    const items = editingChecklist.items
    
    // 交换位置
    const temp = items[index]
    items[index] = items[index - 1]
    items[index - 1] = temp
    
    this.setData({ editingChecklist })
  },

  // 向下移动项目
  moveItemDown(event: any) {
    const index = event.currentTarget.dataset.index
    const editingChecklist = this.data.editingChecklist
    const items = editingChecklist.items
    
    if (index >= items.length - 1) return
    
    // 交换位置
    const temp = items[index]
    items[index] = items[index + 1]
    items[index + 1] = temp
    
    this.setData({ editingChecklist })
  },

  // 保存检查单
  saveChecklist() {
    const editingChecklist = this.data.editingChecklist
    
    if (!editingChecklist.name.trim()) {
      wx.showToast({
        title: '请输入检查单名称',
        icon: 'none'
      })
      return
    }
    
    if (editingChecklist.items.length === 0) {
      wx.showToast({
        title: '请至少添加一个检查项目',
        icon: 'none'
      })
      return
    }
    
    const checklists = [...this.data.checklists]
    
    if (this.data.editMode === 'create') {
      // 新建检查单
      const newChecklist: Checklist = {
        id: this.generateId(),
        name: editingChecklist.name,
        items: editingChecklist.items,
        completedItems: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      checklists.push(newChecklist)
    } else {
      // 编辑现有检查单
      let index = -1
      for (let i = 0; i < checklists.length; i++) {
        if (checklists[i].id === editingChecklist.id) {
          index = i
          break
        }
      }
      if (index > -1) {
        checklists[index] = {
          ...checklists[index],
          name: editingChecklist.name,
          items: editingChecklist.items,
          updatedAt: Date.now()
        }
      }
    }
    
    // 🎯 富化数据后设置
    const enrichedChecklists = checklists.map(checklist => this.enrichChecklistData(checklist))
    
    // 🎯 更新统计数据
    this.updateStatistics(enrichedChecklists)
    
    this.setData({ 
      checklists: enrichedChecklists,
      showEditDialog: false
    })
    this.saveChecklists()
    
    wx.showToast({
      title: this.data.editMode === 'create' ? '检查单创建成功' : '检查单更新成功',
      icon: 'success'
    })
  },

  // 获取检查单进度文本
  getChecklistProgress(checklist: Checklist): string {
    const completed = checklist.completedItems ? checklist.completedItems.length : 0
    const total = checklist.items ? checklist.items.length : 0
    return `${completed}/${total}`
  },

  // 获取已完成数量
  getCompletedCount(checklist: Checklist): number {
    return checklist.completedItems ? checklist.completedItems.length : 0
  },

  // 🎯 获取进度百分比（新增方法支持新UI）
  getProgressPercentage(checklist: Checklist): number {
    const completed = this.getCompletedCount(checklist)
    const total = checklist.items ? checklist.items.length : 0
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  },

  // 🎯 检查检查单是否完成（新增方法）
  isChecklistCompleted(checklist: Checklist): boolean {
    const completed = this.getCompletedCount(checklist)
    const total = checklist.items ? checklist.items.length : 0
    return total > 0 && completed === total
  },

  // 🎯 更新检查单显示数据（预计算值）
  enrichChecklistData(checklist: Checklist): Checklist {
    try {
      const completedCount = checklist.completedItems ? checklist.completedItems.length : 0
      const total = checklist.items ? checklist.items.length : 0
      const progressPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0
      const isCompleted = total > 0 && completedCount === total
      
      return {
        ...checklist,
        completedCount,
        progressPercentage,
        isCompleted
      }
    } catch (error) {
      console.error('数据富化失败:', error)
      return checklist
    }
  },

  // 🎯 新增：更新统计数据
  updateStatistics(checklists: Checklist[]) {
    if (!checklists || checklists.length === 0) {
      this.setData({
        completedChecklistsCount: 0,
        inProgressChecklistsCount: 0,
        totalChecklistsCount: 0
      })
      return
    }
    
    let completedCount = 0
    let inProgressCount = 0
    
    checklists.forEach(checklist => {
      if (checklist.isCompleted) {
        completedCount++
      } else {
        // 只有有检查项目的检查单才算进行中
        if (checklist.items && checklist.items.length > 0) {
          inProgressCount++
        }
      }
    })
    
    this.setData({
      completedChecklistsCount: completedCount,
      inProgressChecklistsCount: inProgressCount,
      totalChecklistsCount: checklists.length
    })
  },

  // 🎯 主题管理 - 集成全局主题管理器
  initTheme() {
    try {
      // 引入全局主题管理器
      const themeManager = require('../../utils/theme-manager.js')
      
      // 初始化页面主题，会自动应用当前主题并设置监听器
      this.themeCleanup = themeManager.initPageTheme(this)
      
      console.log('个人检查单页面已连接到全局主题管理器')
    } catch (error) {
      console.error('主题管理器连接失败:', error)
      // 降级处理
      const savedTheme = wx.getStorageSync('current_theme') || 'light'
      this.setData({ isDarkMode: savedTheme === 'dark' })
    }
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 🎯 新增：检查单上移
  moveChecklistUp(event: any) {
    const index = event.currentTarget.dataset.index
    if (index <= 0) return
    
    const checklists = [...this.data.checklists]
    
    // 交换位置
    const temp = checklists[index]
    checklists[index] = checklists[index - 1]
    checklists[index - 1] = temp
    
    // 更新数据
    this.setData({ checklists })
    this.saveChecklists()
  },

  // 🎯 新增：检查单下移
  moveChecklistDown(event: any) {
    const index = event.currentTarget.dataset.index
    const checklists = [...this.data.checklists]
    
    if (index >= checklists.length - 1) return
    
    // 交换位置
    const temp = checklists[index]
    checklists[index] = checklists[index + 1]
    checklists[index + 1] = temp
    
    // 更新数据
    this.setData({ checklists })
    this.saveChecklists()
  },



  // 🎯 基于Context7最佳实践：显示项目操作菜单
  showItemMenu(event: any) {
    const index = event.currentTarget.dataset.index
    const item = this.data.editingChecklist.items[index]
    const totalItems = this.data.editingChecklist.items.length
    
    console.log('🎯 显示项目操作菜单，索引:', index, '项目:', item.text)
    
    // 根据项目位置动态生成操作选项
    const actions = []
    
    // 编辑操作
    actions.push({
      name: '编辑项目',
      color: '#1989fa',
      icon: 'edit'
    })
    
    // 上移操作（如果不是第一项）
    if (index > 0) {
      actions.push({
        name: '上移',
        color: '#00b578',
        icon: 'arrow-up'
      })
    }
    
    // 下移操作（如果不是最后一项）
    if (index < totalItems - 1) {
      actions.push({
        name: '下移',
        color: '#00b578',
        icon: 'arrow-down'
      })
    }
    
    // 删除操作
    actions.push({
      name: '删除项目',
      color: '#ee0a24',
      icon: 'delete'
    })
    
    this.setData({
      showItemActionSheet: true,
      currentItemIndex: index,
      itemActions: actions
    })
    
    // 触觉反馈
    wx.vibrateShort({
      type: 'light'
    })
  },

  // 🎯 基于Context7最佳实践：关闭操作菜单
  closeItemActionSheet() {
    this.setData({
      showItemActionSheet: false,
      currentItemIndex: -1,
      itemActions: []
    })
  },

  // 🎯 基于Context7最佳实践：处理操作选择
  onItemActionSelect(event: any) {
    const action = event.detail
    const index = this.data.currentItemIndex
    
    console.log('🎯 选择操作:', action.name, '索引:', index)
    
    // 关闭菜单
    this.closeItemActionSheet()
    
    // 根据选择的操作执行相应功能
    switch (action.name) {
      case '编辑项目':
        this.editItemText({ currentTarget: { dataset: { index } } })
        break
      case '上移':
        this.moveItemUp({ currentTarget: { dataset: { index } } })
        break
      case '下移':
        this.moveItemDown({ currentTarget: { dataset: { index } } })
        break
      case '删除项目':
        this.confirmDeleteItem(index)
        break
    }
  },

  // 🎯 基于Context7最佳实践：确认删除项目
  confirmDeleteItem(index: number) {
    const item = this.data.editingChecklist.items[index]
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除项目"${item.text}"吗？`,
      confirmText: '删除',
      confirmColor: '#ee0a24',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.deleteEditItem({ currentTarget: { dataset: { index } } })
          
          // 删除成功提示
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 1500
          })
          
          // 触觉反馈
          wx.vibrateShort({
            type: 'medium'
          })
        }
      }
    })
  },

  // 🎯 新增：快速添加按钮聚焦输入框
  focusAddInput() {
    this.setData({ focusAddInput: true })
  },

  // 🎯 新增：取消编辑项目
  cancelEditItem() {
    // 如果有编辑内容，先保存再取消
    if (this.data.editingItemText.trim() && this.data.editingItemIndex >= 0) {
      this.saveItemText()
    } else {
      this.setData({
        editingItemIndex: -1,
        editingItemText: ''
      })
    }
  },

  // 🎯 新增：直接删除项目
  deleteItem(event: any) {
    const index = event.currentTarget.dataset.index
    const item = this.data.editingChecklist.items[index]
    
    wx.showModal({
      title: '删除项目',
      content: `确定要删除“${item.text}”吗？`,
      confirmText: '删除',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          const editingChecklist = this.data.editingChecklist
          editingChecklist.items.splice(index, 1)
          
          this.setData({ 
            editingChecklist,
            editingItemIndex: -1,
            editingItemText: ''
          })
          
          wx.showToast({
            title: '已删除',
            icon: 'success'
          })
        }
      }
    })
  },


  // 🎯 新增：拖拽开始
  onDragStart(event: any) {
    this.setData({
      isDragging: true,
      dragStartIndex: event.currentTarget.dataset.index
    })
    
    wx.vibrateShort({ type: 'medium' })
  },

  // 🎯 新增：拖拽移动
  onDragMove(event: any) {
    if (!this.data.isDragging) return
    // 拖拽逻辑可以在这里实现，但小程序中较为复杂
    // 我们使用上下移动按钮作为替代方案
  },

  // 🎯 新增：拖拽结束
  onDragEnd(event: any) {
    this.setData({
      isDragging: false,
      dragStartIndex: -1,
      dragEndIndex: -1
    })
  },
}) 