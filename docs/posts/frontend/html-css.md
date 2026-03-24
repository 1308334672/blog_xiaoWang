---
title: HTML & CSS 基础
---

# HTML & CSS 基础 🎨

> 万丈高楼平地起，HTML 和 CSS 是前端的基石。

## HTML 语义化标签

语义化标签让代码更有意义，也更利于 SEO 和无障碍访问。

```html
<!-- 推荐使用语义化标签 -->
<header>网站头部</header>
<nav>导航栏</nav>
<main>
  <article>
    <h1>文章标题</h1>
    <p>文章内容...</p>
  </article>
  <aside>侧边栏</aside>
</main>
<footer>网站底部</footer>
```

## CSS Flexbox 布局

Flexbox 是现代 CSS 布局的核心。

```css
.container {
  display: flex;
  justify-content: center;  /* 主轴对齐 */
  align-items: center;      /* 交叉轴对齐 */
  gap: 16px;                /* 间距 */
  flex-wrap: wrap;          /* 换行 */
}
```

### 常用属性速查

| 属性 | 值 | 说明 |
|------|----|------|
| `flex-direction` | `row` / `column` | 主轴方向 |
| `justify-content` | `center` / `space-between` | 主轴对齐 |
| `align-items` | `center` / `flex-start` | 交叉轴对齐 |
| `flex-wrap` | `wrap` / `nowrap` | 是否换行 |

## CSS Grid 布局

Grid 适合二维布局场景。

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 24px;
}
```

## CSS 变量

CSS 自定义属性让样式更易维护。

```css
:root {
  --primary-color: #ff85a2;
  --font-size-base: 16px;
  --border-radius: 8px;
}

.button {
  background-color: var(--primary-color);
  font-size: var(--font-size-base);
  border-radius: var(--border-radius);
}
```

## CSS 动画

```css
/* Keyframes 动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.element {
  animation: fadeIn 0.5s ease-out forwards;
}

/* Transition 过渡 */
.button {
  transition: transform 0.2s, box-shadow 0.2s;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}
```

::: tip 📌 记住这些
- 优先使用 Flexbox 做一维布局
- 用 Grid 做二维布局
- 多用 CSS 变量保持一致性
:::
