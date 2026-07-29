## Why

仓库同时引入了 OpenSpec 与 Superpowers 相关 skills，但尚未规定两者的职责边界和调用顺序。缺少统一编排时，agent 可能生成并行的 design、tasks 和完成状态，造成重复审批、artifact 漂移或绕过强制 OpenSpec 生命周期。

## What Changes

- 在 `AGENTS.md` 中新增 OpenSpec 与 Superpowers 的编排规则。
- 规定 OpenSpec 是 change lifecycle、持久化 planning artifacts 和实施授权的唯一事实来源。
- 规定 Superpowers 只提供阶段内的方法，包括需求探索、任务拆分、TDD、系统化调试、评审、验证和分支收尾。
- 将 `brainstorming` 与 `writing-plans` 的持久化输出分别映射到 OpenSpec `design.md` 与 `tasks.md`，禁止默认创建并行的正式 design 或 plan。
- 规定 `openspec-apply-change` 是实施阶段唯一的 task 控制器；实施发现 scope、specs、design 或 tasks 漂移时，必须停止并通过 `openspec-update-change` 更新 artifacts、重新确认后再继续。
- 规定验证、sync、archive 和分支收尾的顺序，并明确仓库规则覆盖通用 skill 中更宽松的归档行为。
- 不修改 `.agents/skills/openspec-*` 或 Superpowers skill 源文件。
- **BREAKING**: 无。

## Capabilities

### New Capabilities

- `agent-development-workflow`: 定义仓库内 agent 使用 OpenSpec 与 Superpowers skills 时的职责边界、artifact 所有权、阶段编排、漂移处理和完成门禁。

### Modified Capabilities

- 无。

## Impact

- 受影响文件为根目录 `AGENTS.md`，并新增对应 OpenSpec capability 规格。
- 后续 agent 执行仓库变更时必须按照新的编排规则选择和组合 skills。
- 不影响应用运行时代码、API、依赖或用户数据。
- 非目标包括修改任何 skill 实现、增加新的自动化 orchestrator skill，以及调整现有业务功能。
