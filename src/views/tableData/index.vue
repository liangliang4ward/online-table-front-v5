<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  ElCard,
  ElTable,
  ElTableColumn,
  ElButton,
  ElPagination,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElSwitch,
  ElDatePicker,
  ElRadioGroup,
  ElRadio,
  ElCheckboxGroup,
  ElCheckbox,
  ElUpload,
  ElMessage,
  ElMessageBox,
  ElTag,
  ElDescriptions,
  ElDescriptionsItem,
  ElEmpty
} from 'element-plus'
import RichTextEditor from '@/components/RichTextEditor.vue'
import { getAllTableHeads, getTableConfigById } from '@/mock/tableHead'
import { pageQuery, queryById, insert, update, deleteById, batchDeleteByIds, queryByMainTableId, deleteByMainTableId } from '@/mock/tableData'

const route = useRoute()

// 根据字段配置获取控件类型
const getControlType = (field) => {
  if (field.controlType) {
    return field.controlType
  }
  // 没有配置控件类型时，根据数据库类型推断
  const map = {
    varchar: 'input',
    text: 'input',
    longtext: 'input',
    int: 'inputNumber',
    bigint: 'inputNumber',
    tinyint: 'inputNumber',
    date: 'datePicker',
    datetime: 'datetimePicker',
    decimal: 'inputNumber'
  }
  return map[field.dbType] || 'input'
}

// 数据库类型与表单组件映射（保留用于兼容）
const DB_TYPE_COMPONENT_MAP = {
  varchar: 'input',
  text: 'textarea',
  longtext: 'textarea',
  int: 'inputNumber',
  bigint: 'inputNumber',
  tinyint: 'inputNumber',
  date: 'datePicker',
  datetime: 'datetimePicker',
  decimal: 'inputNumber'
}

// 订单状态选项
const ORDER_STATUS_OPTIONS = [
  { label: '待付款', value: 0 },
  { label: '待发货', value: 1 },
  { label: '已发货', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 }
]

// 用户状态选项
const STATUS_OPTIONS = [
  { label: '禁用', value: 0 },
  { label: '启用', value: 1 }
]

// 获取枚举选项
const getEnumOptions = (fieldName) => {
  if (['order_status', 'orderStatus'].includes(fieldName)) {
    return ORDER_STATUS_OPTIONS
  }
  if (['status'].includes(fieldName) && fieldName !== 'order_status') {
    return STATUS_OPTIONS
  }
  return null
}

// 状态变量
const loading = ref(false)
const tableData = ref([])
const selectedRows = ref([])
const tableHeads = ref([])
const selectedTableId = ref(null)
const selectedTableConfig = ref(null)

// 分页
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10
})

// 查询参数
const queryParams = reactive({})

// 查询表单是否展开
const queryFormExpanded = ref(true)

// 重置查询参数
const resetQueryParams = () => {
  Object.keys(queryParams).forEach((key) => {
    delete queryParams[key]
  })
  
  if (selectedTableConfig.value?.fields) {
    selectedTableConfig.value.fields.forEach((field) => {
      if (field.queryType && field.queryType !== 'none') {
        const fieldName = field.dbFieldNameAlias || field.dbFieldName
        
        if (field.queryType === 'between') {
          queryParams[`${fieldName}Start`] = null
          queryParams[`${fieldName}End`] = null
        } else if (field.queryType === 'in') {
          queryParams[fieldName] = []
        } else {
          if (['int', 'bigint', 'tinyint', 'decimal'].includes(field.dbType)) {
            queryParams[fieldName] = null
          } else if (['date', 'datetime'].includes(field.dbType)) {
            queryParams[fieldName] = null
          } else {
            queryParams[fieldName] = ''
          }
        }
      }
    })
  }
}

// 处理查询
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 处理重置
const handleReset = () => {
  resetQueryParams()
  pagination.current = 1
  fetchData()
}

// 获取字段的选项配置
const getFieldOptions = (field) => {
  if (!field.controlConfig) return []
  
  const { dataSourceType, options, dictionaryCode } = field.controlConfig
  
  if (dataSourceType === 'static' && options && options.length > 0) {
    return options.map((opt) => ({
      label: opt.label,
      value: opt.value
    }))
  }
  
  // 这里可以扩展字典和接口的情况
  return []
}

// 获取查询类型标签
const getQueryTypeLabel = (queryType) => {
  const map = {
    eq: '等于',
    like: '模糊',
    gt: '大于',
    lt: '小于',
    gte: '大于等于',
    lte: '小于等于',
    between: '区间',
    in: '多选'
  }
  return map[queryType] || ''
}

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增数据')
const detailVisible = ref(false)
const detailData = ref(null)
// 详情模式下的附表数据
const detailSubTableDataMap = reactive({})
const formRef = ref(null)
const isEdit = ref(false)

// 表单数据
const formData = reactive({})

// 表单规则
const formRules = reactive({})

// 是否通过路由参数进入（预览模式）
const isPreviewMode = computed(() => {
  return !!route.params.tableId
})

// 当前表类型
const currentTableType = computed(() => {
  return selectedTableConfig.value?.tableType ?? 0
})

// 表类型标签
const TABLE_TYPE_LABELS = {
  0: '单表',
  1: '主表',
  2: '附表'
}

// 是否是附表
const isSubTable = computed(() => {
  return currentTableType.value === 2
})

// 是否是主表
const isMainTable = computed(() => {
  return currentTableType.value === 1
})

// 是否是单表
const isSingleTable = computed(() => {
  return currentTableType.value === 0
})

// 表单列数配置
const formColumns = computed(() => {
  return selectedTableConfig.value?.formColumns || 2
})

// 弹窗宽度（根据列数动态调整）
const dialogWidth = computed(() => {
  const columns = formColumns.value
  const hasSubTables = isMainTable.value && relatedSubTables.value.length > 0
  
  if (columns === 4) {
    return hasSubTables ? '1400px' : '1200px'
  }
  return hasSubTables ? '1100px' : '900px'
})

// 获取当前主表关联的附表列表
const relatedSubTables = computed(() => {
  if (!selectedTableConfig.value || !isMainTable.value) return []
  const tableName = selectedTableConfig.value.tableName
  const allTables = getAllTableHeads()
  return allTables.filter((t) => t.tableType === 2 && t.mainTable === tableName)
})

// 附表数据（主表新增时使用）
const subTableDataMap = reactive({})

// 活动的附表Tab
const activeSubTableTab = ref(0)

// 获取附表列表（不依赖计算属性，直接获取）
const getSubTableList = () => {
  if (!selectedTableConfig.value) return []
  const tableName = selectedTableConfig.value.tableName
  const isMain = selectedTableConfig.value.tableType === 1
  if (!isMain) return []
  const allTables = getAllTableHeads()
  return allTables.filter((t) => t.tableType === 2 && t.mainTable === tableName)
}

// 初始化附表数据
// mainTableId: 主表ID，用于编辑/详情模式加载已有数据
const initSubTableData = async (mainTableId = null) => {
  Object.keys(subTableDataMap).forEach((key) => {
    delete subTableDataMap[key]
  })
  
  // 直接获取附表列表，不依赖计算属性
  const subTables = getSubTableList()
  if (subTables.length > 0) {
    for (const subTable of subTables) {
      subTableDataMap[subTable.id] = []
      
      if (mainTableId) {
        // 编辑模式：从数据库加载已有数据
        const relationFieldName = subTable.relationConfig?.relationFieldName || 'mainTableId'
        const res = await queryByMainTableId(subTable.id, mainTableId, relationFieldName)
        if (res.success && res.data?.length > 0) {
          // 加载已有数据
          subTableDataMap[subTable.id] = [...res.data]
        } else {
          // 没有数据，添加一行空数据
          addSubTableRow(subTable.id)
        }
      } else {
        // 新增模式：给所有附表默认添加一行数据
        addSubTableRow(subTable.id)
      }
    }
    // 默认选中第一个附表Tab
    activeSubTableTab.value = 0
  }
}

// 判断附表是否是一对多关系
const isOneToMany = (subTable) => {
  return subTable?.relationConfig?.relationType === 'one_to_many'
}

// 判断附表是否是一对一关系
const isOneToOne = (subTable) => {
  return subTable?.relationConfig?.relationType === 'one_to_one'
}

// 获取附表的可编辑字段
const getSubTableFormFields = (subTable) => {
  if (!subTable?.fields) return []
  return subTable.fields.filter(
    (f) => f.isShowForm && f.dbFieldName !== subTable.relationConfig?.subTableField
  )
}

