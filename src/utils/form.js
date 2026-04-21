import {
  DB_TYPE_CONTROL_MAP,
  QUERY_TYPE_LABELS,
  ORDER_STATUS_OPTIONS,
  STATUS_OPTIONS,
  RELATION_TYPES
} from '@/constants/form'

/**
 * 根据字段配置获取控件类型
 * @param {Object} field - 字段配置对象
 * @returns {string} 控件类型
 */
export function getControlType(field) {
  if (field?.controlType) {
    return field.controlType
  }
  return DB_TYPE_CONTROL_MAP[field?.dbType] || 'input'
}

/**
 * 获取枚举选项
 * @param {string} fieldName - 字段名
 * @returns {Array|null} 选项数组或null
 */
export function getEnumOptions(fieldName) {
  if (['order_status', 'orderStatus'].includes(fieldName)) {
    return ORDER_STATUS_OPTIONS
  }
  if (['status'].includes(fieldName) && fieldName !== 'order_status') {
    return STATUS_OPTIONS
  }
  return null
}

/**
 * 获取字段的选项配置
 * @param {Object} field - 字段配置对象
 * @returns {Array} 选项数组
 */
export function getFieldOptions(field) {
  if (!field?.controlConfig) return []

  const { dataSourceType, options } = field.controlConfig

  if (dataSourceType === 'static' && options && options.length > 0) {
    return options.map(opt => ({
      label: opt.label,
      value: opt.value
    }))
  }

  return []
}

/**
 * 获取查询类型标签
 * @param {string} queryType - 查询类型
 * @returns {string} 标签文本
 */
export function getQueryTypeLabel(queryType) {
  return QUERY_TYPE_LABELS[queryType] || ''
}

/**
 * 获取字段项的样式（处理布局配置）
 * @param {Object} field - 字段配置
 * @param {number} index - 索引
 * @param {Array} fields - 字段数组
 * @param {number} customColumns - 自定义列数
 * @param {number} formColumns - 表单列数
 * @returns {Object} 样式对象
 */
export function getFieldItemStyle(field, index, fields, customColumns = null, formColumns = 2) {
  const controlType = getControlType(field)
  const layoutType = field?.layoutType || 'default'
  const columns = customColumns || formColumns

  const style = {}

  if (controlType === 'richText' || layoutType === 'fullRow') {
    style.gridColumn = `span ${columns}`
  }

  if (layoutType === 'newLine') {
    style.gridColumnStart = '1'
  }

  return style
}

/**
 * 获取字段的类名
 * @param {Object} field - 字段配置
 * @returns {Array} 类名数组
 */
export function getFieldItemClass(field) {
  const controlType = getControlType(field)
  const layoutType = field?.layoutType || 'default'

  const classes = []
  if (controlType === 'richText' || layoutType === 'fullRow') {
    classes.push('form-item-full')
  }
  if (layoutType === 'newLine') {
    classes.push('form-item-newline')
  }

  return classes
}

/**
 * 检查字段是否可编辑
 * @param {Object} field - 字段配置
 * @param {boolean} isEdit - 是否编辑模式
 * @returns {boolean} 是否可编辑
 */
export function isFieldEditable(field, isEdit = false) {
  if (field?.isReadOnly) return false

  if (isEdit) {
    return field?.isEditable !== false
  } else {
    return field?.isAddable !== false
  }
}

/**
 * 获取字段的最大长度（优先级：validationRules.maxLength > dbLength）
 * @param {Object} field - 字段配置
 * @returns {number|null} 最大长度
 */
export function getFieldMaxLength(field) {
  const validationRules = field?.validationRules || {}
  if (validationRules.maxLength !== null && validationRules.maxLength !== undefined) {
    return validationRules.maxLength
  }
  if (field?.dbLength !== null && field?.dbLength !== undefined && field.dbLength > 0) {
    return field.dbLength
  }
  return null
}

