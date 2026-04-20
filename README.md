# subApp-template

基于 Vue 3 + Vite + Element Plus 的前端项目模板。

## 技术栈

- **框架**: Vue 3.x
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **路由**: Vue Router 4.x
- **状态管理**: Pinia
- **HTTP 请求**: Axios
- **微前端**: qiankun

## 目录结构

```
subApp-template/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口
│   │   └── request.js     # Axios 封装
│   ├── assets/            # 资源文件
│   ├── components/        # 公共组件
│   ├── config/            # 配置文件
│   │   └── index.js       # 应用配置
│   ├── directives/        # 自定义指令
│   ├── hooks/             # 组合式函数
│   ├── router/            # 路由配置
│   │   └── index.js
│   ├── store/             # Pinia 状态管理
│   ├── styles/            # 全局样式
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   │   ├── 404.vue        # 404 页面
│   │   ├── demo.vue       # Demo 页面
│   │   └── index.vue      # 首页
│   ├── App.vue            # 根组件
│   ├── main.js            # 入口文件
│   └── style.css          # 全局样式
├── .env                   # 公共环境变量
├── .env.development       # 开发环境配置
├── .env.production        # 生产环境配置
├── index.html
├── package.json
└── vite.config.js
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 路由

| 路径 | 说明 |
|------|------|
| `/` | 重定向到 /index |
| `/index` | 首页 |
| `/demo` | Demo 页面 |
| `*` | 404 页面 |

## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_APP_TITLE` | 应用标题 | subApp-template |
| `VITE_APP_VERSION` | 应用版本 | 1.0.0 |
| `VITE_API_BASE` | API 基础路径 | /api |
| `VITE_BASE_PATH` | 路由基础路径 | / |
| `VITE_TIMEOUT` | 请求超时时间 (ms) | 5000 |
| `VITE_ENABLE_LOG` | 是否开启日志 | true |

## 文档

- [代码规范](docs/CODING_STANDARD.md)
- [目录结构说明](docs/PROJECT_STRUCTURE.md)
- [路由配置](docs/ROUTER.md)
- [API 接口规范](docs/API.md)
- [qiankun 子应用接入](docs/QIANKUN.md)

## License

MIT
