import { CONTROL_TYPE_OPTIONS, QUERY_TYPE_OPTIONS } from '../constants'

// 转驼峰命名
export const toCamelCase = str => {
  if (!str) return ''
  return str.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

// 获取默认控件类型（根据数据库类型推断）
export const getDefaultControlType = dbType => {
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
export const getDefaultQueryType = dbType => {
  if (['date', 'datetime'].includes(dbType)) {
    return 'between'
  }
  if (['int', 'long', 'double', 'bigdecimal'].includes(dbType)) {
    return 'eq'
  }
  return 'like'
}

// 判断是否允许小数点（只有decimal类型允许）
export const isAllowDecimal = dbType => {
  return ['decimal'].includes(dbType)
}

// 根据数据库类型获取可用的控件类型选项
export const getAvailableControlTypes = dbType => {
  const allTypes = [...CONTROL_TYPE_OPTIONS]

  // 根据数据库类型过滤控件类型
  switch (dbType) {
    case 'varchar':
    case 'text':
    case 'longtext':
      // 字符串/文本类型：允许文本框、文本域、下拉选择、单选、复选、文件上传、富文本
      // 不允许数字输入、日期选择、日期时间选择
      return allTypes.filter(
        t => !['inputNumber', 'datePicker', 'datetimePicker'].includes(t.value)
      )
    case 'int':
    case 'bigint':
    case 'tinyint':
      // 整型类型：允许数字输入、下拉选择、单选、复选
      // 不允许日期选择、日期时间选择、文件上传、富文本
      return allTypes.filter(
        t => !['datePicker', 'datetimePicker', 'upload', 'richText'].includes(t.value)
      )
    case 'date':
      // 日期类型：允许日期选择、文本框
      // 不允许数字输入、日期时间选择、下拉多选、复选、文件上传、富文本
      return allTypes.filter(t =>
        ['input', 'textarea', 'datePicker', 'select', 'radio'].includes(t.value)
      )
    case 'datetime':
      // 日期时间类型：允许日期时间选择、文本框
      // 不允许数字输入、日期选择、下拉多选、复选、文件上传、富文本
      return allTypes.filter(t =>
        ['input', 'textarea', 'datetimePicker', 'select', 'radio'].includes(t.value)
      )
    case 'decimal':
      // 小数类型：允许数字输入、下拉选择、单选、复选
      // 不允许日期选择、日期时间选择、文件上传、富文本
      return allTypes.filter(
        t => !['datePicker', 'datetimePicker', 'upload', 'richText'].includes(t.value)
      )
    default:
      return allTypes
  }
}

// 根据控件类型获取可用的查询方式
export const getAvailableQueryTypes = controlType => {
  const allTypes = [...QUERY_TYPE_OPTIONS]

  switch (controlType) {
    case 'input':
    case 'textarea':
    case 'richText':
      // 文本类型：支持不查询、等于、模糊查询
      return allTypes.filter(t => ['none', 'eq', 'like'].includes(t.value))

    case 'password':
      // 密码类型：只支持不查询、等于（不推荐查询）
      return allTypes.filter(t => ['none', 'eq'].includes(t.value))

    case 'inputNumber':
      // 数字类型：支持不查询、等于、大于、小于、大于等于、小于等于、区间
      return allTypes.filter(t =>
        ['none', 'eq', 'gt', 'lt', 'gte', 'lte', 'between'].includes(t.value)
      )

    case 'select':
    case 'radio':
      // 单选类型：只支持不查询、等于
      return allTypes.filter(t => ['none', 'eq'].includes(t.value))

    case 'selectMultiple':
    case 'checkbox':
      // 多选类型：只支持不查询、多选
      return allTypes.filter(t => ['none', 'in'].includes(t.value))

    case 'datePicker':
    case 'datetimePicker':
      // 日期类型：支持不查询、等于、大于、小于、大于等于、小于等于、区间
      return allTypes.filter(t =>
        ['none', 'eq', 'gt', 'lt', 'gte', 'lte', 'between'].includes(t.value)
      )

    case 'upload':
      // 文件上传：只支持不查询
      return allTypes.filter(t => t.value === 'none')

    default:
      return allTypes
  }
}

// 获取控件类型标签
export const getControlTypeLabel = controlType => {
  const option = CONTROL_TYPE_OPTIONS.find(o => o.value === controlType)
  return option ? option.label : ''
}

// 获取查询方式标签
export const getQueryTypeLabel = queryType => {
  const option = QUERY_TYPE_OPTIONS.find(o => o.value === queryType)
  return option ? option.label : ''
}

// 获取表类型标签
export const getTableTypeLabel = (tableType, TABLE_TYPE_OPTIONS) => {
  const option = TABLE_TYPE_OPTIONS.find(item => item.value === tableType)
  return option?.label || '-'
}

// 获取表类型标签颜色
export const getTableTypeTagType = tableType => {
  const typeMap = {
    0: 'info',
    1: 'primary',
    2: 'success'
  }
  return typeMap[tableType] || 'info'
}

// 获取同步状态标签
export const getSyncStatusLabel = isDbSynch => {
  return isDbSynch === 'Y' ? '已同步' : '未同步'
}

// 获取同步状态标签颜色
export const getSyncStatusTagType = isDbSynch => {
  return isDbSynch === 'Y' ? 'success' : 'warning'
}

// 获取数据库类型标签
export const getDbTypeLabel = (dbType, DB_TYPE_OPTIONS) => {
  const option = DB_TYPE_OPTIONS.find(item => item.value === dbType)
  return option?.label || dbType
}

// 获取索引类型标签
export const getIndexTypeLabel = (indexType, INDEX_TYPE_OPTIONS) => {
  const option = INDEX_TYPE_OPTIONS.find(item => item.value === indexType)
  return option?.label || indexType
}

// 获取数据预览链接
export const getPreviewLink = tableId => {
  const baseUrl = window.location.origin + window.location.pathname
  const previewPath = `/tableData/${tableId}`
  // 处理 qiankun 环境下的路径
  const currentPath = window.location.pathname
  const segments = currentPath.split('/').filter(s => s)
  if (segments.length > 1) {
    // 如果有前缀路径（如 qiankun 主应用路径）
    return `${window.location.origin}/${segments[0]}/tableData/${tableId}`
  }
  return `${baseUrl.replace(/\/[^/]*$/, '')}/tableData/${tableId}`
}

// 获取默认字段配置
export const getDefaultFields = () => [
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

// 检查是否需要显示选项配置
export const needOptionConfig = controlType => {
  return ['select', 'selectMultiple', 'radio', 'checkbox'].includes(controlType)
}

// 检查是否需要显示日期格式配置
export const needDateFormatConfig = controlType => {
  return ['datePicker', 'datetimePicker'].includes(controlType)
}

// 检查是否需要显示文件配置
export const needFileConfig = controlType => {
  return controlType === 'upload'
}

// 检查是否为文本类型字段（显示长度、正则、预设规则）
export const isTextFieldType = controlType => {
  return ['input', 'password', 'textarea', 'richText'].includes(controlType)
}

// 检查是否为数字类型字段（显示最小值、最大值）
export const isNumberFieldType = controlType => {
  return controlType === 'inputNumber'
}

// 检查是否为选择类型字段
export const isSelectFieldType = controlType => {
  return ['select', 'selectMultiple', 'radio', 'checkbox'].includes(controlType)
}

// 检查是否为日期类型字段
export const isDateFieldType = controlType => {
  return ['datePicker', 'datetimePicker'].includes(controlType)
}

// 获取可用的日期格式选项
export const getAvailableDateFormatOptions = dbType => {
  // 年月日格式选项
  const dateOnlyOptions = [
    { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
    { label: 'YYYY/MM/DD', value: 'YYYY/MM/DD' },
    { label: 'YYYY年MM月DD日', value: 'YYYY年MM月DD日' }
  ]

  // 日期时间格式选项
  const dateTimeOptions = [{ label: 'YYYY-MM-DD HH:mm:ss', value: 'YYYY-MM-DD HH:mm:ss' }]

  // 如果没有当前配置的字段，返回所有选项
  if (!dbType) {
    return [...dateOnlyOptions, ...dateTimeOptions]
  }

  // 根据数据库类型返回不同的选项
  if (dbType === 'date') {
    // date类型只能选择年月日格式
    return dateOnlyOptions
  }

  // datetime或其他类型可以选择所有格式
  return [...dateOnlyOptions, ...dateTimeOptions]
}
