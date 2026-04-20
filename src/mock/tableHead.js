import { generateId, getCurrentTime, successResponse, pageResponse, paginate } from './index'
import { getAllDatasources } from './datasource'

// 默认字段配置（基础字段）
const getDefaultFields = () => [
  {
    dbFieldName: 'id',
    dbFieldNameAlias: 'id',
    dbFieldTxt: '主键',
    dbType: 'text',
    dbLength: 36,
    dbPointLength: null,
    dbIsNull: false,
    dbIsKey: true,
    dbIsPersist: true,
    dbDefaultVal: '',
    isShowForm: false,
    isShowList: true,
    isQuery: false,
    isReadOnly: true,
    fieldMustInput: '0',
    controlType: 'input',
    queryType: 'none',
    controlConfig: {}
  },
  {
    dbFieldName: 'create_time',
    dbFieldNameAlias: 'createTime',
    dbFieldTxt: '创建时间',
    dbType: 'datetime',
    dbLength: null,
    dbPointLength: null,
    dbIsNull: true,
    dbIsKey: false,
    dbIsPersist: true,
    dbDefaultVal: '',
    isShowForm: false,
    isShowList: true,
    isQuery: false,
    isReadOnly: true,
    fieldMustInput: '0',
    controlType: 'datetimePicker',
    queryType: 'none',
    controlConfig: {}
  },
  {
    dbFieldName: 'update_time',
    dbFieldNameAlias: 'updateTime',
    dbFieldTxt: '更新时间',
    dbType: 'datetime',
    dbLength: null,
    dbPointLength: null,
    dbIsNull: true,
    dbIsKey: false,
    dbIsPersist: true,
    dbDefaultVal: '',
    isShowForm: false,
    isShowList: false,
    isQuery: false,
    isReadOnly: true,
    fieldMustInput: '0',
    controlType: 'datetimePicker',
    queryType: 'none',
    controlConfig: {}
  },
  {
    dbFieldName: 'create_by',
    dbFieldNameAlias: 'createBy',
    dbFieldTxt: '创建人',
    dbType: 'text',
    dbLength: 50,
    dbPointLength: null,
    dbIsNull: true,
    dbIsKey: false,
    dbIsPersist: true,
    dbDefaultVal: '100',
    isShowForm: false,
    isShowList: false,
    isQuery: false,
    isReadOnly: false,
    fieldMustInput: '0',
    controlType: 'input',
    queryType: 'none',
    controlConfig: {}
  },
  {
    dbFieldName: 'update_by',
    dbFieldNameAlias: 'updateBy',
    dbFieldTxt: '更新人',
    dbType: 'text',
    dbLength: 50,
    dbPointLength: null,
    dbIsNull: true,
    dbIsKey: false,
    dbIsPersist: true,
    dbDefaultVal: '100',
    isShowForm: false,
    isShowList: false,
    isQuery: false,
    isReadOnly: false,
    fieldMustInput: '0',
    controlType: 'input',
    queryType: 'none',
    controlConfig: {}
  },
  {
    dbFieldName: 'delete_flag',
    dbFieldNameAlias: 'deleteFlag',
    dbFieldTxt: '删除标记',
    dbType: 'int',
    dbLength: null,
    dbPointLength: null,
    dbIsNull: true,
    dbIsKey: false,
    dbIsPersist: true,
    dbDefaultVal: '0',
    isShowForm: false,
    isShowList: false,
    isQuery: false,
    isReadOnly: true,
    fieldMustInput: '0',
    controlType: 'inputNumber',
    queryType: 'none',
    controlConfig: {}
  }
]

// 获取数据源名称
const getDatasourceName = (datasourceId) => {
  const datasources = getAllDatasources()
  const ds = datasources.find((d) => d.id === datasourceId)
  return ds?.datasourceName || '-'
}

