# Moonfall V1 技术路线

> 状态：Draft  
> 日期：2026-07-28  
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
- 首发平台：macOS

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
- 管理本地 UI 状态和服务端状态缓存。
- 通过 REST 完成查询和命令操作。
- 通过 WebSocket 接收增量事件并收敛到一致状态。
- 将原生能力请求发送给 Tauri Rust Host。
- 不直接创建或管理 Agent Core 实例。

### 3.2 Tauri Rust Host 职责

- 启动并监管 Kimi Code SEA sidecar。
- 解析服务实例地址并完成健康检查。
- 处理启动超时、异常退出、重启和退出清理。
- 管理窗口、菜单、快捷键和窗口状态。
- 提供目录选择、文件保存、Finder 显示和外部应用打开能力。
- 提供 macOS 通知、钥匙串和后续自动更新能力。
- 将运行日志写入可诊断、可导出的位置。

Rust Host 不承担以下职责：

- Agent 推理与编排
- 会话和 Transcript 业务逻辑
- Tool、Skill、MCP 实现
- 模型 Provider 管理逻辑

### 3.3 Kimi Code 后端职责

- Agent、Session、Task 和 Transcript 生命周期。
- 模型、Provider 与 OAuth。
- Tool、Skill、MCP 和权限控制。
- 文件系统、Git、终端与附件服务。
- Plan、Goal、Swarm、子 Agent 和 BTW 等 Agent 能力。
- 会话、配置、日志和运行数据持久化。

## 4. 后端集成方案

### 4.1 构建与分发

Moonfall 不要求用户安装 Kimi Code。发布流程为每个目标平台构建一个固定版本的 Kimi Code SEA，并作为 Tauri sidecar 打进 App Bundle。

基本要求：

- 每个 Moonfall 版本固定对应一个 Kimi Code commit 或 release。
- CI 从固定版本构建 SEA，禁止在发布时跟随浮动分支。
- App 启动前校验 sidecar 是否存在且可执行。
- Moonfall 版本信息中记录对应的 Kimi Code 版本。
- 前端协议兼容性以该固定后端版本为准。

### 4.2 启动流程

1. Tauri 创建主窗口并显示本地启动状态页。
2. Rust Host 确定应用数据目录、日志目录和 sidecar 路径。
3. 启动 Kimi Code SEA。
4. 读取实际监听地址并轮询 `/api/v1/healthz`。
5. 获取服务端 token，通过安全的初始化通道交给前端。
6. 前端初始化 REST 客户端并建立 WebSocket 连接。
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
- 原生命令采用最小 Tauri capability，不为前端开放通用 Shell 执行。
- 外部 URL、文件路径和应用启动请求必须经过校验。
- Provider 凭据后续应由 macOS Keychain 承载；V1 若仍由 Kimi Code 管理，必须记录迁移边界。

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

- TanStack Query：工作区、会话列表、模型、Provider、配置等服务端查询状态。
- Zustand：当前会话、流式消息、任务活动、待处理交互和 UI 状态。
- 组件局部状态：输入框、Popover、Dialog、选中项和临时表单。
- Tauri 状态：sidecar 生命周期、窗口状态、系统权限和更新状态。

服务端数据只保留一个明确的事实来源。WebSocket 增量更新必须能够在断线、事件缺口或版本不匹配时回退到 REST snapshot，而不是长期依赖不完整的本地推演。

### 5.3 API 客户端

REST 和 WebSocket 分开实现：

- REST 类型优先从 kap-server OpenAPI 生成。
- 在生成层之上增加轻量、稳定的领域 facade。
- WebSocket 使用独立的协议模块，负责连接、订阅、心跳、游标、重连和 resync。
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

### M0：工程与协议基线

目标：建立可持续开发的工程骨架。

- 初始化 Tauri 2 + React + TypeScript + Vite。
- 配置 HeroUI v3、Tailwind CSS v4 和主题 Token。
- 建立代码质量、单元测试和桌面 E2E 基础。
- 固定 Kimi Code 后端版本。
- 验证 REST、WebSocket、鉴权和 CORS/origin 行为。

完成标准：开发环境能启动空 App，并连接一个本地 Kimi Code 服务。

### M1：最小 Agent 闭环

目标：证明端到端技术路线。

- Tauri 启动并探活 sidecar。
- 选择本地工作区。
- 创建会话。
- 发送一条消息。
- 展示流式文本和结束状态。
- 支持打断和基础错误恢复。

完成标准：无外部 Kimi/Node 环境时，可以从启动 App 到完成一次 Agent turn。

### M2：完整对话与交互

- 完整消息时间线。
- Thinking、Tool call 和 Tool result。
- Approval、Question 和权限模式。
- 附件、排队、steer、undo 和 compact。
- WebSocket 重连、事件缺口和 snapshot 恢复。

完成标准：常规 Agent 会话不需要回到 CLI 或 Kimi Web 完成操作。

### M3：开发者工作区

- 文件树、搜索和预览。
- Git 状态、变更列表和 diff。
- 终端。
- 原生目录选择、打开文件和 Finder 集成。

