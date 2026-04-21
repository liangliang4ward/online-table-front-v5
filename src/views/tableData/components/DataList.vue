<script setup>
import { computed } from 'vue'
import { formatValue, getStatusTagType } from '@/utils'

const props = defineProps({
  tableData: {
    type: Array,
    required: true
  },
  listFields: {
    type: Array,
    required: true
  },
  selectedRows: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    required: true
  },
  selectedTableConfig: {
    type: Object,
    default: null
  },
  isSubTable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'selection-change',
  'size-change',
  'current-change',
  'add',
  'delete',
  'detail',
  'edit',
  'batch-delete'
])

const hasCheckbox = computed(() => {
  return props.selectedTableConfig?.isCheckbox === 'Y'
})

const handleSelectionChange = rows => {
  emit('selection-change', rows)
}

const handleSizeChange = size => {
  emit('size-change', size)
}

const handleCurrentChange = current => {
  emit('current-change', current)
}

const handleAdd = () => {
  emit('add')
}

const handleDelete = row => {
  emit('delete', row)
}

const handleDetail = row => {
  emit('detail', row)
}

const handleEdit = row => {
  emit('edit', row)
}

const handleBatchDelete = () => {
  emit('batch-delete')
}
</script>

<template>
  <ElCard v-if="selectedTableConfig" class="data-card">
    <!-- 操作栏 -->
    <div class="action-bar">
      <!-- 附表不允许单独新增数据 -->
      <ElButton v-if="!isSubTable" type="primary" @click="handleAdd"> 新增数据 </ElButton>
      <ElButton
        v-if="isSubTable"
        type="primary"
        disabled
        title="附表数据需要在主表数据录入时同时录入"
      >
        新增数据（需通过主表操作）
      </ElButton>
      <ElButton type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
        批量删除
      </ElButton>
      <div class="table-info">
        <ElTag v-if="selectedTableConfig?.tableName" type="primary">{{
          selectedTableConfig.tableName
        }}</ElTag>
        <span class="table-txt" v-if="selectedTableConfig?.tableTxt">{{
          selectedTableConfig.tableTxt
        }}</span>
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
      <ElTableColumn v-if="hasCheckbox" type="selection" width="50" align="center" />
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
          <ElButton type="primary" link size="small" @click="handleDetail(row)">详情</ElButton>
          <ElButton type="primary" link size="small" @click="handleEdit(row)">编辑</ElButton>
          <ElButton type="danger" link size="small" @click="handleDelete(row)">删除</ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <!-- 分页 -->
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

  <!-- 空状态 -->
  <ElCard v-else class="empty-card">
    <div class="empty-hint">
      <p>请从上方选择要管理的数据表</p>
    </div>
  </ElCard>
</template>

<style scoped>
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
</style>
