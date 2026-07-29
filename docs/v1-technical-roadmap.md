# Moonfall V1 技术路线

> 状态：Draft  
> 日期：2026-07-29
> 目标版本：V1（macOS）

## 1. 项目目标

Moonfall 是一个基于 Kimi Code 后端能力构建的 macOS Agent 工作台。V1 的目标不是给现有 Kimi Web 增加桌面外壳，而是在保留 Kimi Code 后端的前提下，使用 Tauri、React 和 HeroUI 完全重建前端，并达到现有 Kimi Web 的功能覆盖范围。

V1 重点解决以下问题：

- 用户无需安装 Node.js、pnpm 或 Kimi CLI，即可安装并运行 Moonfall。
- App 能可靠启动、连接和管理本地 Kimi Code 服务。
- 具备完整的 Agent 对话、工具调用、任务控制和开发者工作区能力。
- 建立独立、可维护的 React 前端架构，为后续产品与视觉迭代提供基础。
- 保持清晰的前后端协议边界，避免将 Agent 业务逻辑重复实现到 Rust 或 React 中。

## 2. 已确认决策

### 2.1 技术栈

- 桌面框架：Tauri 2
- 前端框架：React + TypeScript + Vite
- UI 组件库：HeroUI v3
- 样式基础：Tailwind CSS v4 + CSS Variables
- 后端运行时：Kimi Code SEA 可执行文件
- 后端协议：kap-server 的 REST + WebSocket API
- 首发平台：macOS，Apple Silicon only

HeroUI 必须使用 v3 API：

- 使用 `@heroui/react` 与 `@heroui/styles`。
- 不引入旧版 `HeroUIProvider`。
- 使用 compound components。
- 交互事件优先使用 React Aria/HeroUI 的 `onPress`。
- Tailwind CSS 固定使用 v4，不兼容 v3 配置方式。

### 2.2 前端重建边界

Moonfall 不复用 Kimi Web 的以下实现：

- Vue 组件
- composables
- Vue 响应式状态
- 页面结构代码
- 前端 API adapter 实现
- 现有 UI primitive 实现

允许将 Kimi Web 作为以下内容的参考：

- V1 功能清单
- REST/WebSocket 行为参考
- 流式事件和异常场景参考
- 第一版布局、密度、颜色和交互参考
- 功能验收对照基线

### 2.3 第一版设计策略

V1 在视觉上与现有 Kimi Web 保持一致，降低同时重构技术架构与产品设计带来的风险。视觉一致不等于复制前端代码，而是将现有设计语言重新表达为 Moonfall 的设计 Token 和 React 组件。

V1 保留的主要视觉特征：

- `#1783ff` 品牌主色
- 浅色和深色主题
- Inter UI 字体与 JetBrains Mono 代码字体
- 紧凑、面向开发者的界面密度
- 工作区和会话侧栏
- 中央 Agent 时间线与底部输入区
- 工具调用、审批、问题、任务和 diff 的语义状态色
- 克制的阴影、圆角和动效

后续版本可在不改变后端协议的情况下逐步调整信息架构、视觉品牌和交互模型。

### 2.4 后端引入与运行边界

- Moonfall 记录 Kimi Code 上游仓库、完整 commit SHA、Kimi Code version、Node/pnpm 工具链和上游构建 target，禁止构建时跟随浮动分支。
- Moonfall 通过脚本拉取指定 commit，并使用上游 `darwin-arm64` target 和官方 native release workflow 生成完整 SEA。
- V1 接受官方 SEA 中内置但不使用的 Kimi Web 静态资源，不维护剔除前端资源的上游 patch 或 fork。
- SEA 作为 Tauri external binary 随 App Bundle 打包，用户不需要安装 Node.js、pnpm、Kimi CLI 或外部 daemon。
- V1 使用 Moonfall 独立 `KIMI_CODE_HOME` 和 App 私有 sidecar，不复用 `~/.kimi-code` 或已运行的 Kimi daemon。
- Moonfall App 与 SEA 作为一个原子版本发布，sidecar 不独立自动更新。

