## ADDED Requirements

### Requirement: `.agents` 作为 skill 的 canonical source
仓库 MUST 将项目 skill 的唯一事实来源放在 `.agents/skills/` 下，且 MUST NOT 通过复制文件在多个 CLI 入口目录维护 skill 副本。

#### Scenario: 查看 skill 真实位置
- **WHEN** 维护者检查仓库中的 skill 文件存放位置
- **THEN** skill 内容位于 `.agents/skills/` 下
- **AND** 各 CLI 入口通过软链接访问同一份内容，而不是独立副本

### Requirement: CLI 入口目录统一挂载到 `.agents`
仓库 MUST 为参与 skill discovery 的根级 CLI 入口目录提供指向 `.agents` 的软链接，当前至少包括 `.codex`、`.kimi-code` 与 `.grok`。

#### Scenario: 检查三个 CLI 入口
- **WHEN** 维护者查看仓库根目录下的 `.codex`、`.kimi-code` 与 `.grok`
- **THEN** 三者均为指向 `.agents` 的软链接
- **AND** 它们解析到的目标一致

#### Scenario: 通过 `.grok` 访问 skills
- **WHEN** 工具或维护者访问 `.grok/skills/`
- **THEN** 该路径解析到 `.agents/skills/`
- **AND** 可见内容与直接访问 `.agents/skills/` 一致

### Requirement: 新增 CLI 入口时复用同一挂载模式
当仓库新增需要 skill discovery 的根级 CLI 入口目录时，维护者 MUST 优先创建指向 `.agents` 的根级软链接，而不是为单个 skill 复制文件或建立分散挂载。

#### Scenario: 新增第四个 CLI 入口
- **WHEN** 维护者为新的 CLI 工具增加根级 skill 入口目录
- **THEN** 该入口通过指向 `.agents` 的软链接暴露 skill
- **AND** 不在新入口下复制 `.agents/skills` 中的 skill 内容