// 默认数据表数据
const getDefaultTableHeads = () => [
  {
    id: 'tbl_001',
    tableName: 'sys_user',
    tableTxt: '用户表',
    tableType: 0,
    datasourceId: 'ds_001',
    datasourceName: '主数据库',
    mainTable: '',
    isCheckbox: 'Y',
    isPage: 'Y',
    isTree: 'N',
    isDbSynch: 'Y',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00',
    fields: [
      ...getDefaultFields(),
      {
        dbFieldName: 'username',
        dbFieldNameAlias: 'username',
        dbFieldTxt: '用户名',
        dbType: 'text',
        dbLength: 50,
        dbPointLength: null,
        dbIsNull: false,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '',
        isShowForm: true,
        isShowList: true,
        isQuery: true,
        isReadOnly: false,
        fieldMustInput: '1',
        controlType: 'input',
        queryType: 'like',
        controlConfig: {}
      },
      {
        dbFieldName: 'password',
        dbFieldNameAlias: 'password',
        dbFieldTxt: '密码',
        dbType: 'text',
        dbLength: 100,
        dbPointLength: null,
        dbIsNull: false,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '',
        isShowForm: true,
        isShowList: false,
        isQuery: false,
        isReadOnly: false,
        fieldMustInput: '1',
        controlType: 'input',
        queryType: 'none',
        controlConfig: {}
      },
      {
        dbFieldName: 'nickname',
        dbFieldNameAlias: 'nickname',
        dbFieldTxt: '昵称',
        dbType: 'text',
        dbLength: 50,
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
      },
      {
        dbFieldName: 'email',
        dbFieldNameAlias: 'email',
        dbFieldTxt: '邮箱',
        dbType: 'text',
        dbLength: 100,
        dbPointLength: null,
        dbIsNull: true,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '',
        isShowForm: true,
        isShowList: true,
        isQuery: true,
        isReadOnly: false,
        fieldMustInput: '0',
        controlType: 'input',
        queryType: 'like',
        controlConfig: {}
      },
      {
        dbFieldName: 'phone',
        dbFieldNameAlias: 'phone',
        dbFieldTxt: '手机号',
        dbType: 'text',
        dbLength: 20,
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
      },
      {
        dbFieldName: 'status',
        dbFieldNameAlias: 'status',
        dbFieldTxt: '状态',
        dbType: 'int',
        dbLength: null,
        dbPointLength: null,
        dbIsNull: false,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '1',
        isShowForm: true,
        isShowList: true,
        isQuery: true,
        isReadOnly: false,
        fieldMustInput: '1',
        controlType: 'radio',
        queryType: 'eq',
        controlConfig: {
          dataSourceType: 'static',
          options: [
            { label: '禁用', value: 0 },
            { label: '启用', value: 1 }
          ]
        }
      }
    ],
    indexes: [
      {
        indexName: 'idx_username',
        indexType: 'unique',
        indexField: ['username']
      },
      {
        indexName: 'idx_email',
        indexType: 'normal',
        indexField: ['email']
      }
    ]
  },
  {
    id: 'tbl_002',
    tableName: 'sys_role',
    tableTxt: '角色表',
    tableType: 0,
    datasourceId: 'ds_001',
    datasourceName: '主数据库',
    mainTable: '',
    isCheckbox: 'Y',
    isPage: 'Y',
    isTree: 'N',
    isDbSynch: 'Y',
    createTime: '2024-01-15 11:20:00',
    updateTime: '2024-01-15 11:20:00',
    fields: [
      ...getDefaultFields(),
      {
        dbFieldName: 'role_name',
        dbFieldNameAlias: 'roleName',
        dbFieldTxt: '角色名称',
        dbType: 'text',
        dbLength: 50,
        dbPointLength: null,
        dbIsNull: false,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '',
        isShowForm: true,
        isShowList: true,
        isQuery: true,
        isReadOnly: false,
        fieldMustInput: '1'
      },
      {
        dbFieldName: 'role_code',
        dbFieldNameAlias: 'roleCode',
        dbFieldTxt: '角色编码',
        dbType: 'text',
        dbLength: 50,
        dbPointLength: null,
        dbIsNull: false,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '',
        isShowForm: true,
        isShowList: true,
        isQuery: true,
        isReadOnly: false,
        fieldMustInput: '1'
      },
      {
        dbFieldName: 'description',
        dbFieldNameAlias: 'description',
        dbFieldTxt: '描述',
        dbType: 'text',
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
        fieldMustInput: '0'
      },
      {
        dbFieldName: 'status',
        dbFieldNameAlias: 'status',
        dbFieldTxt: '状态',
        dbType: 'int',
        dbLength: null,
        dbPointLength: null,
        dbIsNull: false,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '1',
        isShowForm: true,
        isShowList: true,
        isQuery: true,
        isReadOnly: false,
        fieldMustInput: '1'
      }
    ],
    indexes: [
      {
        indexName: 'idx_role_code',
        indexType: 'unique',
        indexField: ['role_code']
      }
    ]
  },
  {
    id: 'tbl_003',
    tableName: 'bus_order',
    tableTxt: '订单表',
    tableType: 1,
    datasourceId: 'ds_003',
    datasourceName: '业务数据库',
    mainTable: '',
    isCheckbox: 'Y',
    isPage: 'Y',
    isTree: 'N',
    isDbSynch: 'N',
    createTime: '2024-01-16 14:30:00',
    updateTime: '2024-01-16 14:30:00',
    fields: [
      ...getDefaultFields(),
      {
        dbFieldName: 'order_no',
        dbFieldNameAlias: 'orderNo',
        dbFieldTxt: '订单号',
        dbType: 'text',
        dbLength: 32,
        dbPointLength: null,
        dbIsNull: false,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '',
        isShowForm: true,
        isShowList: true,
        isQuery: true,
        isReadOnly: false,
        fieldMustInput: '1'
      },
      {
        dbFieldName: 'order_amount',
        dbFieldNameAlias: 'orderAmount',
        dbFieldTxt: '订单金额',
        dbType: 'decimal',
        dbLength: 10,
        dbPointLength: 2,
        dbIsNull: false,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '0.00',
        isShowForm: true,
        isShowList: true,
        isQuery: false,
        isReadOnly: false,
        fieldMustInput: '1'
      },
      {
        dbFieldName: 'order_status',
        dbFieldNameAlias: 'orderStatus',
        dbFieldTxt: '订单状态',
        dbType: 'int',
        dbLength: null,
        dbPointLength: null,
        dbIsNull: false,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '0',
        isShowForm: true,
        isShowList: true,
        isQuery: true,
        isReadOnly: false,
        fieldMustInput: '1'
      },
      {
        dbFieldName: 'customer_name',
        dbFieldNameAlias: 'customerName',
        dbFieldTxt: '客户姓名',
        dbType: 'text',
        dbLength: 50,
        dbPointLength: null,
        dbIsNull: true,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '',
        isShowForm: true,
        isShowList: true,
        isQuery: true,
        isReadOnly: false,
        fieldMustInput: '0'
      },
      {
        dbFieldName: 'customer_phone',
        dbFieldNameAlias: 'customerPhone',
        dbFieldTxt: '客户电话',
        dbType: 'text',
        dbLength: 20,
        dbPointLength: null,
        dbIsNull: true,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '',
        isShowForm: true,
        isShowList: true,
        isQuery: false,
        isReadOnly: false,
        fieldMustInput: '0'
      },
      {
        dbFieldName: 'address',
        dbFieldNameAlias: 'address',
        dbFieldTxt: '收货地址',
        dbType: 'text',
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
        fieldMustInput: '0'
      },
      {
        dbFieldName: 'remark',
        dbFieldNameAlias: 'remark',
        dbFieldTxt: '备注',
        dbType: 'text',
        dbLength: null,
        dbPointLength: null,
        dbIsNull: true,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '',
        isShowForm: true,
        isShowList: false,
        isQuery: false,
        isReadOnly: false,
        fieldMustInput: '0'
      }
    ],
    indexes: [
      {
        indexName: 'idx_order_no',
        indexType: 'unique',
        indexField: ['order_no']
      },
      {
        indexName: 'idx_order_status',
        indexType: 'normal',
        indexField: ['order_status']
      }
    ]
  },
  {
    id: 'tbl_004',
    tableName: 'bus_order_detail',
    tableTxt: '订单明细表',
    tableType: 2,
    datasourceId: 'ds_003',
    datasourceName: '业务数据库',
    mainTable: 'bus_order',
    isCheckbox: 'Y',
    isPage: 'Y',
    isTree: 'N',
    isDbSynch: 'N',
    createTime: '2024-01-16 15:00:00',
    updateTime: '2024-01-16 15:00:00',
    relationConfig: {
      relationType: 'one_to_many',
      mainTableField: 'id',
      subTableField: 'order_id',
      relationFieldName: 'orderId'
    },
    fields: [
      ...getDefaultFields(),
      {
        dbFieldName: 'order_id',
        dbFieldNameAlias: 'orderId',
        dbFieldTxt: '订单ID',
        dbType: 'text',
        dbLength: 36,
        dbPointLength: null,
        dbIsNull: false,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '',
        isShowForm: true,
        isShowList: true,
        isQuery: true,
        isReadOnly: false,
        fieldMustInput: '1'
      },
      {
        dbFieldName: 'product_name',
        dbFieldNameAlias: 'productName',
        dbFieldTxt: '商品名称',
        dbType: 'text',
        dbLength: 100,
        dbPointLength: null,
        dbIsNull: false,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '',
        isShowForm: true,
        isShowList: true,
        isQuery: true,
        isReadOnly: false,
        fieldMustInput: '1'
      },
      {
        dbFieldName: 'product_code',
        dbFieldNameAlias: 'productCode',
        dbFieldTxt: '商品编码',
        dbType: 'text',
        dbLength: 50,
        dbPointLength: null,
        dbIsNull: true,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '',
        isShowForm: true,
        isShowList: true,
        isQuery: true,
        isReadOnly: false,
        fieldMustInput: '0'
      },
      {
        dbFieldName: 'quantity',
        dbFieldNameAlias: 'quantity',
        dbFieldTxt: '数量',
        dbType: 'int',
        dbLength: null,
        dbPointLength: null,
        dbIsNull: false,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '1',
        isShowForm: true,
        isShowList: true,
        isQuery: false,
        isReadOnly: false,
        fieldMustInput: '1'
      },
      {
        dbFieldName: 'unit_price',
        dbFieldNameAlias: 'unitPrice',
        dbFieldTxt: '单价',
        dbType: 'decimal',
        dbLength: 10,
        dbPointLength: 2,
        dbIsNull: false,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '0.00',
        isShowForm: true,
        isShowList: true,
        isQuery: false,
        isReadOnly: false,
        fieldMustInput: '1'
      },
      {
        dbFieldName: 'subtotal',
        dbFieldNameAlias: 'subtotal',
        dbFieldTxt: '小计',
        dbType: 'decimal',
        dbLength: 10,
        dbPointLength: 2,
        dbIsNull: false,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '0.00',
        isShowForm: true,
        isShowList: true,
        isQuery: false,
        isReadOnly: false,
        fieldMustInput: '1'
      },
      {
        dbFieldName: 'remark',
        dbFieldNameAlias: 'remark',
        dbFieldTxt: '备注',
        dbType: 'text',
        dbLength: 200,
        dbPointLength: null,
        dbIsNull: true,
        dbIsKey: false,
        dbIsPersist: true,
        dbDefaultVal: '',
        isShowForm: true,
        isShowList: false,
        isQuery: false,
        isReadOnly: false,
        fieldMustInput: '0'
      }
    ],
    indexes: [
      {
        indexName: 'idx_order_detail_order_id',
        indexType: 'normal',
        indexField: ['order_id']
      }
    ]
  }
]