## 3. 总体架构

```text
┌─────────────────────────────────────────────────────────────┐
│                       Moonfall.app                         │
│                                                             │
│  ┌──────────────────── React WebView ────────────────────┐  │
│  │ App Shell                                             │  │
│  │ Workspaces / Sessions / Conversation / Tasks          │  │
│  │ Files / Changes / Terminal / Models / Settings        │  │
│  │                                                       │  │
│  │ Kimi REST Client       Kimi WebSocket Client          │  │
│  │ Tauri Native Adapter   Frontend State                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                 │ HTTP/WS               │ invoke             │
│  ┌──────────────▼────────────────────────▼────────────────┐  │
│  │ Tauri Rust Host                                       │  │
│  │ Window / Sidecar / Health / Logs / Native APIs        │  │
│  └───────────────────────┬───────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────┘
                           │ child process
                 ┌─────────▼──────────┐
                 │ Kimi Code SEA      │
                 │ kap-server         │
                 │ agent-core-v2      │
                 └────────────────────┘
```

### 3.1 React 前端职责

- 呈现全部用户界面。
- 管理临时 UI 状态和可丢弃的服务端状态缓存。
- 通过 REST 完成查询和命令操作。
- 通过 WebSocket 接收增量事件，并在连接中断或事件缺口时重新获取 REST snapshot。
- 将原生能力请求发送给 Tauri Rust Host。
- 按 Kimi Code 官方连接契约携带认证信息，不实现 Token 生命周期。
- 不直接创建或管理 Agent Core 实例。
- 不把 Session、Transcript、Task、Agent 或 Provider 等状态复制为第二套业务事实来源。

### 3.2 Tauri Rust Host 职责

- 启动并监管 Kimi Code SEA sidecar。
- 解析服务实例地址并完成健康检查。
- 处理启动超时、异常退出、重启和退出清理。
- 管理窗口、菜单、快捷键和窗口状态。
- 提供目录选择、文件保存、Finder 显示和外部应用打开能力。
- 提供 macOS 通知和后续 App 自动更新能力。
- 将运行日志写入可诊断、可导出的位置。

Rust Host 不承担以下职责：

- Agent 推理与编排
- 会话和 Transcript 业务逻辑
- Tool、Skill、MCP 实现
- 模型 Provider 管理逻辑
- Token 生成、保存、校验或轮换逻辑

### 3.3 Kimi Code 后端职责

- Token 生成、保存、校验与轮换，以及 REST/WebSocket 鉴权规则。
- Agent、Session、Task 和 Transcript 生命周期。
- 模型、Provider 与 OAuth。
- Tool、Skill、MCP 和权限控制。
- 文件系统、Git、终端与附件服务。
- Plan、Goal、Swarm、子 Agent 和 BTW 等 Agent 能力。
- 会话、配置、日志和运行数据持久化。

## 4. 后端集成方案

### 4.1 构建与分发

Moonfall 不提交 Kimi Code 源码，也不要求用户安装 Kimi Code。后端构建流程从版本锁文件读取上游仓库、完整 commit、工具链和上游 target，拉取并校验 checkout 后完整复现该 commit 的官方 native build workflow：

1. 在 `darwin-arm64` target 的 workflow job 中构建 Kimi Web。
2. 执行 `apps/kimi-code/scripts/copy-web-assets.mjs`，将 Web assets 放入 SEA 构建输入。
3. 执行 `build:native:release`，生成官方 release profile SEA。
4. 执行 `test:native:smoke`，验证 native executable 可运行。
5. 执行 `package:native`，生成带 checksum 的上游 artifact。

以上步骤必须依次成功，不得跳过 Kimi Web 构建、Web assets 复制、native smoke 或 artifact packaging。`darwin-arm64` 是 Kimi Code 上游 native target；产物的 Mach-O 架构必须为 `arm64`；`aarch64-apple-darwin` 只用于 Tauri external binary staging 的平台 triple。进入 staging 时，脚本才按 Tauri 约定复制或重命名已验证的 SEA。

