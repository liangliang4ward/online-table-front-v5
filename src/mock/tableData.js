import { generateId, getCurrentTime, successResponse, pageResponse, paginate } from './index'
import { getTableConfigById } from './tableHead'

// 获取表数据的存储键
const getTableDataStorageKey = (tableId) => {
  return `mock_table_data_${tableId}`
}

// 加载表数据
const loadTableData = (tableId) => {
  const key = getTableDataStorageKey(tableId)
  const stored = localStorage.getItem(key)
  if (stored) {
    return JSON.parse(stored)
  }
  // 尝试生成默认数据
  const defaultData = generateDefaultData(tableId)
  saveTableData(tableId, defaultData)
  return defaultData
}

// 保存表数据
const saveTableData = (tableId, data) => {
  const key = getTableDataStorageKey(tableId)
  localStorage.setItem(key, JSON.stringify(data))
}

// 根据表配置生成默认数据
const generateDefaultData = (tableId) => {
  const tableConfig = getTableConfigById(tableId)
  if (!tableConfig) return []

  const data = []
  const now = getCurrentTime()

  // 根据不同的表生成不同的示例数据
  if (tableConfig.tableName === 'sys_user') {
    data.push(
      {
        id: 'data_user_001',
        username: 'admin',
        password: 'e10adc3949ba59abbe56e057f20f883e',
        nickname: '管理员',
        email: 'admin@example.com',
        phone: '13800138000',
        status: 1,
        createTime: '2024-01-15 10:00:00',
        updateTime: '2024-01-15 10:00:00',
        createBy: 'system',
        updateBy: 'system',
        deleteFlag: 0
      },
      {
        id: 'data_user_002',
        username: 'user1',
        password: 'e10adc3949ba59abbe56e057f20f883e',
        nickname: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138001',
        status: 1,
        createTime: '2024-01-16 09:00:00',
        updateTime: '2024-01-16 09:00:00',
        createBy: 'admin',
        updateBy: 'admin',
        deleteFlag: 0
      },
      {
        id: 'data_user_003',
        username: 'user2',
        password: 'e10adc3949ba59abbe56e057f20f883e',
        nickname: '李四',
        email: 'lisi@example.com',
        phone: '13800138002',
        status: 0,
        createTime: '2024-01-17 14:00:00',
        updateTime: '2024-01-17 14:00:00',
        createBy: 'admin',
        updateBy: 'admin',
        deleteFlag: 0
      }
    )
  } else if (tableConfig.tableName === 'sys_role') {
    data.push(
      {
        id: 'data_role_001',
        roleName: '超级管理员',
        roleCode: 'SUPER_ADMIN',
        description: '拥有所有权限',
        status: 1,
        createTime: '2024-01-15 10:00:00',
        updateTime: '2024-01-15 10:00:00',
        createBy: 'system',
        updateBy: 'system',
        deleteFlag: 0
      },
      {
        id: 'data_role_002',
        roleName: '普通用户',
        roleCode: 'COMMON_USER',
        description: '普通用户角色',
        status: 1,
        createTime: '2024-01-15 11:00:00',
        updateTime: '2024-01-15 11:00:00',
        createBy: 'system',
        updateBy: 'system',
        deleteFlag: 0
      },
      {
        id: 'data_role_003',
        roleName: '访客',
        roleCode: 'GUEST',
        description: '访客角色，只读权限',
        status: 0,
        createTime: '2024-01-16 09:00:00',
        updateTime: '2024-01-16 09:00:00',
        createBy: 'admin',
        updateBy: 'admin',
        deleteFlag: 0
      }
    )
  } else if (tableConfig.tableName === 'bus_order') {
    data.push(
      {
        id: 'data_order_001',
        orderNo: 'ORD202401150001',
        orderAmount: 1999.99,
        orderStatus: 2,
        customerName: '张三',
        customerPhone: '13800138001',
        address: '北京市朝阳区xxx街道xxx号',
        remark: '急需发货',
        createTime: '2024-01-15 14:00:00',
        updateTime: '2024-01-16 10:00:00',
        createBy: 'user1',
        updateBy: 'user1',
        deleteFlag: 0
      },
      {
        id: 'data_order_002',
        orderNo: 'ORD202401160001',
        orderAmount: 599.00,
        orderStatus: 1,
        customerName: '李四',
        customerPhone: '13800138002',
        address: '上海市浦东新区xxx路xxx号',
        remark: '',
        createTime: '2024-01-16 11:00:00',
        updateTime: '2024-01-16 11:00:00',
        createBy: 'user2',
        updateBy: 'user2',
        deleteFlag: 0
      },
      {
        id: 'data_order_003',
        orderNo: 'ORD202401170001',
        orderAmount: 3500.50,
        orderStatus: 0,
        customerName: '王五',
        customerPhone: '13800138003',
        address: '广州市天河区xxx路xxx号',
        remark: '请核对商品信息',
        createTime: '2024-01-17 09:00:00',
        updateTime: '2024-01-17 09:00:00',
        createBy: 'admin',
        updateBy: 'admin',
        deleteFlag: 0
      },
      {
        id: 'data_order_004',
        orderNo: 'ORD202401170002',
        orderAmount: 120.00,
        orderStatus: 3,
        customerName: '赵六',
        customerPhone: '13800138004',
        address: '深圳市南山区xxx路xxx号',
        remark: '',
        createTime: '2024-01-17 15:00:00',
        updateTime: '2024-01-18 10:00:00',
        createBy: 'user1',
        updateBy: 'user1',
        deleteFlag: 0
      }
    )
  }

  return data
}

