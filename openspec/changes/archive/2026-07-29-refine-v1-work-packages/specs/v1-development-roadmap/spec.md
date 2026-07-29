## ADDED Requirements

### Requirement: V1 路线具有固定工作包目录
V1 路线 MUST 在 B0-B2 与 A0-A8 阶段下定义以下 54 个有序工作包，并 MUST 为每项保持稳定编号、建议 OpenSpec change 名称和单一开发结果。

| 编号 | OpenSpec change | 单一开发结果 |
| --- | --- | --- |
| B0.1 | `define-kimi-upstream-lock` | 定义上游仓库、完整 commit、version lock schema |
| B0.2 | `fetch-pinned-kimi-code` | 拉取缓存并校验 remote、detached checkout 与 clean worktree |
| B0.3 | `verify-kimi-toolchain` | 校验 Node、pnpm、平台、lockfile 与升级失败规则 |
| B1.1 | `build-kimi-web-assets` | 构建 Kimi Web 并复制 Web assets |
| B1.2 | `build-kimi-release-sea` | 使用 `darwin-arm64` target 执行 `build:native:release` |
| B1.3 | `smoke-and-package-sea` | 完成 native smoke、artifact packaging 与 checksum |
| B1.4 | `produce-sea-manifest` | 记录 target、Mach-O 架构、Tauri triple、SHA 并进入 staging |
| B2.1 | `capture-backend-protocols` | 保存 OpenAPI 与 AsyncAPI 基线 |
| B2.2 | `build-backend-contract-harness` | 验证启动、health、loopback、auth、origin 与 REST/WS contract |
| B2.3 | `catalogue-backend-capabilities` | 建立 endpoint、event 与能力域矩阵 |
| B2.4 | `verify-backend-live-scenarios` | 验证账号、模型、OAuth、外部服务场景并记录阻塞 |
| A0.1 | `initialize-app-workspace` | 初始化无可见产品功能的 Tauri、React、TypeScript 与 Vite 空工程 |
| A0.2 | `establish-test-and-ci` | 建立 unit、Playwright、Midscene、fixture、reporter 与 CI |
| A0.3 | `establish-ui-foundation` | 建立 HeroUI v3、Tailwind v4、tokens 与主题基础 |
| A0.4 | `establish-native-security` | 建立 Tauri capabilities、CSP 与原生命令边界 |
| A1.1 | `bundle-sea-sidecar` | 配置 external binary staging 并验证 App Bundle |
| A1.2 | `isolate-kimi-data-home` | 建立独立 `KIMI_CODE_HOME`、缓存与日志目录 |
| A1.3 | `launch-and-connect-sidecar` | 启动进程并传递地址与官方连接描述 |
| A1.4 | `manage-sidecar-health` | 实现启动状态、超时与健康检查 |
| A1.5 | `manage-sidecar-lifecycle` | 实现有限重启、异常退出与退出清理 |
| A1.6 | `expose-sidecar-diagnostics` | 展示服务端版本、连接状态并导出日志与诊断信息 |
| A2.1 | `manage-workspaces` | 完成目录选择及工作区添加、删除、重命名、切换与最近列表 |
| A2.2 | `create-and-organize-sessions` | 完成会话创建及按工作区组织 |
| A2.3 | `implement-composer` | 完成不含附件的文本输入与发送 |
| A2.4 | `render-streaming-response` | 发送 REST command 并渲染 WebSocket 流式文本 |
| A2.5 | `control-agent-turn` | 完成停止、错误、重试与真实 Agent turn 验收 |
| A3.1 | `manage-sessions` | 完成会话列表、搜索、分页、重命名、归档、恢复、分叉与导出 |
| A3.2 | `render-rich-transcript` | 渲染 Markdown、代码、表格、Mermaid、KaTeX 与媒体 |
| A3.3 | `render-thinking-and-tools` | 渲染 Thinking 与 Tool input、progress、result、error |
| A3.4 | `handle-user-interactions` | 完成 Approval、Question 与附件上传、预览、移除生命周期 |
| A3.5 | `control-message-flow` | 完成队列、排序、steer、undo、compact、草稿与输入历史 |
| A3.6 | `recover-realtime-state` | 完成重连、事件缺口检测与 REST snapshot resync |
| A4.1 | `browse-project-files` | 完成文件树、搜索与预览 |
| A4.2 | `integrate-native-file-actions` | 完成编辑器打开与 Finder 显示 |
| A4.3 | `inspect-git-state` | 展示分支、状态与增删统计 |
| A4.4 | `inspect-file-diffs` | 展示文件 diff 与 Tool diff |
| A4.5 | `provide-interactive-terminal` | 完成 PTY 生命周期、Terminal UI 与退出清理 |
| A5.1 | `configure-agent-permissions` | 完成权限模式、Plan mode 与单次 turn Thinking override |
| A5.2 | `manage-goals-and-tasks` | 完成 Goal 生命周期、Task 查看与取消 |
| A5.3 | `observe-agent-swarms` | 展示 Swarm、子 Agent 状态并支持取消 |
| A5.4 | `support-btw-conversations` | 完成 BTW 侧聊与上下文隔离 |
| A5.5 | `expose-skills` | 完成 Skills 列表、详情、调用与结果 |
| A6.1 | `integrate-oauth-and-providers` | 完成 OAuth 与 Provider 生命周期 |
| A6.2 | `select-models` | 完成模型列表、选择、收藏与可用性 |
| A6.3 | `configure-runtime-parameters` | 持久化默认模型、默认 Thinking 与其他运行参数 |
| A6.4 | `manage-user-preferences` | 完成主题、字体、通知、声音与诊断偏好 |
| A7.1 | `polish-first-run` | 完成首次启动、空状态与引导 |
| A7.2 | `integrate-desktop-shell` | 完成窗口、菜单、快捷键、最小尺寸与通知 |
| A7.3 | `recover-app-and-sidecar` | 完成 App 与 sidecar 的重启、崩溃和后台恢复 |
| A7.4 | `qualify-performance` | 验证长会话、内存、启动速度与持续运行 |
| A8.1 | `close-feature-matrix` | 固定 B0 commit 并关闭功能差异与 scope exception |
| A8.2 | `freeze-release-mapping` | 固定 App、SEA、protocol、version 原子映射与回滚 |
| A8.3 | `sign-and-notarize-app` | 完成 Developer ID、hardened runtime、entitlements 与公证 |
| A8.4 | `qualify-clean-machine-release` | 完成安装包、干净机器、升级、回滚与发布报告 |

