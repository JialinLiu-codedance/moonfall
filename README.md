# Moonfall

Moonfall 是一个基于 Kimi Code 后端能力构建的 macOS Agent 工作台。项目希望把 Agent 从聊天窗口提升为能够理解项目、执行任务、调用工具、协作编排并持续交付结果的桌面应用。

## V1 方向

第一版只复用 Kimi Code 的后端能力，前端从零构建：

- 使用 Kimi Code 的 `kap-server`、`agent-core-v2`、Tool、Skill、Session 和 Transcript 能力。
- 不复用现有 Kimi Web 的 Vue 组件、状态管理或前端 API adapter。
- 使用 Tauri 2、React 和 HeroUI v3 构建原生 macOS 应用。
- 第一版在布局、密度和视觉语言上对齐 Kimi Web，后续再逐步优化产品结构与品牌体验。
- 以现有 Kimi Web 的功能范围作为 V1 验收基线，而不是前端实现基础。

## 技术架构

| 层级 | 技术与职责 |
| --- | --- |
| 桌面宿主 | Tauri 2，负责窗口、sidecar 生命周期、原生菜单、文件能力、通知和系统集成 |
| 前端 | React + TypeScript + Vite，负责 Agent 工作台的全部界面与交互 |
| 组件与样式 | HeroUI v3 + Tailwind CSS v4 + CSS Variables |
| 本地通信 | REST + WebSocket，连接 Kimi Code `kap-server` |
| Agent 后端 | Kimi Code SEA sidecar，承载 Agent、会话、任务、工具和持久化能力 |

ToTheMoon 将 Kimi Code SEA 随 App 一同分发。用户不需要单独安装 Node.js、pnpm 或 Kimi CLI。React 前端通过明确的协议层调用本地服务，Rust Host 不重复实现 Agent 业务逻辑。

## V1 能力范围

- 工作区与会话管理
- 流式对话、Thinking、Tool call 与附件
- Approval、Question 与权限模式
- Plan、Goal、Task、Swarm、子 Agent 与 BTW
- Skills、模型、Provider 与 OAuth
- 文件浏览、搜索、Git 状态与 diff
- 交互式终端
- 主题、通知、日志、诊断与恢复
- macOS 安装、签名与公证

## 当前状态

项目目前处于 V1 规划和工程初始化阶段，应用骨架、依赖与可执行的开发命令尚未建立。完成工程初始化并验证真实运行入口后，本 README 将补充环境要求、开发命令和构建流程。

## 强制要求

本项目强制使用 OpenSpec 管理所有变更。任何业务代码、文档、配置、工具链或内部重构都必须完整执行 propose、人工确认、apply、verify、strict validation、sync 和 archive；详细规则见 `AGENTS.md`。

## 文档

- [V1 技术路线](docs/v1-technical-roadmap.md)：总体架构、功能范围、迭代计划、测试策略与完成定义。
