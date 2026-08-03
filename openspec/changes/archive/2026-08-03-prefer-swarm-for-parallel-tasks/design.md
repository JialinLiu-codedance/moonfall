## Context

`AGENTS.md` 已定义 OpenSpec 外层 lifecycle 与 Superpowers 阶段内方法，并提到可选用 `subagent-driven-development` 或 `executing-plans`，但未强制「可并行时优先 swarm」。运行时已支持 AgentSwarm / 多 subagent；需要把偏好与审核责任写进仓库规则，避免主 Agent 串行化本可并行的调查与互不冲突的修改。

## Goals / Non-Goals

**Goals:**

- 在 `AGENTS.md` 的编排章节增加清晰、可执行的 swarm 优先规则。
- 在 `agent-development-workflow` 中增加对应 requirement，便于后续验收 agent 行为。
- 固定主 Agent 职责：划分并行边界、派发、汇总、审核、决定是否采纳，并维护唯一 OpenSpec task 状态。

**Non-Goals:**

- 不改 skill 源码或 AgentSwarm 实现。
- 不要求对串行依赖、共享写冲突、单文件微改强制并行。
- 不削弱 OpenSpec 确认门禁或允许 subagent 直接勾选/归档 change。

## Decisions

### 1. 规则落点

放在 `AGENTS.md` →「OpenSpec 与 Superpowers 编排」下新增小节 **「并行与 Swarm」**，并同步更新「阶段内调用规则」中实施阶段的表述，指向 swarm 优先。

被否决：只写在 skill 文档——仓库规则以 `AGENTS.md` 为最高优先级，skill 无法覆盖。  
被否决：单独新建 capability——行为属于既有 agent 工作流，扩展 `agent-development-workflow` 更一致。

### 2. 何时必须优先并行

主 Agent MUST 在以下情况优先使用 swarm / 多 subagent：

- 2 个及以上**无共享写冲突**的调查（读代码、搜路径、对照文档）。
- 2 个及以上**文件集合不重叠**且无接口耦合的实现或修改切片（在已确认 OpenSpec tasks 授权范围内）。
- 同一 task 内可拆成互不依赖的只读取证（例如并行读多份日志/多模块）。

以下情况 **不得** 为并行而并行：

- 强顺序依赖（后一步依赖前一步输出）。
- 会争用同一文件、同一 lock、同一运行中进程或同一 OpenSpec checkbox 状态。
- 尚未获得 artifacts 确认的实现修改。
- 体量小到并行编排成本高于收益的单点改动。

### 3. 主 Agent 审核义务

Subagent 返回后，主 Agent MUST：

1. 核对范围是否越权、是否与 design/specs/tasks 一致。  
2. 检查冲突编辑、重复工作、遗漏验证。  
3. 拒绝不可信结论时自行复验关键证据（命令输出、文件内容），不得仅因 subagent 声称完成而勾选 task。  
4. 只由主 Agent 更新 OpenSpec `tasks.md` 与后续 verify/sync/archive。

### 4. 与现有多代理 skills 的关系

- 运行时 **AgentSwarm** / `dispatching-parallel-agents` / `subagent-driven-development` 均为阶段内手段。  
- OpenSpec 仍是唯一 change 与 task 状态来源。  
- 并行切片的正式完成状态仍归并到当前 change 的 `tasks.md`。

### 5. 文案风格

与现有 `AGENTS.md` 一致：中文条目 + 英文关键词（MUST、OpenSpec、swarm、task）；短列表，避免冗长教程。

## Risks / Trade-offs

- [过度并行导致冲突 diff] → 规则明确禁止重叠写集与共享状态；主 Agent 审核合并。  
- [subagent 幻觉完成] → 明确主 Agent 复验证据，subagent 声明不能替代 verification。  
- [与「同一时间只实施一个 V1 工作包」混淆] → 并行是工作包/change **内部**切片，不并行多个 V1 工作包 OpenSpec change。  
- [编排开销] → 允许主 Agent 对显然不可并行或过小任务保持串行。

## Migration Plan

- 仅文档与 specs；无代码迁移。  
- 归档后后续会话读取 `AGENTS.md` 即生效。  
- 回滚：还原 `AGENTS.md` 与 `agent-development-workflow` 相关段落。

## Open Questions

- 无。若用户希望强制「任何 2+ 文件修改必须 swarm」，可在确认 artifacts 时收紧；当前采用「可并行则优先，有冲突则串行」。
