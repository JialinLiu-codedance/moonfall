## Context

Moonfall 当前只有项目定位、V1 技术路线、流程规范和品牌资产，尚未建立应用工程、后端构建脚本或可执行开发命令。已有路线确定只复用 Kimi Code 后端，使用 Tauri 2、React 和 HeroUI v3 完全重建前端，但现有 M0-M6 没有把官方 SEA 引入、后端协议验收、sidecar 打包和 App 产品能力拆成可独立授权与验收的阶段。

本 change 只把已经确认的完整迭代设计写入 `docs/v1-technical-roadmap.md` 和新 capability spec。后续 B0-B2 与 A0-A8 仍需各自创建 OpenSpec change，确认 artifacts 后才能实施。

## Goals / Non-Goals

**Goals:**

- 建立从固定 Kimi Code 上游 commit 到 Moonfall V1 发布的完整阶段依赖图。
- 让 B0-B2 在任何 App 业务开发前完成官方完整 SEA 的供应链、协议和能力验收。
- 明确 SEA 随 `.app` 打包、独立 `KIMI_CODE_HOME`、App 私有进程和 Apple Silicon 首发边界。
- 明确 Kimi Code 继续拥有认证与业务状态，Moonfall 只消费官方连接契约、REST snapshot 和 WebSocket event。
- 为每个阶段定义交付物、验证门禁、版本节点、非目标和最终完成定义。

**Non-Goals:**

- 不在本 change 中拉取 Kimi Code、构建 SEA 或初始化 Tauri/React 工程。
- 不 fork 或修改 Kimi Code，也不剔除官方 SEA 内置的 Kimi Web 静态资源。
- 不设计 Moonfall 自有 Token、Session、Task、Agent 或 Provider 状态生命周期。
- 不把 Intel、Windows、Linux、移动端、远程 Web、多账号调度、订阅转 API、跨会话记忆、内置浏览器或悬浮宠物纳入 V1。
- 不把后续所有实现合并到一个 OpenSpec change。

## Decisions

### 1. 使用“后端基座先行，App 纵向闭环推进”

路线分为 B0-B2 后端基座、A0-A1 桌面基础、A2-A6 产品闭环和 A7-A8 交付。B2 未通过前不开始 App 工程，A1 未证明 SEA 随 `.app` 独立运行前不开始 Agent 业务功能。

被否决的后端分层优先方案会在真实 App 消费之前铺设过多能力；被否决的 UI 外壳优先方案会让 fixture 长期偏离真实协议。当前方案保留后端完整引入的前置要求，并在此后用纵向闭环尽早暴露端到端问题。

### 2. 固定上游 commit 并构建官方完整 SEA

Moonfall 后续通过版本锁文件和脚本拉取指定 Kimi Code commit，完整复现上游 native build workflow：使用 `darwin-arm64` target 构建 Kimi Web、复制 Web assets、执行 `build:native:release`、运行 native smoke 并打包 artifact。B1 manifest 分别记录上游 target `darwin-arm64`、Mach-O 架构 `arm64` 和 Tauri staging triple `aarch64-apple-darwin`；进入 Tauri staging 时才将已验证二进制复制或重命名为 external binary 约定的文件名。Moonfall 不提交上游源码，也不维护剔除 Kimi Web 资源的 patch。

被否决的浮动分支无法复现发布；被否决的仅消费外部预构建 artifact 会削弱供应链控制；被否决的纯后端 patch 会让 Moonfall 承担持续的上游合并成本。

### 3. 后端完整性由构建、协议和能力三层证据定义

B2 必须保存 OpenAPI 与 AsyncAPI 基线，将 REST endpoint、WebSocket event 和全部后端能力域纳入矩阵，并为每项提供 contract test、smoke scenario 或明确限制。依赖真实账号或模型的场景单独标记 live verification，但不得静默跳过。

“后端完整”不表示 React 已实现全部界面，而表示所有官方能力已被识别、分类并建立后续消费与验证入口。

### 4. Kimi Code 是认证和业务状态的唯一事实来源

Kimi Code 继续负责 Token 生成、保存、校验与轮换，以及 Session、Transcript、Task、Agent、Provider 等业务状态和持久化。Tauri Host 只负责 sidecar 生命周期、健康检查和传递官方连接描述；React 只按官方协议消费 REST snapshot 与 WebSocket event，并维护临时 UI 状态。

被否决的 Moonfall Token store、刷新队列和复制业务状态机会制造双重事实来源。只有未来增加 Kimi Code 不具备的 Moonfall 自有能力时，才为新增能力单独设计认证或状态模型。

### 5. SEA 与 App 作为原子版本发布

V1 使用 Moonfall 独立 `KIMI_CODE_HOME` 和 App 私有 sidecar，不复用 `~/.kimi-code` 或外部 daemon。SEA 作为 Tauri external binary 随 App Bundle 打包，Moonfall version、Kimi Code commit、SEA SHA-256、OpenAPI、AsyncAPI 和能力矩阵版本保持映射。

被否决的共享目录或复用 daemon 会引入版本、Token 和并发冲突；被否决的 sidecar 独立自动更新会造成前后端协议错配。

### 6. 每个阶段使用独立 OpenSpec change

B0-B2 与 A0-A8 按依赖顺序分别执行 propose、人工确认、apply、测试、verify、strict validation、sync 和 archive。任何阶段未通过门禁时，不开始其依赖阶段。

用户可见 UI 从 A0 建立测试基础设施后，必须遵守项目的 Playwright 与 Midscene RED/GREEN 门禁；真实 `.app` 里程碑使用桌面验收。

## Risks / Trade-offs

- [上游 commit 构建环境变化] → 固定 Node、pnpm 和 lockfile，完整复现该 commit 的官方 native build workflow，并在 B1 建立全新目录重复构建验证。
- [官方 SEA 包含未使用的 Kimi Web 资源] → V1 接受体积代价以避免维护 fork，后续通过独立 change 评估体积和攻击面。
- [Tauri origin 无法安全直连官方 REST/WS] → B2 使用预期 production origin 的 HTTP/WS contract harness 提前验证，A1 再用真实 `.app` 复验；任一验证失败时暂停后续阶段并更新 artifacts，不预先引入 Rust proxy。
- [协议或数据格式随上游升级破坏兼容] → 每次升级重新执行 B0-B2、生成协议差异并运行全部回归。
- [V1 功能范围过大] → 将功能差异矩阵固定到 B0 的同一 Kimi Code commit；V1 范围内条目必须已支持或明确不适用，任何部分支持或延期必须通过用户确认的 OpenSpec scope exception，且不得覆盖路线列出的核心能力。
- [文档路线与实施漂移] → 每个后续 change 引用本 capability；发现阶段边界变化时先更新 artifacts 并重新确认。

## Migration Plan

1. 用本 change 更新 `docs/v1-technical-roadmap.md`，将原 M0-M6 替换为 B0-B2 与 A0-A8。
2. 同步 `v1-development-roadmap` delta spec 到主规格并归档本 change。
3. 后续从 B0 开始逐个创建独立实施 change，不在本 PR 中执行任何阶段。
4. 若路线文档更新有误，可回滚本次文档与 spec commit；当前没有运行时代码或用户数据迁移。

## Open Questions

本 change 没有阻塞性开放问题。每个阶段内部尚未实现的具体命令、接口细节和 UI 方案由对应 OpenSpec change 在实施前确认，且不得改变本路线的已确认职责边界。
