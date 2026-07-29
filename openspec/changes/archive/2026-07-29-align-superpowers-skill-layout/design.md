## Context

现有 `superpowers-skill` spec 描述的是单一 `.agents/skills/superpowers` 目录，但仓库已经按 skill 名称拆分为多个 `.agents/skills/<skill-name>` 目录，并使用 `.codex`、`.kimi-code`、`.grok` 三个根级软链接复用 `.agents`。本 change 的目标是让 spec 与已确认的实际布局一致，避免把目录重构误判为实现缺失。

## Goals / Non-Goals

**Goals:**

- 将按名称拆分的 `.agents/skills/<skill-name>` 定义为唯一来源。
- 将三个根级软链接和 skill discovery 规则写成可验证约束。
- 保留对固定 vendored skill 内容的完整性检查，覆盖路径与内容漂移。

**Non-Goals:**

- 不新增、删除或重写任何 skill 正文。
- 不修改 `.agents/skills/openspec-*` 或其他技能实现。
- 不把 `.codex`、`.kimi-code` 或 `.grok` 变成独立目录，也不引入新的 CLI 入口。

## Decisions

### 以按名称拆分目录替代聚合目录

采用 `.agents/skills/<skill-name>/SKILL.md` 作为 canonical source，因为当前 loader、目录结构和实际文件均按此组织。保留单一 `superpowers` 聚合目录会继续制造不存在的路径并掩盖真实 skill 边界。未采用“为兼容旧 spec 创建聚合软链接”，因为它会产生额外发现入口和重复语义。

### 使用根级软链接统一入口

保留 `.codex`、`.kimi-code`、`.grok` 指向 `.agents` 的软链接，让不同工具共享同一份目录树。未采用为每个工具复制 `.agents/skills`，因为复制会导致内容漂移和维护分叉。

### 用固定结构与哈希检查保护 vendored 内容

验证分为结构检查和内容检查：结构检查确认目录及链接目标，内容检查对固定 vendored 文件执行 SHA-256 校验。哈希记录只用于确认纳入仓库的固定内容，不扩大为所有未来 skill 的不可变清单。

## Risks / Trade-offs

- [风险] 旧工具仍寻找 `.agents/skills/superpowers` → [控制] 在验证中明确按名称扫描并检查所有入口；若发现外部工具兼容性问题，另建兼容性 change，不在本 change 偷加副本。
- [风险] vendored skill 更新后哈希检查失败 → [控制] 更新内容时同步更新验证记录，并通过新的 OpenSpec change 审查范围。
- [取舍] 根级软链接依赖文件系统支持 → [控制] 保持现有仓库约定，并在检查中显式报告链接类型和目标。

## Migration Plan

apply 阶段核对当前布局与固定内容；如发现规格之外的布局差异，先停止并更新 artifacts。验证通过后同步并归档。回滚时可在 sync 前删除本 change，sync 后只能通过新的 OpenSpec change 修正规格。

## Open Questions

暂无。未来是否支持额外 CLI 入口或兼容聚合目录，应在独立 change 中决定。
