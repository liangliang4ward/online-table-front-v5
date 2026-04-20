<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
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
  ElMessage,
  ElMessageBox,
  ElTag,
  ElTabs,
  ElTabPane,
  ElDivider,
  ElPopover,
  ElTooltip
} from 'element-plus'
import { pageQuery, queryById, insert, update, deleteById, batchDeleteByIds, syncDb } from '@/mock/tableHead'
import { pageQuery as queryDatasourceList } from '@/mock/datasource'

const router = useRouter()

const TABLE_TYPE_OPTIONS = [
  { label: '单表', value: 0 },
  { label: '主表', value: 1 },
  { label: '附表', value: 2 }
]

const SYNC_STATUS_OPTIONS = [
  { label: '已同步', value: 'Y' },
  { label: '未同步', value: 'N' }
]

// 数据库类型选项（MySQL字段类型）
const DB_TYPE_OPTIONS = [
  { label: 'varchar', value: 'varchar' },
  { label: 'int', value: 'int' },
  { label: 'bigint', value: 'bigint' },
  { label: 'tinyint', value: 'tinyint' },
  { label: 'decimal', value: 'decimal' },
  { label: 'date', value: 'date' },
  { label: 'datetime', value: 'datetime' },
  { label: 'text', value: 'text' },
  { label: 'longtext', value: 'longtext' }
]

const INDEX_TYPE_OPTIONS = [
  { label: '普通索引', value: 'normal' },
  { label: '唯一索引', value: 'unique' }
]

const ID_TYPE_OPTIONS = [
  { label: 'int', value: 'int' },
  { label: 'bigint', value: 'bigint' },
  { label: 'varchar', value: 'varchar' }
]

// 控件类型选项
const CONTROL_TYPE_OPTIONS = [
  { label: '文本框', value: 'input' },
  { label: '密码框', value: 'password' },
  { label: '文本域', value: 'textarea' },
  { label: '数字输入', value: 'inputNumber' },
  { label: '下拉选择(单选)', value: 'select' },
  { label: '下拉选择(多选)', value: 'selectMultiple' },
  { label: '单选框', value: 'radio' },
  { label: '复选框', value: 'checkbox' },
  { label: '日期选择', value: 'datePicker' },
  { label: '日期时间选择', value: 'datetimePicker' },
  { label: '文件上传', value: 'upload' },
  { label: '富文本', value: 'richText' }
]

// 查询方式选项
const QUERY_TYPE_OPTIONS = [
  { label: '不查询', value: 'none' },
  { label: '等于', value: 'eq' },
  { label: '模糊查询', value: 'like' },
  { label: '大于', value: 'gt' },
  { label: '小于', value: 'lt' },
  { label: '大于等于', value: 'gte' },
  { label: '小于等于', value: 'lte' },
  { label: '区间', value: 'between' },
  { label: '多选', value: 'in' }
]

// 数据来源类型选项
const DATA_SOURCE_TYPE_OPTIONS = [
  { label: '静态选项', value: 'static' },
  { label: '字典', value: 'dictionary' },
  { label: '接口', value: 'api' }
]

const SYSTEM_FIELDS = ['create_time', 'update_time', 'delete_flag']

const FIXED_NAME_FIELDS = ['id', 'create_by', 'update_by', ...SYSTEM_FIELDS]