构建产物必须记录：

- Moonfall version
- Kimi Code commit 与 version
- Node 与 pnpm version
- 上游 target `darwin-arm64`
- Mach-O 架构 `arm64`
- Tauri staging triple `aarch64-apple-darwin`
- SEA SHA-256
- OpenAPI、AsyncAPI 和能力矩阵版本

构建流程必须在上游身份、commit、工作树或 lockfile 不匹配时明确失败。构建缓存、上游源码 checkout 和 SEA artifact 不进入 Git。经 smoke test 的 SEA 进入 Tauri external binary staging，最终随 App Bundle 一起签名、分发和回滚。

### 4.2 启动流程

1. Tauri 创建主窗口并显示本地启动状态页。
2. Rust Host 确定应用数据目录、日志目录和 sidecar 路径。
3. 启动 Kimi Code SEA。
4. 读取实际监听地址并轮询 `/api/v1/healthz`。
5. 按 Kimi Code 官方机制获取 endpoint 与 opaque credential 组成的连接描述。
6. 通过受控初始化通道将连接描述交给前端，前端按官方协议初始化 REST 客户端并建立 WebSocket 连接。
7. 获取 meta、auth、config、workspace 和 session 初始状态。
8. 进入 Agent 工作台。

启动失败时必须展示：

- 明确的失败阶段
- 可理解的错误信息
- 重试入口
- 打开日志入口
- 导出诊断信息入口

### 4.3 安全边界

- 服务仅绑定 loopback，不监听局域网地址。
- 保留 bearer token 鉴权，不使用 `--dangerous-bypass-auth`。
- 只允许 Tauri 应用的本地 origin 访问 REST 和 WebSocket。
- Token 不写入 URL 查询参数，不输出到普通日志。
- Token 的生成、保存、校验与轮换全部由 Kimi Code 处理，Moonfall 不建立 Token store 或刷新状态机。
- 原生命令采用最小 Tauri capability，不为前端开放通用 Shell 执行。
- 外部 URL、文件路径和应用启动请求必须经过校验。
- Provider 凭据由 Kimi Code 保存在 Moonfall 独立 `KIMI_CODE_HOME`；Moonfall 不复制凭据到前端持久化或普通日志。

## 5. 前端架构

### 5.1 推荐目录

```text
src/
├── app/                    # 启动、路由、主题、全局错误、快捷键
├── features/
│   ├── workspaces/
│   ├── sessions/
│   ├── conversation/
│   ├── interactions/      # Approval / Question
│   ├── agents/            # Plan / Goal / Task / Swarm / BTW
│   ├── changes/           # Files / Git / Diff
│   ├── terminal/
│   ├── models/
│   ├── skills/
│   └── settings/
├── services/
│   ├── kimi-api/          # REST client、鉴权、协议类型
│   ├── kimi-events/       # WebSocket、重连、事件归并
│   └── native/            # Tauri command adapter
├── stores/                # 实时会话与 UI 状态
├── queries/               # REST 查询和缓存
├── components/
│   ├── ui/                # HeroUI 封装与通用 primitive
│   └── domain/            # Message、ToolCall、Task、Diff 等
├── styles/
│   ├── tokens.css
│   ├── theme.css
│   └── globals.css
└── test/
```

### 5.2 状态分层

- TanStack Query：工作区、会话列表、模型、Provider、配置等可重新获取的服务端查询缓存。
- Zustand：当前选择、流式展示、待处理交互和其他临时 UI 状态。
- 组件局部状态：输入框、Popover、Dialog、选中项和临时表单。
- Tauri 状态：sidecar 生命周期、窗口状态、系统权限和更新状态。

Kimi Code 是 Token、Session、Transcript、Task、Agent、Provider 等认证与业务状态的唯一事实来源。前端缓存可以丢弃和重建；WebSocket 增量更新必须能够在断线、事件缺口或版本不匹配时回退到 REST snapshot，而不是长期依赖不完整的本地推演。

