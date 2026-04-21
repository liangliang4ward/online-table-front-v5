import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { insert, update, queryById } from '@/mock/tableData'
import { buildFieldRules, createEmptyTableRow } from '@/utils/form-utils'

/**
 * 表单相关的逻辑
 * @param {Object} options - 配置选项
 * @param {Ref} options.selectedTableId - 选中的表ID
 * @param {Ref} options.selectedTableConfig - 选中的表配置
 * @param {Function} options.fetchData - 刷新数据的方法
 * @returns {Object} 表单相关的状态和方法
 */
export function useForm(options = {}) {
  const { selectedTableId, selectedTableConfig, fetchData } = options

  // 弹窗相关
  const dialogVisible = ref(false)
  const dialogTitle = ref('新增数据')
  const formRef = ref(null)
  const isEdit = ref(false)

  // 表单数据
  const formData = reactive({})

  // 表单规则
  const formRules = reactive({})

  // 获取新增时的表单字段
  const addFormFields = computed(() => {
    if (!selectedTableConfig.value?.fields) return []
    return selectedTableConfig.value.fields.filter(
      f => f.isShowForm !== false && f.isShowInAdd !== false
    )
  })

  // 获取编辑时的表单字段
  const editFormFields = computed(() => {
    if (!selectedTableConfig.value?.fields) return []
    return selectedTableConfig.value.fields.filter(f => f.isShowForm !== false)
  })

  // 获取当前模式的表单字段
  const formFields = computed(() => {
    return isEdit.value ? editFormFields.value : addFormFields.value
  })

  // 表单列数配置
  const formColumns = computed(() => {
    return selectedTableConfig.value?.formColumns || 2
  })

  // 弹窗宽度（根据列数动态调整）
  const dialogWidth = computed(() => {
    const columns = formColumns.value
    const hasSubTables = selectedTableConfig.value?.tableType === 1

    if (columns === 4) {
      return hasSubTables ? '1400px' : '1200px'
    }
    return hasSubTables ? '1100px' : '900px'
  })

  // 重置表单
  const resetForm = () => {
    Object.keys(formData).forEach(key => {
      delete formData[key]
    })
    Object.keys(formRules).forEach(key => {
      delete formRules[key]
    })

    // 根据表配置初始化表单数据和规则
    if (selectedTableConfig.value?.fields) {
      const emptyRow = createEmptyTableRow(selectedTableConfig.value)
      Object.assign(formData, emptyRow)

      // 设置验证规则
      selectedTableConfig.value.fields.forEach(field => {
        const fieldName = field.dbFieldNameAlias || field.dbFieldName
        const rules = buildFieldRules(field)
        if (rules.length > 0) {
          formRules[fieldName] = rules
        }
      })
    }
  }

  // 打开新增弹窗
  const openAddDialog = () => {
    dialogTitle.value = '新增数据'
    isEdit.value = false
    resetForm()
    dialogVisible.value = true
  }

  // 打开编辑弹窗
  const openEditDialog = async row => {
    dialogTitle.value = '编辑数据'
    isEdit.value = true
    resetForm()

    try {
      const res = await queryById(selectedTableId.value, row.id)
      if (res.success && res.data) {
        // 将数据复制到表单
        Object.assign(formData, res.data)
      }
    } catch (error) {
      console.error('获取详情失败:', error)
    }

    dialogVisible.value = true
  }

  // 处理提交
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      let res
      if (isEdit.value) {
        // 编辑模式
        res = await update(selectedTableId.value, formData)
      } else {
        // 新增模式
        res = await insert(selectedTableId.value, formData)
      }

      if (res.success) {
        ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
        dialogVisible.value = false
        // 刷新数据列表
        if (fetchData) {
          fetchData()
        }
      }
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  return {
    // 状态
    dialogVisible,
    dialogTitle,
    formRef,
    isEdit,
    formData,
    formRules,
    addFormFields,
    editFormFields,
    formFields,
    formColumns,
    dialogWidth,

    // 方法
    resetForm,
    openAddDialog,
    openEditDialog,
    handleSubmit
  }
}
