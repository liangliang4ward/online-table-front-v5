import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

/**
 * 索引配置逻辑
 * @param {Object} options - 配置选项
 * @param {Object} options.formData - 表表单数据（包含indexes数组）
 * @returns {Object} 索引配置相关的状态和方法
 */
export function useIndexConfig(options = {}) {
  const { formData } = options

  // 状态变量
  const indexDialogVisible = ref(false)
  const indexDialogTitle = ref('新增索引')
  const indexFormRef = ref(null)
  const currentIndexIndex = ref(-1)

  // 索引表单数据
  const indexFormData = reactive({
    indexName: '',
    indexType: 'normal',
    indexField: []
  })

  // 索引表单规则
  const indexFormRules = {
    indexName: [{ required: true, message: '请输入索引名称', trigger: 'blur' }],
    indexType: [{ required: true, message: '请选择索引类型', trigger: 'change' }],
    indexField: [{ required: true, message: '请选择索引字段', trigger: 'change', type: 'array' }]
  }

  // 重置索引表单
  const resetIndexForm = () => {
    Object.assign(indexFormData, {
      indexName: '',
      indexType: 'normal',
      indexField: []
    })
  }

  // 打开新增索引对话框
  const openAddIndexDialog = () => {
    indexDialogTitle.value = '新增索引'
    currentIndexIndex.value = -1
    resetIndexForm()
    indexDialogVisible.value = true
  }

  // 打开编辑索引对话框
  const openEditIndexDialog = (row, index) => {
    indexDialogTitle.value = '编辑索引'
    currentIndexIndex.value = index
    Object.assign(indexFormData, {
      indexName: row.indexName,
      indexType: row.indexType || 'normal',
      indexField: row.indexField || []
    })
    indexDialogVisible.value = true
  }

  // 提交索引表单
  const handleIndexSubmit = async () => {
    const valid = await indexFormRef.value?.validate().catch(() => false)
    if (!valid) return

    // 获取表单数据（优先使用formData.value，否则直接使用formData）
    const indexes = formData.value?.indexes || formData.indexes

    if (currentIndexIndex.value === -1) {
      indexes.push({ ...indexFormData })
    } else {
      indexes[currentIndexIndex.value] = { ...indexFormData }
    }
    indexDialogVisible.value = false
  }

  // 删除索引
  const handleDeleteIndex = index => {
    const indexes = formData.value?.indexes || formData.indexes
    indexes.splice(index, 1)
  }

  return {
    // 状态
    indexDialogVisible,
    indexDialogTitle,
    indexFormRef,
    currentIndexIndex,
    indexFormData,
    indexFormRules,

    // 方法
    resetIndexForm,
    openAddIndexDialog,
    openEditIndexDialog,
    handleIndexSubmit,
    handleDeleteIndex
  }
}
