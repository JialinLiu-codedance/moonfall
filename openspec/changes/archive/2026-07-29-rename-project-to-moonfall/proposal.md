## Why

项目已经正式从 `ToTheMoon` 更名为 `Moonfall`，但当前有效文档与 main specs 仍残留旧名称，未来应用初始化也缺少统一的技术标识约束。需要立即建立唯一项目身份，避免产品名称、应用标识和运行目录继续分叉。

## What Changes

- 将当前有效的项目说明、技术路线和 main specs 中的项目名称统一为 `Moonfall`。
- 新增项目身份约束，要求未来 Moonfall 自有的产品名称、package、crate、binary、Bundle、应用数据目录、日志目录和发布产物使用 `Moonfall` 或 `moonfall` 命名，不得继续引入 `ToTheMoon` 标识。
- 保持 Kimi Code 上游 package 与协议标识不变，避免破坏持续同步边界。
- 保留归档 OpenSpec change 中的历史名称，不改写已经完成的历史记录。
- 不修改本地仓库目录或 GitHub 远端仓库名称；这些外部资源需要另行授权和迁移。

## Capabilities

### New Capabilities

- `project-identity`: 定义 Moonfall 的正式产品名称、代码标识、运行目录命名及旧名称禁用边界。

### Modified Capabilities

- `project-readme`: 将 README 中的正式项目名称从 `ToTheMoon` 修改为 `Moonfall`。

## Impact

- 修改 `README.md`、`docs/v1-technical-roadmap.md` 与当前 main specs 中残留的项目名称。
- 为后续 Tauri、React、Rust、构建和发布配置增加统一命名约束。
- 不修改运行时代码、依赖、后端协议、Kimi Code 上游标识、归档 change、GitHub 远端或本地仓库目录。
