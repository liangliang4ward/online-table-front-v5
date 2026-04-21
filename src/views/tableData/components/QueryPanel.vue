<script setup>
import { getFieldOptions } from '@/utils'

const props = defineProps({
  queryFields: {
    type: Array,
    required: true
  },
  queryParams: {
    type: Object,
    required: true
  },
  queryFormExpanded: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:queryParams', 'update:queryFormExpanded', 'search', 'reset'])

const updateQueryParam = (key, value) => {
  emit('update:queryParams', { ...props.queryParams, [key]: value })
}

const toggleExpanded = () => {
  emit('update:queryFormExpanded', !props.queryFormExpanded)
}

const handleSearch = () => {
  emit('search')
}

const handleReset = () => {
  emit('reset')
}

const getFieldName = field => {
  return field.dbFieldNameAlias || field.dbFieldName
}
</script>

<template>
  <ElCard class="query-card">
    <div class="query-header" @click="toggleExpanded">
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
                  :model-value="queryParams[`${getFieldName(field)}Start`]"
                  @update:model-value="v => updateQueryParam(`${getFieldName(field)}Start`, v)"
                  :type="field.dbType === 'date' ? 'date' : 'datetime'"
                  placeholder="开始时间"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 180px"
                />
                <span class="between-separator">至</span>
                <ElDatePicker
                  :model-value="queryParams[`${getFieldName(field)}End`]"
                  @update:model-value="v => updateQueryParam(`${getFieldName(field)}End`, v)"
                  :type="field.dbType === 'date' ? 'date' : 'datetime'"
                  placeholder="结束时间"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 180px"
                />
              </template>
              <!-- 数字类型区间查询 -->
              <template v-else-if="['int', 'bigint', 'tinyint', 'decimal'].includes(field.dbType)">
                <ElInputNumber
                  :model-value="queryParams[`${getFieldName(field)}Start`]"
                  @update:model-value="v => updateQueryParam(`${getFieldName(field)}Start`, v)"
                  placeholder="最小值"
                  :controls="false"
                  style="width: 140px"
                />
                <span class="between-separator">至</span>
                <ElInputNumber
                  :model-value="queryParams[`${getFieldName(field)}End`]"
                  @update:model-value="v => updateQueryParam(`${getFieldName(field)}End`, v)"
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
            <template
              v-if="['select', 'selectMultiple', 'radio', 'checkbox'].includes(field.controlType)"
            >
              <ElSelect
                v-if="field.controlType === 'select' || field.queryType === 'eq'"
                :model-value="queryParams[getFieldName(field)]"
                @update:model-value="v => updateQueryParam(getFieldName(field), v)"
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
                :model-value="queryParams[getFieldName(field)]"
                @update:model-value="v => updateQueryParam(getFieldName(field), v)"
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
              v-else-if="
                ['datePicker', 'datetimePicker'].includes(field.controlType) ||
                ['date', 'datetime'].includes(field.dbType)
              "
              :model-value="queryParams[getFieldName(field)]"
              @update:model-value="v => updateQueryParam(getFieldName(field), v)"
              :type="field.dbType === 'date' ? 'date' : 'datetime'"
              :placeholder="`请选择${field.dbFieldTxt || field.dbFieldName}`"
              value-format="YYYY-MM-DD HH:mm:ss"
              clearable
              style="width: 180px"
            />
            <!-- 数字输入 -->
            <ElInputNumber
              v-else-if="
                ['inputNumber'].includes(field.controlType) ||
                ['int', 'bigint', 'tinyint', 'decimal'].includes(field.dbType)
              "
              :model-value="queryParams[getFieldName(field)]"
              @update:model-value="v => updateQueryParam(getFieldName(field), v)"
              :placeholder="`请输入${field.dbFieldTxt || field.dbFieldName}`"
              :controls="false"
              clearable
              style="width: 180px"
            />
            <!-- 文本输入（默认） -->
            <ElInput
              v-else
              :model-value="queryParams[getFieldName(field)]"
              @update:model-value="v => updateQueryParam(getFieldName(field), v)"
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
</template>

<style scoped>
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
  border-bottom: 1px solid #ebeef5;
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
  border-top: 1px dashed #ebeef5;
}
</style>
