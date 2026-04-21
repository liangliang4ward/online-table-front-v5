import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pageQuery, deleteById, batchDeleteByIds } from '@/mock/tableData'

/**
 * 数据列表相关的逻辑
 * @param {Object} options - 配置选项
 * @param {Ref} options.selectedTableId - 选中的表ID
 * @param {Ref} options.selectedTableConfig - 选中的表配置
 * @returns {Object} 数据列表相关的状态和方法
 */
export function useTableData(options = {}) {
  const { selectedTableId, selectedTableConfig } = options

  // 状态变量
  const loading = ref(false)
  const tableData = ref([])
  const selectedRows = ref([])

  // 分页
  const pagination = reactive({
    total: 0,
    current: 1,
    pageSize: 10
  })

  // 查询参数
  const queryParams = reactive({})

  // 查询表单是否展开
  const queryFormExpanded = ref(true)

  // 获取可显示的列表字段
  const listFields = computed(() => {
    if (!selectedTableConfig.value?.fields) return []
    return selectedTableConfig.value.fields.filter(f => f.isShowList !== false)
  })

  // 获取可查询的字段
  const queryFields = computed(() => {
    if (!selectedTableConfig.value?.fields) return []
    return selectedTableConfig.value.fields.filter(f => f.queryType && f.queryType !== 'none')
  })

  // 重置查询参数
  const resetQueryParams = () => {
    Object.keys(queryParams).forEach(key => {
      delete queryParams[key]
    })

    if (selectedTableConfig.value?.fields) {
      selectedTableConfig.value.fields.forEach(field => {
        if (field.queryType && field.queryType !== 'none') {
          const fieldName = field.dbFieldNameAlias || field.dbFieldName

          if (field.queryType === 'between') {
            queryParams[`${fieldName}Start`] = null
            queryParams[`${fieldName}End`] = null
          } else if (field.queryType === 'in') {
            queryParams[fieldName] = []
          } else {
            if (['int', 'bigint', 'tinyint', 'decimal'].includes(field.dbType)) {
              queryParams[fieldName] = null
            } else if (['date', 'datetime'].includes(field.dbType)) {
              queryParams[fieldName] = null
            } else {
              queryParams[fieldName] = ''
            }
          }
        }
      })
    }
  }

  // 处理查询
  const handleSearch = () => {
    pagination.current = 1
    fetchData()
  }

  // 处理重置
  const handleReset = () => {
    resetQueryParams()
    pagination.current = 1
    fetchData()
  }

  // 加载数据
  const fetchData = async () => {
    if (!selectedTableId.value) return

    loading.value = true
    try {
      // 构建查询参数
      const searchParams = {}
      Object.keys(queryParams).forEach(key => {
        const value = queryParams[key]
        if (
          value !== null &&
          value !== undefined &&
          value !== '' &&
          (Array.isArray(value) ? value.length > 0 : true)
        ) {
          searchParams[key] = value
        }
      })

      const params = {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams
      }
      const res = await pageQuery(selectedTableId.value, params)
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

  // 分页处理
  const handleSizeChange = size => {
    pagination.pageSize = size
    fetchData()
  }

  const handleCurrentChange = current => {
    pagination.current = current
    fetchData()
  }

  const handleSelectionChange = rows => {
    selectedRows.value = rows
  }

  // 处理删除
  const handleDelete = async row => {
    try {
      await ElMessageBox.confirm('确定要删除该数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const res = await deleteById(selectedTableId.value, row.id)
      if (res.success) {
        ElMessage.success('删除成功')
        fetchData()
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
      }
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要删除的数据')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 条数据吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      const ids = selectedRows.value.map(row => row.id)
      const res = await batchDeleteByIds(selectedTableId.value, ids)
      if (res.success) {
        ElMessage.success('批量删除成功')
        selectedRows.value = []
        fetchData()
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量删除失败:', error)
      }
    }
  }

  // 监听表选择变化，自动重置查询参数并重新加载数据
  if (selectedTableId && selectedTableConfig) {
    watch(selectedTableId, newVal => {
      if (newVal) {
        // 重置查询参数
        resetQueryParams()
        pagination.current = 1
        fetchData()
      } else {
        tableData.value = []
        pagination.total = 0
      }
    })
  }

  return {
    // 状态
    loading,
    tableData,
    selectedRows,
    pagination,
    queryParams,
    queryFormExpanded,
    listFields,
    queryFields,

    // 方法
    resetQueryParams,
    handleSearch,
    handleReset,
    fetchData,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    handleDelete,
    handleBatchDelete
  }
}
