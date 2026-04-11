# Bugfix Requirements Document

## Introduction

用户报告了管理后台路由混乱问题，导致用户体验差且容易产生困惑。主要问题包括：
1. 从 2000 端口（生产环境）进入个人中心，点击 ADMIN 按钮跳转到 `http://localhost:2000/admin/posts`
2. 直接访问 `http://localhost:5173/admin` 需要尾部斜杠才能正常工作
3. 两个端口的管理后台内容和权限完全相同，但路由行为不一致
4. 个人中心的 ADMIN 按钮没有国际化翻译

这些问题的根源在于：
- 开发环境（5173 端口 Vite）和生产环境（2000 端口 Axum）路由配置不一致
- Vite 配置了 `base: '/admin/'`，要求尾部斜杠
- React Router 使用 `<BrowserRouter>` 但没有配置 `basename`
- 5173 端口是开发专用，不应该暴露给用户使用
- 国际化字典中已有 `admin` 键，但模板中未使用 `data-i18n` 属性

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN 用户从 2000 端口个人中心点击 ADMIN 按钮 THEN 系统跳转到 `/admin/posts` 而不是 `/admin`

1.2 WHEN 用户直接访问 `http://localhost:5173/admin`（无尾部斜杠）THEN 系统提示需要添加尾部斜杠才能正常工作

1.3 WHEN 用户在 5173 端口和 2000 端口访问管理后台 THEN 系统显示相同的内容和权限，但路由行为不一致（一个需要尾部斜杠，一个不需要）

1.4 WHEN 用户在个人中心页面查看 ADMIN 按钮 THEN 系统显示英文 "Admin" 文本，即使用户语言设置为中文

1.5 WHEN 用户切换语言 THEN ADMIN 按钮文本不会随之改变

### Expected Behavior (Correct)

2.1 WHEN 用户从 2000 端口个人中心点击 ADMIN 按钮 THEN 系统 SHALL 跳转到 `/admin`（管理后台首页），由 React Router 自动重定向到 `/admin/posts`

2.2 WHEN 用户直接访问 `http://localhost:5173/admin`（无尾部斜杠）THEN 系统 SHALL 正常加载管理后台，无需手动添加尾部斜杠

2.3 WHEN 用户在 5173 端口和 2000 端口访问管理后台 THEN 系统 SHALL 提供一致的路由行为（都不需要尾部斜杠）

2.4 WHEN 用户在个人中心页面查看 ADMIN 按钮且语言设置为中文 THEN 系统 SHALL 显示 "管理后台" 文本

2.5 WHEN 用户在个人中心页面查看 ADMIN 按钮且语言设置为英文 THEN 系统 SHALL 显示 "Admin" 文本

2.6 WHEN 用户切换语言 THEN ADMIN 按钮文本 SHALL 立即更新为对应语言的翻译

### Unchanged Behavior (Regression Prevention)

3.1 WHEN 用户访问 `/admin/posts`、`/admin/categories` 等子路由 THEN 系统 SHALL CONTINUE TO 正常加载对应的管理页面

3.2 WHEN 用户在管理后台内部导航（点击侧边栏菜单） THEN 系统 SHALL CONTINUE TO 正常切换页面

3.3 WHEN 用户访问 `/admin` 且未登录 THEN 系统 SHALL CONTINUE TO 显示登录页面

3.4 WHEN 用户访问 `/setup` 路由 THEN 系统 SHALL CONTINUE TO 正常显示安装向导页面

3.5 WHEN 用户在 2000 端口访问其他前台路由（如 `/`、`/posts/:slug`、`/profile`） THEN 系统 SHALL CONTINUE TO 正常渲染主题模板

3.6 WHEN 用户在个人中心页面使用其他已国际化的元素（如 "返回首页"、"退出登录" 按钮） THEN 这些元素 SHALL CONTINUE TO 正确显示对应语言的翻译

3.7 WHEN 开发者运行 `npm run dev` 启动开发环境 THEN Vite 开发服务器 SHALL CONTINUE TO 在 5173 端口正常运行并代理 API 请求到 2000 端口
