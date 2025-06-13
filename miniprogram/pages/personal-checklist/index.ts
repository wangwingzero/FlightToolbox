// 个人检查单页面
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';

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
}

Page({
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
    editingItemText: ''
  },

  onLoad() {
    console.log('个人检查单页面加载')
    this.loadChecklists()
  },

  onShow() {
    this.loadChecklists()
  },

  // 加载检查单数据
  loadChecklists() {
    try {
      const checklists = wx.getStorageSync('personal_checklists') || []
      
      // 如果是第一次使用，自动创建默认检查单
      if (checklists.length === 0) {
        this.createInitialChecklists()
        return
      }
      
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

    this.setData({ checklists: defaultChecklists })
    this.saveChecklists()
    
    console.log('已自动创建默认检查单')
  },

  // 保存检查单数据
  saveChecklists() {
    try {
      wx.setStorageSync('personal_checklists', this.data.checklists)
    } catch (error) {
      console.error('保存检查单失败:', error)
      Toast.fail('保存失败')
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
    const checklist = this.data.checklists.find(item => item.id === checklistId)
    
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
    const checklist = this.data.checklists.find(item => item.id === checklistId)
    
    if (checklist) {
      Dialog.confirm({
        title: '确认删除',
        message: `确定要删除检查单"${checklist.name}"吗？`,
      }).then(() => {
        const newChecklists = this.data.checklists.filter(item => item.id !== checklistId)
        this.setData({ checklists: newChecklists })
        this.saveChecklists()
        Toast.success('删除成功')
      }).catch(() => {
        // 用户取消删除
      })
    }
  },

  // 打开检查单详情
  openChecklist(event: any) {
    const checklistId = event.currentTarget.dataset.id
    const checklist = this.data.checklists.find(item => item.id === checklistId)
    
    if (checklist) {
      this.setData({
        currentChecklist: checklist,
        checkedItems: checklist.completedItems || [],
        showChecklistDetail: true
      })
    }
  },

  // 关闭检查单详情
  closeChecklistDetail() {
    this.setData({ showChecklistDetail: false })
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
        return {
          ...checklist,
          completedItems: checkedItems,
          updatedAt: Date.now()
        }
      }
      return checklist
    })
    
    // 更新当前检查单
    const updatedCurrentChecklist = checklists.find(item => item.id === currentChecklist.id)
    if (updatedCurrentChecklist) {
      this.setData({ 
        checklists,
        currentChecklist: updatedCurrentChecklist
      })
    }
    
    this.saveChecklists()
    
    // 检查是否全部完成
    if (checkedItems.length === currentChecklist.items.length && currentChecklist.items.length > 0) {
      Toast.success('检查单已全部完成！')
    }
  },

  // 重置检查单
  resetChecklist() {
    Dialog.confirm({
      title: '重置检查单',
      message: '确定要重置当前检查单吗？所有已完成的项目将被清除。',
    }).then(() => {
      this.setData({ checkedItems: [] })
      this.updateChecklistProgress([])
      Toast.success('检查单已重置')
    }).catch(() => {
      // 用户取消重置
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
    this.setData({
      'editingChecklist.name': event.detail
    })
  },

  // 新项目文本变化
  onNewItemChange(event: any) {
    this.setData({ newItemText: event.detail })
  },

  // 添加新项目
  addNewItem() {
    const newItemText = this.data.newItemText.trim()
    if (!newItemText) {
      Toast.fail('请输入检查项目')
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
      newItemText: ''
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
    this.setData({ editingItemText: event.detail })
  },

  // 保存项目文本
  saveItemText() {
    const index = this.data.editingItemIndex
    const newText = this.data.editingItemText.trim()
    
    if (!newText) {
      Toast.fail('项目名称不能为空')
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
      Toast.fail('请输入检查单名称')
      return
    }
    
    if (editingChecklist.items.length === 0) {
      Toast.fail('请至少添加一个检查项目')
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
      const index = checklists.findIndex(item => item.id === editingChecklist.id)
      if (index > -1) {
        checklists[index] = {
          ...checklists[index],
          name: editingChecklist.name,
          items: editingChecklist.items,
          updatedAt: Date.now()
        }
      }
    }
    
    this.setData({ 
      checklists,
      showEditDialog: false
    })
    this.saveChecklists()
    
    Toast.success(this.data.editMode === 'create' ? '检查单创建成功' : '检查单更新成功')
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

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 转发功能
  onShareAppMessage() {
    return {
      title: '飞行工具箱 - 个人检查单',
      path: '/pages/personal-checklist/index'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '飞行工具箱 - 个人检查单'
    }
  }
}) 