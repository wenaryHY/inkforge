# InkForge 项目 - 阶段6A主题管理完整实施 Prompt

## 项目背景

**项目名称**: InkForge - 开源博客内容管理系统
**当前阶段**: 6A - 主题管理前后端集成
**技术栈**: Rust (Axum) + React + SQLite + WebSocket
**工作目录**: `D:/inkforge`

## 当前状态

### 已完成
- ✅ 后端主题模块基础结构（service / repository / dto）
- ✅ 前端主题列表页面 UI 框架
- ✅ 主题激活 API 接口
- ✅ 前端路由框架（BrowserRouter + Routes）

### 待完成
- ❌ 修复后端编译错误（MultipartError 转换）
- ❌ 清理 Rust 编译 warnings
- ❌ 实现前端主题详情页面（ThemeDetail.tsx）
- ❌ 完整的前后端集成测试

## 编译错误详情

当前 `cargo check` 输出 2 个错误：

```
error[E0277]: `?` couldn't convert the error to `AppError`
  --> src\modules\theme\handler.rs:89:57
  --> src\modules\theme\handler.rs:91:50
```

**原因**: `MultipartError` 没有实现到 `AppError` 的转换
**位置**: `src/modules/theme/handler.rs` 第 89、91 行
**解决方案**: 在 `src/shared/error.rs` 中为 `AppError` 添加 `From<MultipartError>` 实现

## 任务清单

### 第一步：修复编译错误

1. **打开** `src/shared/error.rs`
2. **在 `AppError` enum 中添加**:
   ```rust
   Multipart(String),
   ```
3. **在 impl 块中添加 From 转换**:
   ```rust
   impl From<axum::extract::multipart::MultipartError> for AppError {
       fn from(err: axum::extract::multipart::MultipartError) -> Self {
           AppError::Multipart(err.to_string())
       }
   }
   ```
4. **在 Display impl 中添加**:
   ```rust
   AppError::Multipart(msg) => write!(f, "Multipart error: {}", msg),
   ```

### 第二步：清理 Rust Warnings

删除以下未使用的导入（共 12 个 warning）：

- `src/infra/db/mod.rs:3` - 删除 `pub use pool::*;`
- `src/infra/plugin/mod.rs:3` - 删除 `pub use traits::*;`
- `src/infra/storage/mod.rs:4-5` - 删除 `pub use local::*;` 和 `pub use traits::*;`
- `src/modules/post/service.rs:16` - 删除 `use crate::modules::tag::domain::Tag;`
- `src/modules/theme/dto.rs:2` - 从导入中删除 `Theme`
- `src/modules/theme/handler.rs:84` - 删除 `use std::io::Write;`
- `src/modules/theme/mod.rs:8-15` - 删除 `SelectOption, ThemeConfigField, ThemeConfigRecord, ThemeSummary`
- `src/modules/theme/mod.rs:17-19` - 删除 `pub use dto::*;`, `pub use service::*;`, `pub use handler::*;`
- `src/shared/auth.rs:13` - 从导入中删除 `Claims`

### 第三步：实现前端主题详情页面

**文件**: `src/admin/ui/src/pages/ThemeDetail.tsx`

需要实现以下功能：
- 从 URL 参数获取主题 slug
- 调用 `/api/admin/themes/{slug}` 获取主题详情
- 显示主题信息（名称、版本、作者、描述）
- 显示主题配置字段（只读展示）
- 提供"返回列表"按钮

**参考结构**:
```tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { apiData } from '../lib/api';
import type { ThemeSummary } from '../types';

export default function ThemeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<ThemeSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const data = await apiData<ThemeSummary>(`/api/admin/themes/${slug}`);
        setTheme(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <div>加载中...</div>;
  if (!theme) return <div>主题不存在</div>;

  return (
    <div>
      <PageHeader
        title={theme.manifest.name}
        subtitle={theme.manifest.description}
        actions={
          <Button onClick={() => navigate('/admin/themes')} variant="ghost">
            返回列表
          </Button>
        }
      />
      {/* 显示主题详情内容 */}
    </div>
  );
}
```

### 第四步：验证编译

运行以下命令确保无错误：
```bash
cd D:/inkforge
cargo check
```

预期结果：编译成功，无 error（warnings 可以保留）

### 第五步：前端构建检查

```bash
cd D:/inkforge/src/admin/ui
npm run build
```

确保前端构建成功。

## 关键文件位置

- 后端错误处理: `src/shared/error.rs`
- 主题 handler: `src/modules/theme/handler.rs`
- 前端主题列表: `src/admin/ui/src/pages/Themes.tsx`
- 前端主题详情: `src/admin/ui/src/pages/ThemeDetail.tsx`
- 前端路由: `src/admin/ui/src/App.tsx`
- 前端 API: `src/admin/ui/src/lib/api.ts`
- 前端类型: `src/admin/ui/src/types/index.ts`

## 验收标准

- ✅ `cargo check` 无编译错误
- ✅ `cargo check` 无 warnings（或仅保留必要的）
- ✅ 前端 `npm run build` 成功
- ✅ 主题列表页面可正常加载并显示主题
- ✅ 点击"详情"按钮可跳转到主题详情页
- ✅ 主题详情页显示完整的主题信息

## 注意事项

1. **不要修改已有的 API 接口签名** - 保持与前端约定一致
2. **保持代码风格一致** - 参考现有代码的命名和格式
3. **错误处理** - 所有 API 调用都应有适当的错误处理
4. **类型安全** - 确保 TypeScript 类型完整，无 `any` 类型