#### Scenario: 选择下一个工作包
- **WHEN** 当前工作包已经完成且团队准备继续 V1 开发
- **THEN** 下一个 change 使用目录中紧随其后的编号、名称和开发结果

#### Scenario: 工作包目录出现缺失或重复
- **WHEN** 路线检查发现编号、change 名称或单一开发结果缺失、重复或顺序不一致
- **THEN** 路线验证失败且不得开始受影响的工作包

### Requirement: 工作包保持可恢复的 task 粒度
每个工作包 MUST 只交付一个可独立验证的结果，并 SHOULD 包含 3-7 个 task；每个 task MUST 记录输入、输出、失败行为和 fresh verification。超过该范围或跨越多个主要所有权边界时，工作包 MUST 在实施前重新评估并更新路线 artifacts。

#### Scenario: 工作包包含过多行为
- **WHEN** 一个工作包需要超过 7 个 task 或覆盖多个相互独立的主要所有权边界
- **THEN** 团队在实施前拆分工作包、更新 artifacts 并重新获得用户确认

#### Scenario: 完成一个 task
- **WHEN** task 的实现与相关 fresh verification 均完成
- **THEN** 当前 change 立即更新 checkbox 和验证证据，不依赖聊天记录保存完成状态

### Requirement: 上下文恢复使用仓库事实
AI 每次开始或恢复工作包 MUST 重新读取 `openspec status`、apply instructions 返回的全部 context files、Git 状态、当前 diff、task checkbox 和最近验证证据，并 MUST NOT 使用聊天记录、模型记忆或 subagent 声明替代这些事实。

