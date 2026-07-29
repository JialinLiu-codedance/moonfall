## Context

当前主规格以 B0-B2、A0-A8 作为实施单元。阶段边界适合表达产品依赖和版本成熟度，但 B2、A3、A4、A5 等阶段包含多个协议、状态或 UI 领域，无法在一次有限上下文中稳定实施。Moonfall 的开发主要由 AI 执行，聊天上下文会被压缩，因此正式状态必须持续保存在 OpenSpec artifacts、Git 和 fresh verification evidence 中。

本 change 将阶段保留为 umbrella milestone，并在阶段下增加 54 个有序工作包。工作包成为实施授权、恢复和验收的最小 OpenSpec lifecycle 单元。

## Goals / Non-Goals

**Goals:**

- 为 B0-B2 与 A0-A8 建立稳定、完整、无重复的工作包目录。
- 让每次执行只需要恢复一个工作包的上下文。
- 让每个工作包具有单一结果、有限 task 数和独立完成门禁。
- 明确阶段、工作包、task 和版本节点四种概念的职责。
- 固定从 `B0.1` 到 `A8.4` 的依赖顺序和版本映射。

**Non-Goals:**

- 不在本 change 中实施任一工作包。
- 不为 54 个工作包一次性生成 proposal、design、specs 或 tasks。
- 不要求每完成一个工作包就发布 App 或递增 SemVer。
- 不允许工作包绕过仓库的 OpenSpec lifecycle。

## Decisions

### 1. 阶段是 milestone，工作包是执行单元

B0-B2 与 A0-A8 继续表达总体架构与依赖；`B0.1` 至 `A8.4` 表达一次可以完整授权、实施、验证和归档的结果。每个工作包对应一个独立 OpenSpec change，change 名称由目录固定，不在执行时临时改写。

被否决的“每个阶段一个 change”仍然需要在压缩后恢复多个独立领域；被否决的“每个 task 一个 change”会产生过高 lifecycle 成本并失去可交付结果边界。

### 2. 固定 54 个工作包并严格按依赖顺序推进

目录包含 B0 3 项、B1 4 项、B2 4 项、A0 4 项、A1 6 项、A2 5 项、A3 6 项、A4 5 项、A5 5 项、A6 4 项、A7 4 项和 A8 4 项，共 54 项。默认一次只存在一个实施中的工作包；只有当前工作包完成 verify、strict validation、sync 和 archive 后，才开始下一项。

被否决的自由并行会让多个 active change 共享接口和状态，增加合并与上下文恢复风险。未来如确有并行需要，必须通过单独 OpenSpec change 更新依赖图并重新确认。

### 3. 每个工作包通常包含 3-7 个 task

task 必须描述一个可独立验证的行为增量，记录输入、输出、失败行为和 fresh verification。文件数量不作为 task 粒度标准；同一行为可以修改多个必要文件，但不得把无关行为合入同一 task。

超过 7 个 task 或跨越多个主要所有权边界时，必须先判断是否需要新增工作包并更新路线 artifacts。少于 3 个 task 时允许保留，但 design 必须说明该结果为何仍值得独立 lifecycle。

### 4. 上下文恢复以仓库事实为准

每次恢复执行必须重新读取 `openspec status`、apply instructions 返回的全部 context files、`git status`、当前 diff、task checkbox 和最近一次验证结果。聊天记录、模型记忆或 subagent 完成声明不能替代这些证据。

task 完成后立即更新当前 change 的 checkbox 和验证证据。发现 scope、spec、design 或 tasks 漂移时停止实施，先更新 artifacts 并重新获得用户确认。

### 5. SemVer 只标识可交付能力节点

`0.0.1`、`0.0.2`、`0.0.3` 分别对应上游锁定、可验证 SEA 和 Backend Preview；`0.1.0` 至 `1.0.0` 对应现有 App 成熟度节点。工作包编号负责执行顺序，SemVer 负责发布语义，两者不得混用。

### 6. UI TDD 基础设施先于用户可见 UI

A0.1 只初始化无可见产品功能的空工程；A0.2 随即建立 unit、Playwright、Midscene、fixture、reporter 和条件式 CI。HeroUI、tokens、主题与其他用户可见 UI 从 A0.3 开始，必须在 A0.2 提供的基础设施上取得真实 RED/GREEN。

被否决的先做 UI foundation 再补测试无法满足仓库的 Midscene UI TDD 硬门禁。

### 7. 核心能力与相邻工作包具有明确所有权

A2.1 负责工作区添加、删除、重命名、切换、最近列表和目录选择；A2.2 负责会话创建及按工作区组织。A1.6 负责服务端版本、连接状态、日志和诊断导出；A7.3 只负责 App 与 sidecar 的重启、崩溃和后台恢复，复用 A1.6 的诊断能力而不建立第二套导出。A2.3 只负责文本 Composer，完整附件生命周期属于 A3.4；输入历史属于 A3.5。A5.1 负责单次 turn 的 Thinking override，A6.3 负责持久化默认 Thinking 与其他默认运行参数。

## Risks / Trade-offs

- [54 个 change 增加流程成本] → 通过复用标准 artifact 模板和稳定验收命令降低成本；该成本换取可恢复性与审查边界。
- [未来上游协议导致工作包边界变化] → 先更新本 capability 和路线文档并重新确认，不让实施静默偏离目录。
- [工作包仍然过大] → 在对应 change 的 design 阶段按所有权边界继续拆分，并在实施前更新目录。
- [为了满足数量而产生空洞 change] → 工作包必须有独立产物和门禁；没有独立结果时合并到相邻工作包并通过路线更新确认。
- [版本号被理解为每项都发布] → spec 明确版本只在阶段末形成可交付节点。

## Migration Plan

1. 更新 `v1-development-roadmap` 主规格，新增工作包目录和执行约束。
2. 更新 `docs/v1-technical-roadmap.md`，将阶段表扩展为工作包表并标准化版本号。
3. 后续从 `B0.1 define-kimi-upstream-lock` 创建第一个实施 change。
4. 若拆分不适用，可回滚本次文档和 spec 变更；当前没有运行时代码或数据迁移。

## Open Questions

本 change 没有阻塞性开放问题。未来工作包内部的接口、文件和测试细节由各自 OpenSpec change 在实施前确认。