// 创建空的表数据行
const createEmptyTableRow = (subTable) => {
  if (!subTable?.fields) return {}
  
  const newRow = {}
  subTable.fields.forEach((field) => {
    if (field.isShowForm) {
      const fieldName = field.dbFieldNameAlias || field.dbFieldName
      
      // 根据控件类型设置默认值
      const controlType = getControlType(field)
      
      // 文件上传类型默认为空数组
      if (controlType === 'upload') {
        newRow[fieldName] = []
      }
      // 多选类型（下拉多选、复选框）默认为空数组
      else if (controlType === 'selectMultiple' || controlType === 'checkbox') {
        newRow[fieldName] = []
      }
      // 设置默认值
      else if (field.dbDefaultVal !== null && field.dbDefaultVal !== undefined && field.dbDefaultVal !== '') {
        if (['int', 'bigint', 'tinyint'].includes(field.dbType)) {
          newRow[fieldName] = parseInt(field.dbDefaultVal) || 0
        } else if (field.dbType === 'decimal') {
          newRow[fieldName] = parseFloat(field.dbDefaultVal) || 0
        } else {
          newRow[fieldName] = field.dbDefaultVal
        }
      } else {
        if (['int', 'bigint', 'tinyint'].includes(field.dbType)) {
          newRow[fieldName] = null
        } else if (field.dbType === 'decimal') {
          newRow[fieldName] = null
        } else {
          newRow[fieldName] = ''
        }
      }
    }
  })
  
  return newRow
}

// 添加附表数据行
const addSubTableRow = (subTableId) => {
  if (!subTableDataMap[subTableId]) {
    subTableDataMap[subTableId] = []
  }
  
  const subTables = getSubTableList()
  const subTable = subTables.find((t) => t.id === subTableId)
  if (!subTable) return
  
  const newRow = createEmptyTableRow(subTable)
  subTableDataMap[subTableId].push(newRow)
}

// 删除附表数据行
const removeSubTableRow = (subTableId, index) => {
  if (subTableDataMap[subTableId]) {
    subTableDataMap[subTableId].splice(index, 1)
  }
}

// 监听表选择变化
watch(selectedTableId, (newVal) => {
  if (newVal) {
    selectedTableConfig.value = getTableConfigById(newVal)
    // 重置查询参数
    resetQueryParams()
    pagination.current = 1
    fetchData()
  } else {
    selectedTableConfig.value = null
    tableData.value = []
    pagination.total = 0
  }
})

// 获取可显示的列表字段
const listFields = computed(() => {
  if (!selectedTableConfig.value?.fields) return []
  return selectedTableConfig.value.fields.filter((f) => f.isShowList !== false)
})

// 获取新增时的表单字段
const addFormFields = computed(() => {
  if (!selectedTableConfig.value?.fields) return []
  return selectedTableConfig.value.fields.filter((f) => f.isShowForm !== false && f.isShowInAdd !== false)
})

// 获取编辑时的表单字段
const editFormFields = computed(() => {
  if (!selectedTableConfig.value?.fields) return []
  return selectedTableConfig.value.fields.filter((f) => f.isShowForm !== false)
})

// 获取当前模式的表单字段
const formFields = computed(() => {
  return isEdit.value ? editFormFields.value : addFormFields.value
})

// 获取可查询的字段
const queryFields = computed(() => {
  if (!selectedTableConfig.value?.fields) return []
  return selectedTableConfig.value.fields.filter((f) => f.queryType && f.queryType !== 'none')
})

// 加载数据表列表
const fetchTableHeads = async () => {
  const tables = getAllTableHeads()
  tableHeads.value = tables || []
  // 默认选中第一个表
  if (tableHeads.value.length > 0 && !selectedTableId.value) {
    selectedTableId.value = tableHeads.value[0].id
  }
}

// 加载数据
const fetchData = async () => {
  if (!selectedTableId.value) return

  loading.value = true
  try {
    // 构建查询参数
    const searchParams = {}
    Object.keys(queryParams).forEach((key) => {
      const value = queryParams[key]
      if (value !== null && value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
        searchParams[key] = value
      }
    })

    const params = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      ...searchParams
    }
    const res = await pageQuery(selectedTableId.value, params)
    if (res.success) {
      tableData.value = res.data?.list || []
      pagination.total = res.data?.total || 0
    }
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    loading.value = false
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchData()
}

