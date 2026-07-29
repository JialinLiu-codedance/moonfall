## Why

当前 `superpowers-skill` capability 仍以单一 `.agents/skills/superpowers` 目录描述布局，但仓库实际采用按 skill 拆分的 `.agents/skills/<skill-name>` 目录，并通过根级软链接向 `.codex`、`.kimi-code` 和 `.grok` 暴露同一套内容。规格与实现不一致会阻塞后续校验，也会让贡献者误以为存在一个不存在的聚合目录。

## What Changes

- 修正 `superpowers-skill` capability，使 `.agents/skills/<skill-name>` 成为 skills 的 canonical source。
- 记录根级 `.codex`、`.kimi-code`、`.grok` 软链接到 `.agents` 的统一暴露方式。
- 明确拆分后的 skill 目录必须保持可发现、可解析且不产生重复副本。
- 增加对现有目录、软链接目标和固定 vendored skill 内容的验证要求。
- 本 change 不新增或删除 skill，不改变 skill 正文，不修改 OpenSpec skill 实现，也不引入运行时依赖。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `superpowers-skill`: 将目录布局、软链接和 skill 内容校验要求对齐当前实现。

## Impact

- 修改 `openspec/changes/align-superpowers-skill-layout/` 下的 proposal、delta spec、design 和 tasks，并在生命周期完成时同步 `openspec/specs/superpowers-skill/spec.md`。
- apply 阶段仅核对和必要时修正与 skills 布局相关的仓库文件；不影响 ToTheMoon 应用运行时、API 或依赖。
- 后续 CI、贡献者工具和 skill 加载路径以 `.agents/skills/<skill-name>` 及根级软链接为准。