/**
 * 根据字段配置生成校验规则
 * @param {Object} field - 字段配置
 * @returns {Array} 校验规则数组
 */
export function buildFieldRules(field) {
  const rules = []
  const fieldName = field?.dbFieldTxt || field?.dbFieldName
  const validationRules = field?.validationRules || {}

  const isRequired =
    validationRules.required === true || (field?.fieldMustInput === '1' && !field?.dbIsNull)

  if (isRequired) {
    const controlType = getControlType(field)
    if (
      controlType === 'selectMultiple' ||
      controlType === 'checkbox' ||
      controlType === 'upload'
    ) {
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

/**
 * 创建空的表数据行
 * @param {Object} tableConfig - 表配置对象
 * @returns {Object} 空数据行
 */
export function createEmptyTableRow(tableConfig) {
  if (!tableConfig?.fields) return {}

  const newRow = {}
  tableConfig.fields.forEach(field => {
    if (field.isShowForm) {
      const fieldName = field.dbFieldNameAlias || field.dbFieldName
      const controlType = getControlType(field)

      if (controlType === 'upload') {
        newRow[fieldName] = []
      } else if (controlType === 'selectMultiple' || controlType === 'checkbox') {
        newRow[fieldName] = []
      } else if (
        field.dbDefaultVal !== null &&
        field.dbDefaultVal !== undefined &&
        field.dbDefaultVal !== ''
      ) {
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

/**
 * 格式化值显示
 * @param {*} value - 值
 * @param {Object} field - 字段配置
 * @returns {string} 格式化后的值
 */
export function formatValue(value, field) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (['status', 'order_status', 'orderStatus'].includes(field?.dbFieldName)) {
    const options = getEnumOptions(field.dbFieldName)
    if (options) {
      const option = options.find(opt => opt.value === value)
      return option?.label || value
    }
  }

  if (['select', 'radio'].includes(field?.controlType)) {
    const options = getFieldOptions(field)
    const option = options.find(opt => opt.value === value)
    return option?.label || value
  }

  return value
}

/**
 * 获取选项标签
 * @param {*} value - 值
 * @param {Object} field - 字段配置
 * @returns {string} 标签
 */
export function getOptionLabel(value, field) {
  const options = getFieldOptions(field)
  const option = options.find(opt => opt.value === value)
  return option?.label || value
}

/**
 * 获取状态标签类型
 * @param {*} value - 值
 * @param {Object} field - 字段配置
 * @returns {string} 标签类型
 */
export function getStatusTagType(value, field) {
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

/**
 * 获取字段标签
 * @param {string} fieldName - 字段名
 * @param {Object} tableConfig - 表配置
 * @returns {string} 字段标签
 */
export function getFieldLabel(fieldName, tableConfig) {
  if (!tableConfig?.fields) return fieldName
  const field = tableConfig.fields.find(
    f => f.dbFieldName === fieldName || f.dbFieldNameAlias === fieldName
  )
  return field?.dbFieldTxt || fieldName
}

/**
 * 判断附表是否是一对多关系
 * @param {Object} subTable - 附表配置
 * @returns {boolean} 是否一对多
 */
export function isOneToMany(subTable) {
  return subTable?.relationConfig?.relationType === RELATION_TYPES.ONE_TO_MANY
}

/**
 * 判断附表是否是一对一关系
 * @param {Object} subTable - 附表配置
 * @returns {boolean} 是否一对一
 */
export function isOneToOne(subTable) {
  return subTable?.relationConfig?.relationType === RELATION_TYPES.ONE_TO_ONE
}

/**
 * 获取附表的可编辑字段
 * @param {Object} subTable - 附表配置
 * @returns {Array} 字段数组
 */
export function getSubTableFormFields(subTable) {
  if (!subTable?.fields) return []
  return subTable.fields.filter(
    f => f.isShowForm && f.dbFieldName !== subTable.relationConfig?.subTableField
  )
}