### 5.3 API 客户端

REST 和 WebSocket 分开实现：

- REST 类型优先从 kap-server OpenAPI 生成。
- 在生成层之上增加轻量、稳定的领域 facade。
- WebSocket 使用独立的协议模块，负责连接、订阅、心跳、游标、重连和 resync，但不实现 Kimi Code 的认证或业务状态生命周期。
- React 组件不得直接拼接 URL 或处理 wire snake_case 数据。
- 所有错误统一映射为前端可识别的错误类型。

### 5.4 UI 组件策略

HeroUI 负责通用交互基础：

- Button、IconButton
- Dialog、Sheet
- Menu、Tabs、Tooltip
- Input、Textarea、Select、Checkbox、Switch
- Badge、Spinner、Skeleton

Moonfall 自己实现领域组件：

- Conversation Timeline
- User/Assistant Message
- Thinking Block
- Tool Call 与 Tool Result
- Approval 与 Question
- Plan、Goal、Task、Swarm
- File Preview、Git Changes、Diff
- Terminal Panel

领域组件可以组合 HeroUI primitive，但不应为了使用组件库而把所有区域设计成 Card。

## 6. V1 功能范围

### 6.1 工作区与会话

- 添加、删除、重命名和切换工作区
- 目录选择与最近工作区
- 新建、打开、搜索和分页加载会话
- 会话重命名、归档、恢复、分叉和导出
- 按工作区组织会话
- 保存未发送草稿和输入历史

### 6.2 Agent 对话

- 文本输入与流式输出
- Markdown、代码高亮、表格、Mermaid 和 KaTeX
- Thinking 展示
- Tool call 输入、进度、输出与错误
- 图片、视频和文件附件
- 消息排队、调整顺序和 steer
- 打断、撤销和上下文压缩
- 断线重连、缺口检测和 snapshot 恢复

### 6.3 Agent 控制

- Manual、Auto、Yolo 权限模式
- Approval 和 Question
- Thinking level
- Plan mode
- Goal 创建、暂停、恢复和取消
- Task 查看与取消
- Swarm 和子 Agent 状态
- BTW 侧聊
- Skills 列表与调用

### 6.4 开发者工作区

- 文件树、搜索和文件预览
- Git 分支、状态和增删统计
- 文件 diff 与 Tool diff
- 在编辑器中打开文件
- 在 Finder 中显示文件
- 交互式终端

### 6.5 模型与设置

- OAuth 登录和退出
- 模型选择与收藏
- Provider 添加、刷新和删除
- 默认模型和运行参数
- 浅色、深色和系统主题
- 字体大小、通知和声音
- 服务端版本、连接状态和诊断信息

## 7. 迭代计划

V1 采用“后端基座先行，App 纵向闭环推进”。阶段依赖固定为：

```text
B0 上游锁定
  → B1 SEA 可重复构建
  → B2 后端协议与能力验收
  → A0 Tauri + React 工程初始化
  → A1 SEA sidecar 打包与生命周期
  → A2 最小 Agent 闭环
  → A3 完整会话与实时交互
  → A4 开发者工作区
  → A5 高级 Agent 能力
  → A6 模型、账号与配置
  → A7 桌面产品化
  → A8 V1 对齐与正式发布
```

B2 未通过前不得开始 A0；A1 未证明 SEA 随 `.app` 在无 Node.js 环境独立运行前不得开始 A2。每个阶段必须使用独立 OpenSpec change，并在完成 verify、strict validation、sync 和 archive 后才视为完成。

### B0：上游锁定

- 建议 change：`pin-kimi-code-upstream`
- 目标：建立可审计、可复现的 Kimi Code 来源边界。
- 交付物：上游仓库与完整 commit 配置、工具链约束、拉取和 checkout 校验脚本、缓存策略、升级说明。
- 完成门禁：脚本只能得到指定 commit；上游身份、工作树、commit 或 lockfile 不匹配时明确失败。

