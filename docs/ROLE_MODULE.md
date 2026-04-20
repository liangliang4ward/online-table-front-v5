# 角色列表模块实现说明

## 已实现内容

### 1. API接口 (`src/api/role/index.ts`)

#### 接口定义
- **URL**: `/system/sys-role/pageQuery`
- **Method**: POST
- **功能**: 分页查询角色信息

#### TypeScript类型定义
```typescript
// 查询请求参数
export interface SysRoleQueryReq {
  pageNum?: number
  pageSize?: number
  roleName?: string
  roleCode?: string
  status?: number
  appCode?: string
  // ... 其他查询字段
}

// 角色信息
export interface SysRoleDto {
  id: string
  roleName: string
  roleCode: string
  status: 'ENABLE' | 'DISABLE'
  orderNum: number
  superType: 'COMMON' | 'SUPER' | 'READ_SUPER'
  deptName: string
  userCount: string
  createTime: string
  remark: string
  // ... 其他字段
}

// 分页响应
export interface PageResponse<T> {
  total: number
  size: number
  pages: number
  current: number
  list: T[]
}

// API响应
export interface ApiResponse<T> {
  success: boolean
  code: number
  msg: string
  data: T
}
```

#### 导出的API方法
```typescript
// 分页查询角色列表
export function getRolePageList(params: SysRoleQueryReq): Promise<ApiResponse<PageResponse<SysRoleDto>>>
```

### 2. 视图组件 (`src/views/role/index.vue`)

#### 功能特性
- ✅ 分页查询
- ✅ 多条件筛选（角色名称、角色编码、角色状态）
- ✅ 加载状态提示
- ✅ 错误处理
- ✅ 状态和类型格式化显示
- ✅ 自动获取用户数量（withUserCount: true）

#### 查询条件
- 角色名称（模糊查询）
- 角色编码（模糊查询）
- 角色状态（启用/停用）

#### 表格字段
| 字段 | 说明 | 宽度 |
|------|------|------|
| roleName | 角色名称 | 150px |
| roleCode | 角色编码 | 150px |
| superType | 超管类型 | 120px |
| status | 状态 | 100px |
| orderNum | 显示顺序 | 100px |
| deptName | 所属部门 | 150px |
| userCount | 用户数量 | 100px |
| createTime | 创建时间 | 180px |
| remark | 备注 | 200px |

#### 分页功能
- 支持切换每页显示条数（10/20/50/100）
- 支持页码跳转
- 显示总记录数

### 3. 路由配置

已添加角色列表路由：
```javascript
{
  path: '/role',
  name: 'RoleList',
  component: () => import('@/views/role/index.vue'),
  meta: {
    title: '角色列表'
  }
}
```

访问路径：
- 独立运行：`http://localhost:5173/role`
- qiankun子应用：`http://主应用域名/主应用前缀/template/role`

### 4. 首页导航

在首页添加了快速导航按钮，可以直接跳转到角色列表页面。

## 使用示例

### 访问角色列表

```bash
# 启动开发服务器
npm run dev

# 访问
http://localhost:5173/role
```

### 在组件中使用API

```vue
<script setup>
import { getRolePageList } from '@/api/role'
import { ref } from 'vue'

const roleList = ref([])

const fetchRoles = async () => {
  const response = await getRolePageList({
    pageNum: 1,
    pageSize: 10,
    roleName: '管理员'
  })

  if (response.success) {
    roleList.value = response.data.list
  }
}
</script>
```

## 请求头配置

API请求会自动携带以下请求头：
- `Authorization`: Bearer {token} - 从 userStore 获取
- `X-APP-CODE`: {appCode} - 从 userStore 获取

这是在 `src/api/request.js` 中统一配置的。

## 状态显示说明

### 角色状态 (status)
- `ENABLE` → 启用（绿色标签）
- `DISABLE` → 停用（红色标签）

### 超管类型 (superType)
- `COMMON` → 普通角色（灰色标签）
- `SUPER` → 超级管理员（红色标签）
- `READ_SUPER` → 只读超管（橙色标签）

## 未实现功能

根据指示，当前只实现了列表功能，以下功能未实现：
- ❌ 新增角色
- ❌ 编辑角色
- ❌ 删除角色
- ❌ 角色详情
- ❌ 分配权限
- ❌ 导出功能
- ❌ 其他高级查询条件

## 后续开发建议

当需要扩展功能时，可以按以下步骤进行：

1. **新增功能**
   - 在 `src/api/role/index.ts` 添加新增接口
   - 创建新增表单组件

2. **编辑功能**
   - 添加编辑接口
   - 创建编辑表单组件

3. **删除功能**
   - 添加删除接口
   - 在表格操作列添加删除按钮

4. **权限分配**
   - 添加权限树组件
   - 实现权限保存接口

## 注意事项

1. **权限控制**
   - 可使用 `v-permission` 指令控制按钮权限
   - 示例：`v-permission="['create:role:addRole']"`

2. **数据验证**
   - TypeScript类型已在API层定义
   - 可根据需要添加更严格的验证

3. **错误处理**
   - 全局错误处理器已集成
   - API错误会自动提示用户

4. **性能优化**
   - 表格使用虚拟滚动（如数据量大）
   - 可添加防抖优化查询

## 文件清单

### 新增文件
- `src/api/role/index.ts` - API接口定义
- `src/views/role/index.vue` - 角色列表视图

### 修改文件
- `src/router/index.js` - 添加角色路由
- `src/views/index.vue` - 添加快速导航

## API调试

可使用 Token调试工具 (`/debug-token`) 先获取有效token，然后再访问角色列表页面。

接口地址：`/system/sys-role/pageQuery`
完整地址：`{VITE_API_BASE}/system/sys-role/pageQuery`