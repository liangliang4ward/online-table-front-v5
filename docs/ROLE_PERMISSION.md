# 角色管理权限配置说明

## 按钮权限控制

角色管理模块的所有操作按钮都已添加权限控制，使用 `v-permission` 指令实现。

### 权限码列表

| 功能按钮 | 权限码 | 说明 |
|---------|--------|------|
| 新增角色 | `modify:sysRole:insert` | 控制新增按钮的显示 |
| 编辑角色 | `modify:sysRole:update` | 控制编辑按钮的显示 |
| 删除角色 | `modify:sysRole:delete` | 控制删除按钮的显示 |
| 分配菜单 | `modify:sysRole:allocateMenu` | 控制分配菜单按钮的显示 |
| 分配用户 | `modify:sysRole:bindUsers` | 控制分配用户按钮的显示 |
| 查看用户 | `modify:sysRole:bindUsers` | 使用绑定用户权限，查看用户列表 |
| 解绑用户 | `modify:sysRole:unBindUsers` | 控制解绑按钮的显示 |

## 使用方式

### 单个权限

```vue
<ElButton v-permission="'modify:sysRole:insert'" type="primary">
  新增
</ElButton>
```

### 多个权限（OR关系）

```vue
<ElButton v-permission="['modify:sysRole:update', 'modify:sysRole:insert']" type="primary">
  操作
</ElButton>
```

只要拥有其中一个权限，按钮就会显示。

## 权限验证逻辑

权限验证基于用户登录信息中的权限列表，具体实现在：

- **指令实现**: `src/directives/permission.js`
- **验证函数**: `src/utils/permission.js`
- **权限数据**: 存储在 `src/store/user.js` 的 `loginInfo.permissions`

### 权限检查流程

1. 用户登录后，后端返回用户的权限列表
2. 权限列表存储在 userStore 中
3. 当渲染带有 `v-permission` 指令的元素时
4. 指令调用 `checkPermission` 函数验证权限
5. 如果用户没有对应权限，元素会被移除

### 权限匹配规则

支持通配符匹配：

- `*.*.*` - 超级管理员权限，匹配所有权限
- `modify:*:*` - 匹配所有 modify 模块的权限
- `modify:sysRole:*` - 匹配 sysRole 下的所有操作权限

## 示例场景

### 场景1：只有查看权限的用户

用户权限列表：
```json
[]
```

显示效果：
- ✅ 可以查看角色列表
- ❌ 看不到"新增"按钮
- ❌ 看不到"编辑"、"删除"、"分配菜单"等操作按钮

### 场景2：有编辑权限的用户

用户权限列表：
```json
["modify:sysRole:update"]
```

显示效果：
- ✅ 可以查看角色列表
- ✅ 可以看到"编辑"按钮
- ❌ 看不到"新增"、"删除"、"分配菜单"等其他按钮

### 场景3：有完整权限的管理员

用户权限列表：
```json
["*.*.*"]
```

或

```json
[
  "modify:sysRole:insert",
  "modify:sysRole:update",
  "modify:sysRole:delete",
  "modify:sysRole:allocateMenu",
  "modify:sysRole:bindUsers",
  "modify:sysRole:unBindUsers"
]
```

显示效果：
- ✅ 所有按钮都可见
- ✅ 可以执行所有操作

## 权限配置建议

### 后端配置

在菜单权限表中配置对应的权限码：

```sql
INSERT INTO sys_menu (menu_name, menu_code, permission_code, menu_type) 
VALUES 
  ('新增角色', 'btn-add', 'modify:sysRole:insert', 'BUTTON'),
  ('编辑角色', 'btn-edit', 'modify:sysRole:update', 'BUTTON'),
  ('删除角色', 'btn-delete', 'modify:sysRole:delete', 'BUTTON'),
  ('分配菜单', 'btn-allocateMenu', 'modify:sysRole:allocateMenu', 'BUTTON'),
  ('分配用户', 'btn-bindUsers', 'modify:sysRole:bindUsers', 'BUTTON'),
  ('解绑用户', 'btn-unBindUsers', 'modify:sysRole:unBindUsers', 'BUTTON');
```

### 角色分配

给不同角色分配相应的权限：

**普通管理员**：
- `modify:sysRole:update` - 只能编辑

**角色管理员**：
- `modify:sysRole:insert`
- `modify:sysRole:update`
- `modify:sysRole:allocateMenu`
- `modify:sysRole:bindUsers`

**超级管理员**：
- `*.*.*` - 所有权限

## 注意事项

1. **权限数据必须在登录时获取**：确保 loginInfo 中包含 permissions 字段
2. **权限码必须一致**：前后端的权限码必须完全一致
3. **权限区分**：`bindUsers` 和 `unBindUsers` 是不同的权限，可以分别控制
4. **通配符使用**：谨慎使用通配符 `*`，避免权限过大

## 扩展：动态权限控制

如果需要更复杂的权限控制逻辑，可以在代码中手动判断：

```javascript
import { checkPermission } from '@/utils/permission'

const canEdit = computed(() => {
  return checkPermission('modify:sysRole:update')
})

// 在模板中使用
<ElButton v-if="canEdit" type="primary" @click="handleEdit">编辑</ElButton>
```

## 权限测试

在开发环境可以使用 Token 调试工具 (`/debug-token`) 模拟不同权限的用户进行测试。