### B1：SEA 可重复构建

- 建议 change：`build-kimi-code-sea`
- 目标：从 B0 锁定来源生成官方完整 Apple Silicon SEA。
- 交付物：固定 Node/pnpm 环境、完整官方 native workflow 脚本、`darwin-arm64` SEA、SHA-256、版本清单、构建日志、native smoke 结果和 packaged artifact。
- 完成门禁：全新目录可以依次完成 Kimi Web 构建、Web assets 复制、`build:native:release`、native smoke 和 artifact packaging；manifest 中的 commit、version、上游 target `darwin-arm64`、Mach-O 架构 `arm64`、Tauri staging triple `aarch64-apple-darwin` 和 SHA-256 可追溯。

### B2：后端协议与能力验收

- 建议 change：`qualify-kimi-backend`
- 目标：在 App 工程开始前完成官方后端能力基线。
- 交付物：OpenAPI/AsyncAPI snapshot、typed client 生成输入、REST endpoint 与 WebSocket event 清单、能力矩阵、contract/smoke harness、预期 Tauri production origin 验证。
- 完成门禁：全部 endpoint、event 和能力域都有测试入口或明确限制；依赖真实账号或模型的 live verification 不得静默跳过。

“后端完整”由三层证据组成：

1. 构建完整性：官方完整 SEA、原生依赖和运行资源进入可校验产物。
2. 协议完整性：REST endpoint 与 WebSocket event 全部分类并追溯到同一 commit。
3. 能力完整性：Session、Transcript、Agent、Tool、Skill、Task、Goal、Swarm、文件、Git、Terminal、模型、Provider、OAuth、配置和日志等能力域均有 contract test、smoke scenario 或明确限制。

“后端完整”不表示 React 已实现全部界面，而表示所有官方能力已被识别、分类并建立后续消费与验证入口。

### A0：Tauri + React 工程初始化

- 建议 change：`initialize-moonfall-app`
- 目标：建立可持续开发和验证的空 App 工程。
- 交付物：Tauri 2、React、TypeScript、Vite、HeroUI v3、Tailwind CSS v4、lint、typecheck、unit、Playwright、Midscene 和条件式 CI。
- 完成门禁：空 App 可启动；基础检查全绿；UI 测试基础设施能够产生有效 RED/GREEN。

### A1：SEA sidecar 打包与生命周期

- 建议 change：`integrate-kimi-sidecar`
- 目标：将 B1 产物作为 external binary 随 `.app` 分发并建立可靠生命周期。
- 交付物：Tauri external binary 配置、独立 `KIMI_CODE_HOME`、启动和健康状态、官方连接描述传递、有限重启、日志、退出清理和诊断 UI。
- 完成门禁：App Bundle 包含匹配 SEA；真实 `.app` 在无 Node.js 环境启动；异常退出、重试和正常退出清理通过。

### A2：最小 Agent 闭环

- 建议 change：`deliver-minimal-agent-loop`
- 目标：首次证明完整端到端技术路线。
- 交付物：工作区选择、会话创建、Composer、流式文本、停止生成和基础错误状态。
- 完成门禁：用户可以从启动 App 到完成一次真实 Agent turn，无需返回 CLI 或 Kimi Web。

### A3：完整会话与实时交互

- 建议 change：`complete-conversation-workflow`
- 目标：覆盖日常 Agent 对话与服务恢复场景。
- 交付物：会话管理、Transcript、Thinking、Tool call/result、Approval、Question、附件、队列、steer、undo、compact、WebSocket 重连、事件缺口检测和 REST snapshot 恢复。
- 完成门禁：常规 Agent 会话不需要返回 CLI 或 Kimi Web；断线和事件缺口可以恢复到 Kimi Code 权威状态。

### A4：开发者工作区

