# 小王の博客 ✨

> 一个基于 Vue 3 + Express.js 的全栈博客项目，前端采用**新海诚动漫风格**设计。

![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)

---

## ✨ 效果预览

- 🌌 **新海诚风格**：深蓝天空渐变 + 星光粒子背景动画
- 🪟 **毛玻璃效果**：Glassmorphism 卡片设计
- 📱 **响应式布局**：适配移动端与桌面端
- ✏️ **Markdown 支持**：博客内容支持代码高亮

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
| Marked | ^11.1 | Markdown 渲染 |
| Highlight.js | ^11.9 | 代码高亮 |

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | >= 18 | 运行时环境 |
| Express | ^4.18 | Web 框架 |
| UUID | ^9.0 | 生成文章 ID |
| CORS | ^2.8 | 跨域处理 |

---

## 🚀 快速开始

### 前置条件
- Node.js >= 18.x
- npm >= 8.x

### 1. 安装依赖

```bash
# 安装所有依赖（根目录 + client + server）
npm run install:all
```

### 2. 启动开发服务器

```bash
# 同时启动前端和后端
npm run dev
```

- 前端地址：http://localhost:5173
- 后端地址：http://localhost:3001

### Linux 远程访问开发环境

当前项目已经按你的 Linux 服务器 IP `47.103.138.24` 配置好了远程开发访问。

```bash
# 进入项目根目录
cd /path/to/blog_xiaoWang

# 安装依赖
npm run install:all

# 一条命令同时启动前后端
npm run dev:linux
```

启动后可从浏览器访问：

- 前端：http://47.103.138.24:5173
- 后端健康检查：http://47.103.138.24:3001/api/health

可选环境变量：

- `FRONTEND_ORIGIN`：允许访问后端的前端来源，多个地址用逗号分隔
- `PORT`：后端端口，默认 `3001`
- `VITE_HOST`：前端监听地址，默认 `0.0.0.0`
- `VITE_PORT`：前端端口，默认 `5173`
- `VITE_API_TARGET`：Vite 代理目标，默认 `http://127.0.0.1:3001`

如果你想分别启动，也可以这样执行：

```bash
cd /path/to/blog_xiaoWang/server
FRONTEND_ORIGIN=http://47.103.138.24:5173 npm run dev

cd /path/to/blog_xiaoWang/client
VITE_HOST=0.0.0.0 npm run dev
```

如果 Linux 开了防火墙，还需要放行 `5173` 和 `3001` 端口。

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

## 📁 项目结构

```
blog_xiaoWang/
├── client/                    # 前端 Vue 3 项目
│   ├── src/
│   │   ├── assets/           # CSS 全局样式
│   │   ├── api/              # Axios API 封装
│   │   ├── views/
│   │   │   ├── Home.vue      # 首页
│   │   │   ├── Blog.vue      # 博客列表
│   │   │   ├── BlogDetail.vue # 博客详情
│   │   │   ├── About.vue     # 关于页面
│   │   │   └── Admin.vue     # 管理后台
│   │   ├── router/           # Vue Router
│   │   ├── store/            # Pinia 状态管理
│   │   └── App.vue           # 根组件（星空背景）
│   └── vite.config.js        # Vite 配置（含 API 代理）
├── server/                    # 后端 Express 项目
│   ├── routes/
│   │   ├── posts.js          # 文章 CRUD API
│   │   └── auth.js           # 管理员认证
│   ├── data/
│   │   └── posts.json        # 博客数据（JSON 文件存储）
│   └── app.js                # Express 入口
├── docs/                      # VitePress 文档（原有）
└── package.json               # 根目录（含启动脚本）
```

---

## 📝 使用说明

### 写博客 / 管理文章

1. 启动项目后访问 http://localhost:5173/admin
2. 输入管理密码（默认：**admin123**）
3. 点击「新建文章」填写内容（支持 Markdown）
4. 保存后文章自动出现在博客列表

### 修改管理密码

```bash
ADMIN_PASSWORD=你的新密码 npm run dev:server
```

如果前端不是从 `localhost:5173` 访问，而是从服务器 IP 或域名访问，记得同时设置：

```bash
FRONTEND_ORIGIN=http://47.103.138.24:5173 ADMIN_PASSWORD=你的新密码 npm run dev:server
```

### API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/posts | 获取文章列表（支持 page/limit/search/category）|
| GET | /api/posts/:id | 获取单篇文章 |
| POST | /api/posts | 创建文章 |
| PUT | /api/posts/:id | 更新文章 |
| DELETE | /api/posts/:id | 删除文章 |
| POST | /api/auth/login | 管理员登录 |

---

## 🎨 设计灵感

本项目前端设计灵感来源于新海诚的动漫电影，采用深蓝夜空渐变、星空粒子动画、毛玻璃卡片和橙金色强调色。

---

## VitePress 文档

原有的 VitePress 文档功能依然保留：

```bash
npm run docs:dev      # 启动文档开发服务器
npm run docs:build    # 构建文档
```

---

Made with ❤️ & Vue 3 by 小王