const handleCurrentChange = (current) => {
  pagination.current = current
  fetchData()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 获取字段项的样式（处理布局配置）
const getFieldItemStyle = (field, index, fields, customColumns = null) => {
  const controlType = getControlType(field)
  const layoutType = field.layoutType || 'default'
  const columns = customColumns || formColumns.value
  
  const style = {}
  
  // 富文本或单独一行：跨所有列
  if (controlType === 'richText' || layoutType === 'fullRow') {
    style.gridColumn = `span ${columns}`
  }
  
  // 换行处理：从新行开始
  // CSS Grid 中，设置 gridColumnStart: '1' 会让元素从第一列开始
  // 如果当前位置不在第一列，就会自动换到下一行
  if (layoutType === 'newLine') {
    style.gridColumnStart = '1'
  }
  
  return style
}

// 获取字段的类名
const getFieldItemClass = (field) => {
  const controlType = getControlType(field)
  const layoutType = field.layoutType || 'default'
  
  const classes = []
  if (controlType === 'richText' || layoutType === 'fullRow') {
    classes.push('form-item-full')
  }
  if (layoutType === 'newLine') {
    classes.push('form-item-newline')
  }
  
  return classes
}

// 检查字段是否可编辑
const isFieldEditable = (field) => {
  // 如果是只读字段，不可编辑
  if (field.isReadOnly) return false
  
  // 根据模式判断
  if (isEdit.value) {
    // 编辑模式：检查 isEditable
    return field.isEditable !== false
  } else {
    // 新增模式：检查 isAddable
    return field.isAddable !== false
  }
}

// 获取字段的最大长度（优先级：validationRules.maxLength > dbLength）
const getFieldMaxLength = (field) => {
  const validationRules = field.validationRules || {}
  // 优先使用校验规则配置的最大长度
  if (validationRules.maxLength !== null && validationRules.maxLength !== undefined) {
    return validationRules.maxLength
  }
  // 其次使用字段定义的长度
  if (field.dbLength !== null && field.dbLength !== undefined && field.dbLength > 0) {
    return field.dbLength
  }
  return null
}

// 根据字段配置生成校验规则
const buildFieldRules = (field) => {
  const rules = []
  const fieldName = field.dbFieldTxt || field.dbFieldName
  const validationRules = field.validationRules || {}

  // 必填校验（优先级：validationRules.required > fieldMustInput > dbIsNull）
  const isRequired = validationRules.required === true || 
                    (field.fieldMustInput === '1' && !field.dbIsNull)
  
  if (isRequired) {
    const controlType = getControlType(field)
    if (controlType === 'selectMultiple' || controlType === 'checkbox' || controlType === 'upload') {
      rules.push({
        required: true,
        message: `请选择${fieldName}`,
        trigger: 'change',
        type: 'array',
        min: 1
      })
    } else {
      rules.push({
        required: true,
        message: `请输入${fieldName}`,
        trigger: 'blur'
      })
    }
  }

  // 长度校验
  if (validationRules.minLength !== null && validationRules.minLength !== undefined) {
    rules.push({
      min: validationRules.minLength,
      message: `${fieldName}最少${validationRules.minLength}个字符`,
      trigger: 'blur'
    })
  }
  if (validationRules.maxLength !== null && validationRules.maxLength !== undefined) {
    rules.push({
      max: validationRules.maxLength,
      message: `${fieldName}最多${validationRules.maxLength}个字符`,
      trigger: 'blur'
    })
  }

  // 数值范围校验
  if (validationRules.min !== null && validationRules.min !== undefined) {
    rules.push({
      type: 'number',
      min: validationRules.min,
      message: `${fieldName}不能小于${validationRules.min}`,
      trigger: 'blur'
    })
  }
  if (validationRules.max !== null && validationRules.max !== undefined) {
    rules.push({
      type: 'number',
      max: validationRules.max,
      message: `${fieldName}不能大于${validationRules.max}`,
      trigger: 'blur'
    })
  }

  // 正则表达式校验
  if (validationRules.pattern && validationRules.pattern.trim()) {
    try {
      const pattern = new RegExp(validationRules.pattern)
      rules.push({
        validator: (rule, value, callback) => {
          if (value && !pattern.test(value)) {
            callback(new Error(validationRules.message || `${fieldName}格式不正确`))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      })
    } catch (e) {
      console.warn('Invalid regex pattern:', validationRules.pattern)
    }
  }

  return rules
}

// 重置表单
const resetForm = () => {
  Object.keys(formData).forEach((key) => {
    delete formData[key]
  })
  Object.keys(formRules).forEach((key) => {
    delete formRules[key]
  })

  // 根据表配置初始化表单数据和规则
  if (selectedTableConfig.value?.fields) {
    selectedTableConfig.value.fields.forEach((field) => {
      const fieldName = field.dbFieldNameAlias || field.dbFieldName
      
      // 根据控件类型设置默认值
      const controlType = getControlType(field)
      
      // 文件上传类型默认为空数组
      if (controlType === 'upload') {
        formData[fieldName] = []
      }
      // 多选类型（下拉多选、复选框）默认为空数组
      else if (controlType === 'selectMultiple' || controlType === 'checkbox') {
        formData[fieldName] = []
      }
      // 设置默认值
      else if (field.dbDefaultVal !== null && field.dbDefaultVal !== undefined && field.dbDefaultVal !== '') {
        if (['int', 'bigint', 'tinyint'].includes(field.dbType)) {
          formData[fieldName] = parseInt(field.dbDefaultVal) || 0
        } else if (field.dbType === 'decimal') {
          formData[fieldName] = parseFloat(field.dbDefaultVal) || 0
        } else {
          formData[fieldName] = field.dbDefaultVal
        }
      } else {
        // 根据类型设置默认空值
        if (['int', 'bigint', 'tinyint'].includes(field.dbType)) {
          formData[fieldName] = null
        } else if (field.dbType === 'decimal') {
          formData[fieldName] = null
        } else {
          formData[fieldName] = ''
        }
      }

      // 设置验证规则
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
  // 主表需要初始化附表数据
  initSubTableData()
  activeSubTableTab.value = 0
  dialogVisible.value = true
}

// 打开编辑弹窗
const openEditDialog = async (row) => {
  dialogTitle.value = '编辑数据'
  isEdit.value = true
  resetForm()

  try {
    const res = await queryById(selectedTableId.value, row.id)
    if (res.success && res.data) {
      // 将数据复制到表单
      Object.assign(formData, res.data)
    }
    // 主表需要初始化附表数据，传入主表ID以加载已有数据
    await initSubTableData(row.id)
    activeSubTableTab.value = 0
  } catch (error) {
    console.error('获取详情失败:', error)
  }

  dialogVisible.value = true
}

// 打开详情弹窗
const openDetailDialog = async (row) => {
  try {
    const res = await queryById(selectedTableId.value, row.id)
    if (res.success && res.data) {
      detailData.value = res.data
      // 初始化详情模式下的附表数据，传入主表ID以加载已有数据
      await initDetailSubTableData(row.id)
      detailVisible.value = true
    }
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}

// 初始化详情模式下的附表数据
// mainTableId: 主表ID，用于加载已有数据
const initDetailSubTableData = async (mainTableId = null) => {
  Object.keys(detailSubTableDataMap).forEach((key) => {
    delete detailSubTableDataMap[key]
  })
  
  if (isMainTable.value && relatedSubTables.value.length > 0) {
    for (const subTable of relatedSubTables.value) {
      detailSubTableDataMap[subTable.id] = []
      
      if (mainTableId) {
        // 从数据库加载已有数据
        const relationFieldName = subTable.relationConfig?.relationFieldName || 'mainTableId'
        const res = await queryByMainTableId(subTable.id, mainTableId, relationFieldName)
        if (res.success && res.data?.length > 0) {
          // 加载已有数据
          detailSubTableDataMap[subTable.id] = [...res.data]
        } else {
          // 没有数据，添加一行空数据以显示表格结构
          const newRow = createEmptyTableRow(subTable)
          detailSubTableDataMap[subTable.id].push(newRow)
        }
      } else {
        // 没有主表ID，添加一行空数据以显示表格结构
        const newRow = createEmptyTableRow(subTable)
        detailSubTableDataMap[subTable.id].push(newRow)
      }
    }
  }
}

// 处理提交数据中的日期格式
const processSubmitData = (data) => {
  const result = { ...data }
  Object.keys(result).forEach((key) => {
    if (result[key] instanceof Date) {
      const date = result[key]
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      result[key] = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
  })
  return result
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    const submitData = processSubmitData(formData)

    if (isEdit.value) {
      // 编辑模式
      const res = await update(selectedTableId.value, submitData)
      if (res.success) {
        // 如果是主表且有关联附表，更新附表数据
        if (isMainTable.value && relatedSubTables.value.length > 0) {
          const mainTableId = submitData.id
          
          // 遍历所有附表，先删除旧数据，再插入新数据
          for (const subTable of relatedSubTables.value) {
            const relationFieldName = subTable.relationConfig?.relationFieldName || 'mainTableId'
            
            // 1. 删除旧的附表数据
            await deleteByMainTableId(subTable.id, mainTableId, relationFieldName)
            
            // 2. 插入新的附表数据
            const subTableDataList = subTableDataMap[subTable.id] || []
            for (const subData of subTableDataList) {
              const processedSubData = processSubmitData(subData)
              
              // 设置关联字段
              processedSubData[relationFieldName] = mainTableId
              
              // 保存附表数据
              await insert(subTable.id, processedSubData)
            }
          }
        }
        
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchData()
      }
    } else {
      // 新增模式
      // 1. 先保存主表数据
      const mainTableRes = await insert(selectedTableId.value, submitData)
      if (!mainTableRes.success) {
        ElMessage.error('主表数据保存失败')
        return
      }

      // 2. 获取新生成的主表ID（需要从返回结果中获取）
      // 这里我们需要特殊处理，因为 insert 函数只返回 success，不返回新插入的ID
      // 实际上，我们需要修改 insert 函数或使用其他方式
      // 对于 mock 数据，我们可以直接使用生成的ID

      // 3. 如果是主表且有关联附表，保存附表数据
      if (isMainTable.value && relatedSubTables.value.length > 0) {
        // 这里我们需要获取刚才插入的主表数据的ID
        // 由于是 mock 数据，我们重新查询来获取最新的ID
        const listRes = await pageQuery(selectedTableId.value, { pageNo: 1, pageSize: 1000 })
        if (listRes.success && listRes.data?.list?.length > 0) {
          // 按创建时间倒序，获取最新的一条
          const list = [...listRes.data.list]
          list.sort((a, b) => {
            if (a.createTime && b.createTime) {
              return new Date(b.createTime) - new Date(a.createTime)
            }
            return 0
          })
          const latestMainRecord = list[0]
          const mainTableId = latestMainRecord?.id

          if (mainTableId) {
            // 遍历所有附表，保存附表数据
            for (const subTable of relatedSubTables.value) {
              const subTableDataList = subTableDataMap[subTable.id] || []
              
              for (const subData of subTableDataList) {
                const processedSubData = processSubmitData(subData)
                
                // 设置关联字段
                if (subTable.relationConfig) {
                  const relationFieldName = subTable.relationConfig.relationFieldName || 'mainTableId'
                  processedSubData[relationFieldName] = mainTableId
                }

                // 保存附表数据
                await insert(subTable.id, processedSubData)
              }
            }
          }
        }
      }

      ElMessage.success('新增成功')
      dialogVisible.value = false
      fetchData()
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该条数据吗？', '提示', {
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await deleteById(selectedTableId.value, row.id)
        if (res.success) {
          ElMessage.success('删除成功')
          fetchData()
        }
      } catch (error) {
        console.error('删除失败:', error)
      }
    })
    .catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条数据吗？`, '提示', {
    type: 'warning'
  })
    .then(async () => {
      try {
        const ids = selectedRows.value.map((row) => row.id)
        const res = await batchDeleteByIds(selectedTableId.value, ids)
        if (res.success) {
          ElMessage.success('删除成功')
          fetchData()
        }
      } catch (error) {
        console.error('批量删除失败:', error)
      }
    })
    .catch(() => {})
}

// 格式化显示值
const formatValue = (value, field) => {
  if (value === null || value === undefined) return '-'
  
  // 处理状态枚举
  const enumOptions = getEnumOptions(field?.dbFieldName)
  if (enumOptions) {
    const option = enumOptions.find((o) => o.value === value)
    return option?.label || value
  }

  // 处理日期
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
    return value
  }

  return String(value)
}

// 获取状态标签类型
const getStatusTagType = (value, field) => {
  if (['order_status', 'orderStatus'].includes(field?.dbFieldName)) {
    const typeMap = {
      0: 'info',
      1: 'warning',
      2: 'primary',
      3: 'success',
      4: 'danger'
    }
    return typeMap[value] || 'info'
  }
  if (field?.dbFieldName === 'status') {
    return value === 1 ? 'success' : 'danger'
  }
  return 'info'
}

// 获取字段标签
const getFieldLabel = (fieldName) => {
  if (!selectedTableConfig.value?.fields) return fieldName
  const field = selectedTableConfig.value.fields.find(
    (f) => f.dbFieldName === fieldName || f.dbFieldNameAlias === fieldName
  )
  return field?.dbFieldTxt || fieldName
}

onMounted(() => {
  fetchTableHeads()
  
  // 检查路由参数，如果有 tableId 参数，自动选择该表
  const tableIdFromRoute = route.params.tableId
  if (tableIdFromRoute) {
    // 等待表列表加载完成后再选择
    const checkAndSelect = () => {
      if (tableHeads.value.length > 0) {
        const tableExists = tableHeads.value.some((t) => t.id === tableIdFromRoute)
        if (tableExists) {
          selectedTableId.value = tableIdFromRoute
        }
      } else {
        setTimeout(checkAndSelect, 100)
      }
    }
    checkAndSelect()
  }
})
</script>

<template>
  <div class="table-data-page">
    <!-- 表选择区域（非预览模式显示） -->
    <ElCard v-if="!isPreviewMode" class="table-select-card">
      <div class="table-select-bar">
        <div class="select-item">
          <span class="select-label">选择数据表</span>
          <ElSelect
            v-model="selectedTableId"
            placeholder="请选择要管理的数据表"
            style="width: 300px"
            filterable
          >
            <ElOption
              v-for="table in tableHeads"
              :key="table.id"
              :label="`${table.tableName} - ${table.tableTxt}`"
              :value="table.id"
            />
          </ElSelect>
        </div>
      </div>
    </ElCard>

    <!-- 附表提示信息 -->
    <ElCard v-if="isSubTable && selectedTableId" class="sub-table-tip-card" v-show="false">
      <div class="sub-table-tip">
        <el-icon :size="18" color="#e6a23c">
          <Warning />
        </el-icon>
        <span class="tip-text">这是一个附表，数据将关联到主表。附表数据需要在主表数据录入时同时录入，或通过主表数据详情查看和编辑。</span>
      </div>
    </ElCard>

    <!-- 查询表单区域 -->
    <ElCard v-if="selectedTableId && queryFields.length > 0" class="query-card">
      <div class="query-header" @click="queryFormExpanded = !queryFormExpanded">
        <span class="query-title">查询条件</span>
        <ElButton type="primary" link size="small">
          {{ queryFormExpanded ? '收起' : '展开' }}
        </ElButton>
      </div>
      <div v-show="queryFormExpanded" class="query-form-content">
        <div class="query-items">
          <template v-for="field in queryFields" :key="field.dbFieldName">
            <div v-if="field.queryType === 'between'" class="query-item-between">
              <span class="query-label">
                {{ field.dbFieldTxt || field.dbFieldName }}
              </span>
              <div class="between-inputs">
                <!-- 日期类型区间查询 -->
                <template v-if="['date', 'datetime'].includes(field.dbType)">
                  <ElDatePicker
                    v-model="queryParams[`${field.dbFieldNameAlias || field.dbFieldName}Start`]"
                    :type="field.dbType === 'date' ? 'date' : 'datetime'"
                    placeholder="开始时间"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 180px"
                  />
                  <span class="between-separator">至</span>
                  <ElDatePicker
                    v-model="queryParams[`${field.dbFieldNameAlias || field.dbFieldName}End`]"
                    :type="field.dbType === 'date' ? 'date' : 'datetime'"
                    placeholder="结束时间"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 180px"
                  />
                </template>
                <!-- 数字类型区间查询 -->
                <template v-else-if="['int', 'bigint', 'tinyint', 'decimal'].includes(field.dbType)">
                  <ElInputNumber
                    v-model="queryParams[`${field.dbFieldNameAlias || field.dbFieldName}Start`]"
                    placeholder="最小值"
                    :controls="false"
                    style="width: 140px"
                  />
                  <span class="between-separator">至</span>
                  <ElInputNumber
                    v-model="queryParams[`${field.dbFieldNameAlias || field.dbFieldName}End`]"
                    placeholder="最大值"
                    :controls="false"
                    style="width: 140px"
                  />
                </template>
              </div>
            </div>
            <div v-else class="query-item">
              <span class="query-label">
                {{ field.dbFieldTxt || field.dbFieldName }}
              </span>
              <!-- 下拉选择/单选/多选控件 -->
              <template v-if="['select', 'selectMultiple', 'radio', 'checkbox'].includes(field.controlType)">
                <ElSelect
                  v-if="field.controlType === 'select' || field.queryType === 'eq'"
                  v-model="queryParams[field.dbFieldNameAlias || field.dbFieldName]"
                  :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                  clearable
                  style="width: 180px"
                >
                  <ElOption
                    v-for="opt in getFieldOptions(field)"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </ElSelect>
                <ElSelect
                  v-else-if="field.controlType === 'selectMultiple' || field.queryType === 'in'"
                  v-model="queryParams[field.dbFieldNameAlias || field.dbFieldName]"
                  :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                  multiple
                  clearable
                  style="width: 220px"
                >
                  <ElOption
                    v-for="opt in getFieldOptions(field)"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </ElSelect>
              </template>
              <!-- 日期选择器 -->
              <ElDatePicker
                v-else-if="['datePicker', 'datetimePicker'].includes(field.controlType) || ['date', 'datetime'].includes(field.dbType)"
                v-model="queryParams[field.dbFieldNameAlias || field.dbFieldName]"
                :type="field.dbType === 'date' ? 'date' : 'datetime'"
                :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                value-format="YYYY-MM-DD HH:mm:ss"
                clearable
                style="width: 180px"
              />
              <!-- 数字输入 -->
              <ElInputNumber
                v-else-if="['inputNumber'].includes(field.controlType) || ['int', 'bigint', 'tinyint', 'decimal'].includes(field.dbType)"
                v-model="queryParams[field.dbFieldNameAlias || field.dbFieldName]"
                :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                :controls="false"
                clearable
                style="width: 180px"
              />
              <!-- 文本输入（默认） -->
              <ElInput
                v-else
                v-model="queryParams[field.dbFieldNameAlias || field.dbFieldName]"
                :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                clearable
                style="width: 180px"
                @keyup.enter="handleSearch"
              />
            </div>
          </template>
        </div>
        <div class="query-actions">
          <ElButton type="primary" @click="handleSearch">查询</ElButton>
          <ElButton @click="handleReset">重置</ElButton>
        </div>
      </div>
    </ElCard>

    <!-- 数据列表区域 -->
    <ElCard v-if="selectedTableId" class="data-card">
      <!-- 操作栏 -->
      <div class="action-bar">
        <!-- 附表不允许单独新增数据 -->
        <ElButton
          v-if="!isSubTable"
          type="primary"
          @click="openAddDialog"
        >
          新增数据
        </ElButton>
        <ElButton
          v-if="isSubTable"
          type="primary"
          disabled
          title="附表数据需要在主表数据录入时同时录入"
        >
          新增数据（需通过主表操作）
        </ElButton>
        <ElButton
          type="danger"
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </ElButton>
        <div class="table-info">
          <ElTag v-if="!isPreviewMode" type="primary">{{ selectedTableConfig?.tableName }}</ElTag>
          <span class="table-txt" v-if="!isPreviewMode">{{ selectedTableConfig?.tableTxt }}</span>
        </div>
      </div>

      <!-- 数据表格 -->
      <ElTable
        v-loading="loading"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
        max-height="500"
      >
        <ElTableColumn
          v-if="selectedTableConfig?.isCheckbox === 'Y'"
          type="selection"
          width="50"
          align="center"
        />
        <ElTableColumn type="index" label="序号" width="60" align="center" />
        
        <!-- 动态列 -->
        <ElTableColumn
          v-for="field in listFields"
          :key="field.dbFieldName"
          :prop="field.dbFieldNameAlias || field.dbFieldName"
          :label="field.dbFieldTxt || field.dbFieldName"
          :min-width="['text', 'longtext'].includes(field.dbType) ? 200 : 120"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <ElTag
              v-if="['status', 'order_status', 'orderStatus'].includes(field.dbFieldName)"
              :type="getStatusTagType(row[field.dbFieldNameAlias || field.dbFieldName], field)"
              size="small"
            >
              {{ formatValue(row[field.dbFieldNameAlias || field.dbFieldName], field) }}
            </ElTag>
            <span v-else>
              {{ formatValue(row[field.dbFieldNameAlias || field.dbFieldName], field) }}
            </span>
          </template>
        </ElTableColumn>

        <!-- 操作列 -->
        <ElTableColumn label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton type="primary" link size="small" @click="openDetailDialog(row)">详情</ElButton>
            <ElButton type="primary" link size="small" @click="openEditDialog(row)">编辑</ElButton>
            <ElButton type="danger" link size="small" @click="handleDelete(row)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>

    <!-- 空状态 -->
    <ElCard v-else class="empty-card">
      <ElEmpty description="请先选择一个数据表">
        <template #image>
          <div class="empty-hint">
            <el-icon :size="60" color="#909399">
              <DataAnalysis />
            </el-icon>
            <p>请从上方选择要管理的数据表</p>
          </div>
        </template>
      </ElEmpty>
    </ElCard>

    <!-- 新增/编辑弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :width="dialogWidth"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <!-- 主表表单（始终显示在顶部） -->
      <div class="main-table-section">
        <div class="section-title">主表数据</div>
        <ElForm
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
          class="data-form"
        >
          <div 
            class="form-grid" 
            :style="{ 
              gridTemplateColumns: `repeat(${formColumns}, 1fr)` 
            }"
          >
            <ElFormItem
              v-for="(field, index) in formFields"
              :key="field.dbFieldName"
              :label="field.dbFieldTxt || field.dbFieldName"
              :prop="field.dbFieldNameAlias || field.dbFieldName"
              :class="getFieldItemClass(field)"
              :style="getFieldItemStyle(field, index, formFields)"
            >
              <!-- 文本框 -->
              <ElInput
                v-if="getControlType(field) === 'input'"
                v-model="formData[field.dbFieldNameAlias || field.dbFieldName]"
                :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                :disabled="!isFieldEditable(field)"
                :maxlength="getFieldMaxLength(field)"
                show-word-limit
              />

              <!-- 密码框 -->
              <ElInput
                v-else-if="getControlType(field) === 'password'"
                v-model="formData[field.dbFieldNameAlias || field.dbFieldName]"
                type="password"
                show-password
                :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                :disabled="!isFieldEditable(field)"
                :maxlength="getFieldMaxLength(field)"
                show-word-limit
              />

              <!-- 文本域 -->
              <ElInput
                v-else-if="getControlType(field) === 'textarea'"
                v-model="formData[field.dbFieldNameAlias || field.dbFieldName]"
                type="textarea"
                :rows="3"
                :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                :disabled="!isFieldEditable(field)"
                :maxlength="getFieldMaxLength(field)"
                show-word-limit
              />

              <!-- 数字输入 -->
              <ElInputNumber
                v-else-if="getControlType(field) === 'inputNumber'"
                v-model="formData[field.dbFieldNameAlias || field.dbFieldName]"
                :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                :disabled="!isFieldEditable(field)"
                :controls="false"
                style="width: 100%"
              />

              <!-- 下拉单选 -->
              <ElSelect
                v-else-if="getControlType(field) === 'select'"
                v-model="formData[field.dbFieldNameAlias || field.dbFieldName]"
                :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                :disabled="!isFieldEditable(field)"
                style="width: 100%"
              >
                <ElOption
                  v-for="option in getFieldOptions(field)"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>

              <!-- 下拉多选 -->
              <ElSelect
                v-else-if="getControlType(field) === 'selectMultiple'"
                v-model="formData[field.dbFieldNameAlias || field.dbFieldName]"
                :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                :disabled="!isFieldEditable(field)"
                multiple
                style="width: 100%"
              >
                <ElOption
                  v-for="option in getFieldOptions(field)"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>

              <!-- 单选框 -->
              <ElRadioGroup
                v-else-if="getControlType(field) === 'radio'"
                v-model="formData[field.dbFieldNameAlias || field.dbFieldName]"
                :disabled="!isFieldEditable(field)"
              >
                <ElRadio
                  v-for="option in getFieldOptions(field)"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </ElRadio>
              </ElRadioGroup>

              <!-- 复选框 -->
              <ElCheckboxGroup
                v-else-if="getControlType(field) === 'checkbox'"
                v-model="formData[field.dbFieldNameAlias || field.dbFieldName]"
                :disabled="!isFieldEditable(field)"
              >
                <ElCheckbox
                  v-for="option in getFieldOptions(field)"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </ElCheckbox>
              </ElCheckboxGroup>

              <!-- 日期选择 -->
              <ElDatePicker
                v-else-if="getControlType(field) === 'datePicker'"
                v-model="formData[field.dbFieldNameAlias || field.dbFieldName]"
                type="date"
                :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                :disabled="!isFieldEditable(field)"
                :format="field.controlConfig?.dateFormat || 'YYYY-MM-DD'"
                :value-format="field.controlConfig?.dateFormat || 'YYYY-MM-DD'"
                style="width: 100%"
              />

              <!-- 日期时间选择 -->
              <ElDatePicker
                v-else-if="getControlType(field) === 'datetimePicker'"
                v-model="formData[field.dbFieldNameAlias || field.dbFieldName]"
                type="datetime"
                :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                :disabled="!isFieldEditable(field)"
                :format="field.controlConfig?.dateFormat || 'YYYY-MM-DD HH:mm:ss'"
                :value-format="field.controlConfig?.dateFormat || 'YYYY-MM-DD HH:mm:ss'"
                style="width: 100%"
              />

              <!-- 文件上传 -->
              <ElUpload
                v-else-if="getControlType(field) === 'upload'"
                v-model:file-list="formData[field.dbFieldNameAlias || field.dbFieldName]"
                :action="field.controlConfig?.uploadUrl || '/api/upload'"
                :multiple="field.controlConfig?.multiple || false"
                :limit="field.controlConfig?.limit || 1"
                :disabled="!isFieldEditable(field)"
                list-type="text"
              >
                <ElButton type="primary" size="small">
                  {{ field.controlConfig?.multiple ? '选择文件(多选)' : '选择文件' }}
                </ElButton>
                <template #tip>
                  <div class="el-upload__tip">
                    可上传类型: {{ field.controlConfig?.accept || '*' }}
                    {{ field.controlConfig?.maxSize ? `，单文件大小不超过 ${field.controlConfig.maxSize}MB` : '' }}
                  </div>
                </template>
              </ElUpload>

              <!-- 富文本 -->
              <RichTextEditor
                v-else-if="getControlType(field) === 'richText'"
                v-model="formData[field.dbFieldNameAlias || field.dbFieldName]"
                :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                :disabled="!isFieldEditable(field)"
                :height="250"
              />

              <!-- 默认输入框 -->
              <ElInput
                v-else
                v-model="formData[field.dbFieldNameAlias || field.dbFieldName]"
                :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                :disabled="!isFieldEditable(field)"
              />
            </ElFormItem>
          </div>
        </ElForm>
      </div>

      <!-- 附表数据Tab（主表有附表时显示，新增和编辑模式都显示） -->
      <div
        v-if="isMainTable && relatedSubTables.length > 0"
        class="sub-tables-section"
      >
        <div class="section-divider"></div>
        <div class="section-title">附表数据</div>
        <ElTabs
          v-if="relatedSubTables.length > 0"
          v-model="activeSubTableTab"
          class="form-tabs"
        >
          <ElTabPane
            v-for="(subTable, index) in relatedSubTables"
            :key="subTable.id"
            :label="subTable.tableTxt || subTable.tableName"
            :name="index"
          >
            <div class="sub-table-section">
              <!-- 一对一关系：直接渲染表单 -->
              <template v-if="isOneToOne(subTable)">
                <div
                  v-if="subTableDataMap[subTable.id] && subTableDataMap[subTable.id].length > 0"
                  class="one-to-one-form"
                >
                  <ElForm
                    :model="subTableDataMap[subTable.id][0]"
                    label-width="80px"
                    class="data-form"
                  >
                    <div 
                      class="form-grid" 
                      :style="{ 
                        gridTemplateColumns: `repeat(${subTable.formColumns || 2}, 1fr)` 
                      }"
                    >
                      <ElFormItem
                        v-for="(field, index) in getSubTableFormFields(subTable)"
                        :key="field.dbFieldName"
                        :label="field.dbFieldTxt || field.dbFieldName"
                        :class="getFieldItemClass(field)"
                        :style="getFieldItemStyle(field, index, getSubTableFormFields(subTable), subTable.formColumns || 2)"
                      >
                        <!-- 文本框 -->
                        <ElInput
                          v-if="getControlType(field) === 'input'"
                          v-model="subTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="!isFieldEditable(field)"
                          :maxlength="getFieldMaxLength(field)"
                          show-word-limit
                        />

                        <!-- 密码框 -->
                        <ElInput
                          v-else-if="getControlType(field) === 'password'"
                          v-model="subTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          type="password"
                          show-password
                          :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="!isFieldEditable(field)"
                          :maxlength="getFieldMaxLength(field)"
                          show-word-limit
                        />

                        <!-- 文本域 -->
                        <ElInput
                          v-else-if="getControlType(field) === 'textarea'"
                          v-model="subTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          type="textarea"
                          :rows="3"
                          :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="!isFieldEditable(field)"
                          :maxlength="getFieldMaxLength(field)"
                          show-word-limit
                        />

                        <!-- 数字输入 -->
                        <ElInputNumber
                          v-else-if="getControlType(field) === 'inputNumber'"
                          v-model="subTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="field.isReadOnly"
                          :controls="false"
                          style="width: 100%"
                        />

                        <!-- 下拉单选 -->
                        <ElSelect
                          v-else-if="getControlType(field) === 'select'"
                          v-model="subTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="field.isReadOnly"
                          style="width: 100%"
                        >
                          <ElOption
                            v-for="option in getFieldOptions(field)"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                          />
                        </ElSelect>

                        <!-- 下拉多选 -->
                        <ElSelect
                          v-else-if="getControlType(field) === 'selectMultiple'"
                          v-model="subTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="field.isReadOnly"
                          multiple
                          style="width: 100%"
                        >
                          <ElOption
                            v-for="option in getFieldOptions(field)"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                          />
                        </ElSelect>

                        <!-- 单选框 -->
                        <ElRadioGroup
                          v-else-if="getControlType(field) === 'radio'"
                          v-model="subTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          :disabled="field.isReadOnly"
                        >
                          <ElRadio
                            v-for="option in getFieldOptions(field)"
                            :key="option.value"
                            :value="option.value"
                          >
                            {{ option.label }}
                          </ElRadio>
                        </ElRadioGroup>

                        <!-- 复选框 -->
                        <ElCheckboxGroup
                          v-else-if="getControlType(field) === 'checkbox'"
                          v-model="subTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          :disabled="field.isReadOnly"
                        >
                          <ElCheckbox
                            v-for="option in getFieldOptions(field)"
                            :key="option.value"
                            :value="option.value"
                          >
                            {{ option.label }}
                          </ElCheckbox>
                        </ElCheckboxGroup>

                        <!-- 日期选择 -->
                        <ElDatePicker
                          v-else-if="getControlType(field) === 'datePicker'"
                          v-model="subTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          type="date"
                          :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="field.isReadOnly"
                          :format="field.controlConfig?.dateFormat || 'YYYY-MM-DD'"
                          :value-format="field.controlConfig?.dateFormat || 'YYYY-MM-DD'"
                          style="width: 100%"
                        />

                        <!-- 日期时间选择 -->
                        <ElDatePicker
                          v-else-if="getControlType(field) === 'datetimePicker'"
                          v-model="subTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          type="datetime"
                          :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="field.isReadOnly"
                          :format="field.controlConfig?.dateFormat || 'YYYY-MM-DD HH:mm:ss'"
                          :value-format="field.controlConfig?.dateFormat || 'YYYY-MM-DD HH:mm:ss'"
                          style="width: 100%"
                        />

                        <!-- 文件上传 -->
                        <ElUpload
                          v-else-if="getControlType(field) === 'upload'"
                          v-model:file-list="subTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          :action="field.controlConfig?.uploadUrl || '/api/upload'"
                          :multiple="field.controlConfig?.multiple || false"
                          :limit="field.controlConfig?.limit || 1"
                          :disabled="field.isReadOnly"
                          list-type="text"
                        >
                          <ElButton type="primary" size="small">
                            {{ field.controlConfig?.multiple ? '选择文件(多选)' : '选择文件' }}
                          </ElButton>
                        </ElUpload>

                        <!-- 富文本 -->
                        <RichTextEditor
                          v-else-if="getControlType(field) === 'richText'"
                          v-model="subTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="field.isReadOnly"
                          :height="200"
                        />

                        <!-- 默认输入框 -->
                        <ElInput
                          v-else
                          v-model="subTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="field.isReadOnly"
                        />
                      </ElFormItem>
                    </div>
                  </ElForm>
                </div>
              </template>

              <!-- 一对多关系：表格样式展示 -->
              <template v-else>
                <div class="sub-table-header">
                  <span class="sub-table-title">{{ subTable.tableTxt || subTable.tableName }}</span>
                  <ElButton type="primary" size="small" @click="addSubTableRow(subTable.id)">
                    添加明细
                  </ElButton>
                </div>

                <div
                  v-if="subTableDataMap[subTable.id] && subTableDataMap[subTable.id].length > 0"
                  class="sub-table-table-wrapper"
                >
                  <ElTable :data="subTableDataMap[subTable.id]" border stripe>
                    <!-- 序号列 -->
                    <ElTableColumn type="index" label="序号" width="60" align="center" />

                    <!-- 动态列 -->
                    <ElTableColumn
                      v-for="field in getSubTableFormFields(subTable)"
                      :key="field.dbFieldName"
                      :label="field.dbFieldTxt || field.dbFieldName"
                      :min-width="120"
                      align="center"
                    >
                      <template #default="{ row }">
                        <!-- 文本框 -->
                        <ElInput
                          v-if="getControlType(field) === 'input'"
                          v-model="row[field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="field.isReadOnly"
                          size="small"
                        />

                        <!-- 文本域 -->
                        <ElInput
                          v-else-if="getControlType(field) === 'textarea'"
                          v-model="row[field.dbFieldNameAlias || field.dbFieldName]"
                          type="textarea"
                          :rows="2"
                          :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="field.isReadOnly"
                          size="small"
                        />

                        <!-- 数字输入 -->
                        <ElInputNumber
                          v-else-if="getControlType(field) === 'inputNumber'"
                          v-model="row[field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="field.isReadOnly"
                          :controls="false"
                          size="small"
                          style="width: 100%"
                        />

                        <!-- 下拉单选 -->
                        <ElSelect
                          v-else-if="getControlType(field) === 'select'"
                          v-model="row[field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="field.isReadOnly"
                          size="small"
                          style="width: 100%"
                        >
                          <ElOption
                            v-for="option in getFieldOptions(field)"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                          />
                        </ElSelect>

                        <!-- 下拉多选 -->
                        <ElSelect
                          v-else-if="getControlType(field) === 'selectMultiple'"
                          v-model="row[field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="field.isReadOnly"
                          multiple
                          size="small"
                          style="width: 100%"
                        >
                          <ElOption
                            v-for="option in getFieldOptions(field)"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                          />
                        </ElSelect>

                        <!-- 单选框 -->
                        <ElRadioGroup
                          v-else-if="getControlType(field) === 'radio'"
                          v-model="row[field.dbFieldNameAlias || field.dbFieldName]"
                          :disabled="field.isReadOnly"
                          size="small"
                        >
                          <ElRadio
                            v-for="option in getFieldOptions(field)"
                            :key="option.value"
                            :value="option.value"
                          >
                            {{ option.label }}
                          </ElRadio>
                        </ElRadioGroup>

                        <!-- 复选框 -->
                        <ElCheckboxGroup
                          v-else-if="getControlType(field) === 'checkbox'"
                          v-model="row[field.dbFieldNameAlias || field.dbFieldName]"
                          :disabled="field.isReadOnly"
                          size="small"
                        >
                          <ElCheckbox
                            v-for="option in getFieldOptions(field)"
                            :key="option.value"
                            :value="option.value"
                          >
                            {{ option.label }}
                          </ElCheckbox>
                        </ElCheckboxGroup>

                        <!-- 日期选择 -->
                        <ElDatePicker
                          v-else-if="getControlType(field) === 'datePicker'"
                          v-model="row[field.dbFieldNameAlias || field.dbFieldName]"
                          type="date"
                          :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="field.isReadOnly"
                          :format="field.controlConfig?.dateFormat || 'YYYY-MM-DD'"
                          :value-format="field.controlConfig?.dateFormat || 'YYYY-MM-DD'"
                          size="small"
                          style="width: 100%"
                        />

                        <!-- 日期时间选择 -->
                        <ElDatePicker
                          v-else-if="getControlType(field) === 'datetimePicker'"
                          v-model="row[field.dbFieldNameAlias || field.dbFieldName]"
                          type="datetime"
                          :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="field.isReadOnly"
                          :format="field.controlConfig?.dateFormat || 'YYYY-MM-DD HH:mm:ss'"
                          :value-format="field.controlConfig?.dateFormat || 'YYYY-MM-DD HH:mm:ss'"
                          size="small"
                          style="width: 100%"
                        />

                        <!-- 文件上传 -->
                        <ElUpload
                          v-else-if="getControlType(field) === 'upload'"
                          v-model:file-list="row[field.dbFieldNameAlias || field.dbFieldName]"
                          :action="field.controlConfig?.uploadUrl || '/api/upload'"
                          :multiple="field.controlConfig?.multiple || false"
                          :limit="field.controlConfig?.limit || 1"
                          :disabled="field.isReadOnly"
                          list-type="text"
                          size="small"
                        >
                          <ElButton type="primary" link size="small">
                            选择文件
                          </ElButton>
                        </ElUpload>

                        <!-- 富文本（表格中不显示富文本编辑器，用文本框替代） -->
                        <ElInput
                          v-else-if="getControlType(field) === 'richText'"
                          v-model="row[field.dbFieldNameAlias || field.dbFieldName]"
                          type="textarea"
                          :rows="2"
                          :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="field.isReadOnly"
                          size="small"
                        />

                        <!-- 默认输入框 -->
                        <ElInput
                          v-else
                          v-model="row[field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                          :disabled="field.isReadOnly"
                          size="small"
                        />
                      </template>
                    </ElTableColumn>

                    <!-- 操作列 -->
                    <ElTableColumn label="操作" width="80" align="center">
                      <template #default="{ $index }">
                        <ElButton
                          type="danger"
                          link
                          size="small"
                          @click="removeSubTableRow(subTable.id, $index)"
                        >
                          删除
                        </ElButton>
                      </template>
                    </ElTableColumn>
                  </ElTable>
                </div>

                <ElEmpty
                  v-else
                  description="暂无明细数据，点击上方按钮添加"
                  :image-size="80"
                />
              </template>
            </div>
          </ElTabPane>
        </ElTabs>
      </div>

      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 详情弹窗（样式与编辑/新增一致，只读状态） -->
    <ElDialog
      v-model="detailVisible"
      title="数据详情"
      :width="dialogWidth"
      destroy-on-close
    >
      <!-- 主表表单（始终显示在顶部，只读） -->
      <div class="main-table-section">
        <div class="section-title">主表数据</div>
        <ElForm
          label-width="100px"
          class="data-form"
        >
          <div 
            class="form-grid" 
            :style="{ 
              gridTemplateColumns: `repeat(${formColumns}, 1fr)` 
            }"
          >
            <ElFormItem
              v-for="(field, index) in formFields"
              :key="field.dbFieldName"
              :label="field.dbFieldTxt || field.dbFieldName"
              :class="getFieldItemClass(field)"
              :style="getFieldItemStyle(field, index, formFields)"
            >
              <!-- 文本框 -->
              <ElInput
                v-if="getControlType(field) === 'input'"
                :model-value="detailData?.[field.dbFieldNameAlias || field.dbFieldName]"
                :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                disabled
              />

              <!-- 密码框（详情模式下掩码显示） -->
              <ElInput
                v-else-if="getControlType(field) === 'password'"
                type="password"
                :model-value="detailData?.[field.dbFieldNameAlias || field.dbFieldName]"
                :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                disabled
              />

              <!-- 文本域 -->
              <ElInput
                v-else-if="getControlType(field) === 'textarea'"
                :model-value="detailData?.[field.dbFieldNameAlias || field.dbFieldName]"
                type="textarea"
                :rows="3"
                :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                disabled
              />

              <!-- 数字输入 -->
              <ElInputNumber
                v-else-if="getControlType(field) === 'inputNumber'"
                :model-value="detailData?.[field.dbFieldNameAlias || field.dbFieldName]"
                :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                disabled
                :controls="false"
                style="width: 100%"
              />

              <!-- 下拉单选 -->
              <ElSelect
                v-else-if="getControlType(field) === 'select'"
                :model-value="detailData?.[field.dbFieldNameAlias || field.dbFieldName]"
                :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                disabled
                style="width: 100%"
              >
                <ElOption
                  v-for="option in getFieldOptions(field)"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>

              <!-- 下拉多选 -->
              <ElSelect
                v-else-if="getControlType(field) === 'selectMultiple'"
                :model-value="detailData?.[field.dbFieldNameAlias || field.dbFieldName]"
                :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                disabled
                multiple
                style="width: 100%"
              >
                <ElOption
                  v-for="option in getFieldOptions(field)"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>

              <!-- 单选框 -->
              <ElRadioGroup
                v-else-if="getControlType(field) === 'radio'"
                :model-value="detailData?.[field.dbFieldNameAlias || field.dbFieldName]"
                disabled
              >
                <ElRadio
                  v-for="option in getFieldOptions(field)"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </ElRadio>
              </ElRadioGroup>

              <!-- 复选框 -->
              <ElCheckboxGroup
                v-else-if="getControlType(field) === 'checkbox'"
                :model-value="detailData?.[field.dbFieldNameAlias || field.dbFieldName]"
                disabled
              >
                <ElCheckbox
                  v-for="option in getFieldOptions(field)"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </ElCheckbox>
              </ElCheckboxGroup>

              <!-- 日期选择 -->
              <ElDatePicker
                v-else-if="getControlType(field) === 'datePicker'"
                :model-value="detailData?.[field.dbFieldNameAlias || field.dbFieldName]"
                type="date"
                :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                disabled
                :format="field.controlConfig?.dateFormat || 'YYYY-MM-DD'"
                :value-format="field.controlConfig?.dateFormat || 'YYYY-MM-DD'"
                style="width: 100%"
              />

              <!-- 日期时间选择 -->
              <ElDatePicker
                v-else-if="getControlType(field) === 'datetimePicker'"
                :model-value="detailData?.[field.dbFieldNameAlias || field.dbFieldName]"
                type="datetime"
                :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                disabled
                :format="field.controlConfig?.dateFormat || 'YYYY-MM-DD HH:mm:ss'"
                :value-format="field.controlConfig?.dateFormat || 'YYYY-MM-DD HH:mm:ss'"
                style="width: 100%"
              />

              <!-- 文件上传（只读模式显示文件名） -->
              <div
                v-else-if="getControlType(field) === 'upload'"
                class="upload-readonly"
              >
                <span v-if="detailData?.[field.dbFieldNameAlias || field.dbFieldName]?.length > 0">
                  {{ detailData[field.dbFieldNameAlias || field.dbFieldName].length }} 个文件
                </span>
                <span v-else>无文件</span>
              </div>

              <!-- 富文本（只读模式显示HTML内容） -->
              <RichTextEditor
                v-else-if="getControlType(field) === 'richText'"
                :model-value="detailData?.[field.dbFieldNameAlias || field.dbFieldName]"
                :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                disabled
                :height="250"
              />

              <!-- 默认输入框 -->
              <ElInput
                v-else
                :model-value="detailData?.[field.dbFieldNameAlias || field.dbFieldName]"
                :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                disabled
              />
            </ElFormItem>
          </div>
        </ElForm>
      </div>

      <!-- 附表数据Tab（主表有附表时显示，只读模式） -->
      <div
        v-if="isMainTable && relatedSubTables.length > 0"
        class="sub-tables-section"
      >
        <div class="section-divider"></div>
        <div class="section-title">附表数据</div>
        <ElTabs
          v-if="relatedSubTables.length > 0"
          class="form-tabs"
        >
          <ElTabPane
            v-for="subTable in relatedSubTables"
            :key="subTable.id"
            :label="subTable.tableTxt || subTable.tableName"
          >
            <div class="sub-table-section">
              <!-- 一对一关系：直接渲染表单（只读） -->
              <template v-if="isOneToOne(subTable)">
                <div
                  v-if="detailSubTableDataMap[subTable.id] && detailSubTableDataMap[subTable.id].length > 0"
                  class="one-to-one-form"
                >
                  <ElForm
                    :model="detailSubTableDataMap[subTable.id][0]"
                    label-width="80px"
                    class="data-form"
                  >
                    <div 
                      class="form-grid" 
                      :style="{ 
                        gridTemplateColumns: `repeat(${subTable.formColumns || 2}, 1fr)` 
                      }"
                    >
                      <ElFormItem
                        v-for="(field, index) in getSubTableFormFields(subTable)"
                        :key="field.dbFieldName"
                        :label="field.dbFieldTxt || field.dbFieldName"
                        :class="getFieldItemClass(field)"
                        :style="getFieldItemStyle(field, index, getSubTableFormFields(subTable), subTable.formColumns || 2)"
                      >
                        <!-- 文本框 -->
                        <ElInput
                          v-if="getControlType(field) === 'input'"
                          :model-value="detailSubTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                          disabled
                        />

                        <!-- 密码框（详情模式下掩码显示） -->
                        <ElInput
                          v-else-if="getControlType(field) === 'password'"
                          type="password"
                          :model-value="detailSubTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                          disabled
                        />

                        <!-- 文本域 -->
                        <ElInput
                          v-else-if="getControlType(field) === 'textarea'"
                          :model-value="detailSubTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          type="textarea"
                          :rows="3"
                          :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                          disabled
                        />

                        <!-- 数字输入 -->
                        <ElInputNumber
                          v-else-if="getControlType(field) === 'inputNumber'"
                          :model-value="detailSubTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                          disabled
                          :controls="false"
                          style="width: 100%"
                        />

                        <!-- 下拉单选 -->
                        <ElSelect
                          v-else-if="getControlType(field) === 'select'"
                          :model-value="detailSubTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                          disabled
                          style="width: 100%"
                        >
                          <ElOption
                            v-for="option in getFieldOptions(field)"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                          />
                        </ElSelect>

                        <!-- 下拉多选 -->
                        <ElSelect
                          v-else-if="getControlType(field) === 'selectMultiple'"
                          :model-value="detailSubTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                          disabled
                          multiple
                          style="width: 100%"
                        >
                          <ElOption
                            v-for="option in getFieldOptions(field)"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                          />
                        </ElSelect>

                        <!-- 单选框 -->
                        <ElRadioGroup
                          v-else-if="getControlType(field) === 'radio'"
                          :model-value="detailSubTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          disabled
                        >
                          <ElRadio
                            v-for="option in getFieldOptions(field)"
                            :key="option.value"
                            :value="option.value"
                          >
                            {{ option.label }}
                          </ElRadio>
                        </ElRadioGroup>

                        <!-- 复选框 -->
                        <ElCheckboxGroup
                          v-else-if="getControlType(field) === 'checkbox'"
                          :model-value="detailSubTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          disabled
                        >
                          <ElCheckbox
                            v-for="option in getFieldOptions(field)"
                            :key="option.value"
                            :value="option.value"
                          >
                            {{ option.label }}
                          </ElCheckbox>
                        </ElCheckboxGroup>

                        <!-- 日期选择 -->
                        <ElDatePicker
                          v-else-if="getControlType(field) === 'datePicker'"
                          :model-value="detailSubTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          type="date"
                          :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                          disabled
                          :format="field.controlConfig?.dateFormat || 'YYYY-MM-DD'"
                          :value-format="field.controlConfig?.dateFormat || 'YYYY-MM-DD'"
                          style="width: 100%"
                        />

                        <!-- 日期时间选择 -->
                        <ElDatePicker
                          v-else-if="getControlType(field) === 'datetimePicker'"
                          :model-value="detailSubTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          type="datetime"
                          :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
                          disabled
                          :format="field.controlConfig?.dateFormat || 'YYYY-MM-DD HH:mm:ss'"
                          :value-format="field.controlConfig?.dateFormat || 'YYYY-MM-DD HH:mm:ss'"
                          style="width: 100%"
                        />

                        <!-- 富文本 -->
                        <RichTextEditor
                          v-else-if="getControlType(field) === 'richText'"
                          :model-value="detailSubTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                          disabled
                          :height="200"
                        />

                        <!-- 默认输入框 -->
                        <ElInput
                          v-else
                          :model-value="detailSubTableDataMap[subTable.id][0][field.dbFieldNameAlias || field.dbFieldName]"
                          :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
                          disabled
                        />
                      </ElFormItem>
                    </div>
                  </ElForm>
                </div>
                <ElEmpty
                  v-else
                  description="暂无附表数据"
                  :image-size="60"
                />
              </template>

              <!-- 一对多关系：表格样式展示（只读） -->
              <template v-else>
                <div
                  v-if="detailSubTableDataMap[subTable.id] && detailSubTableDataMap[subTable.id].length > 0"
                  class="sub-table-table-wrapper"
                >
                  <ElTable :data="detailSubTableDataMap[subTable.id]" border stripe>
                    <!-- 序号列 -->
                    <ElTableColumn type="index" label="序号" width="60" align="center" />

                    <!-- 动态列 -->
                    <ElTableColumn
                      v-for="field in getSubTableFormFields(subTable)"
                      :key="field.dbFieldName"
                      :label="field.dbFieldTxt || field.dbFieldName"
                      :min-width="120"
                      align="center"
                    >
                      <template #default="{ row }">
                        <!-- 文本框（只读显示值） -->
                        <span v-if="['input', 'textarea'].includes(getControlType(field))">
                          {{ row[field.dbFieldNameAlias || field.dbFieldName] || '-' }}
                        </span>

                        <!-- 数字输入（只读显示值） -->
                        <span v-else-if="getControlType(field) === 'inputNumber'">
                          {{ row[field.dbFieldNameAlias || field.dbFieldName] ?? '-' }}
                        </span>

                        <!-- 下拉单选（显示标签） -->
                        <ElTag
                          v-else-if="getControlType(field) === 'select'"
                          size="small"
                        >
                          {{ getOptionLabel(row[field.dbFieldNameAlias || field.dbFieldName], field) }}
                        </ElTag>

                        <!-- 下拉多选（显示标签） -->
                        <div v-else-if="getControlType(field) === 'selectMultiple'">
                          <ElTag
                            v-for="val in (row[field.dbFieldNameAlias || field.dbFieldName] || [])"
                            :key="val"
                            size="small"
                            class="mr-2"
                          >
                            {{ getOptionLabel(val, field) }}
                          </ElTag>
                        </div>

                        <!-- 单选框（显示标签） -->
                        <ElTag
                          v-else-if="getControlType(field) === 'radio'"
                          size="small"
                        >
                          {{ getOptionLabel(row[field.dbFieldNameAlias || field.dbFieldName], field) }}
                        </ElTag>

                        <!-- 复选框（显示标签） -->
                        <div v-else-if="getControlType(field) === 'checkbox'">
                          <ElTag
                            v-for="val in (row[field.dbFieldNameAlias || field.dbFieldName] || [])"
                            :key="val"
                            size="small"
                            class="mr-2"
                          >
                            {{ getOptionLabel(val, field) }}
                          </ElTag>
                        </div>

                        <!-- 日期/日期时间 -->
                        <span v-else-if="['datePicker', 'datetimePicker'].includes(getControlType(field))">
                          {{ row[field.dbFieldNameAlias || field.dbFieldName] || '-' }}
                        </span>

                        <!-- 默认显示值 -->
                        <span v-else>
                          {{ row[field.dbFieldNameAlias || field.dbFieldName] || '-' }}
                        </span>
                      </template>
                    </ElTableColumn>
                  </ElTable>
                </div>

                <ElEmpty
                  v-else
                  description="暂无明细数据"
                  :image-size="60"
                />
              </template>
            </div>
          </ElTabPane>
        </ElTabs>
      </div>

      <template #footer>
        <ElButton @click="detailVisible = false">关闭</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.table-data-page {
  padding: 20px;
}

.table-select-card {
  margin-bottom: 16px;
}

.table-select-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.select-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-label {
  color: #606266;
  white-space: nowrap;
}

.data-card {
  margin-bottom: 16px;
}

.empty-card {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-hint {
  text-align: center;
  color: #909399;
}

.empty-hint p {
  margin-top: 16px;
  font-size: 14px;
}

.action-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.table-txt {
  color: #909399;
  font-size: 13px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 24px;
  align-items: start;
}

.form-grid :deep(.el-form-item) {
  margin-bottom: 18px;
}

.form-grid :deep(.form-item-full) {
  grid-column: span 2;
}

.form-grid :deep(.el-input),
.form-grid :deep(.el-select),
.form-grid :deep(.el-date-editor) {
  width: 100%;
}

/* 表单Tabs样式 */
.form-tabs {
  width: 100%;
}

/* 附表区域样式 */
.sub-table-section {
  width: 100%;
}

.sub-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #EBEEF5;
}

.sub-table-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

/* 附表列表样式 */
.sub-table-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.sub-table-row {
  background: #FAFAFA;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #E4E7ED;
}

.row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #DCDFE6;
}

.row-index {
  font-size: 14px;
  font-weight: 500;
  color: #409EFF;
}

.row-form {
  width: 100%;
}

.row-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 16px;
}

.row-form-grid :deep(.el-form-item) {
  margin-bottom: 12px;
}

.row-form-grid :deep(.form-item-full) {
  grid-column: span 2;
}

.row-form-grid :deep(.el-input),
.row-form-grid :deep(.el-input-number),
.row-form-grid :deep(.el-date-editor) {
  width: 100%;
}

/* 滚动条样式 */
.sub-table-list::-webkit-scrollbar {
  width: 6px;
}

.sub-table-list::-webkit-scrollbar-thumb {
  background: #C0C4CC;
  border-radius: 3px;
}

.sub-table-list::-webkit-scrollbar-track {
  background: #F2F6FC;
}

/* 主表区域样式 */
.main-table-section {
  width: 100%;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #409EFF;
}

/* 附表区域样式 */
.sub-tables-section {
  width: 100%;
  margin-top: 16px;
}

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #E4E7ED 50%, transparent 100%);
  margin: 20px 0;
}

.form-tabs {
  width: 100%;
}

.form-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.form-tabs :deep(.el-tab-pane) {
  padding: 0;
}

/* 查询表单样式 */
.query-card {
  margin-bottom: 16px;
}

.query-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  padding-bottom: 8px;
  border-bottom: 1px solid #EBEEF5;
  margin-bottom: 12px;
}

.query-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

.query-form-content {
  padding: 8px 0;
}

.query-items {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-bottom: 16px;
}

.query-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.query-item-between {
  display: flex;
  align-items: center;
  gap: 8px;
}

.query-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  white-space: nowrap;
  min-width: 80px;
}

.between-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.between-separator {
  color: #909399;
  white-space: nowrap;
}

.query-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  padding-top: 8px;
  border-top: 1px dashed #EBEEF5;
}
</style>