- 建议 change：`add-developer-workspace`
- 目标：让用户在 Moonfall 内检查 Agent 的代码与命令结果。
- 交付物：文件树、搜索、预览、Git 状态、diff、Terminal、编辑器打开和 Finder 集成。
- 完成门禁：Agent 产生的主要文件修改和命令结果均可在 App 内检查。

### A5：高级 Agent 能力

- 建议 change：`add-advanced-agent-controls`
- 目标：消费 Kimi Code 暴露的高级 Agent 控制能力。
- 交付物：Plan、Goal、Task、Swarm、子 Agent、BTW、Skills 和权限模式。
- 完成门禁：高级任务可观察、可交互、可取消、可恢复，且 Kimi Code 仍是业务状态唯一事实来源。

### A6：模型、账号与配置

- 建议 change：`add-model-and-account-settings`
- 目标：完成模型访问与用户偏好闭环。
- 交付物：OAuth、Provider、模型选择、Thinking level、默认参数、主题、通知、声音和诊断设置。
- 完成门禁：首次登录到模型调用完整通过；凭据不进入前端持久化、URL 或普通日志。

### A7：桌面产品化

- 建议 change：`productize-moonfall-desktop`
- 目标：将功能完整 App 提升到发布候选质量。
- 交付物：首次启动、空状态、窗口与菜单、快捷键、通知、崩溃恢复、长会话性能和诊断导出。
- 完成门禁：长会话、App 重启、后台恢复、sidecar 异常和最低窗口尺寸通过验收。

### A8：V1 对齐与正式发布

- 建议 change：`release-moonfall-v1`
- 目标：完成可追溯、可安装的 Apple Silicon V1。
- 交付物：固定到 B0 同一 Kimi Code commit 的 Kimi Web 功能差异矩阵、签名、公证、安装包、版本映射和发布验收报告。
- 完成门禁：干净 Apple Silicon Mac 可以安装并完成核心场景；V1 范围内全部差异只能标记为已支持或明确不适用。部分支持或延期不是 V1 完成状态，必须先通过用户确认的 OpenSpec scope exception 调整范围，且不得移除核心能力。

### 7.1 版本节点

版本节点表示能力成熟度，不预设日历日期：

| 版本节点 | 包含阶段 | 可交付结果 |
| --- | --- | --- |
| Backend Preview | B0-B2 | 固定、构建并完整验证官方 SEA，尚无 App |
| `0.1 Desktop Foundation` | A0-A1 | SEA 随 `.app` 打包，生命周期和诊断可用 |
| `0.2 Agent Alpha` | A2 | 可以选择项目并完成真实 Agent turn |
| `0.3 Conversation Alpha` | A3 | 日常对话、Tool、Approval、Question 和恢复可用 |
| `0.4 Developer Preview` | A4 | 文件、Git、diff 和 Terminal 形成开发工作台 |
| `0.5 Agent Beta` | A5-A6 | 高级 Agent、模型、OAuth、Provider 和设置完成 |
| `0.9 Release Candidate` | A7 | 桌面体验、恢复、性能和诊断达到发布候选标准 |
| `1.0` | A8 | 功能差异收敛，完成签名、公证和干净机器验收 |

## 8. 测试与验证

### 8.1 统一验证层级

```text
静态检查
  → 单元测试
  → REST/WS contract test
  → SEA 集成与能力 smoke test
  → Playwright 确定性 E2E
  → Midscene 语义 UI 验收
  → 真实 .app 桌面验收
  → 干净机器发布验收
```

每个 task 只有在相关 fresh verification 通过后才能勾选。依赖模型、账号、签名凭据或外部服务的检查必须明确记录为通过、失败或因缺少前置条件而阻塞，不得把 `skipped` 当作通过。

### 8.2 后端基座验证

