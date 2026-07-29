## Why

现有 V1 技术路线已经确定 Kimi Code 后端复用与 Tauri 2、React、HeroUI v3 的前端重建方向，但当前 M0-M6 仍把后端供应链、sidecar 集成和产品能力混在较粗的阶段中，无法作为后续独立 OpenSpec change 的稳定依赖与验收边界。现在需要先固化从官方完整 SEA 引入到 Moonfall V1 发布的完整迭代路线，确保后端基座完整验收后再启动 App 业务开发，并避免 Moonfall 重复实现 Kimi Code 已有的认证和业务状态管理。

## What Changes

- 将 V1 开发路线重构为后端基座 B0-B2、桌面基础 A0-A1、产品闭环 A2-A6 和交付 A7-A8 四组依赖阶段。
- 明确固定 Kimi Code 上游 commit、通过脚本拉取并构建官方完整 Apple Silicon SEA、生成版本与校验清单、完成协议和能力矩阵验收的后端引入目标。
- 明确官方完整 SEA 作为 Tauri external binary 随 App 打包，使用 Moonfall 独立 `KIMI_CODE_HOME`，并由 App 管理私有 sidecar 生命周期。
- 明确 Kimi Code 继续负责 Token、Session、Task、Agent、Provider 等认证与业务状态，Moonfall 只消费官方 REST、WebSocket 和连接契约。
- 为每个阶段定义建议的 OpenSpec change、主要交付物、依赖门禁、测试层级和版本节点。
- 明确 V1 非目标、Kimi Code 升级流程、故障恢复边界和最终完成定义。
- 本 change 只更新路线文档和对应规格，不拉取 Kimi Code、不构建 SEA、不初始化 Tauri/React 工程，也不实施任何产品能力。

## Capabilities

### New Capabilities

- `v1-development-roadmap`: 定义 Moonfall 从固定 Kimi Code 上游、构建和验收官方完整 SEA，到完成 Apple Silicon V1 App 的阶段顺序、职责边界、门禁和完成标准。

### Modified Capabilities

无。

## Impact

- 更新 `docs/v1-technical-roadmap.md` 中的待确认事项、迭代计划、测试策略、风险控制和 V1 完成定义。
- 新增 `openspec/specs/v1-development-roadmap/spec.md` 作为后续各实施 change 的路线约束。
- 后续 B0-B2 与 A0-A8 change 必须按依赖顺序分别执行完整 OpenSpec 生命周期。
- 不影响当前运行时代码、API、构建产物或依赖；仓库在本 change 完成后仍处于规划和工程初始化阶段。