// 数据表存储
const STORAGE_KEY = 'mock_table_heads'

const loadTableHeads = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  const defaultData = getDefaultTableHeads()
  saveTableHeads(defaultData)
  return [...defaultData]
}

const saveTableHeads = (tableHeads) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tableHeads))
}

// 分页查询
export function pageQuery(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let tableHeads = loadTableHeads()
      let filtered = tableHeads

      // 按表名模糊查询
      if (params.tableName) {
        filtered = filtered.filter((t) =>
          t.tableName.toLowerCase().includes(params.tableName.toLowerCase())
        )
      }

      // 按表类型查询
      if (params.tableType !== null && params.tableType !== undefined) {
        filtered = filtered.filter((t) => t.tableType === params.tableType)
      }

      // 按同步状态查询
      if (params.isDbSynch) {
        filtered = filtered.filter((t) => t.isDbSynch === params.isDbSynch)
      }

      // 分页
      const pageNo = params.pageNo || 1
      const pageSize = params.pageSize || 10
      const { list, total } = paginate(filtered, pageNo, pageSize)

      // 补充数据源名称
      const listWithDatasourceName = list.map((item) => ({
        ...item,
        datasourceName: getDatasourceName(item.datasourceId)
      }))

      resolve(pageResponse(listWithDatasourceName, total, pageNo, pageSize))
    }, 200)
  })
}

