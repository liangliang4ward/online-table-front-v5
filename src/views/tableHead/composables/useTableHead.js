import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  pageQuery,
  queryById,
  insert,
  update,
  deleteById,
  batchDeleteByIds,
  syncDb
} from '@/mock/tableHead'
import { pageQuery as queryDatasourceList } from '@/mock/datasource'
import { getDefaultFields, getPreviewLink } from '@/utils'

/**
 * 表管理核心逻辑
 * @returns {Object} 表管理相关的状态和方法
 */
export function useTableHead() {
  const router = useRouter()

  // 状态变量
  const loading = ref(false)
  const tableData = ref([])
  const selectedRows = ref([])

  // 查询参数
  const queryParams = reactive({
    tableName: '',
    tableType: null,
    isDbSynch: '',
    pageNo: 1,
    pageSize: 10
  })

  // 分页
  const pagination = reactive({
    total: 0,
    current: 1,
    pageSize: 10
  })

  // 弹窗相关
  const dialogVisible = ref(false)
  const dialogTitle = ref('新增数据表')
  const isEdit = ref(false)
  const formRef = ref(null)
  const activeTab = ref('fields')
  const baseInfoExpanded = ref(true)

  // 数据源选项
  const datasourceOptions = ref([])
  const mainTableOptions = ref([])

  // 表单数据
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

  // 表单规则
  const baseFormRules = {
    tableName: [{ required: true, message: '请输入表名', trigger: 'blur' }],
    tableTxt: [{ required: true, message: '请输入表说明', trigger: 'blur' }],
    tableType: [{ required: true, message: '请选择表类型', trigger: 'change' }]
  }

  // 计算属性：字段选项（用于索引配置）
  const fieldOptions = computed(() => {
    return formData.fields.map(f => ({
      label: f.dbFieldName,
      value: f.dbFieldName
    }))
  })

  // 主表字段选项（用于附表关联字段配置）
  const mainTableFieldOptions = computed(() => {
    const mainTable = mainTableOptions.value.find(t => t.tableName === formData.mainTable)
    if (!mainTable?.fields) return []
    return mainTable.fields.map(f => ({
      label: f.dbFieldName,
      value: f.dbFieldName
    }))
  })

  // 附表字段选项
  const subTableFieldOptions = computed(() => {
    return formData.fields.map(f => ({
      label: f.dbFieldName,
      value: f.dbFieldName
    }))
  })

  // 获取数据源选项
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

  // 获取主表选项
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

  // 表类型变化处理
  const handleTableTypeChange = val => {
    if (val === 2) {
      fetchMainTableOptions()
    } else {
      formData.mainTable = ''
    }
  }

  // 获取数据列表
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

  // 查询
  const handleSearch = () => {
    pagination.current = 1
    fetchData()
  }

  // 重置
  const handleReset = () => {
    queryParams.tableName = ''
    queryParams.tableType = null
    queryParams.isDbSynch = ''
    pagination.current = 1
    fetchData()
  }

  // 分页变化
  const handleSizeChange = size => {
    pagination.pageSize = size
    fetchData()
  }

  const handleCurrentChange = current => {
    pagination.current = current
    fetchData()
  }

  // 选择变化
  const handleSelectionChange = rows => {
    selectedRows.value = rows
  }

  // 重置表单
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

  // 打开新增弹窗
  const openAddDialog = () => {
    dialogTitle.value = '新增数据表'
    isEdit.value = false
    resetFormData()
    dialogVisible.value = true
  }

  // 打开编辑弹窗
  const openEditDialog = async row => {
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

  // 提交表单
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

  // 删除
  const handleDelete = row => {
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

  // 批量删除
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
          const ids = selectedRows.value.map(row => row.id)
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

  // 同步到数据库
  const handleSyncDb = row => {
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

  // 打开数据预览页面
  const openDataPreview = row => {
    router.push(`/tableData/${row.id}`)
  }

  // 复制预览链接
  const copyPreviewLink = row => {
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

  return {
    // 状态
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

    // 方法
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
  }
}
