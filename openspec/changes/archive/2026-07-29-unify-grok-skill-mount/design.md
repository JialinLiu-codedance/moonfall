## Context

仓库当前已有：

- `.agents/skills/`：skill 的 canonical source
- `.codex -> .agents`
- `.kimi-code -> .agents`

Grok Build 官方会扫描 `.agents/skills/` 与 `.grok/skills/`。功能上不加 `.grok` 也能发现 skill，但入口约定与 Codex / Kimi 不一致。维护者希望三种 CLI 使用同一挂载模式。

## Goals / Non-Goals

**Goals:**

- 新增 `.grok -> .agents` 软链接，与 `.codex`、`.kimi-code` 对齐。
- 保证 `.grok/skills/` 解析到 `.agents/skills/`，内容不复制、不漂移。
- 用规格固化 CLI skill 挂载约定，便于后续新增入口目录时复用。

**Non-Goals:**

- 不迁移或改写任何 skill 正文。
- 不引入 Grok 项目级 `config.toml`、plugins 或 workflows。
- 不调整用户级 `~/.grok/` 配置。
- 不改变 OpenSpec 流程或业务代码。

## Decisions

### 1. 使用根级整目录软链接，而不是只链 `skills`

与现有 `.codex` / `.kimi-code` 保持同一模式：

```text
.grok -> .agents
```

这样 `.grok/skills` 自然等于 `.agents/skills`，无需为每个 skill 单独建链。

**备选方案：** 仅创建 `.grok/skills -> ../.agents/skills`。
优点是 `.grok/` 下可独立放 config；缺点是与现有两个入口不一致，且当前仓库没有独立 Grok 配置需求。因此不采用。

### 2. Canonical source 继续是 `.agents/skills`

不把 skill 迁到 `.grok/skills`。Grok 文档推荐的 `.grok/skills` 在本仓库通过软链接获得，真实文件仍在 `.agents`。

**备选方案：** 把 skill 迁到 `.grok/skills`，再让 `.agents` 反链过去。会颠倒已有约定，牵动 Codex / Kimi 入口，成本更高，不采用。

### 3. 用文件系统验证，不依赖运行时探测

实施后用 `readlink` / `ls -la` 验证：

- `.grok` 指向 `.agents`
- `.grok/skills` 与 `.agents/skills` 为同一目录
- `.codex`、`.kimi-code` 仍保持原样

## Risks / Trade-offs

- [未来需要 `.grok/config.toml` 等独立文件] → 整目录软链接会把写入落到 `.agents/`。缓解：届时解除 `.grok` 整目录链接，改为只挂 `skills` 子路径；本 change 在 proposal 中已标注该取舍。
- [软链接目标写错] → 创建后立即用 `readlink` 校验；失败则删除错误链接重建。
- [部分工具不跟随软链接] → Grok 文档明确扫描 `.agents/skills/` 与 `.grok/skills/`；整目录链接是常见 POSIX 语义，风险低。
- [gitignore 误伤] → 当前 `.gitignore` 未忽略 `.grok`；提交时确认软链接被 git 正确记录为 symlink。

## Migration Plan

1. 确认仓库根尚不存在 `.grok` 实体目录或冲突文件。
2. 创建 `ln -s .agents .grok`。
3. 验证 `.grok`、`.codex`、`.kimi-code` 均指向 `.agents`。
4. 验证 `.grok/skills` 可见现有 skill（如 `openspec-propose`、`superpowers`）。
5. 回滚：删除 `.grok` 软链接即可，不影响 `.agents` 内容。

## Open Questions

- 无。挂载模式已与现有 Codex / Kimi 入口对齐，无需额外产品决策。