- 拉取脚本校验 remote、完整 commit、工作树和 lockfile。
- 构建脚本校验固定工具链、完整官方 native workflow、SEA 可执行性、version、上游 target `darwin-arm64`、Mach-O 架构 `arm64`、Tauri staging triple `aarch64-apple-darwin` 和 SHA-256。
- 保存 `/openapi.json` 与 `/asyncapi.json`，并检查 endpoint/event 与能力矩阵集合完整性。
- 使用独立临时 `KIMI_CODE_HOME` 验证 loopback、官方鉴权、健康检查和主要能力域。
- 使用预期 Tauri production origin 的 HTTP/WS contract harness 验证 CORS/origin 行为，A1 再用真实 `.app` 复验。

### 8.3 前端与集成验证

- 单元测试覆盖 REST 数据映射、WebSocket event reducer、消息和 Tool call 归并、路径、附件与 diff 工具函数。
- 组件测试覆盖 Composer、Conversation Timeline、Tool Call、Approval、Question、Task、Goal、Plan、diff 和文件预览。
- 集成测试覆盖 sidecar 健康检查、会话创建、prompt、流式响应、Approval/Question、snapshot 恢复和 Terminal 生命周期。

### 8.4 UI 与桌面验收

- 所有用户可见 UI task 在实现前使用相同 Playwright assertion 和 Midscene prompt 获得有效 RED，实现后获得 GREEN。
- 日常 React WebView 使用 `@midscene/web` + Playwright；真实 `.app` 里程碑使用 `@midscene/computer`。
- 本地 Midscene 基础设施不可用时，相关 UI task 为 `BLOCKED`；CI 缺少模型配置时必须明确标记 `skipped` 及原因。
- 视觉验收至少覆盖 macOS 浅色、深色、默认窗口尺寸和最小支持窗口尺寸。
- 桌面 E2E 覆盖首次启动、真实 Agent turn、App 重启、sidecar 启动失败与异常退出、原生文件选择、通知和无 Node.js 环境运行。

## 9. 发布与升级要求

- 输出可独立运行的 Apple Silicon `.app`，App Bundle 包含匹配版本的官方完整 Kimi Code SEA。
- 正式外部分发必须使用 Developer ID Application 签名、hardened runtime、正确的 sidecar entitlements 和 Apple notarization。
- 发布产物必须记录 Moonfall version、Kimi Code commit/version、SEA SHA-256、OpenAPI、AsyncAPI 和能力矩阵版本。
- V1 不允许 sidecar 独立自动更新；App 与 SEA 作为一个原子版本发布和回滚。
- 用户数据目录与 App 版本分离。若后端引入不可逆数据迁移，升级前必须备份并记录最低可回滚版本。
- 升级 Kimi Code 必须使用独立 OpenSpec change，更新固定 commit 后重新执行 B0-B2、生成协议差异并运行全部 App 回归。

## 10. 风险与控制

### 10.1 上游构建环境变化

控制措施：固定上游 commit、Node、pnpm、lockfile 与 `darwin-arm64` target，并在 B1 使用全新目录验证完整官方 native workflow 的重复构建；manifest 分别记录上游 target、Mach-O 架构和 Tauri staging triple，避免混用命名体系。

### 10.2 官方 SEA 包含未使用的 Kimi Web 资源

控制措施：V1 接受体积代价以避免维护 fork；后续只能通过独立 change 评估体积和攻击面，不能在构建脚本中静默 patch 上游。

### 10.3 后端协议持续变化

控制措施：保存 OpenAPI/AsyncAPI、生成 REST 类型、维护协议兼容测试；升级后端时重新执行 B0-B2 并完成差异审查。

### 10.4 Tauri origin 无法安全直连官方 REST/WS

控制措施：B2 使用预期 production origin 的 contract harness 提前验证，A1 用真实 `.app` 复验；失败时暂停阶段并更新 OpenSpec design，不预先引入 Rust proxy。

### 10.5 流式事件状态复杂

控制措施：Kimi Code 保持业务状态唯一事实来源；事件 reducer 与 UI 分离；检测 seq/cursor 缺口；所有不确定状态回退到 REST snapshot。

### 10.6 Tauri 与 sidecar 生命周期

