<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElCard } from 'element-plus'
import { getAllTableHeads, getTableConfigById } from '@/mock/tableHead'
import { queryById } from '@/mock/tableData'

// 引入 composables
import { useTableData } from './composables/useTableData'
import { useForm } from './composables/useForm'
import { useSubTable } from './composables/useSubTable'

// 引入组件
import TableSelector from './components/TableSelector.vue'
import QueryPanel from './components/QueryPanel.vue'
import DataList from './components/DataList.vue'
import FormDialog from './components/FormDialog.vue'
import DetailDialog from './components/DetailDialog.vue'

const route = useRoute()

// 表选择相关状态
const tableHeads = ref([])
const selectedTableId = ref(null)
const selectedTableConfig = ref(null)

// 是否通过路由参数进入（预览模式）
const isPreviewMode = computed(() => {
  return !!route.params.tableId
})

// 当前表类型
const currentTableType = computed(() => {
  return selectedTableConfig.value?.tableType ?? 0
})

// 是否是附表
const isSubTable = computed(() => {
  return currentTableType.value === 2
})

// 是否是主表
const isMainTable = computed(() => {
  return currentTableType.value === 1
})

// 详情弹窗相关
const detailVisible = ref(false)
const detailData = ref(null)

// 使用 composables
const {
  loading,
  tableData,
  selectedRows,
  pagination,
  queryParams,
  queryFormExpanded,
  listFields,
  queryFields,
  handleSearch,
  handleReset,
  fetchData,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  handleDelete,
  handleBatchDelete
} = useTableData({
  selectedTableId,
  selectedTableConfig
})

const {
  dialogVisible,
  dialogTitle,
  formRef,
  isEdit,
  formData,
  formRules,
  formFields,
  formColumns,
  openAddDialog,
  openEditDialog,
  handleSubmit: submitForm
} = useForm({
  selectedTableId,
  selectedTableConfig,
  fetchData
})

const {
  subTableDataMap,
  activeSubTableTab,
  detailSubTableDataMap,
  relatedSubTables,
  initSubTableData,
  addSubTableRow,
  removeSubTableRow,
  initDetailSubTableData
} = useSubTable({
  selectedTableConfig
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

// 监听表选择变化
watch(selectedTableId, newVal => {
  if (newVal) {
    selectedTableConfig.value = getTableConfigById(newVal)
  } else {
    selectedTableConfig.value = null
  }
})

// 打开详情弹窗
const openDetailDialog = async row => {
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

// 处理表单提交（包含附表数据）
const handleSubmit = async () => {
  // 这里可以处理附表数据的保存
  await submitForm()
}

// 打开新增弹窗（包含附表初始化）
const handleOpenAddDialog = () => {
  openAddDialog()
  // 主表需要初始化附表数据
  if (isMainTable.value) {
    initSubTableData()
    activeSubTableTab.value = 0
  }
}

// 打开编辑弹窗（包含附表初始化）
const handleOpenEditDialog = async row => {
  await openEditDialog(row)
  // 主表需要初始化附表数据，传入主表ID以加载已有数据
  if (isMainTable.value) {
    await initSubTableData(row.id)
    activeSubTableTab.value = 0
  }
}

onMounted(() => {
  fetchTableHeads()

  // 检查路由参数，如果有 tableId 参数，自动选择该表
  const tableIdFromRoute = route.params.tableId
  if (tableIdFromRoute) {
    // 等待表列表加载完成后再选择
    const checkAndSelect = () => {
      if (tableHeads.value.length > 0) {
        const tableExists = tableHeads.value.some(t => t.id === tableIdFromRoute)
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
    <TableSelector
      v-if="!isPreviewMode"
      :table-heads="tableHeads"
      v-model:selected-table-id="selectedTableId"
    />

    <!-- 附表提示信息 -->
    <ElCard v-if="isSubTable && selectedTableId" class="sub-table-tip-card" v-show="false">
      <div class="sub-table-tip">
        <el-icon :size="18" color="#e6a23c">
          <Warning />
        </el-icon>
        <span class="tip-text"
          >这是一个附表，数据将关联到主表。附表数据需要在主表数据录入时同时录入，或通过主表数据详情查看和编辑。</span
        >
      </div>
    </ElCard>

    <!-- 查询表单区域 -->
    <QueryPanel
      v-if="selectedTableId && queryFields.length > 0"
      :query-fields="queryFields"
      v-model:query-params="queryParams"
      v-model:query-form-expanded="queryFormExpanded"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据列表区域 -->
    <DataList
      :table-data="tableData"
      :list-fields="listFields"
      :selected-rows="selectedRows"
      :loading="loading"
      :pagination="pagination"
      :selected-table-config="selectedTableConfig"
      :is-sub-table="isSubTable"
      @selection-change="handleSelectionChange"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @add="handleOpenAddDialog"
      @delete="handleDelete"
      @detail="openDetailDialog"
      @edit="handleOpenEditDialog"
      @batch-delete="handleBatchDelete"
    />

    <!-- 新增/编辑弹窗 -->
    <FormDialog
      :visible="dialogVisible"
      @update:visible="v => (dialogVisible = v)"
      :title="dialogTitle"
      :form-data="formData"
      :form-rules="formRules"
      :form-fields="formFields"
      :form-columns="formColumns"
      :is-edit="isEdit"
      :is-main-table="isMainTable"
      :related-sub-tables="relatedSubTables"
      :sub-table-data-map="subTableDataMap"
      :active-sub-table-tab="activeSubTableTab"
      @update:active-sub-table-tab="v => (activeSubTableTab = v)"
      @submit="handleSubmit"
      @add-sub-table-row="addSubTableRow"
      @remove-sub-table-row="removeSubTableRow"
    />

    <!-- 详情弹窗 -->
    <DetailDialog
      :visible="detailVisible"
      @update:visible="v => (detailVisible = v)"
      :detail-data="detailData"
      :form-fields="formFields"
      :form-columns="formColumns"
      :is-main-table="isMainTable"
      :related-sub-tables="relatedSubTables"
      :detail-sub-table-data-map="detailSubTableDataMap"
    />
  </div>
</template>

<style scoped>
.table-data-page {
  padding: 20px;
}

.sub-table-tip-card {
  margin-bottom: 16px;
}

.sub-table-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fdf6ec;
  border-radius: 4px;
}

.tip-text {
  color: #e6a23c;
  font-size: 14px;
}
</style>
