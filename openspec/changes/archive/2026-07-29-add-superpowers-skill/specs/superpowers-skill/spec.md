## ADDED Requirements

### Requirement: `superpowers` skill 使用统一来源
仓库 MUST 将 `superpowers` skill 的真实内容保存在 `.agents/skills/superpowers`，并且 MUST NOT 将其他位置的副本作为该 skill 的事实来源。

#### Scenario: 维护者更新 skill 内容
- **WHEN** 维护者修改 `superpowers` skill
- **THEN** 变更只需要落在 `.agents/skills/superpowers`
- **AND** 其他挂载位置不会保存独立副本

### Requirement: CLI 入口目录通过软链接暴露 `superpowers` skill
对于仓库中实际存在且参与 skill discovery 的 CLI 入口目录，仓库 MUST 通过软链接暴露 `.agents/skills/superpowers`，且软链接目标 MUST 指向 canonical source。

#### Scenario: 新增一个 CLI 入口目录
- **WHEN** 仓库新增一个需要加载 skills 的 CLI 入口目录
- **THEN** 该目录可以通过软链接访问同一份 `superpowers` skill

#### Scenario: 检查现有 CLI 入口目录
- **WHEN** 维护者检查任一 CLI 入口目录中的 `superpowers` 挂载
- **THEN** 软链接目标与 `.agents/skills/superpowers` 一致
- **AND** 不会复制出另一份 skill 内容

### Requirement: `.codex` 下不放置 `superpowers`
仓库 MUST NOT 在 `.codex` 下创建 `superpowers` 的软链接或副本。

#### Scenario: 检查 `.codex` 目录
- **WHEN** 维护者查看 `.codex` 目录
- **THEN** 不会找到 `superpowers` 相关的软链接或独立副本