完成标准：用户可以在 Moonfall 内检查 Agent 产生的主要代码变更和命令执行结果。

### M4：高级 Agent 能力

- Plan、Goal、Task。
- Swarm、子 Agent、BTW。
- Skills。
- 模型、Provider 和 OAuth。

完成标准：覆盖 Kimi Web 暴露的高级 Agent 控制能力。

### M5：产品化与发布

- 首次启动与空状态。
- 通知、声音、快捷键和原生菜单。
- 日志、诊断和崩溃恢复。
- 性能、长会话和大输出优化。
- macOS 签名、公证和安装包。

完成标准：在未安装开发工具的新 Mac 用户环境完成安装和核心功能验收。

### M6：功能对齐验收

- 建立 Kimi Web 功能差异矩阵。
- 对每项能力记录已支持、部分支持、不适用或延期。
- 完成浅色/深色和常见窗口尺寸视觉对比。
- 完成断网、后端异常、Token 失效和 App 重启场景。

完成标准：V1 范围内不存在未记录的功能差异。

## 8. 测试与验证

### 8.1 单元测试

- REST 数据映射
- WebSocket event reducer
- 消息与 Tool call 归并
- 权限和交互状态转换
- 路径、附件和 diff 工具函数

### 8.2 组件测试

- Composer
- Conversation Timeline
- Tool Call
- Approval、Question
- Task、Goal、Plan
- Diff 和文件预览

### 8.3 集成测试

- 启动 sidecar 并完成健康检查
- 创建会话并提交 prompt
- WebSocket 流式响应
- Approval/Question 往返
- 断线重连和 snapshot 恢复
- 终端创建、输入、输出和关闭

### 8.4 桌面 E2E

- 首次启动
- 选择项目并完成一次 Agent turn
- App 退出和重启后的会话恢复
- sidecar 启动失败和异常退出
- 原生文件选择与通知
- `.app` 在无 Node.js 环境运行

任何可见 UI 变更都需要在至少以下环境进行截图验证：

- macOS 浅色主题
- macOS 深色主题
- 默认窗口尺寸
- 最小支持窗口尺寸

## 9. 发布要求

- 输出可独立运行的 `.app`。
- App Bundle 包含对应架构的 Kimi Code sidecar。
- 正式外部分发必须使用 Developer ID Application 签名。
- 启用 hardened runtime，并为 sidecar 配置正确的签名与 entitlements。
- 完成 Apple notarization。
- 发布产物记录 Moonfall、前端协议和 Kimi Code 后端版本。
- 自动更新不阻塞首个开发版，但正式稳定版发布前必须有明确方案。

## 10. 风险与控制

### 10.1 后端协议持续变化

控制措施：固定 Kimi Code commit；生成 REST 类型；维护协议兼容测试；升级后端时单独完成差异审查。

### 10.2 流式事件状态复杂

控制措施：事件 reducer 与 UI 分离；保留 seq/cursor；检测缺口；所有不确定状态回退到 REST snapshot。

### 10.3 Tauri 与 sidecar 生命周期

控制措施：明确启动状态机、超时、日志和重试；使用健康检查而不是仅判断进程存在；覆盖异常退出测试。

### 10.4 功能对齐范围过大

控制措施：按纵向闭环交付；维护功能矩阵；优先完成 Agent 主流程，再扩展高级功能。

### 10.5 同时追求重构和视觉创新

控制措施：V1 使用 Kimi Web 视觉基线；架构重建完成后再逐步进行品牌和交互迭代。

## 11. 待确认事项

以下事项尚未成为正式决策，进入对应实现前需要确认：

1. 数据目录：默认使用 Moonfall 独立目录，还是共享 `~/.kimi-code` 的会话与配置。
2. 后端来源：CI 直接从固定 Kimi Code commit 构建，还是消费受控的预构建 SEA artifact。
3. 进程策略：App 独占私有 daemon，还是优先复用已经运行的 Kimi daemon。
4. 自动更新：V1 正式版是否必须包含 App 与 sidecar 的原子更新。
5. 品牌范围：V1 只替换产品名称与图标，还是同时调整文案和信息架构。
6. 最低 macOS 版本与首批支持架构：Apple Silicon only，还是同时支持 Intel。

在这些事项确认前，推荐默认采用：独立数据目录、固定 commit 构建、App 私有 daemon、Apple Silicon 优先。

## 12. V1 完成定义

V1 只有在以下条件全部满足时才视为完成：

- 用户无需安装 Node.js、pnpm 或 Kimi CLI。
- App 可以可靠启动、连接、重启和诊断 Kimi Code sidecar。
- Agent 主流程以及 V1 功能矩阵中的能力完成验收。
- 断线、Token 失效、sidecar 异常和 App 重启有明确恢复行为。
- 长会话和持续流式输出不会造成不可接受的 UI 卡顿。
- 浅色、深色和最小窗口尺寸通过视觉验收。
- 安装包可以在干净的目标 Mac 环境运行。
- 正式分发产物完成签名和公证。
- 所有已知功能差异均有记录，不存在隐式缺失。
