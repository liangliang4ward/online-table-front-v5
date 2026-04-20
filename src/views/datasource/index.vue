<script setup>
import { ref, reactive, onMounted } from 'vue'
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
  ElSelect,
  ElOption,
  ElMessage,
  ElMessageBox,
  ElTag
} from 'element-plus'
import { pageQuery, insert, update, deleteById, batchDeleteByIds } from '@/mock/datasource'

const DB_TYPE_OPTIONS = [
  { label: 'MySQL', value: 'mysql' }
]

const loading = ref(false)
const tableData = ref([])
const selectedRows = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增数据源')
const formRef = ref(null)
const queryParams = reactive({
  datasourceName: '',
  dbType: '',
  pageNo: 1,
  pageSize: 10
})
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10
})
const formData = reactive({
  id: null,
  datasourceName: '',
  dbType: 'mysql',
  dbUrl: '',
  dbUsername: '',
  dbPassword: '',
  dbExtInfo: ''
})
const formRules = {
  datasourceName: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
  dbUrl: [{ required: true, message: '请输入连接地址', trigger: 'blur' }]
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
  queryParams.datasourceName = ''
  queryParams.dbType = ''
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

const openAddDialog = () => {
  dialogTitle.value = '新增数据源'
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = async (row) => {
  dialogTitle.value = '编辑数据源'
  resetForm()
  Object.assign(formData, {
    id: row.id,
    datasourceName: row.datasourceName,
    dbType: row.dbType || 'mysql',
    dbUrl: row.dbUrl,
    dbUsername: row.dbUsername,
    dbPassword: row.dbPassword,
    dbExtInfo: row.dbExtInfo || ''
  })
  dialogVisible.value = true
}

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    datasourceName: '',
    dbType: 'mysql',
    dbUrl: '',
    dbUsername: '',
    dbPassword: '',
    dbExtInfo: ''
  })
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    const api = formData.id ? update : insert
    const res = await api(formData)
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
  ElMessageBox.confirm(`确定要删除数据源「${row.datasourceName}」吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteById(row.id)
      if (res.success) {
        ElMessage.success('删除成功')
        fetchData()
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条数据吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
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
  }).catch(() => {})
}

const getDbTypeLabel = (dbType) => {
  if (!dbType) return '-'
  const option = DB_TYPE_OPTIONS.find((item) => item.value === dbType)
  return option?.label || dbType
}

const getDbTypeTagType = (dbType) => {
  if (!dbType) return 'info'
  return 'primary'
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="datasource-page">
    <ElCard class="search-card">
      <div class="search-bar">
        <div class="search-item">
          <span class="search-label">数据源名称</span>
          <ElInput
            v-model="queryParams.datasourceName"
            placeholder="请输入数据源名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="search-item">
          <span class="search-label">数据库类型</span>
          <ElSelect
            v-model="queryParams.dbType"
            placeholder="请选择数据库类型"
            clearable
            style="width: 150px"
          >
            <ElOption
              v-for="item in DB_TYPE_OPTIONS"
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
        <ElButton type="primary" @click="openAddDialog">新增数据源</ElButton>
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
        <ElTableColumn prop="id" label="ID" width="80" align="center" />
        <ElTableColumn prop="datasourceName" label="数据源名称" min-width="150" />
        <ElTableColumn prop="dbType" label="数据库类型" width="120" align="center">
          <template #default="{ row }">
            <ElTag :type="getDbTypeTagType(row.dbType)">
              {{ getDbTypeLabel(row.dbType) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="dbUrl" label="连接地址" min-width="250" show-overflow-tooltip />
        <ElTableColumn prop="dbUsername" label="用户名" width="120" />
        <ElTableColumn prop="createTime" label="创建时间" width="170" align="center" />
        <ElTableColumn label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton type="primary" link size="small" @click="openEditDialog(row)">编辑</ElButton>
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

    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="550px" destroy-on-close>
      <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <ElFormItem label="数据源名称" prop="datasourceName">
          <ElInput v-model="formData.datasourceName" placeholder="请输入数据源名称" />
        </ElFormItem>
        <ElFormItem label="数据库类型" prop="dbType">
          <ElSelect v-model="formData.dbType" placeholder="请选择数据库类型" style="width: 100%">
            <ElOption
              v-for="item in DB_TYPE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="连接地址" prop="dbUrl">
          <ElInput v-model="formData.dbUrl" placeholder="请输入数据库连接地址" />
        </ElFormItem>
        <ElFormItem label="用户名" prop="dbUsername">
          <ElInput v-model="formData.dbUsername" placeholder="请输入数据库用户名" />
        </ElFormItem>
        <ElFormItem label="密码" prop="dbPassword">
          <ElInput
            v-model="formData.dbPassword"
            type="password"
            placeholder="请输入数据库密码"
            show-password
          />
        </ElFormItem>
        <ElFormItem label="扩展信息" prop="dbExtInfo">
          <ElInput
            v-model="formData.dbExtInfo"
            type="textarea"
            :rows="3"
            placeholder="请输入扩展信息（JSON格式）"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.datasource-page {
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
</style>
