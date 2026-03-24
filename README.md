# 🌸 小王の学习记录

> 基于 VitePress 构建的二次元风格个人博客，记录学习与成长。

## ✨ 特色

- 🌸 **二次元风格** - 樱花粉配色，樱花飘落特效
- 📚 **分类清晰** - 前端、后端、日记、资源四大分类
- 🔍 **全站搜索** - 内置本地搜索，快速找到内容
- 📱 **响应式设计** - 完美适配 PC 和移动端
- 🌙 **深浅色主题** - 支持暗色模式切换
- ✏️ **GitHub 编辑** - 每篇文章可直接在 GitHub 上编辑

## 📁 目录结构

```
blog_xiaoWang/
├── docs/
│   ├── .vitepress/
│   │   ├── config.ts          # VitePress 配置
│   │   └── theme/
│   │       ├── index.ts       # 自定义主题入口
│   │       └── custom.css     # 二次元样式
│   ├── public/
│   │   ├── images/            # 图片资源（博客内引用路径: /images/xxx）
│   │   └── favicon.svg        # 网站图标
│   ├── posts/
│   │   ├── frontend/          # 前端笔记
│   │   ├── backend/           # 后端笔记
│   │   ├── diary/             # 日记
│   │   └── resources/         # 资源收藏
│   ├── about.md               # 关于页
│   └── index.md               # 首页
├── package.json
└── README.md
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run docs:dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run docs:build
```

### 预览生产版本

```bash
npm run docs:preview
```

## 📝 如何写文章

1. 在对应分类目录下创建 `.md` 文件（如 `docs/posts/frontend/react.md`）
2. 在文章顶部添加 frontmatter：
   ```yaml
   ---
   title: 文章标题
   ---
   ```
3. 在 `docs/.vitepress/config.ts` 的 `sidebar` 中添加新文章链接

## 🖼️ 如何上传资源

将图片或其他静态文件放入 `docs/public/images/` 目录。

在文章中引用：
```markdown
![描述](/images/my-image.png)
```

## 🎨 主题定制

修改 `docs/.vitepress/theme/custom.css` 中的 CSS 变量来自定义颜色：

```css
:root {
  --vp-c-brand-1: #ff85a2;  /* 主色调 */
  --vp-c-bg: #fff8fc;        /* 背景色 */
}
```

## 📦 部署

推荐部署到：
- **GitHub Pages** - 免费，与代码库集成
- **Vercel** - 自动部署，国内访问快
- **Netlify** - 功能丰富，易于配置

### GitHub Pages 部署示例

在 `.github/workflows/deploy.yml` 中配置 GitHub Actions 自动部署。

---

Made with ❤️ and 🌸 by 小王
