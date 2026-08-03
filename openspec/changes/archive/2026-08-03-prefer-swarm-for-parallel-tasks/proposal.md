## Why

开发过程中经常出现可并行的只读调查或互不冲突的修改，但仓库规则尚未要求主 Agent 优先使用 swarm 并行执行。补充该规则可缩短反馈周期，并明确主 Agent 对 subagent 结果的审核责任，避免并行工作绕过 OpenSpec 与完成门禁。

## What Changes

- 在 `AGENTS.md` 增加「可并行任务优先使用 swarm」编排规则：识别可并行项后优先并行调查或修改，主 Agent 汇总并审核结果后再继续。
- 修改 `agent-development-workflow` capability：将 swarm 并行偏好与主 Agent 审核义务写成可验收 requirement。
- 明确边界：并行不得产生第二套 task 状态、不得让多个 subagent 冲突改同一文件、不得跳过 OpenSpec 确认与完成门禁；单一串行依赖任务仍由主 Agent 顺序执行。

## Capabilities

### New Capabilities
- （无）

### Modified Capabilities
- `agent-development-workflow`: 新增「可并行工作优先 swarm，主 Agent 审核结果」的 requirement 与 scenarios。

## Impact

- 影响范围：`AGENTS.md`、OpenSpec `agent-development-workflow` 主 specs。
- 运行时影响：仅约束 agent 工作方式，不改变产品代码、构建或用户可见功能。
- 与现有规则关系：仍服从 OpenSpec 外层 lifecycle；`subagent-driven-development` / `dispatching-parallel-agents` / AgentSwarm 仍是阶段内方法，不得独立建 change lifecycle。
- 非目标：不修改 `.agents/skills/openspec-*` 源文件；不强制对不可并行任务使用 swarm。
