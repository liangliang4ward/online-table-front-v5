<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
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
  ElRadio,
  ElRadioGroup,
  ElTag,
  ElTabs,
  ElTabPane,
  ElDivider,
  ElPopover,
  ElTooltip
} from 'element-plus'
import {
  TABLE_TYPE_OPTIONS,
  SYNC_STATUS_OPTIONS,
  DB_TYPE_OPTIONS,
  ID_TYPE_OPTIONS,
  FORM_COLUMNS_OPTIONS,
  RELATION_TYPE_OPTIONS,
  SYSTEM_FIELDS,
  FIXED_NAME_FIELDS
} from '@/constants'
import {
  toCamelCase,
  isAllowDecimal,
  getTableTypeLabel,
  getTableTypeTagType,
  getSyncStatusLabel,
  getSyncStatusTagType,
  getDbTypeLabel,
  getIndexTypeLabel
} from '@/utils'

// 引入 composables
import { useTableHead } from './composables/useTableHead'
import { useFieldConfig } from './composables/useFieldConfig'
import { useIndexConfig } from './composables/useIndexConfig'

// 使用表管理核心逻辑
const {
  loading,
  tableData,
  selectedRows,
  queryParams,
  pagination,
  dialogVisible,
  dialogTitle,
  isEdit,
  formRef,
  activeTab,
  baseInfoExpanded,
  datasourceOptions,
  mainTableOptions,
  formData,
  baseFormRules,
  fieldOptions,
  mainTableFieldOptions,
  subTableFieldOptions,
  fetchDatasourceOptions,
  fetchMainTableOptions,
  handleTableTypeChange,
  fetchData,
  handleSearch,
  handleReset,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  resetFormData,
  openAddDialog,
  openEditDialog,
  handleSubmit,
  handleDelete,
  handleBatchDelete,
  handleSyncDb,
  openDataPreview,
  copyPreviewLink
} = useTableHead()

// 使用字段配置逻辑
const formDataRef = ref(formData)

const {
  fieldConfigDialogVisible,
  currentFieldIndex,
  fieldConfigFormRef,
  fieldConfigActiveTab,
  currentConfigField,
  fieldConfigFormData,
  availableControlTypes,
  availableQueryTypes,
  needOptionConfig,
  needDateFormatConfig,
  needFileConfig,
  isTextFieldType,
  isNumberFieldType,
  availableDateFormatOptions,
  openFieldConfigDialog,
  handleFieldConfigSubmit,
  addOption,
  removeOption,
  handlePresetRuleChange
} = useFieldConfig({ formData: formDataRef })

// 使用索引配置逻辑
const {
  indexDialogVisible,
  indexDialogTitle,
  indexFormRef,
  currentIndexIndex,
  indexFormData,
  indexFormRules,
  resetIndexForm,
  openAddIndexDialog,
  openEditIndexDialog,
  handleIndexSubmit,
  handleDeleteIndex
} = useIndexConfig({ formData: formDataRef })

// ID类型变化处理
const handleIdTypeChange = row => {
  if (row.dbFieldName === 'id') {
    if (row.dbType === 'int') {
      row.dbLength = null
    } else {
      row.dbLength = 36
    }
  }
}

// 字段名变化处理
const handleFieldNameChange = row => {
  if (row.dbFieldName) {
    row.dbFieldNameAlias = toCamelCase(row.dbFieldName)
  }
}

// 添加字段
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

  const firstSystemFieldIndex = formData.fields.findIndex(field =>
    SYSTEM_FIELDS.includes(field.dbFieldName)
  )

  if (firstSystemFieldIndex === -1) {
    formData.fields.push(newField)
  } else {
    formData.fields.splice(firstSystemFieldIndex, 0, newField)
  }
}

// 删除字段
const handleDeleteField = index => {
  formData.fields.splice(index, 1)
}

onMounted(() => {
  fetchData()
  fetchDatasourceOptions()
})
</script>

