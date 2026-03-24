# 小王の博客 ✨

> 一个基于 Vue 3 + Express.js 的全栈博客项目，前端采用**新海诚动漫风格**设计，支持云服务部署、模块化分类和富文本编辑。

![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)

---

## ✨ 效果预览

- 🌌 **新海诚风格**：深蓝天空渐变 + 星光粒子背景动画
- 🪟 **毛玻璃效果**：Glassmorphism 卡片设计
- 📱 **响应式布局**：适配移动端与桌面端
- ✏️ **ByteMD 富文本编辑器**：独立全屏页面，左写右预览，支持 GFM 和代码高亮
- 📦 **模块系统**：可自定义模块（分区）+ 分类，全部通过 API 管理
- ☁️ **前后端严格分离**：支持独立部署到云服务

---

## 🛠 技术栈

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.4 | 前端框架（组合式 API）|
| Vite | ^5.0 | 构建工具 + 开发服务器 |
| Vue Router | ^4.2 | 前端路由 |
| Pinia | ^2.1 | 状态管理 |
| Axios | ^1.6 | HTTP 请求 |
| ByteMD | ^1.22 | 富文本 Markdown 编辑器 |
| Marked | ^11.1 | Markdown 渲染 |
| Highlight.js | ^11.9 | 代码高亮 |

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | >= 18 | 运行时环境 |
| Express | ^4.18 | Web 框架 |
| UUID | ^9.0 | 生成唯一 ID |
| CORS | ^2.8 | 跨域处理 |

---

## 🚀 快速开始

### 前置条件
- Node.js >= 18.x
- npm >= 8.x

### 1. 安装依赖

```bash
npm run install:all
```

### 2. 启动开发服务器

```bash
npm run dev
```

- 前端地址：http://localhost:5173
- 后端地址：http://localhost:3001

### 3. 单独启动

```bash
npm run dev:client    # 只启动前端
npm run dev:server    # 只启动后端
```

### 4. 构建生产版本

```bash
npm run build
```

---

## ☁️ 云服务部署

### 后端（Node.js 服务，如 Render / Railway）

设置以下环境变量：

```bash
PORT=3001
# 允许跨域的前端域名（逗号分隔）
CORS_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
# 管理员密码
ADMIN_PASSWORD=your-secure-password
```

### 前端（静态托管，如 Vercel / Netlify / GitHub Pages）

修改 `client/.env.production`：

```bash
VITE_API_BASE_URL=https://your-api-domain.com/api
```

然后执行 `npm run build`，将 `client/dist/` 目录部署到静态托管平台。

---

## 📁 项目结构

```
blog_xiaoWang/
├── client/                      # 前端 Vue 3 项目
│   ├── .env.development         # 开发环境变量（API 地址）
│   ├── .env.production          # 生产环境变量（API 地址）
│   ├── src/
│   │   ├── api/
│   │   │   ├── posts.js         # 文章 API（baseURL 读环境变量）
│   │   │   ├── modules.js       # 模块 API
│   │   │   └── categories.js    # 分类 API
│   │   ├── store/
│   │   │   ├── posts.js         # 文章状态
│   │   │   ├── modules.js       # 模块状态
│   │   │   └── categories.js    # 分类状态
│   │   ├── views/
│   │   │   ├── Home.vue         # 首页（显示模块信息）
│   │   │   ├── Blog.vue         # 博客列表（模块 Tab + 动态分类）
│   │   │   ├── BlogDetail.vue   # 博客详情
│   │   │   ├── About.vue        # 关于页面
│   │   │   ├── Admin.vue        # 管理后台（文章/模块/分类 Tab）
│   │   │   └── AdminEditor.vue  # 富文本编辑器（独立全屏页面）
│   │   ├── router/index.js      # 路由（含 /blog/module/:slug）
│   │   └── App.vue              # 根组件
│   └── vite.config.js           # Vite 配置（含 API 代理，用于本地开发）
├── server/                      # 后端 Express 项目
│   ├── routes/
│   │   ├── posts.js             # 文章 CRUD（支持 moduleId/categoryId 过滤）
│   │   ├── modules.js           # 模块 CRUD API
│   │   ├── categories.js        # 分类 CRUD API
│   │   └── auth.js              # 管理员认证
│   ├── models/
│   │   ├── postModel.js         # 文章数据读写
│   │   ├── moduleModel.js       # 模块数据读写
│   │   └── categoryModel.js     # 分类数据读写
│   ├── data/
│   │   ├── posts.json           # 文章数据
│   │   ├── modules.json         # 模块数据
│   │   └── categories.json      # 分类数据
│   └── app.js                   # Express 入口（CORS 读环境变量）
└── package.json                 # 根目录启动脚本
```

---

## 📝 使用说明

### 写文章

1. 访问 http://localhost:5173/admin
2. 输入管理密码（默认：**admin123**）
3. 点击「新建文章」跳转到**全屏富文本编辑器**
4. 选择模块和分类，在 ByteMD 编辑器中写 Markdown（左写右预览）
5. 点击「发布文章」完成

### 管理模块 / 分类

在管理后台的 Tab 中切换到「模块管理」或「分类管理」，支持新建、编辑、删除。

### 按模块浏览文章

- 博客列表页顶部有模块 Tab 栏，点击切换
- 直接访问 `/blog/module/:slug` 查看某个模块的所有文章

### 修改管理密码

```bash
ADMIN_PASSWORD=你的新密码 npm run dev:server
```

---

## 📡 API 接口文档

### 文章 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/posts | 获取文章列表（支持 `page`/`limit`/`search`/`moduleId`/`categoryId`）|
| GET | /api/posts/:id | 获取单篇文章 |
| POST | /api/posts | 创建文章（字段：`title`, `content`, `summary`, `moduleId`, `categoryId`, `tags`）|
| PUT | /api/posts/:id | 更新文章 |
| DELETE | /api/posts/:id | 删除文章 |

### 模块 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/modules | 获取所有模块（按 order 排序）|
| POST | /api/modules | 创建模块（字段：`name`, `slug`, `description`, `icon`, `order`）|
| PUT | /api/modules/:id | 更新模块 |
| DELETE | /api/modules/:id | 删除模块 |

### 分类 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/categories | 获取所有分类（支持 `?moduleId=` 过滤）|
| POST | /api/categories | 创建分类（字段：`name`, `slug`, `moduleId`）|
| PUT | /api/categories/:id | 更新分类 |
| DELETE | /api/categories/:id | 删除分类 |

### 认证 API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 管理员登录 |
| GET | /api/health | 健康检查 |

---

## 🎨 设计灵感

本项目前端设计灵感来源于新海诚的动漫电影，采用深蓝夜空渐变、星空粒子动画、毛玻璃卡片和橙金色强调色。

---

## VitePress 文档

```bash
npm run docs:dev      # 启动文档开发服务器
npm run docs:build    # 构建文档
```

---

Made with ❤️ & Vue 3 by 小王

