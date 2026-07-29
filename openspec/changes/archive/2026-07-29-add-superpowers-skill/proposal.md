## Why

当前仓库已经把 `openspec` skill 作为可复用的 CLI 扩展能力进行管理，但还没有统一引入 `superpowers` skill 的路径与挂载方式。现在补上这套机制，可以让项目内的 AI/CLI 工具获得一致的 skill 发现入口，并避免后续在多个位置重复放置同一份内容。

## What Changes

- 在仓库内新增 `superpowers` skill 的 canonical source，统一放在 `.agents/skills/superpowers`。
- 为实际存在的 CLI 入口目录创建指向 `.agents/skills/superpowers` 的软链接，保持与 `openspec` 类似的使用方式。
- 明确不在 `.codex` 下创建 `superpowers` 的软链接或独立副本。
- 复用现有仓库约定，不新建并行的 skill 存放结构。
- **BREAKING**: 无。

## Capabilities

### New Capabilities
- `superpowers-skill`: 定义 `superpowers` skill 的仓库内存放、挂载与 CLI 发现约定，确保工具链可以通过统一入口访问该 skill。

### Modified Capabilities
- 无。

## Impact

- 受影响路径主要是 `.agents/skills/` 下的 skill 目录，以及仓库中实际存在的 CLI 入口目录。
- 需要创建和验证软链接，确保路径解析、调用方式与现有 `openspec` skill 一致。
- 不涉及应用业务逻辑、运行时 API 或外部依赖变更。
