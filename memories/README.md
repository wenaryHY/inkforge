# InkForge 记忆库索引

> 本目录是 InkForge 的治理层文档，不是临时草稿堆。
> 它只负责两件事：**让协作入口足够快**，以及 **让状态、决策、执行边界不再漂移**。

---

## 会话启动必读

每次新会话或进入新任务时，按以下顺序读取：

1. `../CODEBUDDY.md`
2. `SKILL.md`
3. `PROJECT_STATUS.md`
4. `RUNTIME_RULES.md`

> 从本次整理开始，`README.md` **只做导航**，不再承载“当前结论”或阶段状态判断。

---

## 按任务找文档

| 你现在要做什么 | 首选文档 | 补充文档 |
|---|---|---|
| 先判断项目真实状态 | `PROJECT_STATUS.md` | `architecture-audit-2026-04-10.md` |
| 理解为什么这样设计 | `architecture-decisions.md` | `executable-roadmap.md` |
| 看接下来该做什么 | `executable-roadmap.md` | `phase-task-checklist.md` |
| 看当前阶段是否真通过了 | `INTEGRATION_TEST_CHECKLIST.md` | `PROJECT_STATUS.md` |
| 查已经完成过什么 | `v0.3-progress.md` | `PROJECT_STATUS.md` |
| 了解长期方向 | `architecture-decisions.md` | `executable-roadmap.md` |
| 查看本轮架构审计结论 | `architecture-audit-2026-04-10.md` | `PROJECT_STATUS.md` |

---

## 文档职责边界

| 文档 | 只负责什么 | 不负责什么 |
|---|---|---|
| `PROJECT_STATUS.md` | 当前真实状态、已验证能力、当前风险、近期优先级 | 历史流水、远期畅想 |
| `architecture-decisions.md` | 已接受 / 待复核的正式决策、已延后方向 | 阶段进度、情绪化判断 |
| `executable-roadmap.md` | 阶段目标、范围、退出条件、依赖 | 当前状态裁决 |
| `phase-task-checklist.md` | 当前阶段执行项与验收勾选 | 架构原因解释 |
| `INTEGRATION_TEST_CHECKLIST.md` | 回归与验收动作 | 项目方向判断 |
| `v0.3-progress.md` | 已验证完成事项、失败尝试、重要治理动作 | 当前真相源 |
| `architecture-audit-2026-04-10.md` | 基于真实代码的结构化审计报告 | 运行期规则 |
| `SKILL.md` | 通用工程质量底线 | 项目专属阶段安排 |
| `RUNTIME_RULES.md` | 当前项目的提问、风险分级、写入协议 | 技术路线图 |

---

## 当前推荐阅读路径

### 想在 3 分钟内进入项目上下文
1. `../CODEBUDDY.md`
2. `PROJECT_STATUS.md`
3. `architecture-audit-2026-04-10.md`
4. `phase-task-checklist.md`

### 想开始一个实现任务
1. `../CODEBUDDY.md`
2. `SKILL.md`
3. `PROJECT_STATUS.md`
4. `RUNTIME_RULES.md`
5. `executable-roadmap.md`
6. `phase-task-checklist.md`

### 想核对“这件事到底做完没有”
1. `PROJECT_STATUS.md`
2. `INTEGRATION_TEST_CHECKLIST.md`
3. `v0.3-progress.md`

---

## 维护规则

1. **状态只写进 `PROJECT_STATUS.md`。**
2. **进度只写进 `v0.3-progress.md`。**
3. **`README.md` 只做索引，不再写阶段结论。**
4. **长期方向优先折叠进 `architecture-decisions.md` 与 `executable-roadmap.md`，不再单列愿景文档。**
5. **新文档必须先回答“它为什么不是现有文档中的一节”。**
6. **阶段完成以构建、主链路验证、文档同步三者同时满足为准。**

---

## 当前目录清单

- `SKILL.md`
- `PROJECT_STATUS.md`
- `RUNTIME_RULES.md`
- `architecture-decisions.md`
- `architecture-audit-2026-04-10.md`
- `executable-roadmap.md`
- `phase-task-checklist.md`
- `INTEGRATION_TEST_CHECKLIST.md`
- `v0.3-progress.md`

**最后更新**: 2026-04-10