const toCamelCase = (str) => {
  if (!str) return ''
  return str.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

// 获取默认控件类型（根据数据库类型推断）
const getDefaultControlType = (dbType) => {
  const map = {
    string: 'input',
    int: 'inputNumber',
    long: 'inputNumber',
    date: 'datePicker',
    datetime: 'datetimePicker',
    double: 'inputNumber',
    bigdecimal: 'inputNumber',
    text: 'textarea',
    blob: 'textarea'
  }
  return map[dbType] || 'input'
}

// 获取默认查询类型
const getDefaultQueryType = (dbType) => {
  if (['date', 'datetime'].includes(dbType)) {
    return 'between'
  }
  if (['int', 'long', 'double', 'bigdecimal'].includes(dbType)) {
    return 'eq'
  }
  return 'like'
}

// 判断是否允许小数点（只有decimal类型允许）
const isAllowDecimal = (dbType) => {
  return ['decimal'].includes(dbType)
}

// 根据数据库类型获取可用的控件类型选项
const getAvailableControlTypes = (dbType) => {
  const allTypes = [...CONTROL_TYPE_OPTIONS]
  
  // 根据数据库类型过滤控件类型
  switch (dbType) {
    case 'varchar':
    case 'text':
    case 'longtext':
      // 字符串/文本类型：允许文本框、文本域、下拉选择、单选、复选、文件上传、富文本
      // 不允许数字输入、日期选择、日期时间选择
      return allTypes.filter((t) => 
        !['inputNumber', 'datePicker', 'datetimePicker'].includes(t.value)
      )
    case 'int':
    case 'bigint':
    case 'tinyint':
      // 整型类型：允许数字输入、下拉选择、单选、复选
      // 不允许日期选择、日期时间选择、文件上传、富文本
      return allTypes.filter((t) => 
        !['datePicker', 'datetimePicker', 'upload', 'richText'].includes(t.value)
      )
    case 'date':
      // 日期类型：允许日期选择、文本框
      // 不允许数字输入、日期时间选择、下拉多选、复选、文件上传、富文本
      return allTypes.filter((t) => 
        ['input', 'textarea', 'datePicker', 'select', 'radio'].includes(t.value)
      )
    case 'datetime':
      // 日期时间类型：允许日期时间选择、文本框
      // 不允许数字输入、日期选择、下拉多选、复选、文件上传、富文本
      return allTypes.filter((t) => 
        ['input', 'textarea', 'datetimePicker', 'select', 'radio'].includes(t.value)
      )
    case 'decimal':
      // 小数类型：允许数字输入、下拉选择、单选、复选
      // 不允许日期选择、日期时间选择、文件上传、富文本
      return allTypes.filter((t) => 
        !['datePicker', 'datetimePicker', 'upload', 'richText'].includes(t.value)
      )
    default:
      return allTypes
  }
}

// 当前正在配置的字段
const currentConfigField = ref(null)

// 当前字段可用的控件类型
const availableControlTypes = computed(() => {
  if (!currentConfigField.value) {
    return CONTROL_TYPE_OPTIONS
  }
  return getAvailableControlTypes(currentConfigField.value.dbType)
})

const getDefaultFields = () => [
  {
    dbFieldName: 'id',
    dbFieldNameAlias: 'id',
    dbFieldTxt: '主键',
    dbType: 'varchar',
    dbLength: 36,
    dbPointLength: null,
    dbIsNull: false,
    dbIsKey: true,
    dbIsPersist: true,
    dbDefaultVal: '',
    isShowForm: false,
    isShowList: false,
    isQuery: false,
    isReadOnly: true,
    fieldMustInput: '0',
    controlType: 'input',
    queryType: 'none',
    controlConfig: {}
  },
  {
    dbFieldName: 'create_time',
    dbFieldNameAlias: 'createTime',
    dbFieldTxt: '创建时间',
    dbType: 'datetime',
    dbLength: null,
    dbPointLength: null,
    dbIsNull: true,
    dbIsKey: false,
    dbIsPersist: true,
    dbDefaultVal: '',
    isShowForm: false,
    isShowList: false,
    isQuery: false,
    isReadOnly: true,
    fieldMustInput: '0',
    controlType: 'datetimePicker',
    queryType: 'none',
    controlConfig: {}
  },
  {
    dbFieldName: 'update_time',
    dbFieldNameAlias: 'updateTime',
    dbFieldTxt: '更新时间',
    dbType: 'datetime',
    dbLength: null,
    dbPointLength: null,
    dbIsNull: true,
    dbIsKey: false,
    dbIsPersist: true,
    dbDefaultVal: '',
    isShowForm: false,
    isShowList: false,
    isQuery: false,
    isReadOnly: true,
    fieldMustInput: '0',
    controlType: 'datetimePicker',
    queryType: 'none',
    controlConfig: {}
  },
  {
    dbFieldName: 'create_by',
    dbFieldNameAlias: 'createBy',
    dbFieldTxt: '创建人',
    dbType: 'text',
    dbLength: 50,
    dbPointLength: null,
    dbIsNull: true,
    dbIsKey: false,
    dbIsPersist: true,
    dbDefaultVal: '100',
    isShowForm: false,
    isShowList: false,
    isQuery: false,
    isReadOnly: false,
    fieldMustInput: '0',
    controlType: 'input',
    queryType: 'none',
    controlConfig: {}
  },
  {
    dbFieldName: 'update_by',
    dbFieldNameAlias: 'updateBy',
    dbFieldTxt: '更新人',
    dbType: 'text',
    dbLength: 50,
    dbPointLength: null,
    dbIsNull: true,
    dbIsKey: false,
    dbIsPersist: true,
    dbDefaultVal: '100',
    isShowForm: false,
    isShowList: false,
    isQuery: false,
    isReadOnly: false,
    fieldMustInput: '0',
    controlType: 'input',
    queryType: 'none',
    controlConfig: {}
  },
  {
    dbFieldName: 'delete_flag',
    dbFieldNameAlias: 'deleteFlag',
    dbFieldTxt: '删除标记',
    dbType: 'int',
    dbLength: null,
    dbPointLength: null,
    dbIsNull: true,
    dbIsKey: false,
    dbIsPersist: true,
    dbDefaultVal: '0',
    isShowForm: false,
    isShowList: false,
    isQuery: false,
    isReadOnly: true,
    fieldMustInput: '0',
    controlType: 'inputNumber',
    queryType: 'none',
    controlConfig: {}
  }
]

const loading = ref(false)
const tableData = ref([])
const selectedRows = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增数据表')
const isEdit = ref(false)
const formRef = ref(null)
const activeTab = ref('fields')
const baseInfoExpanded = ref(true)
const datasourceOptions = ref([])
const queryParams = reactive({
  tableName: '',
  tableType: null,
  isDbSynch: '',
  pageNo: 1,
  pageSize: 10
})
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10
})

// 关联类型选项（移除多对一）
const RELATION_TYPE_OPTIONS = [
  { label: '一对多', value: 'one_to_many' },
  { label: '一对一', value: 'one_to_one' }
]

const FORM_COLUMNS_OPTIONS = [
  { label: '1列', value: 1 },
  { label: '2列', value: 2 },
  { label: '3列', value: 3 },
  { label: '4列', value: 4 }
]

const formData = reactive({
  id: null,
  tableName: '',
  tableTxt: '',
  tableType: 0,
  datasourceId: null,
  mainTable: '',
  isCheckbox: 'N',
  isPage: 'Y',
  isTree: 'N',
  formColumns: 2,
  relationConfig: {
    relationType: 'one_to_many',
    mainTableField: 'id',
    subTableField: 'main_table_id',
    relationFieldName: 'mainTableId'
  },
  fields: [],
  indexes: []
})

const mainTableOptions = ref([])

const baseFormRules = {
  tableName: [{ required: true, message: '请输入表名', trigger: 'blur' }],
  tableTxt: [{ required: true, message: '请输入表说明', trigger: 'blur' }],
  tableType: [{ required: true, message: '请选择表类型', trigger: 'change' }]
}

const indexDialogVisible = ref(false)
const indexDialogTitle = ref('新增索引')
const indexFormRef = ref(null)
const currentIndexIndex = ref(-1)
const indexFormData = reactive({
  indexName: '',
  indexType: 'normal',
  indexField: []
})
const indexFormRules = {
  indexName: [{ required: true, message: '请输入索引名称', trigger: 'blur' }],
  indexType: [{ required: true, message: '请选择索引类型', trigger: 'change' }],
  indexField: [{ required: true, message: '请选择索引字段', trigger: 'change', type: 'array' }]
}

const fieldOptions = computed(() => {
  return formData.fields.map((f) => ({
    label: f.dbFieldName,
    value: f.dbFieldName
  }))
})

// 主表字段选项（用于附表关联字段配置）
const mainTableFieldOptions = computed(() => {
  const mainTable = mainTableOptions.value.find((t) => t.tableName === formData.mainTable)
  if (!mainTable?.fields) return []
  return mainTable.fields.map((f) => ({
    label: f.dbFieldName,
    value: f.dbFieldName
  }))
})

// 附表字段选项
const subTableFieldOptions = computed(() => {
  return formData.fields.map((f) => ({
    label: f.dbFieldName,
    value: f.dbFieldName
  }))
})