控制措施：明确启动状态机、超时、日志和有限重试；使用健康检查而不是仅判断进程存在；覆盖异常退出和正常退出清理。

### 10.7 功能对齐范围过大

控制措施：按 A2-A6 纵向闭环交付；功能差异矩阵固定到 B0 的同一 Kimi Code commit。第 6 章中由 A2-A6 交付的全部 V1 功能定义为核心能力，不得通过 scope exception 移除。V1 范围内条目最终只能为已支持或明确不适用；部分支持或延期必须先通过用户确认的 OpenSpec scope exception 调整非核心范围，并记录原因、影响和恢复条件。

### 10.8 同时追求重构和视觉创新

控制措施：V1 使用 Kimi Web 视觉基线；架构重建完成后再逐步进行品牌和交互迭代。

## 11. V1 非目标与阶段内部决策

V1 明确不包含：

- Kimi Web Vue 组件、composable、store、页面代码或 API adapter 复用。
- Kimi Code fork、上游 patch 或纯后端 SEA 变体。
- Moonfall 自有 Token、Session、Task、Agent、Provider 状态生命周期。
- Intel、Windows、Linux、移动端或远程 Web 支持。
- 共享 `~/.kimi-code`、复用外部 daemon 或 sidecar 独立更新。
- 多账号调度、订阅转 API、用量均衡、远程隧道、定时任务、梦境记忆、跨会话记忆、内置浏览器或悬浮宠物。
- 在完成前端重构的同时重新设计完整信息架构；V1 先对齐 Kimi Web 的功能和界面密度。

`docs/idea.md` 中的扩展想法继续作为后续候选，不进入 V1 完成门禁。

以下阶段内部细节由对应 OpenSpec change 在实施前确认，不改变本路线的职责边界：

1. B0 选择的实际 Kimi Code commit SHA 与具体工具链版本。
2. A0 确定的最低 macOS 版本、bundle identifier 和工程命令。
3. A1 基于真实上游契约确定的连接描述读取细节与 lifecycle timeout。
4. A8 的 App 自动更新方案；无论采用何种方案，App 与 SEA 必须原子升级。

## 12. V1 完成定义

V1 只有在以下条件全部满足时才视为完成：

- Moonfall 通过固定完整 commit 的脚本拉取并构建官方完整 Apple Silicon SEA。
- 构建产物具有 Kimi Code commit/version、工具链、上游 target `darwin-arm64`、Mach-O 架构 `arm64`、Tauri staging triple `aarch64-apple-darwin` 和 SHA-256 清单。
- REST、WebSocket 与全部后端能力域进入能力矩阵，没有未记录缺口。
- SEA 作为 external binary 随签名后的 Moonfall.app 分发，且不独立于 App 更新。
- 干净 Apple Silicon Mac 无需 Node.js、pnpm、Kimi CLI 或外部 daemon。
- Kimi Code 使用 Moonfall 独立 `KIMI_CODE_HOME`，并继续作为认证和业务状态唯一事实来源。
- Moonfall 不重复实现 Kimi Code 的 Token 或业务状态生命周期。
- 工作区、会话、对话、Tool、Approval、Question、文件、Git、Terminal、高级 Agent、模型和设置完成验收。
- 断线、sidecar 退出、App 重启、后端错误和长会话均有明确行为。
- 浅色、深色、默认窗口和最小窗口通过确定性 Playwright 与 Midscene 验收。
- 功能差异矩阵固定到 B0 的同一 Kimi Code commit，V1 范围内每项均标记为已支持或明确不适用。
- 第 6 章中由 A2-A6 交付的核心能力全部完成验收；部分支持或延期条目已通过用户确认的 OpenSpec scope exception 调整非核心范围，而不是作为 V1 完成状态保留。
- `.app` 完成 Developer ID 签名、hardened runtime、notarization 和干净机器安装验证。
- B0-B2 与 A0-A8 的 OpenSpec change 均完成 verify、strict validation、sync 和 archive。
