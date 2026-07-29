## MODIFIED Requirements

### Requirement: `superpowers` skill 使用统一来源
仓库 MUST 将受管 Superpowers skills 的真实内容按名称保存在 `.agents/skills/<skill-name>`，并且 MUST NOT 将其他位置的副本作为任一 skill 的事实来源。每个 skill 目录 MUST 包含其自己的 `SKILL.md`，目录名 MUST 与 skill 名称一致。

#### Scenario: 维护者更新单个 skill 内容
- **WHEN** 维护者修改某个 skill
- **THEN** 变更只需要落在对应的 `.agents/skills/<skill-name>` 目录
- **AND** 其他挂载位置不会保存独立副本

#### Scenario: 维护者发现 skill 目录
- **WHEN** skill loader 扫描 `.agents/skills`
- **THEN** 每个包含 `SKILL.md` 的子目录都能按目录名被独立发现

### Requirement: CLI 入口目录通过软链接暴露 `superpowers` skill
仓库 MUST 使用根级 `.codex`、`.kimi-code` 和 `.grok` 软链接暴露同一份 `.agents` 目录；这些链接的目标 MUST 是 `.agents`，且入口下的 skills MUST 解析到 `.agents/skills/<skill-name>`，不得复制 skill 内容。

#### Scenario: 检查根级 CLI 入口
- **WHEN** 维护者检查 `.codex`、`.kimi-code` 或 `.grok`
- **THEN** 该路径是指向 `.agents` 的软链接
- **AND** 通过该入口访问的任一 skill 与 `.agents/skills/<skill-name>` 内容一致

#### Scenario: 新增受管 skill
- **WHEN** 维护者在 `.agents/skills/<skill-name>` 增加一个受管 skill
- **THEN** 三个 CLI 入口都能通过统一软链接发现该 skill
- **AND** 仓库不需要为入口目录创建独立副本

### Requirement: `.codex` 下不放置 `superpowers`
仓库 MUST NOT 在 `.codex` 下创建 `superpowers` 的独立软链接或副本；`.codex` MUST 作为指向 `.agents` 的根级软链接存在，使 `.codex/skills/<skill-name>` 解析到 `.agents/skills/<skill-name>`。仓库 MUST 提供可重复的检查，验证拆分目录、软链接目标以及受管固定内容的完整性。

#### Scenario: 检查 `.codex` 目录
- **WHEN** 维护者查看 `.codex` 目录
- **THEN** `.codex` 是指向 `.agents` 的软链接
- **AND** 通过该入口可以发现按名称拆分的受管 skills

#### Scenario: 结构或内容发生漂移
- **WHEN** 任一 skill 目录缺失、软链接目标错误或固定内容哈希不匹配
- **THEN** 布局检查失败并指出不满足的路径或内容
