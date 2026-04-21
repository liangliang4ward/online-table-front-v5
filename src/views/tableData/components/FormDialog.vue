<script setup>
import { computed } from 'vue'
import FormField from '@/components/form/FormField.vue'
import {
  getFieldItemStyle,
  getFieldItemClass,
  getSubTableFormFields,
  isOneToOne,
  isOneToMany
} from '@/utils/form-utils'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: '新增数据'
  },
  formData: {
    type: Object,
    required: true
  },
  formRules: {
    type: Object,
    default: () => ({})
  },
  formFields: {
    type: Array,
    default: () => []
  },
  formColumns: {
    type: Number,
    default: 2
  },
  isEdit: {
    type: Boolean,
    default: false
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
  subTableDataMap: {
    type: Object,
    default: () => ({})
  },
  activeSubTableTab: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'update:visible',
  'update:formData',
  'update:subTableDataMap',
  'update:activeSubTableTab',
  'submit',
  'cancel',
  'addSubTableRow',
  'removeSubTableRow'
])

const dialogWidth = computed(() => {
  const columns = props.formColumns
  const hasSubTables = props.isMainTable && props.relatedSubTables.length > 0

  if (columns === 4) {
    return hasSubTables ? '1400px' : '1200px'
  }
  return hasSubTables ? '1100px' : '900px'
})

const updateFormData = (fieldName, value) => {
  emit('update:formData', { ...props.formData, [fieldName]: value })
}

const handleClose = () => {
  emit('update:visible', false)
  emit('cancel')
}

const handleSubmit = () => {
  emit('submit')
}

const updateActiveSubTableTab = value => {
  emit('update:activeSubTableTab', value)
}

const handleAddSubTableRow = subTableId => {
  emit('addSubTableRow', subTableId)
}

const handleRemoveSubTableRow = (subTableId, index) => {
  emit('removeSubTableRow', subTableId, index)
}

const getFieldName = field => {
  return field.dbFieldNameAlias || field.dbFieldName
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    @update:model-value="handleClose"
    :title="title"
    :width="dialogWidth"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <!-- 主表表单（始终显示在顶部） -->
    <div class="main-table-section">
      <div class="section-title">主表数据</div>
      <ElForm :model="formData" :rules="formRules" label-width="100px" class="data-form">
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
            :prop="getFieldName(field)"
            :class="getFieldItemClass(field)"
            :style="getFieldItemStyle(field, index, formFields, null, formColumns)"
          >
            <FormField
              :field="field"
              :model-value="formData[getFieldName(field)]"
              @update:model-value="v => updateFormData(getFieldName(field), v)"
              :is-edit="isEdit"
            />
          </ElFormItem>
        </div>
      </ElForm>
    </div>

    <!-- 附表数据Tab（主表有附表时显示，新增和编辑模式都显示） -->
    <div v-if="isMainTable && relatedSubTables.length > 0" class="sub-tables-section">
      <div class="section-divider"></div>
      <div class="section-title">附表数据</div>
      <ElTabs
        v-if="relatedSubTables.length > 0"
        :model-value="activeSubTableTab"
        @update:model-value="updateActiveSubTableTab"
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
                          subTableDataMap[subTable.id][0][
                            field.dbFieldNameAlias || field.dbFieldName
                          ]
                        "
                        :disabled="field.isReadOnly"
                        size="small"
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
                <ElButton type="primary" size="small" @click="handleAddSubTableRow(subTable.id)">
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
                      <FormField
                        :field="field"
                        :model-value="row[field.dbFieldNameAlias || field.dbFieldName]"
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
                        @click="handleRemoveSubTableRow(subTable.id, $index)"
                      >
                        删除
                      </ElButton>
                    </template>
                  </ElTableColumn>
                </ElTable>
              </div>

              <ElEmpty v-else description="暂无明细数据，点击上方按钮添加" :image-size="80" />
            </template>
          </div>
        </ElTabPane>
      </ElTabs>
    </div>

    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">确定</ElButton>
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

.form-grid :deep(.el-input),
.form-grid :deep(.el-select),
.form-grid :deep(.el-date-editor) {
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
  border-bottom: 1px solid #ebeef5;
}

.sub-table-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.sub-table-table-wrapper {
  width: 100%;
}
</style>