// 预设校验规则
const PRESET_VALIDATION_RULES = [
  { label: '邮箱', value: 'email', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', message: '请输入正确的邮箱地址' },
  { label: '手机号', value: 'phone', pattern: '^1[3-9]\\d{9}$', message: '请输入正确的手机号' },
  { label: '身份证号', value: 'idCard', pattern: '(^\\d{15}$)|(^\\d{18}$)|(^\\d{17}(\\d|X|x)$)', message: '请输入正确的身份证号' },
  { label: 'URL', value: 'url', pattern: '^(https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*$', message: '请输入正确的URL地址' },
  { label: '数字', value: 'number', pattern: '^-?\\d+(\\.\\d+)?$', message: '请输入数字' },
  { label: '整数', value: 'integer', pattern: '^-?\\d+$', message: '请输入整数' },
  { label: '正整数', value: 'positiveInteger', pattern: '^[1-9]\\d*$', message: '请输入正整数' },
  { label: '中文', value: 'chinese', pattern: '^[\\u4e00-\\u9fa5]+$', message: '请输入中文' }
]

// 布局类型选项
const LAYOUT_TYPE_OPTIONS = [
  { label: '默认排列', value: 'default' },
  { label: '单独一行', value: 'fullRow' },
  { label: '换行', value: 'newLine' }
]

// 字段配置对话框相关
const fieldConfigDialogVisible = ref(false)
const currentFieldIndex = ref(-1)
const fieldConfigFormRef = ref(null)
const fieldConfigActiveTab = ref('display')
const fieldConfigFormData = reactive({
  controlType: 'input',
  queryType: 'none',
  isShowList: true,
  isShowForm: true,
  isEditable: true,
  isAddable: true,
  isShowInAdd: true,
  layoutType: 'default',
  controlConfig: {
    dataSourceType: 'static',
    dictionaryCode: '',
    options: [],
    apiUrl: '',
    apiMethod: 'GET',
    apiParams: {},
    dateFormat: '',
    multiple: false,
    limit: 1,
    fileTypes: [],
    maxSize: 10
  },
  validationRules: {
    required: false,
    minLength: null,
    maxLength: null,
    min: null,
    max: null,
    pattern: '',
    presetRule: '',
    message: ''
  }
})

// 打开字段配置对话框
const openFieldConfigDialog = (row, index) => {
  currentFieldIndex.value = index
  currentConfigField.value = row
  
  // 重置到显示与布局tab
  fieldConfigActiveTab.value = 'display'
  
  // 初始化表单数据
  fieldConfigFormData.controlType = row.controlType || getDefaultControlType(row.dbType)
  fieldConfigFormData.queryType = row.queryType || (row.isQuery ? getDefaultQueryType(row.dbType) : 'none')
  
  // 显示权限配置
  fieldConfigFormData.isShowList = row.isShowList !== false
  fieldConfigFormData.isShowForm = row.isShowForm !== false
  fieldConfigFormData.isEditable = row.isEditable !== false
  fieldConfigFormData.isAddable = row.isAddable !== false
  fieldConfigFormData.isShowInAdd = row.isShowInAdd !== false
  
  // 布局配置
  fieldConfigFormData.layoutType = row.layoutType || 'default'
  
  // 复制 controlConfig
  const controlConfig = row.controlConfig || {}
  fieldConfigFormData.controlConfig = {
    dataSourceType: controlConfig.dataSourceType || 'static',
    dictionaryCode: controlConfig.dictionaryCode || '',
    options: controlConfig.options ? [...controlConfig.options] : [],
    apiUrl: controlConfig.apiUrl || '',
    apiMethod: controlConfig.apiMethod || 'GET',
    apiParams: controlConfig.apiParams ? { ...controlConfig.apiParams } : {},
    dateFormat: controlConfig.dateFormat || '',
    multiple: controlConfig.multiple || false,
    limit: controlConfig.limit || 1,
    fileTypes: controlConfig.fileTypes ? [...controlConfig.fileTypes] : [],
    maxSize: controlConfig.maxSize || 10
  }
  
  // 复制 validationRules
  const validationRules = row.validationRules || {}
  fieldConfigFormData.validationRules = {
    required: validationRules.required || false,
    minLength: validationRules.minLength ?? null,
    maxLength: validationRules.maxLength ?? null,
    min: validationRules.min ?? null,
    max: validationRules.max ?? null,
    pattern: validationRules.pattern || '',
    presetRule: validationRules.presetRule || '',
    message: validationRules.message || ''
  }
  
  fieldConfigDialogVisible.value = true
}

// 保存字段配置
const handleFieldConfigSubmit = async () => {
  const valid = await fieldConfigFormRef.value?.validate().catch(() => false)
  if (!valid) return
  
  if (currentFieldIndex.value >= 0) {
    const field = formData.fields[currentFieldIndex.value]
    field.controlType = fieldConfigFormData.controlType
    field.queryType = fieldConfigFormData.queryType
    field.isQuery = fieldConfigFormData.queryType !== 'none'
    
    // 显示权限配置
    field.isShowList = fieldConfigFormData.isShowList
    field.isShowForm = fieldConfigFormData.isShowForm
    field.isEditable = fieldConfigFormData.isEditable
    field.isAddable = fieldConfigFormData.isAddable
    field.isShowInAdd = fieldConfigFormData.isShowInAdd
    
    // 布局配置
    field.layoutType = fieldConfigFormData.layoutType
    
    field.controlConfig = { ...fieldConfigFormData.controlConfig }
    field.validationRules = { ...fieldConfigFormData.validationRules }
  }
  
  fieldConfigDialogVisible.value = false
}

// 添加选项
const addOption = () => {
  fieldConfigFormData.controlConfig.options.push({
    label: '',
    value: ''
  })
}

// 删除选项
const removeOption = (index) => {
  fieldConfigFormData.controlConfig.options.splice(index, 1)
}

// 判断是否需要显示选项配置
const needOptionConfig = computed(() => {
  return ['select', 'selectMultiple', 'radio', 'checkbox'].includes(fieldConfigFormData.controlType)
})

// 判断是否需要显示日期格式配置
const needDateFormatConfig = computed(() => {
  return ['datePicker', 'datetimePicker'].includes(fieldConfigFormData.controlType)
})

// 判断是否需要显示文件配置
const needFileConfig = computed(() => {
  return fieldConfigFormData.controlType === 'upload'
})

// 判断是否为文本类型字段（显示长度、正则、预设规则）
const isTextFieldType = computed(() => {
  return ['input', 'password', 'textarea', 'richText'].includes(fieldConfigFormData.controlType)
})

// 判断是否为数字类型字段（显示最小值、最大值）
const isNumberFieldType = computed(() => {
  return fieldConfigFormData.controlType === 'inputNumber'
})

// 判断是否为选择类型字段
const isSelectFieldType = computed(() => {
  return ['select', 'selectMultiple', 'radio', 'checkbox'].includes(fieldConfigFormData.controlType)
})

// 判断是否为日期类型字段
const isDateFieldType = computed(() => {
  return ['datePicker', 'datetimePicker'].includes(fieldConfigFormData.controlType)
})

// 获取控件类型标签
const getControlTypeLabel = (controlType) => {
  const option = CONTROL_TYPE_OPTIONS.find((o) => o.value === controlType)
  return option ? option.label : ''
}

// 获取查询方式标签
const getQueryTypeLabel = (queryType) => {
  const option = QUERY_TYPE_OPTIONS.find((o) => o.value === queryType)
  return option ? option.label : ''
}

const fetchDatasourceOptions = async () => {
  try {
    const res = await queryDatasourceList({ pageNo: 1, pageSize: 100 })
    if (res.success) {
      datasourceOptions.value = res.data?.list || []
    }
  } catch (error) {
    console.error('获取数据源列表失败:', error)
  }
}

const fetchMainTableOptions = async () => {
  try {
    const res = await pageQuery({ tableType: 1, pageNo: 1, pageSize: 100 })
    if (res.success) {
      mainTableOptions.value = res.data?.list || []
    }
  } catch (error) {
    console.error('获取主表列表失败:', error)
  }
}

const handleTableTypeChange = (val) => {
  if (val === 2) {
    fetchMainTableOptions()
  } else {
    formData.mainTable = ''
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...queryParams,
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    }
    const res = await pageQuery(params)
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

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  queryParams.tableName = ''
  queryParams.tableType = null
  queryParams.isDbSynch = ''
  pagination.current = 1
  fetchData()
}

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

const resetFormData = () => {
  Object.assign(formData, {
    id: null,
    tableName: '',
    tableTxt: '',
    tableType: 0,
    datasourceId: null,
    mainTable: '',
    isCheckbox: 'N',
    isPage: 'Y',
    isTree: 'N',
    formColumns: 2,
    relationConfig: {
      relationType: 'one_to_many',
      mainTableField: 'id',
      subTableField: 'main_table_id',
      relationFieldName: 'mainTableId'
    },
    fields: getDefaultFields(),
    indexes: []
  })
  activeTab.value = 'fields'
}

const openAddDialog = () => {
  dialogTitle.value = '新增数据表'
  isEdit.value = false
  resetFormData()
  dialogVisible.value = true
}

const openEditDialog = async (row) => {
  dialogTitle.value = '编辑数据表'
  isEdit.value = true
  resetFormData()
  try {
    const res = await queryById(row.id)
    if (res.success && res.data) {
      const data = res.data
      Object.assign(formData, {
        id: data.id,
        tableName: data.tableName,
        tableTxt: data.tableTxt || '',
        tableType: data.tableType ?? 0,
        datasourceId: data.datasourceId,
        mainTable: data.mainTable || '',
        isCheckbox: data.isCheckbox || 'N',
        isPage: data.isPage || 'Y',
        isTree: data.isTree || 'N',
        formColumns: data.formColumns || 2,
        relationConfig: data.relationConfig || {
          relationType: 'one_to_many',
          mainTableField: 'id',
          subTableField: 'main_table_id',
          relationFieldName: 'mainTableId'
        },
        fields: data.fields || [],
        indexes: data.indexes || []
      })
      if (data.tableType === 2) {
        fetchMainTableOptions()
      }
    }
  } catch (error) {
    console.error('获取详情失败:', error)
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  if (formData.fields.length === 0) {
    ElMessage.warning('请至少添加一个字段')
    activeTab.value = 'fields'
    return
  }

  try {
    const submitData = {
      ...formData,
      fields: formData.fields.map((f, index) => ({
        ...f,
        orderNum: index
      }))
    }
    const api = formData.id ? update : insert
    const res = await api(submitData)
    if (res.success) {
      ElMessage.success(formData.id ? '更新成功' : '新增成功')
      dialogVisible.value = false
      fetchData()
    }
  } catch (error) {
    console.error('保存失败:', error)
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除数据表「${row.tableName}」吗？`, '提示', {
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await deleteById(row.id)
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
        const res = await batchDeleteByIds(ids)
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

const handleSyncDb = (row) => {
  ElMessageBox.confirm(`确定要将数据表「${row.tableName}」同步到数据库吗？`, '提示', {
    type: 'info'
  })
    .then(async () => {
      try {
        const res = await syncDb(row.id, 1)
        if (res.success) {
          ElMessage.success('同步成功')
          fetchData()
        }
      } catch (error) {
        console.error('同步失败:', error)
      }
    })
    .catch(() => {})
}

const handleIdTypeChange = (row) => {
  if (row.dbFieldName === 'id') {
    if (row.dbType === 'int') {
      row.dbLength = null
    } else {
      row.dbLength = 36
    }
  }
}

const handleFieldNameChange = (row) => {
  if (row.dbFieldName) {
    row.dbFieldNameAlias = toCamelCase(row.dbFieldName)
  }
}

const handleAddField = () => {
  const newField = {
    dbFieldName: '',
    dbFieldTxt: '',
    dbType: 'varchar',
    dbLength: 200,
    dbPointLength: null,
    dbIsNull: true,
    dbIsKey: false,
    dbIsPersist: true,
    dbDefaultVal: '',
    isShowForm: true,
    isShowList: true,
    isQuery: false,
    isReadOnly: false,
    fieldMustInput: '0',
    controlType: 'input',
    queryType: 'none',
    controlConfig: {}
  }
  
  const firstSystemFieldIndex = formData.fields.findIndex(
    (field) => SYSTEM_FIELDS.includes(field.dbFieldName)
  )
  
  if (firstSystemFieldIndex === -1) {
    formData.fields.push(newField)
  } else {
    formData.fields.splice(firstSystemFieldIndex, 0, newField)
  }
}

const handleDeleteField = (index) => {
  formData.fields.splice(index, 1)
}

const resetIndexForm = () => {
  Object.assign(indexFormData, {
    indexName: '',
    indexType: 'normal',
    indexField: []
  })
}

const openAddIndexDialog = () => {
  indexDialogTitle.value = '新增索引'
  currentIndexIndex.value = -1
  resetIndexForm()
  indexDialogVisible.value = true
}

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

const handleIndexSubmit = async () => {
  const valid = await indexFormRef.value?.validate().catch(() => false)
  if (!valid) return

  if (currentIndexIndex.value === -1) {
    formData.indexes.push({ ...indexFormData })
  } else {
    formData.indexes[currentIndexIndex.value] = { ...indexFormData }
  }
  indexDialogVisible.value = false
}

const handleDeleteIndex = (index) => {
  formData.indexes.splice(index, 1)
}

const getTableTypeLabel = (tableType) => {
  const option = TABLE_TYPE_OPTIONS.find((item) => item.value === tableType)
  return option?.label || '-'
}

const getTableTypeTagType = (tableType) => {
  const typeMap = {
    0: 'info',
    1: 'primary',
    2: 'success'
  }
  return typeMap[tableType] || 'info'
}

const getSyncStatusLabel = (isDbSynch) => {
  return isDbSynch === 'Y' ? '已同步' : '未同步'
}

const getSyncStatusTagType = (isDbSynch) => {
  return isDbSynch === 'Y' ? 'success' : 'warning'
}

const getDbTypeLabel = (dbType) => {
  const option = DB_TYPE_OPTIONS.find((item) => item.value === dbType)
  return option?.label || dbType
}

const getIndexTypeLabel = (indexType) => {
  const option = INDEX_TYPE_OPTIONS.find((item) => item.value === indexType)
  return option?.label || indexType
}

// 获取数据预览链接
const getPreviewLink = (tableId) => {
  const baseUrl = window.location.origin + window.location.pathname
  const previewPath = `/tableData/${tableId}`
  // 处理 qiankun 环境下的路径
  const currentPath = window.location.pathname
  const segments = currentPath.split('/').filter((s) => s)
  if (segments.length > 1) {
    // 如果有前缀路径（如 qiankun 主应用路径）
    return `${window.location.origin}/${segments[0]}/tableData/${tableId}`
  }
  return `${baseUrl.replace(/\/[^/]*$/, '')}/tableData/${tableId}`
}

// 打开数据预览页面
const openDataPreview = (row) => {
  router.push(`/tableData/${row.id}`)
}

// 复制预览链接
const copyPreviewLink = (row) => {
  const link = getPreviewLink(row.id)
  navigator.clipboard
    .writeText(link)
    .then(() => {
      ElMessage.success('链接已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}

onMounted(() => {
  fetchData()
  fetchDatasourceOptions()
})
</script>

<template>
  <div class="table-head-page">
    <ElCard class="search-card">
      <div class="search-bar">
        <div class="search-item">
          <span class="search-label">表名</span>
          <ElInput
            v-model="queryParams.tableName"
            placeholder="请输入表名"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="search-item">
          <span class="search-label">表类型</span>
          <ElSelect
            v-model="queryParams.tableType"
            placeholder="请选择表类型"
            clearable
            style="width: 120px"
          >
            <ElOption
              v-for="item in TABLE_TYPE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </div>
        <div class="search-item">
          <span class="search-label">同步状态</span>
          <ElSelect
            v-model="queryParams.isDbSynch"
            placeholder="请选择同步状态"
            clearable
            style="width: 120px"
          >
            <ElOption
              v-for="item in SYNC_STATUS_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </div>
        <ElButton type="primary" @click="handleSearch">查询</ElButton>
        <ElButton @click="handleReset">重置</ElButton>
      </div>
      <div class="action-bar">
        <ElButton type="primary" @click="openAddDialog">新增数据表</ElButton>
        <ElButton type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
          批量删除
        </ElButton>
      </div>
    </ElCard>

    <ElCard class="table-card">
      <ElTable
        v-loading="loading"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="50" align="center" />
        <ElTableColumn prop="tableName" label="表名" min-width="150" />
        <ElTableColumn prop="tableTxt" label="表说明" min-width="150" show-overflow-tooltip />
        <ElTableColumn prop="tableType" label="表类型" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="getTableTypeTagType(row.tableType)" size="small">
              {{ getTableTypeLabel(row.tableType) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="datasourceName" label="数据源" width="120" />
        <ElTableColumn prop="isDbSynch" label="同步状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="getSyncStatusTagType(row.isDbSynch)" size="small">
              {{ getSyncStatusLabel(row.isDbSynch) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createTime" label="创建时间" width="170" align="center" />
        <ElTableColumn label="操作" width="320" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton type="primary" link size="small" @click="openDataPreview(row)">预览</ElButton>
            <ElPopover
              placement="bottom"
              :width="350"
              trigger="click"
            >
              <template #reference>
                <ElButton type="info" link size="small">复制链接</ElButton>
              </template>
              <div class="link-popover">
                <p class="link-label">数据预览链接：</p>
                <div class="link-content">
                  <ElInput
                    :model-value="getPreviewLink(row.id)"
                    readonly
                    size="small"
                  />
                  <ElButton type="primary" size="small" @click="copyPreviewLink(row)">
                    复制
                  </ElButton>
                </div>
              </div>
            </ElPopover>
            <ElButton type="primary" link size="small" @click="openEditDialog(row)">编辑</ElButton>
            <ElButton
              type="success"
              link
              size="small"
              :disabled="row.isDbSynch === 'Y'"
              @click="handleSyncDb(row)"
            >
              同步
            </ElButton>
            <ElButton type="danger" link size="small" @click="handleDelete(row)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

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

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1200px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <div class="section-header" @click="baseInfoExpanded = !baseInfoExpanded">
          <div class="section-title">
            基础信息
            <span v-if="!baseInfoExpanded && formData.tableName" class="summary-info">
              {{ formData.tableName }}{{ formData.tableTxt ? ` - ${formData.tableTxt}` : '' }}
            </span>
          </div>
          <ElButton type="primary" link size="small">
            {{ baseInfoExpanded ? '收起' : '展开' }}
          </ElButton>
        </div>
        <ElForm v-show="baseInfoExpanded" ref="formRef" :model="formData" :rules="baseFormRules" label-width="70px" class="base-form" size="small">
          <div class="form-row">
            <ElFormItem label="表名" prop="tableName">
              <ElInput v-model="formData.tableName" placeholder="请输入表名" :disabled="isEdit" />
            </ElFormItem>
            <ElFormItem label="表说明" prop="tableTxt">
              <ElInput v-model="formData.tableTxt" placeholder="请输入表说明" />
            </ElFormItem>
            <ElFormItem label="表类型" prop="tableType">
              <ElSelect v-model="formData.tableType" placeholder="请选择表类型" @change="handleTableTypeChange">
                <ElOption
                  v-for="item in TABLE_TYPE_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="数据源" prop="datasourceId">
              <ElSelect v-model="formData.datasourceId" placeholder="请选择数据源">
                <ElOption
                  v-for="item in datasourceOptions"
                  :key="item.id"
                  :label="item.datasourceName"
                  :value="item.id"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="是否分页">
              <ElSwitch v-model="formData.isPage" active-value="Y" inactive-value="N" />
            </ElFormItem>
            <ElFormItem label="是否树形">
              <ElSwitch v-model="formData.isTree" active-value="Y" inactive-value="N" />
            </ElFormItem>
            <ElFormItem label="表单列数">
              <ElSelect v-model="formData.formColumns" style="width: 100%">
                <ElOption
                  v-for="item in FORM_COLUMNS_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </div>

          <!-- 附表关联配置 -->
          <div v-if="formData.tableType === 2" class="relation-config-section">
            <div class="section-subtitle">附表关联配置</div>
            <div class="form-row">
              <ElFormItem label="主表" prop="mainTable">
                <ElSelect v-model="formData.mainTable" placeholder="请选择主表" filterable style="width: 100%">
                  <ElOption
                    v-for="item in mainTableOptions"
                    :key="item.id"
                    :label="`${item.tableName} - ${item.tableTxt}`"
                    :value="item.tableName"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="关联类型">
                <ElSelect v-model="formData.relationConfig.relationType" placeholder="请选择关联类型" style="width: 100%">
                  <ElOption
                    v-for="item in RELATION_TYPE_OPTIONS"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </div>
            <div class="form-row">
              <ElFormItem label="主表关联字段">
                <ElSelect v-model="formData.relationConfig.mainTableField" placeholder="请选择主表关联字段" style="width: 100%">
                  <ElOption
                    v-for="item in mainTableFieldOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="附表关联字段">
                <ElSelect v-model="formData.relationConfig.subTableField" placeholder="请选择附表关联字段" style="width: 100%">
                  <ElOption
                    v-for="item in subTableFieldOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </div>
            <div class="form-row">
              <ElFormItem label="关联字段别名">
                <ElInput v-model="formData.relationConfig.relationFieldName" placeholder="请输入关联字段别名（驼峰命名）" />
              </ElFormItem>
            </div>
          </div>
        </ElForm>

        <ElTabs v-model="activeTab" class="config-tabs">
          <ElTabPane label="字段配置" name="fields">
            <div class="tab-toolbar">
              <ElButton type="primary" size="small" @click="handleAddField">新增字段</ElButton>
            </div>
            <ElTable :data="formData.fields" border stripe max-height="350">
              <ElTableColumn type="index" label="序号" width="60" align="center" />
              <ElTableColumn prop="dbFieldName" label="字段名" width="90">
                <template #default="{ row }">
                  <ElInput
                    v-model="row.dbFieldName"
                    size="small"
                    :disabled="FIXED_NAME_FIELDS.includes(row.dbFieldName)"
                    @input="handleFieldNameChange(row)"
                  />
                </template>
              </ElTableColumn>
              <ElTableColumn prop="dbFieldNameAlias" label="字段别名" width="90">
                <template #default="{ row }">
                  <ElInput v-model="row.dbFieldNameAlias" size="small" />
                </template>
              </ElTableColumn>
              <ElTableColumn prop="dbFieldTxt" label="字段说明" min-width="150">
                <template #default="{ row }">
                  <ElInput v-model="row.dbFieldTxt" size="small" />
                </template>
              </ElTableColumn>
              <ElTableColumn prop="dbType" label="字段类型" width="130">
                <template #default="{ row }">
                  <ElSelect
                    v-model="row.dbType"
                    size="small"
                    style="width: 100%"
                    :disabled="SYSTEM_FIELDS.includes(row.dbFieldName) || ['create_by', 'update_by'].includes(row.dbFieldName)"
                    @change="handleIdTypeChange(row)"
                  >
                    <ElOption
                      v-for="item in row.dbFieldName === 'id' ? ID_TYPE_OPTIONS : DB_TYPE_OPTIONS"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </ElSelect>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="dbLength" label="长度" width="80" align="center">
                <template #default="{ row }">
                  <ElInput
                    v-model="row.dbLength"
                    size="small"
                    :disabled="SYSTEM_FIELDS.includes(row.dbFieldName) || (row.dbFieldName === 'id' && row.dbType === 'int')"
                  />
                </template>
              </ElTableColumn>
              <ElTableColumn prop="dbPointLength" width="80" align="center">
                <template #header>
                  <ElTooltip content="仅 decimal 类型允许设置小数点" placement="top">
                    <span>小数点 <span class="header-tip">?</span></span>
                  </ElTooltip>
                </template>
                <template #default="{ row }">
                  <ElInput
                    v-model="row.dbPointLength"
                    size="small"
                    :disabled="SYSTEM_FIELDS.includes(row.dbFieldName) || !isAllowDecimal(row.dbType)"
                  />
                </template>
              </ElTableColumn>
              <ElTableColumn prop="dbDefaultVal" label="默认值" width="100" align="center">
                <template #default="{ row }">
                  <ElInput
                    v-model="row.dbDefaultVal"
                    size="small"
                    :disabled="SYSTEM_FIELDS.includes(row.dbFieldName)"
                  />
                </template>
              </ElTableColumn>
              <ElTableColumn prop="dbIsKey" label="主键" width="60" align="center">
                <template #default="{ row }">
                  <ElSwitch
                    v-model="row.dbIsKey"
                    size="small"
                    :disabled="FIXED_NAME_FIELDS.includes(row.dbFieldName)"
                  />
                </template>
              </ElTableColumn>
              <ElTableColumn prop="dbIsNull" label="可空" width="60" align="center">
                <template #default="{ row }">
                  <ElSwitch
                    v-model="row.dbIsNull"
                    size="small"
                    :disabled="FIXED_NAME_FIELDS.includes(row.dbFieldName)"
                  />
                </template>
              </ElTableColumn>
              <ElTableColumn label="操作" width="120" align="center">
                <template #default="{ row, $index }">
                  <ElButton
                    type="primary"
                    link
                    size="small"
                    @click="openFieldConfigDialog(row, $index)"
                  >
                    配置
                  </ElButton>
                  <ElButton
                    type="danger"
                    link
                    size="small"
                    :disabled="row.dbFieldName === 'id'"
                    @click="handleDeleteField($index)"
                  >
                    删除
                  </ElButton>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElTabPane>

          <ElTabPane label="索引配置" name="indexes">
            <div class="tab-toolbar">
              <ElButton type="primary" size="small" @click="openAddIndexDialog">新增索引</ElButton>
            </div>
            <ElTable :data="formData.indexes" border stripe max-height="350">
              <ElTableColumn type="index" label="序号" width="60" align="center" />
              <ElTableColumn prop="indexName" label="索引名称" min-width="150" />
              <ElTableColumn prop="indexType" label="索引类型" width="100">
                <template #default="{ row }">
                  {{ getIndexTypeLabel(row.indexType) }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="indexField" label="索引字段" min-width="200">
                <template #default="{ row }">
                  {{ row.indexField?.join(', ') }}
                </template>
              </ElTableColumn>
              <ElTableColumn label="操作" width="120" align="center">
                <template #default="{ row, $index }">
                  <ElButton type="primary" link size="small" @click="openEditIndexDialog(row, $index)">
                    编辑
                  </ElButton>
                  <ElButton type="danger" link size="small" @click="handleDeleteIndex($index)">
                    删除
                  </ElButton>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElTabPane>
        </ElTabs>
      </div>

      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="indexDialogVisible"
      :title="indexDialogTitle"
      width="500px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <ElForm ref="indexFormRef" :model="indexFormData" :rules="indexFormRules" label-width="100px">
        <ElFormItem label="索引名称" prop="indexName">
          <ElInput v-model="indexFormData.indexName" placeholder="请输入索引名称" />
        </ElFormItem>
        <ElFormItem label="索引类型" prop="indexType">
          <ElSelect v-model="indexFormData.indexType" placeholder="请选择索引类型" style="width: 100%">
            <ElOption
              v-for="item in INDEX_TYPE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="索引字段" prop="indexField">
          <ElSelect
            v-model="indexFormData.indexField"
            multiple
            placeholder="请选择索引字段"
            style="width: 100%"
          >
            <ElOption
              v-for="item in fieldOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="indexDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleIndexSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="fieldConfigDialogVisible"
      title="字段配置"
      width="800px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <ElTabs v-model="fieldConfigActiveTab" type="card" class="field-config-tabs">
        <ElTabPane label="显示与布局" name="display">
          <ElForm ref="fieldConfigFormRef" :model="fieldConfigFormData" label-width="100px">
            <div class="permission-grid">
              <ElFormItem label="列表显示">
                <ElSwitch
                  v-model="fieldConfigFormData.isShowList"
                  active-text="是"
                  inactive-text="否"
                />
              </ElFormItem>
              <ElFormItem label="表单显示">
                <ElSwitch
                  v-model="fieldConfigFormData.isShowForm"
                  active-text="是"
                  inactive-text="否"
                />
              </ElFormItem>
              <ElFormItem label="编辑可改">
                <ElSwitch
                  v-model="fieldConfigFormData.isEditable"
                  active-text="是"
                  inactive-text="否"
                />
              </ElFormItem>
              <ElFormItem label="新增可录">
                <ElSwitch
                  v-model="fieldConfigFormData.isAddable"
                  active-text="是"
                  inactive-text="否"
                />
              </ElFormItem>
              <ElFormItem label="新增显示">
                <ElSwitch
                  v-model="fieldConfigFormData.isShowInAdd"
                  active-text="是"
                  inactive-text="否"
                />
              </ElFormItem>
            </div>

            <ElFormItem label="布局方式">
              <ElSelect v-model="fieldConfigFormData.layoutType" style="width: 100%">
                <ElOption
                  v-for="item in LAYOUT_TYPE_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>

            <ElFormItem label="查询方式">
              <ElSelect v-model="fieldConfigFormData.queryType" style="width: 100%">
                <ElOption
                  v-for="item in QUERY_TYPE_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElForm>
        </ElTabPane>

        <ElTabPane label="控件配置" name="control">
          <ElForm ref="fieldConfigFormRef" :model="fieldConfigFormData" label-width="100px">
            <ElFormItem label="控件类型">
              <ElSelect v-model="fieldConfigFormData.controlType" style="width: 100%">
                <ElOption
                  v-for="item in availableControlTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>

            <template v-if="needOptionConfig">
              <ElFormItem label="数据来源">
                <ElRadioGroup v-model="fieldConfigFormData.controlConfig.dataSourceType">
                  <ElRadio value="static">静态选项</ElRadio>
                  <ElRadio value="dictionary">字典</ElRadio>
                  <ElRadio value="api">接口</ElRadio>
                </ElRadioGroup>
              </ElFormItem>

              <ElFormItem
                v-if="fieldConfigFormData.controlConfig.dataSourceType === 'static'"
                label="选项列表"
              >
                <div class="option-list">
                  <div
                    v-for="(option, index) in fieldConfigFormData.controlConfig.options"
                    :key="index"
                    class="option-item"
                  >
                    <ElInput
                      v-model="option.label"
                      placeholder="显示文本"
                      size="small"
                      style="width: 150px"
                    />
                    <ElInput
                      v-model="option.value"
                      placeholder="值"
                      size="small"
                      style="width: 150px"
                    />
                    <ElButton type="danger" link size="small" @click="removeOption(index)">
                      删除
                    </ElButton>
                  </div>
                  <ElButton type="primary" link size="small" @click="addOption">
                    + 添加选项
                  </ElButton>
                </div>
              </ElFormItem>

              <ElFormItem
                v-if="fieldConfigFormData.controlConfig.dataSourceType === 'dictionary'"
                label="字典编码"
              >
                <ElInput
                  v-model="fieldConfigFormData.controlConfig.dictionaryCode"
                  placeholder="请输入字典编码"
                />
              </ElFormItem>

              <ElFormItem
                v-if="fieldConfigFormData.controlConfig.dataSourceType === 'api'"
                label="接口地址"
              >
                <ElInput
                  v-model="fieldConfigFormData.controlConfig.apiUrl"
                  placeholder="请输入接口地址"
                />
              </ElFormItem>

              <ElFormItem
                v-if="fieldConfigFormData.controlConfig.dataSourceType === 'api'"
                label="请求方式"
              >
                <ElSelect v-model="fieldConfigFormData.controlConfig.apiMethod" style="width: 100%">
                  <ElOption label="GET" value="GET" />
                  <ElOption label="POST" value="POST" />
                </ElSelect>
              </ElFormItem>
            </template>

            <template v-if="needDateFormatConfig">
              <ElFormItem label="日期格式">
                <ElSelect v-model="fieldConfigFormData.controlConfig.dateFormat" style="width: 100%">
                  <ElOption label="YYYY-MM-DD" value="YYYY-MM-DD" />
                  <ElOption label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss" />
                  <ElOption label="YYYY/MM/DD" value="YYYY/MM/DD" />
                  <ElOption label="YYYY年MM月DD日" value="YYYY年MM月DD日" />
                </ElSelect>
              </ElFormItem>
            </template>

            <template v-if="needFileConfig">
              <ElFormItem label="是否多文件">
                <ElSwitch
                  v-model="fieldConfigFormData.controlConfig.multiple"
                  active-text="是"
                  inactive-text="否"
                />
              </ElFormItem>

              <ElFormItem v-if="fieldConfigFormData.controlConfig.multiple" label="最大数量">
                <ElInputNumber
                  v-model="fieldConfigFormData.controlConfig.limit"
                  :min="1"
                  :max="10"
                />
              </ElFormItem>

              <ElFormItem label="最大大小(MB)">
                <ElInputNumber
                  v-model="fieldConfigFormData.controlConfig.maxSize"
                  :min="1"
                  :max="100"
                />
              </ElFormItem>

              <ElFormItem label="允许文件类型">
                <ElSelect
                  v-model="fieldConfigFormData.controlConfig.fileTypes"
                  multiple
                  placeholder="请选择允许的文件类型"
                  style="width: 100%"
                >
                  <ElOption label="图片" value="image" />
                  <ElOption label="文档" value="document" />
                  <ElOption label="视频" value="video" />
                  <ElOption label="音频" value="audio" />
                  <ElOption label="所有" value="*" />
                </ElSelect>
              </ElFormItem>
            </template>

            <template v-if="!needOptionConfig && !needDateFormatConfig && !needFileConfig">
              <div class="empty-tip">当前控件类型无需特殊配置</div>
            </template>
          </ElForm>
        </ElTabPane>

        <ElTabPane label="校验规则" name="validation">
          <ElForm ref="fieldConfigFormRef" :model="fieldConfigFormData" label-width="100px">
            <ElFormItem label="必填校验">
              <ElSwitch
                v-model="fieldConfigFormData.validationRules.required"
                active-text="是"
                inactive-text="否"
              />
            </ElFormItem>

            <template v-if="isTextFieldType">
              <ElFormItem label="预设规则">
                <ElSelect
                  v-model="fieldConfigFormData.validationRules.presetRule"
                  placeholder="选择预设校验规则"
                  clearable
                  style="width: 100%"
                  @change="(val) => {
                    const rule = PRESET_VALIDATION_RULES.find(r => r.value === val)
                    if (rule) {
                      fieldConfigFormData.validationRules.pattern = rule.pattern
                      if (!fieldConfigFormData.validationRules.message) {
                        fieldConfigFormData.validationRules.message = rule.message
                      }
                    }
                  }"
                >
                  <ElOption
                    v-for="item in PRESET_VALIDATION_RULES"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>

              <div class="validation-row">
                <ElFormItem label="最小长度">
                  <ElInputNumber
                    v-model="fieldConfigFormData.validationRules.minLength"
                    :min="0"
                    placeholder="最小"
                    style="width: 150px"
                  />
                </ElFormItem>
                <ElFormItem label="最大长度">
                  <ElInputNumber
                    v-model="fieldConfigFormData.validationRules.maxLength"
                    :min="0"
                    placeholder="最大"
                    style="width: 150px"
                  />
                </ElFormItem>
              </div>

              <ElFormItem label="正则表达式">
                <ElInput
                  v-model="fieldConfigFormData.validationRules.pattern"
                  placeholder="请输入正则表达式（如：^[a-zA-Z]+$）"
                />
              </ElFormItem>
            </template>

            <template v-if="isNumberFieldType">
              <div class="validation-row">
                <ElFormItem label="最小值">
                  <ElInputNumber
                    v-model="fieldConfigFormData.validationRules.min"
                    :controls="false"
                    placeholder="最小值"
                    style="width: 150px"
                  />
                </ElFormItem>
                <ElFormItem label="最大值">
                  <ElInputNumber
                    v-model="fieldConfigFormData.validationRules.max"
                    :controls="false"
                    placeholder="最大值"
                    style="width: 150px"
                  />
                </ElFormItem>
              </div>
            </template>

            <ElFormItem label="错误提示">
              <ElInput
                v-model="fieldConfigFormData.validationRules.message"
                placeholder="校验不通过时的提示信息"
              />
            </ElFormItem>
          </ElForm>
        </ElTabPane>
      </ElTabs>

      <template #footer>
        <ElButton @click="fieldConfigDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleFieldConfigSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.table-head-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 16px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-label {
  color: #606266;
  white-space: nowrap;
}

.action-bar {
  display: flex;
  gap: 10px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.dialog-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0 10px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding-left: 10px;
  border-left: 3px solid #409eff;
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-info {
  font-size: 13px;
  font-weight: 400;
  color: #909399;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
  cursor: pointer;
  user-select: none;
}

.section-header:hover .section-title {
  color: #409eff;
}

.base-form {
  margin-top: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 24px;
  margin-bottom: 0;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-row :deep(.el-form-item) {
  margin-bottom: 12px;
}

.form-row :deep(.el-input),
.form-row :deep(.el-select) {
  width: 100%;
}

.config-tabs {
  margin-top: 16px;
}

.config-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.tab-toolbar {
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tab-toolbar :deep(.el-button) {
  padding: 8px 16px;
}

:deep(.el-table .el-switch) {
  height: 18px;
}

:deep(.el-table .el-switch__core) {
  min-width: 32px;
  height: 18px;
}

:deep(.el-table .el-switch__action) {
  width: 14px;
  height: 14px;
}

:deep(.el-dialog__body) {
  padding: 20px 24px;
}

:deep(.el-divider) {
  margin: 16px 0;
}

.link-popover {
  font-size: 13px;
}

.link-label {
  margin: 0 0 8px 0;
  color: #606266;
  font-weight: 500;
}

.link-content {
  display: flex;
  gap: 8px;
  align-items: center;
}

.link-content :deep(.el-input) {
  flex: 1;
}

.relation-config-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #dcdfe6;
}

.section-subtitle {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 2px solid #67c23a;
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 配置摘要样式 */
.config-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
}

.config-summary .empty-text {
  color: #909399;
  font-size: 12px;
}

.config-summary .ml-4 {
  margin-left: 4px;
}

/* 表头提示图标样式 */
.header-tip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-size: 12px;
  color: #409eff;
  border: 1px solid #409eff;
  border-radius: 50%;
  margin-left: 4px;
  cursor: pointer;
}

/* 权限配置网格样式 */
.permission-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0 16px;
}

.permission-grid :deep(.el-form-item) {
  margin-bottom: 12px;
}

/* 校验规则行样式 */
.validation-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.validation-row :deep(.el-form-item) {
  margin-bottom: 12px;
}
</style>
