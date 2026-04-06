# InkForge v0.3 集成测试清单

## 登录凭证
- **用户名**: testuser
- **密码**: test123456
- **访问地址**: http://localhost:5173/admin/

---

## 第 1 阶段：主题管理（Stage 6A）

### 1.1 主题列表页面
- [ ] 访问 `/admin/themes`
- [ ] 验证主题列表加载成功
- [ ] 验证显示主题名称、版本、作者
- [ ] 验证"激活"按钮状态

### 1.2 主题详情页面
- [ ] 点击主题进入详情页
- [ ] 验证显示主题基本信息（名称、版本、作者、描述）
- [ ] 验证显示主题配置字段（如果有）
- [ ] 验证"返回列表"按钮可用

### 1.3 主题配置编辑
- [ ] 在详情页编辑配置字段
- [ ] 点击"保存配置"按钮
- [ ] 验证保存成功提示
- [ ] 验证配置已保存（刷新页面后仍存在）

### 1.4 主题激活
- [ ] 点击"激活主题"按钮
- [ ] 验证激活成功提示
- [ ] 验证按钮状态变为"已激活"
- [ ] 验证其他主题的激活按钮恢复为可用状态

---

## 第 2 阶段：数据备份（Backup 模块）

### 2.1 手动备份
- [ ] 导航到设置页面 → 数据备份
- [ ] 点击"下载数据库备份"按钮
- [ ] 验证备份文件下载成功
- [ ] 验证备份文件大小合理（> 100KB）
- [ ] 验证文件名包含时间戳

### 2.2 备份导入
- [ ] 点击"选择备份文件导入"
- [ ] 选择刚下载的备份文件
- [ ] 确认导入（会自动备份原数据库）
- [ ] 验证导入成功提示
- [ ] 验证页面刷新后数据完整

### 2.3 备份计划配置
- [ ] 在备份设置中配置自动备份
- [ ] 设置备份频率（每天/每周/每月）
- [ ] 设置备份时间
- [ ] 点击"保存"
- [ ] 验证配置已保存

### 2.4 备份列表查看
- [ ] 查看备份列表
- [ ] 验证显示备份时间、大小、状态
- [ ] 验证可以删除备份
- [ ] 验证可以恢复备份

---

## 第 3 阶段：SEO 优化（SEO 模块）

### 3.1 Robots.txt
- [ ] 访问 http://localhost:3000/robots.txt
- [ ] 验证返回 robots.txt 内容
- [ ] 验证包含 `User-agent: *`
- [ ] 验证包含 `Sitemap:` 指向 sitemap.xml

### 3.2 Sitemap.xml
- [ ] 访问 http://localhost:3000/sitemap.xml
- [ ] 验证返回 XML 格式内容
- [ ] 验证包含 `<?xml version="1.0"?>`
- [ ] 验证包含 `<urlset>` 标签
- [ ] 验证包含已发布文章的 URL

### 3.3 Meta 标签生成
- [ ] 访问前台首页 http://localhost:3000/
- [ ] 打开浏览器开发者工具 → 检查元素
- [ ] 验证 `<meta name="description">` 存在
- [ ] 验证 `<meta property="og:title">` 存在
- [ ] 验证 `<meta property="og:description">` 存在

### 3.4 JSON-LD 结构化数据
- [ ] 在前台页面查看页面源代码
- [ ] 搜索 `<script type="application/ld+json">`
- [ ] 验证包含 `@context: "https://schema.org"`
- [ ] 验证包含 `@type: "WebSite"` 或 `"BlogPosting"`

---

## 第 4 阶段：系统集成验证

### 4.1 后端服务
- [ ] 验证后端启动无错误
- [ ] 访问 http://localhost:3000/api/health
- [ ] 验证返回 `{"status":"ok"}`
- [ ] 访问 http://localhost:3000/api/version
- [ ] 验证返回版本信息

### 4.2 前端构建
- [ ] 验证前端构建成功（npm run build）
- [ ] 验证前端开发服务器运行正常
- [ ] 验证管理后台可访问
- [ ] 验证导航菜单加载完整

### 4.3 API 响应格式
- [ ] 验证所有 API 返回标准格式：
  ```json
  {
    "code": 0,
    "message": "ok",
    "data": {...},
    "request_id": "..."
  }
  ```
- [ ] 验证错误响应包含错误码和消息
- [ ] 验证分页响应包含 pagination 信息

### 4.4 错误处理
- [ ] 测试无效的主题 slug → 验证返回 404
- [ ] 测试无效的备份 ID → 验证返回 404
- [ ] 测试无效的 token → 验证返回 401
- [ ] 测试网络错误恢复 → 验证错误提示显示

---

## 第 5 阶段：API 端点验证（使用 curl）

### 5.1 主题 API
```bash
# 获取主题列表
curl http://localhost:3000/api/admin/themes \
  -H "Authorization: Bearer $TOKEN"

# 获取主题详情
curl http://localhost:3000/api/admin/themes/default/detail \
  -H "Authorization: Bearer $TOKEN"

# 保存主题配置
curl -X PATCH http://localhost:3000/api/admin/themes/default/config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"config":{"key":"value"}}'

# 激活主题
curl -X POST http://localhost:3000/api/admin/themes/default/activate \
  -H "Authorization: Bearer $TOKEN"
```

### 5.2 备份 API
```bash
# 创建备份
curl -X POST http://localhost:3000/api/admin/backup \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"provider":"local"}'

# 列出备份
curl http://localhost:3000/api/admin/backup/list \
  -H "Authorization: Bearer $TOKEN"

# 获取备份计划
curl http://localhost:3000/api/admin/backup/schedule \
  -H "Authorization: Bearer $TOKEN"
```

### 5.3 SEO API
```bash
# 获取 robots.txt
curl http://localhost:3000/robots.txt

# 获取 sitemap.xml
curl http://localhost:3000/sitemap.xml
```

---

## 测试结果记录

| 功能 | 状态 | 备注 |
|------|------|------|
| 主题列表 | ⬜ | |
| 主题详情 | ⬜ | |
| 主题配置编辑 | ⬜ | |
| 主题激活 | ⬜ | |
| 手动备份 | ⬜ | |
| 备份导入 | ⬜ | |
| 备份计划 | ⬜ | |
| Robots.txt | ⬜ | |
| Sitemap.xml | ⬜ | |
| Meta 标签 | ⬜ | |
| JSON-LD | ⬜ | |
| 后端健康检查 | ⬜ | |
| 前端构建 | ⬜ | |
| API 响应格式 | ⬜ | |
| 错误处理 | ⬜ | |

---

## 已知问题

- ⚠️ 旧的 "admin" 用户密码哈希损坏，无法登录
- ✅ 已解决：使用 testuser/test123456 进行测试

---

## 后续步骤

1. 完成上述所有测试
2. 记录任何失败或异常
3. 根据测试结果修复问题
4. 准备进入 Stage 7（前台主题渲染）