// 根据ID查询
export function queryById(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tableHeads = loadTableHeads()
      const tableHead = tableHeads.find((t) => t.id === id)
      if (tableHead) {
        tableHead.datasourceName = getDatasourceName(tableHead.datasourceId)
      }
      resolve(successResponse(tableHead || null))
    }, 100)
  })
}

// 新增
export function insert(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tableHeads = loadTableHeads()
      const newTableHead = {
        ...data,
        id: generateId(),
        datasourceName: getDatasourceName(data.datasourceId),
        isDbSynch: 'N',
        createTime: getCurrentTime(),
        updateTime: getCurrentTime()
      }
      tableHeads.push(newTableHead)
      saveTableHeads(tableHeads)
      resolve(successResponse(true))
    }, 200)
  })
}

// 更新
export function update(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tableHeads = loadTableHeads()
      const index = tableHeads.findIndex((t) => t.id === data.id)
      if (index !== -1) {
        tableHeads[index] = {
          ...tableHeads[index],
          ...data,
          datasourceName: getDatasourceName(data.datasourceId),
          updateTime: getCurrentTime()
        }
        saveTableHeads(tableHeads)
      }
      resolve(successResponse(true))
    }, 200)
  })
}

// 根据ID删除
export function deleteById(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tableHeads = loadTableHeads()
      const filtered = tableHeads.filter((t) => t.id !== id)
      saveTableHeads(filtered)
      resolve(successResponse(true))
    }, 150)
  })
}

// 批量删除
export function batchDeleteByIds(ids) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tableHeads = loadTableHeads()
      const filtered = tableHeads.filter((t) => !ids.includes(t.id))
      saveTableHeads(filtered)
      resolve(successResponse(true))
    }, 150)
  })
}

// 同步到数据库
export function syncDb(tableId, syncType) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tableHeads = loadTableHeads()
      const index = tableHeads.findIndex((t) => t.id === tableId)
      if (index !== -1) {
        tableHeads[index].isDbSynch = 'Y'
        tableHeads[index].updateTime = getCurrentTime()
        saveTableHeads(tableHeads)
      }
      resolve(successResponse(true))
    }, 300)
  })
}

// 获取所有数据表（供其他模块使用）
export function getAllTableHeads() {
  return loadTableHeads()
}

// 根据ID获取表配置
export function getTableConfigById(tableId) {
  const tableHeads = loadTableHeads()
  return tableHeads.find((t) => t.id === tableId)
}

export default {
  pageQuery,
  queryById,
  insert,
  update,
  deleteById,
  batchDeleteByIds,
  syncDb,
  getAllTableHeads,
  getTableConfigById
}
