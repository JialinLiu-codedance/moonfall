## Purpose

定义 Moonfall 从固定 Kimi Code 上游、构建和验收官方完整 SEA，到完成 Apple Silicon V1 App 的阶段顺序、职责边界、门禁和完成标准，使后续 OpenSpec change 能够按稳定依赖独立实施和验收。

## Requirements

### Requirement: V1 按依赖阶段推进
V1 路线 MUST 依次定义 B0-B2 后端基座、A0-A1 桌面基础、A2-A6 产品闭环和 A7-A8 交付阶段，并 MUST 阻止未通过门禁阶段的依赖工作开始。

#### Scenario: 后端基座尚未完成
- **WHEN** B2 的协议和能力验收尚未通过
- **THEN** 项目不得开始 A0 App 工程初始化

#### Scenario: sidecar 尚未随 App 独立运行
- **WHEN** A1 尚未证明 SEA 随 `.app` 在无 Node.js 环境运行
- **THEN** 项目不得开始 A2 Agent 业务功能

### Requirement: 固定上游并构建官方完整 SEA
后端基座 MUST 固定 Kimi Code 上游完整 commit，通过脚本使用上游 `darwin-arm64` target 构建官方完整 SEA，并 MUST 记录 Kimi Code version、工具链、上游 target、Mach-O 架构、Tauri staging triple 和 SHA-256。

#### Scenario: 构建指定后端版本
- **WHEN** 开发者执行后端构建流程
- **THEN** 流程只使用已记录的 commit 和固定工具链生成可校验的 `darwin-arm64` SEA

#### Scenario: 上游 checkout 不匹配
- **WHEN** 拉取结果、工作树或最终 commit 与锁定配置不一致
- **THEN** 构建流程明确失败且不得产出可发布 artifact

#### Scenario: 完整复现官方 native build workflow
- **WHEN** B1 构建官方完整 SEA
- **THEN** 流程依次构建 Kimi Web、复制 Web assets、执行 `build:native:release`、运行 native smoke 并打包 artifact

#### Scenario: 进入 Tauri external binary staging
- **WHEN** 已验证的官方 SEA 进入 Tauri staging
- **THEN** 流程确认 Mach-O 架构为 `arm64`，并按 `aarch64-apple-darwin` external binary triple 复制或重命名文件

### Requirement: 后端完整性具有三层证据
后端验收 MUST 覆盖构建完整性、REST 与 WebSocket 协议完整性以及全部后端能力域，并 MUST 为每个 endpoint、event 和能力域记录测试入口或明确限制。

#### Scenario: 生成后端能力基线
- **WHEN** B2 完成验收
- **THEN** OpenAPI、AsyncAPI 和能力矩阵能够追溯到同一 Kimi Code commit 与 SEA artifact

#### Scenario: live verification 不可用
- **WHEN** 某项能力依赖真实账号、模型或外部服务且当前无法验证
- **THEN** 能力矩阵明确标记阻塞原因且不得将该场景记录为通过

### Requirement: Kimi Code 拥有认证与业务状态
Moonfall MUST 将 Kimi Code 视为 Token、Session、Transcript、Task、Agent、Provider 等认证和业务状态的唯一事实来源，并 MUST NOT 重复实现其生命周期。

#### Scenario: Moonfall 建立后端连接
- **WHEN** Tauri Host 启动 SEA 且 React 客户端初始化
- **THEN** Moonfall 只传递并消费 Kimi Code 官方连接契约，不创建自有 Token store 或刷新状态机

#### Scenario: React 展示实时状态
- **WHEN** React 接收 REST snapshot 或 WebSocket event
- **THEN** React 只维护展示所需的临时 UI 状态，不建立独立的后端业务事实来源

### Requirement: SEA 与 App 原子分发
V1 MUST 将官方 SEA 作为 Tauri external binary 随 Moonfall.app 分发，使用 Moonfall 独立 `KIMI_CODE_HOME` 和 App 私有 sidecar，并 MUST NOT 让 sidecar 独立于 App 更新。

#### Scenario: 干净 Apple Silicon Mac 启动 App
- **WHEN** 用户在未安装 Node.js、pnpm、Kimi CLI 或外部 daemon 的目标 Mac 启动 Moonfall
- **THEN** App 从自身 Bundle 启动匹配版本的 SEA 并使用独立数据目录

#### Scenario: 发布 Moonfall 新版本
- **WHEN** 发布流程生成新的 App artifact
- **THEN** Moonfall version、Kimi Code commit、SEA SHA-256 和协议基线保持可追溯映射

### Requirement: 每个阶段独立执行 OpenSpec 生命周期
B0-B2 与 A0-A8 的实施 MUST 分别创建 OpenSpec change，并 MUST 在完成 verify、strict validation、sync 和 archive 后才视为阶段完成。

#### Scenario: 启动下一阶段
- **WHEN** 团队准备实施某个依赖阶段
- **THEN** 其所有前置 change 已完成任务、验证、规格同步和归档

### Requirement: 路线定义 V1 发布边界
路线 MUST 定义 Backend Preview、`0.1`、`0.2`、`0.3`、`0.4`、`0.5`、`0.9` 和 `1.0` 能力节点，并 MUST 明确 V1 非目标与最终完成标准。A8 功能差异矩阵 MUST 固定到 B0 的同一 Kimi Code commit，V1 范围内条目 MUST 为已支持或明确不适用。

#### Scenario: 判断 V1 是否完成
- **WHEN** 项目评估 `1.0` 发布准备度
- **THEN** 后端基座、App 功能、故障恢复、视觉验收、功能差异矩阵、签名、公证和干净机器安装均满足路线门禁

#### Scenario: 功能条目部分支持或延期
- **WHEN** V1 范围内条目仍为部分支持或需要延期
- **THEN** 项目必须通过用户确认的 OpenSpec scope exception 记录原因和影响，且该 exception 不得覆盖路线列出的核心能力

#### Scenario: 评估后续产品创意
- **WHEN** `docs/idea.md` 中的扩展想法尚未通过独立 change 纳入范围
- **THEN** 这些想法不进入 V1 完成门禁