#### Scenario: 压缩上下文后继续实施
- **WHEN** AI 在上下文压缩或新会话后恢复当前工作包
- **THEN** AI 从 OpenSpec artifacts、Git 和 fresh evidence 重建状态后才继续下一个未完成 task

#### Scenario: 恢复时发现 artifacts 漂移
- **WHEN** 当前实现与 proposal、spec、design 或 tasks 不一致
- **THEN** AI 停止受影响实施，先更新 artifacts 并重新获得用户确认

### Requirement: 版本节点与工作包分离
路线 MUST 使用工作包编号表达执行顺序，并 MUST 仅在形成可交付能力时使用 SemVer 节点：B0.3 对应 `0.0.1`，B1.4 对应 `0.0.2`，B2.4 对应 `0.0.3 Backend Preview`，A1.6 对应 `0.1.0`，A2.5 对应 `0.2.0`，A3.6 对应 `0.3.0`，A4.5 对应 `0.4.0`，A6.4 对应 `0.5.0`，A7.4 对应 `0.9.0`，A8.4 对应 `1.0.0`。

#### Scenario: 完成非版本节点工作包
- **WHEN** 工作包完成但未位于上述版本节点
- **THEN** 路线推进到下一工作包且不要求发布或递增 SemVer

#### Scenario: 到达版本节点
- **WHEN** 对应节点及其全部前置工作包完成生命周期和验收
- **THEN** 项目可以生成该版本节点定义的可交付结果

## MODIFIED Requirements

### Requirement: 每个工作包独立执行 OpenSpec 生命周期
B0-B2 与 A0-A8 下的 54 个工作包 MUST 分别创建 OpenSpec change；同一时间 MUST 只实施一个工作包，并 MUST 在当前工作包完成 verify、strict validation、sync 和 archive 后才开始目录中的下一工作包。

#### Scenario: 启动下一工作包
- **WHEN** 团队准备实施目录中的下一个工作包
- **THEN** 当前工作包及其全部前置 change 已完成任务、验证、规格同步和归档

#### Scenario: 存在未完成的 active change
- **WHEN** 当前工作包仍处于实施、验证、同步或归档阶段
- **THEN** 项目不得开始另一个 V1 工作包

### Requirement: 路线定义 V1 发布边界
路线 MUST 定义 `0.0.1`、`0.0.2`、`0.0.3 Backend Preview`、`0.1.0`、`0.2.0`、`0.3.0`、`0.4.0`、`0.5.0`、`0.9.0` 和 `1.0.0` 能力节点，并 MUST 明确 V1 非目标与最终完成标准。A8 功能差异矩阵 MUST 固定到 B0 的同一 Kimi Code commit，V1 范围内条目 MUST 为已支持或明确不适用；B0.1-A8.4 的 54 个工作包对应 OpenSpec change MUST 全部完成 verify、strict validation、sync 和 archive。

#### Scenario: 判断 V1 是否完成
- **WHEN** 项目评估 `1.0.0` 发布准备度
- **THEN** 后端基座、App 功能、故障恢复、视觉验收、功能差异矩阵、签名、公证和干净机器安装均满足路线门禁

#### Scenario: 功能条目部分支持或延期
- **WHEN** V1 范围内条目仍为部分支持或需要延期
- **THEN** 项目必须通过用户确认的 OpenSpec scope exception 记录原因和影响，且该 exception 不得覆盖路线列出的核心能力

#### Scenario: 评估后续产品创意
- **WHEN** `docs/idea.md` 中的扩展想法尚未通过独立 change 纳入范围
- **THEN** 这些想法不进入 V1 完成门禁

## RENAMED Requirements

- FROM: `### Requirement: 每个阶段独立执行 OpenSpec 生命周期`
- TO: `### Requirement: 每个工作包独立执行 OpenSpec 生命周期`
