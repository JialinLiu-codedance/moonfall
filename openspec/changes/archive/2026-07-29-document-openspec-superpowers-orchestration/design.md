## Context

仓库已经强制所有变更执行完整 OpenSpec 生命周期，并引入了一组用于探索、规划、实施、调试、评审和收尾的 Superpowers skills。两套体系存在职责重叠：OpenSpec 的 `design.md` 与 `tasks.md` 和 Superpowers 默认生成的 design、plan 文档都可以成为规划来源；`openspec-apply-change`、`subagent-driven-development` 与 `executing-plans` 也都可以维护执行进度。

本变更只调整根目录 `AGENTS.md`，用仓库级规则消除这些重叠。依据 `using-superpowers` 的优先级约定，`AGENTS.md` 等用户或项目指令高于 skill 默认行为，因此无需修改任何 skill 源文件。

## Goals / Non-Goals

**Goals:**

- 建立“OpenSpec 外层生命周期、Superpowers 阶段内方法”的统一模型。
- 让 OpenSpec change 成为正式 design、specs、tasks 和完成状态的唯一事实来源。
- 明确需求探索、缺陷诊断、实施、漂移处理、验证、归档和分支收尾的调用顺序。
- 保留 Superpowers 在 TDD、系统化调试、代码评审和 fresh verification 方面的质量门。
- 让未来 agent 可以只阅读 `AGENTS.md` 就确定两套 skills 的组合方式。

**Non-Goals:**

- 不修改 `.agents/skills/openspec-*` 或任何 Superpowers skill 源文件。
- 不创建新的 orchestrator skill、脚本或自动化状态机。
- 不删除 `docs/superpowers/` 路径；只禁止默认把它作为本仓库的并行正式 artifact 来源。
- 不改变现有应用架构、业务行为、API、依赖或运行环境。

## Decisions

### 1. OpenSpec 是唯一外层状态机

OpenSpec 负责 change 标识、proposal、delta specs、design、tasks、人工确认、apply、verify、strict validation、sync 和 archive。Superpowers 不建立第二条 lifecycle，只在当前 OpenSpec 阶段内提供方法。

采用这一方案可以让授权边界和完成状态保持唯一，也与仓库已有强制流程一致。

**备选方案：** 先完整运行 Superpowers，再将其 design 和 plan 复制到 OpenSpec。该方案会产生重复文档、重复审批和双向同步成本，因此不采用。

### 2. 覆盖 Superpowers 的默认 artifact 路径

`brainstorming` 的设计结论必须被吸收到当前 change 的 proposal、delta specs 和 `design.md`；`writing-plans` 的文件范围、接口、任务粒度、TDD 步骤和验证命令必须被吸收到当前 change 的 `tasks.md`。不得默认生成 `docs/superpowers/specs/` 或 `docs/superpowers/plans/` 下的第二份正式文档。

两个 skill 都允许项目偏好覆盖默认输出位置，仓库级规则因此可以在不 fork skill 的前提下统一 artifact 所有权。

**备选方案：** 保留两套文件并规定 OpenSpec 优先。即使定义优先级，次级文档仍可能过期并误导执行者，因此不采用。

### 3. `openspec-apply-change` 维护唯一 task 状态

实施阶段由 `openspec-apply-change` 读取 change 上下文、选择待办 task 并更新 `tasks.md`。`test-driven-development`、`systematic-debugging` 和 code review skills 作为单个 task 内的质量方法；`subagent-driven-development` 或 `executing-plans` 作为执行策略，但不得维护另一套正式 task 完成状态。

复杂任务允许使用 `.superpowers/sdd/` 下的 gitignored ledger 作为恢复用 scratch 数据，但它不能替代 OpenSpec `tasks.md`，任务完成后必须同步回唯一正式状态。

**备选方案：** 让 Superpowers plan 成为执行控制器，OpenSpec 只在最终归档时补状态。该方案会让 OpenSpec apply 状态失真，因此不采用。

### 4. 探索、缺陷和漂移采用不同入口

- 新功能或范围不清晰的需求：使用 `openspec-explore` 作为探索阶段，并使用 `brainstorming` 澄清和比较方案。
- 根因未知的缺陷：先使用 `systematic-debugging` 进行只读诊断，确认根因后再创建或更新 change；任何仓库修改仍必须等待 artifacts 确认。
- 实施中的规格或设计漂移：停止受影响 task，使用 `openspec-update-change` 提出逐项修订，获得重新确认后恢复 apply。

这一划分避免为了只读诊断过早假定解决方案，同时保证任何实际修改都经过 OpenSpec 授权。

### 5. 完成门禁按证据、语义、结构和交付分层

完成顺序固定为：task 级 fresh verification → `openspec-verify-change` 语义核对 → 解决 CRITICAL 与 WARNING → `openspec validate --all --strict` → `openspec-sync-specs` → `openspec-archive-change` → `finishing-a-development-branch`。

其中 `verification-before-completion` 证明测试、静态检查和构建命令的最新结果；`openspec-verify-change` 证明实现与 requirements、scenarios、design 和 tasks 一致，两者不能互相替代。

通用 archive skill 允许用户确认后带着部分警告继续，但本仓库已有更严格的禁止条件。发生冲突时必须遵守 `AGENTS.md`，不能进入宽松分支。

## Risks / Trade-offs

- [Superpowers skill 仍显示默认文档路径] → 在 `AGENTS.md` 中明确路径覆盖和唯一事实来源，执行时始终以仓库规则为准。
- [详细 TDD 计划使 `tasks.md` 变长] → 只记录实施所需的文件、接口、依赖、测试循环和验证命令，不复制 proposal 或 design 正文。
- [临时 SDD ledger 与 tasks 状态不一致] → ledger 只作为 gitignored 恢复数据；只有 OpenSpec checkbox 可以表示正式完成。
- [两层验证增加执行时间] → 分离命令证据和规格一致性可以避免“测试通过但需求未实现”或“文档完整但构建失败”的错误完成。
- [规则较长增加阅读成本] → 在 `AGENTS.md` 中使用职责、阶段和冲突处理三个小节组织，避免复制各 skill 的完整说明。

## Migration Plan

1. 在 `AGENTS.md` 的 OpenSpec 生命周期之后增加 OpenSpec 与 Superpowers 编排规则。
2. 检查规则覆盖职责边界、artifact 映射、阶段顺序、漂移处理和完成门禁。
3. 确认未修改任何 skill 源文件，且未创建并行 design 或 plan 文档。
4. 运行文本结构检查和 `openspec validate --all --strict`。
5. 完成 verify、sync 和 archive 后交付变更。

如需回滚，在 sync 前撤销 `AGENTS.md` 修改并放弃当前 change；sync 后如需撤销，创建新的 OpenSpec change 删除对应 capability 和规则，不直接静默修改 main spec。

## Open Questions

无。
