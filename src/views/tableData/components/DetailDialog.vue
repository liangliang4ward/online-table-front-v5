<script setup>
import { computed } from 'vue'
import FormField from '@/components/form/FormField.vue'
import {
  getControlType,
  getFieldItemStyle,
  getFieldItemClass,
  getSubTableFormFields,
  isOneToOne,
  getOptionLabel
} from '@/utils'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  detailData: {
    type: Object,
    default: null
  },
  formFields: {
    type: Array,
    default: () => []
  },
  formColumns: {
    type: Number,
    default: 2
  },
  // 附表相关
  isMainTable: {
    type: Boolean,
    default: false
  },
  relatedSubTables: {
    type: Array,
    default: () => []
  },
  detailSubTableDataMap: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'close'])

const dialogWidth = computed(() => {
  const columns = props.formColumns
  const hasSubTables = props.isMainTable && props.relatedSubTables.length > 0

  if (columns === 4) {
    return hasSubTables ? '1400px' : '1200px'
  }
  return hasSubTables ? '1100px' : '900px'
})

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const getFieldName = field => {
  return field.dbFieldNameAlias || field.dbFieldName
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    @update:model-value="handleClose"
    title="数据详情"
    :width="dialogWidth"
    destroy-on-close
  >
    <!-- 主表表单（始终显示在顶部，只读） -->
    <div class="main-table-section">
      <div class="section-title">主表数据</div>
      <ElForm label-width="100px" class="data-form">
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
            :style="getFieldItemStyle(field, index, formFields, null, formColumns)"
          >
            <FormField :field="field" :model-value="detailData?.[getFieldName(field)]" readonly />
          </ElFormItem>
        </div>
      </ElForm>
    </div>

    <!-- 附表数据Tab（主表有附表时显示，只读模式） -->
    <div v-if="isMainTable && relatedSubTables.length > 0" class="sub-tables-section">
      <div class="section-divider"></div>
      <div class="section-title">附表数据</div>
      <ElTabs v-if="relatedSubTables.length > 0" class="form-tabs">
        <ElTabPane
          v-for="subTable in relatedSubTables"
          :key="subTable.id"
          :label="subTable.tableTxt || subTable.tableName"
        >
          <div class="sub-table-section">
            <!-- 一对一关系：直接渲染表单（只读） -->
            <template v-if="isOneToOne(subTable)">
              <div
                v-if="
                  detailSubTableDataMap[subTable.id] &&
                  detailSubTableDataMap[subTable.id].length > 0
                "
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
                      :style="
                        getFieldItemStyle(
                          field,
                          index,
                          getSubTableFormFields(subTable),
                          subTable.formColumns || 2,
                          subTable.formColumns || 2
                        )
                      "
                    >
                      <FormField
                        :field="field"
                        :model-value="
                          detailSubTableDataMap[subTable.id][0][
                            field.dbFieldNameAlias || field.dbFieldName
                          ]
                        "
                        readonly
                      />
                    </ElFormItem>
                  </div>
                </ElForm>
              </div>
              <ElEmpty v-else description="暂无附表数据" :image-size="60" />
            </template>

            <!-- 一对多关系：表格样式展示（只读） -->
            <template v-else>
              <div
                v-if="
                  detailSubTableDataMap[subTable.id] &&
                  detailSubTableDataMap[subTable.id].length > 0
                "
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
                      <ElTag v-else-if="getControlType(field) === 'select'" size="small">
                        {{
                          getOptionLabel(row[field.dbFieldNameAlias || field.dbFieldName], field)
                        }}
                      </ElTag>

                      <!-- 下拉多选（显示标签） -->
                      <div
                        v-else-if="getControlType(field) === 'selectMultiple'"
                        class="multi-select-display"
                      >
                        <ElTag
                          v-for="val in row[field.dbFieldNameAlias || field.dbFieldName] || []"
                          :key="val"
                          size="small"
                          class="mr-2"
                        >
                          {{ getOptionLabel(val, field) }}
                        </ElTag>
                      </div>

                      <!-- 单选框（显示标签） -->
                      <ElTag v-else-if="getControlType(field) === 'radio'" size="small">
                        {{
                          getOptionLabel(row[field.dbFieldNameAlias || field.dbFieldName], field)
                        }}
                      </ElTag>

                      <!-- 复选框（显示标签） -->
                      <div
                        v-else-if="getControlType(field) === 'checkbox'"
                        class="multi-select-display"
                      >
                        <ElTag
                          v-for="val in row[field.dbFieldNameAlias || field.dbFieldName] || []"
                          :key="val"
                          size="small"
                          class="mr-2"
                        >
                          {{ getOptionLabel(val, field) }}
                        </ElTag>
                      </div>

                      <!-- 日期/日期时间 -->
                      <span
                        v-else-if="['datePicker', 'datetimePicker'].includes(getControlType(field))"
                      >
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

              <ElEmpty v-else description="暂无明细数据" :image-size="60" />
            </template>
          </div>
        </ElTabPane>
      </ElTabs>
    </div>

    <template #footer>
      <ElButton @click="handleClose">关闭</ElButton>
    </template>
  </ElDialog>
</template>

<style scoped>
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
  border-left: 3px solid #409eff;
}

/* 附表区域样式 */
.sub-tables-section {
  width: 100%;
  margin-top: 16px;
}

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e4e7ed 50%, transparent 100%);
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

/* 表单网格布局 */
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

/* 附表区域样式 */
.sub-table-section {
  width: 100%;
}

.sub-table-table-wrapper {
  width: 100%;
}

.multi-select-display {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.mr-2 {
  margin-right: 8px;
}
</style>
