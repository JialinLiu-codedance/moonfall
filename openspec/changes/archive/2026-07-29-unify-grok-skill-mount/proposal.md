## Why

仓库已通过 `.codex -> .agents` 与 `.kimi-code -> .agents` 统一了 Codex 与 Kimi Code 的 skill 发现入口，但 Grok Build 尚未建立对等挂载。虽然 Grok 原生会扫描 `.agents/skills/`，补上 `.grok` 软链接可以让三种 CLI 的入口约定一致，降低后续维护与文档说明成本。

## What Changes

- 在仓库根目录新增 `.grok -> .agents` 软链接，与现有 `.codex`、`.kimi-code` 保持同一挂载模式。
- 约定 skill 的唯一事实来源仍为 `.agents/skills/`；Grok 通过 `.grok/skills/` 解析到同一份内容。
- 不复制 skill 文件，不改动现有 `.agents/skills` 内容。
- 在约定中明确：后续新增 CLI 入口目录时，优先采用“指向 `.agents` 的根级软链接”而不是为每个 skill 单独建链。
- **BREAKING**: 无。若未来需要在 `.grok/` 下放置与 `.agents` 无关的独立文件，需先解除整目录软链接并改为更细粒度挂载。

## Capabilities

### New Capabilities
- `cli-skill-mount`: 定义仓库内 CLI skill 入口目录的统一挂载约定，覆盖 `.agents` 作为 canonical source，以及 `.codex`、`.kimi-code`、`.grok` 通过软链接暴露 skill 的方式。

### Modified Capabilities
- 无。

## Impact

- 受影响路径：仓库根目录新增 `.grok` 软链接；不修改业务代码、运行时 API 或产品功能。
- 开发者在 Grok Build 中可通过 `.grok/skills/` 与 `.agents/skills/` 访问同一 skill 集合。
- 需验证软链接解析正确，且不影响现有 `.codex` / `.kimi-code` 挂载。
- 与 `add-superpowers-skill` 等 change 兼容：它们继续把 skill 放在 `.agents/skills/`，本 change 只补 Grok 入口。