// 分页查询表数据
export function pageQuery(tableId, params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tableData = loadTableData(tableId)
      let filtered = tableData

      // 过滤掉已删除的数据
      filtered = filtered.filter((item) => item.deleteFlag !== 1)

      // 分页
      const pageNo = params.pageNo || 1
      const pageSize = params.pageSize || 10
      const { list, total } = paginate(filtered, pageNo, pageSize)

      resolve(pageResponse(list, total, pageNo, pageSize))
    }, 200)
  })
}

// 根据ID查询表数据
export function queryById(tableId, id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tableData = loadTableData(tableId)
      const item = tableData.find((t) => t.id === id)
      resolve(successResponse(item || null))
    }, 100)
  })
}

// 新增表数据
export function insert(tableId, data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tableData = loadTableData(tableId)
      const now = getCurrentTime()
      const newData = {
        ...data,
        id: generateId(),
        createTime: now,
        updateTime: now,
        deleteFlag: 0
      }
      tableData.push(newData)
      saveTableData(tableId, tableData)
      resolve(successResponse(true))
    }, 200)
  })
}

// 更新表数据
export function update(tableId, data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tableData = loadTableData(tableId)
      const index = tableData.findIndex((t) => t.id === data.id)
      if (index !== -1) {
        tableData[index] = {
          ...tableData[index],
          ...data,
          updateTime: getCurrentTime()
        }
        saveTableData(tableId, tableData)
      }
      resolve(successResponse(true))
    }, 200)
  })
}

// 根据ID删除表数据（软删除）
export function deleteById(tableId, id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tableData = loadTableData(tableId)
      const index = tableData.findIndex((t) => t.id === id)
      if (index !== -1) {
        tableData[index] = {
          ...tableData[index],
          deleteFlag: 1,
          updateTime: getCurrentTime()
        }
        saveTableData(tableId, tableData)
      }
      resolve(successResponse(true))
    }, 150)
  })
}

// 批量删除表数据（软删除）
export function batchDeleteByIds(tableId, ids) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tableData = loadTableData(tableId)
      const now = getCurrentTime()
      tableData.forEach((item) => {
        if (ids.includes(item.id)) {
          item.deleteFlag = 1
          item.updateTime = now
        }
      })
      saveTableData(tableId, tableData)
      resolve(successResponse(true))
    }, 150)
  })
}

// 根据主表ID查询附表数据
export function queryByMainTableId(subTableId, mainTableId, relationFieldName = 'mainTableId') {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tableData = loadTableData(subTableId)
      const filtered = tableData.filter((item) => item[relationFieldName] === mainTableId && item.deleteFlag !== 1)
      resolve(successResponse(filtered))
    }, 100)
  })
}

// 根据主表ID删除附表数据（软删除）
export function deleteByMainTableId(subTableId, mainTableId, relationFieldName = 'mainTableId') {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tableData = loadTableData(subTableId)
      const now = getCurrentTime()
      tableData.forEach((item) => {
        if (item[relationFieldName] === mainTableId) {
          item.deleteFlag = 1
          item.updateTime = now
        }
      })
      saveTableData(subTableId, tableData)
      resolve(successResponse(true))
    }, 150)
  })
}

export default {
  pageQuery,
  queryById,
  insert,
  update,
  deleteById,
  batchDeleteByIds,
  queryByMainTableId,
  deleteByMainTableId
}
