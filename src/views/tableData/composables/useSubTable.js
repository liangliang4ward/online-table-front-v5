import { ref, reactive, computed } from 'vue'
import { queryByMainTableId } from '@/mock/tableData'
import { getAllTableHeads } from '@/mock/tableHead'
import {
  isOneToMany,
  isOneToOne,
  getSubTableFormFields,
  createEmptyTableRow
} from '@/utils/form-utils'

/**
 * 附表相关的逻辑
 * @param {Object} options - 配置选项
 * @param {Ref} options.selectedTableConfig - 选中的表配置
 * @returns {Object} 附表相关的状态和方法
 */
export function useSubTable(options = {}) {
  const { selectedTableConfig } = options

  // 附表数据（主表新增/编辑时使用）
  const subTableDataMap = reactive({})

  // 活动的附表Tab
  const activeSubTableTab = ref(0)

  // 详情模式下的附表数据
  const detailSubTableDataMap = reactive({})

  // 获取当前主表关联的附表列表
  const relatedSubTables = computed(() => {
    if (!selectedTableConfig.value || selectedTableConfig.value.tableType !== 1) return []
    const tableName = selectedTableConfig.value.tableName
    const allTables = getAllTableHeads()
    return allTables.filter(t => t.tableType === 2 && t.mainTable === tableName)
  })

  // 获取附表列表（不依赖计算属性，直接获取）
  const getSubTableList = () => {
    if (!selectedTableConfig.value) return []
    const tableName = selectedTableConfig.value.tableName
    const isMain = selectedTableConfig.value.tableType === 1
    if (!isMain) return []
    const allTables = getAllTableHeads()
    return allTables.filter(t => t.tableType === 2 && t.mainTable === tableName)
  }

  // 初始化附表数据
  // mainTableId: 主表ID，用于编辑/详情模式加载已有数据
  const initSubTableData = async (mainTableId = null) => {
    Object.keys(subTableDataMap).forEach(key => {
      delete subTableDataMap[key]
    })

    // 直接获取附表列表，不依赖计算属性
    const subTables = getSubTableList()
    if (subTables.length > 0) {
      for (const subTable of subTables) {
        subTableDataMap[subTable.id] = []

        if (mainTableId) {
          // 编辑模式：从数据库加载已有数据
          const relationFieldName = subTable.relationConfig?.relationFieldName || 'mainTableId'
          const res = await queryByMainTableId(subTable.id, mainTableId, relationFieldName)
          if (res.success && res.data?.length > 0) {
            // 加载已有数据
            subTableDataMap[subTable.id] = [...res.data]
          } else {
            // 没有数据，添加一行空数据
            addSubTableRow(subTable.id)
          }
        } else {
          // 新增模式：给所有附表默认添加一行数据
          addSubTableRow(subTable.id)
        }
      }
      // 默认选中第一个附表Tab
      activeSubTableTab.value = 0
    }
  }

  // 添加附表数据行
  const addSubTableRow = subTableId => {
    if (!subTableDataMap[subTableId]) {
      subTableDataMap[subTableId] = []
    }

    const subTables = getSubTableList()
    const subTable = subTables.find(t => t.id === subTableId)
    if (!subTable) return

    const newRow = createEmptyTableRow(subTable)
    subTableDataMap[subTableId].push(newRow)
  }

  // 删除附表数据行
  const removeSubTableRow = (subTableId, index) => {
    if (subTableDataMap[subTableId]) {
      subTableDataMap[subTableId].splice(index, 1)
    }
  }

  // 初始化详情模式下的附表数据
  // mainTableId: 主表ID，用于加载已有数据
  const initDetailSubTableData = async (mainTableId = null) => {
    Object.keys(detailSubTableDataMap).forEach(key => {
      delete detailSubTableDataMap[key]
    })

    if (selectedTableConfig.value?.tableType === 1 && relatedSubTables.value.length > 0) {
      for (const subTable of relatedSubTables.value) {
        detailSubTableDataMap[subTable.id] = []

        if (mainTableId) {
          // 从数据库加载已有数据
          const relationFieldName = subTable.relationConfig?.relationFieldName || 'mainTableId'
          const res = await queryByMainTableId(subTable.id, mainTableId, relationFieldName)
          if (res.success && res.data?.length > 0) {
            // 加载已有数据
            detailSubTableDataMap[subTable.id] = [...res.data]
          }
        }
      }
    }
  }

  return {
    // 状态
    subTableDataMap,
    activeSubTableTab,
    detailSubTableDataMap,
    relatedSubTables,

    // 方法
    getSubTableList,
    initSubTableData,
    addSubTableRow,
    removeSubTableRow,
    initDetailSubTableData,
    isOneToMany,
    isOneToOne,
    getSubTableFormFields
  }
}
