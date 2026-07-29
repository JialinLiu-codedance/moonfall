## Purpose

定义仓库内 agent 组合 OpenSpec 与 Superpowers skills 时的职责边界、artifact 所有权、阶段编排、漂移处理和完成门禁，确保所有变更只有一套可审计的规划与执行状态。

## Requirements

### Requirement: OpenSpec 作为外层生命周期
仓库内执行任何会修改仓库内容的 agent 任务时，agent MUST 将 OpenSpec 作为 change lifecycle、持久化 planning artifacts、人工确认和归档状态的唯一事实来源。

#### Scenario: 发起新的仓库变更
- **WHEN** 用户要求新增功能、修复缺陷、修改文档、调整配置、变更工具链或执行内部重构
- **THEN** agent 在修改实现文件前通过 OpenSpec 创建并完成适用的 proposal、delta specs、design 和 tasks
- **AND** agent 等待用户对全部 artifacts 的明确确认

### Requirement: Superpowers 只提供阶段内方法
agent MUST 将 Superpowers skills 用作 OpenSpec 各阶段内的探索、任务拆分、TDD、系统化调试、评审、验证、隔离工作区和分支收尾方法，MUST NOT 让 Superpowers 建立独立于 OpenSpec 的 change lifecycle。

#### Scenario: 探索复杂需求
- **WHEN** 新需求在范围、方案或成功标准上需要探索
- **THEN** agent 在 `openspec-explore` 阶段使用 `brainstorming` 方法澄清需求并比较方案
- **AND** 最终正式结论进入当前 OpenSpec change 的 artifacts

#### Scenario: 诊断尚未定位的缺陷
- **WHEN** 用户报告缺陷但根因尚未确定
- **THEN** agent 可以先使用 `systematic-debugging` 执行只读诊断
- **AND** 在实施修复前基于已确认根因创建或更新 OpenSpec change

### Requirement: Planning artifacts 保持单一来源
agent MUST 将经过确认的设计和实施计划分别持久化到当前 OpenSpec change 的 `design.md` 与 `tasks.md`，MUST NOT 默认创建 `docs/superpowers/specs/` 或 `docs/superpowers/plans/` 下的并行正式 artifacts。

#### Scenario: 使用 brainstorming 形成设计
- **WHEN** `brainstorming` 形成经过用户认可的设计结论
- **THEN** agent 将这些结论用于当前 change 的 proposal、delta specs 和 `design.md`
- **AND** 不创建第二份正式 design 文档

#### Scenario: 使用 writing-plans 拆分任务
- **WHEN** `writing-plans` 方法用于细化实施任务
- **THEN** agent 将文件范围、接口、依赖、TDD 步骤和验证命令写入当前 change 的 `tasks.md`
- **AND** 不创建第二份正式 plan 文档

### Requirement: Apply 阶段只有一个 task 控制器
进入实施阶段后，agent MUST 由 `openspec-apply-change` 选择 task、读取 change 上下文并更新完成状态；其他 Superpowers skills 只能作为当前 task 的执行方法。

#### Scenario: 实施一个已确认 task
- **WHEN** agent 开始实施当前 change 的待办 task
- **THEN** agent 通过 `openspec-apply-change` 获取任务及上下文
- **AND** 根据任务性质使用 `test-driven-development`、`systematic-debugging`、`requesting-code-review`、`subagent-driven-development` 或 `executing-plans`
- **AND** 只在当前 OpenSpec `tasks.md` 中维护持久化完成状态

### Requirement: Artifact 漂移先更新再实施
实施中发现 scope、specs、design 或 tasks 需要变化时，agent MUST 停止受影响实现，使用 `openspec-update-change` 保持 artifacts 一致，并在用户重新明确确认后恢复 `openspec-apply-change`。

#### Scenario: 实施暴露设计问题
- **WHEN** 当前 task 无法在已确认 design 或 specs 范围内正确完成
- **THEN** agent 不得猜测、扩大范围或静默修改实现方向
- **AND** agent 先提出 artifact 修订并等待用户确认
- **AND** 确认完成后再继续受影响 task

### Requirement: 完成验证与归档遵循统一门禁
agent MUST 先取得 fresh test、静态检查和构建证据，再执行 `openspec-verify-change`、解决所有阻断项、运行 `openspec validate --all --strict`、同步适用的 delta specs 并归档 change，最后才进入分支集成或交付收尾。

#### Scenario: Change 满足完成条件
- **WHEN** 所有实施 tasks 已完成且相关检查提供 fresh passing evidence
- **THEN** agent 使用 `openspec-verify-change` 检查 completeness、correctness 和 coherence
- **AND** agent 修复所有 CRITICAL
- **AND** agent 修复所有 WARNING，或在 `design.md` 中记录接受理由和影响
- **AND** agent 在 strict validation 通过后依次执行 sync 和 archive
- **AND** agent 只在归档完成后使用 `finishing-a-development-branch` 处理分支集成

#### Scenario: 通用 archive skill 允许带警告继续
- **WHEN** 通用 `openspec-archive-change` 行为与仓库的严格完成门禁冲突
- **THEN** agent 以 `AGENTS.md` 的仓库规则为准
- **AND** tasks 未完成、检查失败、存在未解决的 CRITICAL 或 strict validation 失败时不得 sync 或 archive

### Requirement: 可见 UI task 组合 Midscene TDD
当 OpenSpec task 新增或修改用户可见 UI、交互状态、布局或视觉反馈时，agent MUST 在 `openspec-apply-change` 控制下同时使用 Superpowers `test-driven-development` 与仓库级 `midscene-tdd`。确定性测试和 Midscene 验收都只能作为当前 task 的执行证据，MUST NOT 建立第二套正式 task 状态。

#### Scenario: 实施可见 UI change
- **WHEN** agent 从已确认的 OpenSpec `tasks.md` 选择一个可见 UI task
- **THEN** agent 使用 `test-driven-development` 建立确定性 red-green 循环
- **AND** agent 使用 `midscene-tdd` 建立适用的 Web 语义验收或 Desktop 验收
- **AND** 所有持久化完成状态仍由 `openspec-apply-change` 更新到当前 `tasks.md`

#### Scenario: Midscene 基础设施尚未落地
- **WHEN** 可见 UI task 依赖的 Midscene package、fixture、命令或模型配置尚不可用
- **THEN** agent 不得跳过 Midscene 后直接宣称 task 完成
- **AND** agent 将缺失基础设施纳入已确认 artifacts，或将 task 报告为 `BLOCKED`