<template>
  <div class="table-head-page">
    <!-- 搜索卡片 -->
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

    <!-- 数据表格 -->
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
              {{ getTableTypeLabel(row.tableType, TABLE_TYPE_OPTIONS) }}
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
            <ElPopover placement="bottom" :width="350" trigger="click">
              <template #reference>
                <ElButton type="info" link size="small">复制链接</ElButton>
              </template>
              <div class="link-popover">
                <p class="link-label">数据预览链接：</p>
                <div class="link-content">
                  <ElInput
                    :model-value="window.location.origin + '/tableData/' + row.id"
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
          :current-page="pagination.current"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>

    <!-- 新增/编辑弹窗 -->
    <ElDialog
      :model-value="dialogVisible"
      @update:model-value="v => (dialogVisible = v)"
      :title="dialogTitle"
      width="1200px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <!-- 基础信息 -->
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
        <ElForm
          v-show="baseInfoExpanded"
          ref="formRef"
          :model="formData"
          :rules="baseFormRules"
          label-width="70px"
          class="base-form"
          size="small"
        >
          <div class="form-row">
            <ElFormItem label="表名" prop="tableName">
              <ElInput v-model="formData.tableName" placeholder="请输入表名" :disabled="isEdit" />
            </ElFormItem>
            <ElFormItem label="表说明" prop="tableTxt">
              <ElInput v-model="formData.tableTxt" placeholder="请输入表说明" />
            </ElFormItem>
            <ElFormItem label="表类型" prop="tableType">
              <ElSelect
                v-model="formData.tableType"
                placeholder="请选择表类型"
                @change="handleTableTypeChange"
              >
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
                <ElSelect
                  v-model="formData.mainTable"
                  placeholder="请选择主表"
                  filterable
                  style="width: 100%"
                >
                  <ElOption
                    v-for="item in mainTableOptions"
                    :key="item.id"
                    :label="`${item.tableName} - ${item.tableTxt}`"
                    :value="item.tableName"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="关联类型">
                <ElSelect
                  v-model="formData.relationConfig.relationType"
                  placeholder="请选择关联类型"
                  style="width: 100%"
                >
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
                <ElSelect
                  v-model="formData.relationConfig.mainTableField"
                  placeholder="请选择主表关联字段"
                  style="width: 100%"
                >
                  <ElOption
                    v-for="item in mainTableFieldOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="附表关联字段">
                <ElSelect
                  v-model="formData.relationConfig.subTableField"
                  placeholder="请选择附表关联字段"
                  style="width: 100%"
                >
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
                <ElInput
                  v-model="formData.relationConfig.relationFieldName"
                  placeholder="请输入关联字段别名（驼峰命名）"
                />
              </ElFormItem>
            </div>
          </div>
        </ElForm>

        <!-- 配置Tabs -->
        <ElTabs v-model="activeTab" class="config-tabs">
          <!-- 字段配置Tab -->
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
                    :disabled="
                      SYSTEM_FIELDS.includes(row.dbFieldName) ||
                      ['create_by', 'update_by'].includes(row.dbFieldName)
                    "
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
                    :disabled="
                      SYSTEM_FIELDS.includes(row.dbFieldName) ||
                      (row.dbFieldName === 'id' && row.dbType === 'int')
                    "
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
                    :disabled="
                      SYSTEM_FIELDS.includes(row.dbFieldName) || !isAllowDecimal(row.dbType)
                    "
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

          <!-- 索引配置Tab -->
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
                  <ElButton
                    type="primary"
                    link
                    size="small"
                    @click="openEditIndexDialog(row, $index)"
                  >
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

    <!-- 索引配置弹窗 -->
    <ElDialog
      :model-value="indexDialogVisible"
      @update:model-value="v => (indexDialogVisible = v)"
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
          <ElSelect
            v-model="indexFormData.indexType"
            placeholder="请选择索引类型"
            style="width: 100%"
          >
            <ElOption
              v-for="item in [
                { label: '普通索引', value: 'normal' },
                { label: '唯一索引', value: 'unique' }
              ]"
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

    <!-- 字段配置弹窗 -->
    <ElDialog
      :model-value="fieldConfigDialogVisible"
      @update:model-value="v => (fieldConfigDialogVisible = v)"
      title="字段配置"
      width="800px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <ElTabs v-model="fieldConfigActiveTab" type="card" class="field-config-tabs">
        <!-- 控件配置 Tab -->
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

            <ElFormItem label="查询方式">
              <ElSelect v-model="fieldConfigFormData.queryType" style="width: 100%">
                <ElOption
                  v-for="item in availableQueryTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>

            <!-- 选项配置 -->
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
            </template>

            <!-- 日期格式配置 -->
            <template v-if="needDateFormatConfig">
              <ElFormItem label="日期格式">
                <ElSelect
                  v-model="fieldConfigFormData.controlConfig.dateFormat"
                  style="width: 100%"
                >
                  <ElOption
                    v-for="item in availableDateFormatOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </template>

            <!-- 文件配置 -->
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
          </ElForm>
        </ElTabPane>

        <!-- 显示与布局 Tab -->
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
          </ElForm>
        </ElTabPane>

        <!-- 校验规则 Tab -->
        <ElTabPane label="校验规则" name="validation">
          <ElForm ref="fieldConfigFormRef" :model="fieldConfigFormData" label-width="100px">
            <ElFormItem label="必填校验">
              <ElSwitch
                v-model="fieldConfigFormData.validationRules.required"
                active-text="是"
                inactive-text="否"
              />
            </ElFormItem>

            <!-- 文本类型字段：预设规则、长度、正则 -->
            <template v-if="isTextFieldType">
              <ElFormItem label="预设规则">
                <ElSelect
                  v-model="fieldConfigFormData.validationRules.presetRule"
                  placeholder="选择预设校验规则"
                  clearable
                  style="width: 100%"
                  @change="handlePresetRuleChange"
                >
                  <ElOption
                    v-for="item in [
                      { label: '邮箱', value: 'email' },
                      { label: '手机号', value: 'phone' }
                    ]"
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
                  placeholder="请输入正则表达式"
                />
              </ElFormItem>
            </template>

            <!-- 数字类型字段：最小值、最大值 -->
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

.permission-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0 16px;
}

.permission-grid :deep(.el-form-item) {
  margin-bottom: 12px;
}

.validation-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.validation-row :deep(.el-form-item) {
  margin-bottom: 12px;
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
</style>
