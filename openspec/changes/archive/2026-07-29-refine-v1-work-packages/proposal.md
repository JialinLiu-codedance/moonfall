## Why

现有 V1 路线已经定义 B0-B2 与 A0-A8 的阶段边界，但每个阶段仍包含多个相互独立的开发结果。若将一个阶段作为单一执行 change，AI 在多次上下文压缩后需要恢复过多状态，容易遗漏范围、依赖、任务证据或完成门禁，因此需要把路线细化为可独立恢复和验收的工作包。

## What Changes

- 将 B0-B2 与 A0-A8 细化为 54 个有序工作包，每个工作包具有稳定编号、建议 OpenSpec change 名称、单一开发结果和完成门禁。
- 将 A0 测试与 CI 基础设施前置到所有用户可见 UI 工作包之前，并规定 A0.1 只建立无可见产品功能的空工程。
- 为工作区管理、会话组织和 sidecar 诊断建立明确工作包，并划清附件、输入历史与 Thinking 配置的所有权。
- 规定每次执行只允许处理一个工作包，且每个工作包必须使用独立 OpenSpec change 完成完整生命周期。
- 规定每个工作包通常拆分为 3-7 个可独立验证的 task，task 必须记录输入、输出、失败行为和 fresh verification。
- 规定上下文恢复不得依赖聊天记录，必须重新读取当前 change artifacts、Git 状态、task 状态和验证证据。
- 将版本节点标准化为 `0.0.1`、`0.0.2`、`0.0.3`、`0.1.0`、`0.2.0`、`0.3.0`、`0.4.0`、`0.5.0`、`0.9.0` 和 `1.0.0`，并保持版本节点只表示可交付能力，不表示每个工作包都发布版本。
- 更新 `docs/v1-technical-roadmap.md` 的迭代表格，使人类可读路线与 OpenSpec 主规格一致。
- 本 change 只细化路线与规格，不实施任何 B0-B2 或 A0-A8 工作包，不初始化应用工程，也不拉取或构建 Kimi Code。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `v1-development-roadmap`: 将阶段级路线细化为 54 个独立工作包，并增加单工作包执行、UI TDD 前置顺序、核心能力所有权、上下文恢复、task 粒度和版本映射要求。

## Impact

- 更新 `openspec/specs/v1-development-roadmap/spec.md` 的阶段执行与版本边界要求。
- 更新 `docs/v1-technical-roadmap.md` 的迭代计划与版本节点。
- 后续开发从 `B0.1 define-kimi-upstream-lock` 开始，每次只实施一个工作包。
- 不影响运行时代码、API、依赖、构建产物或用户数据。
