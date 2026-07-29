## Purpose

定义 Midscene skills 的固定来源、UI 双层 red-green、真实桌面应用验收、本地与 CI 门禁、失败状态、安全边界，以及 M0 测试基础设施契约。

## Requirements

### Requirement: Midscene skills 使用固定官方来源
仓库 MUST 从 `web-infra-dev/midscene-skills` 的固定 commit `83bf1241d767a150ff801ea6ea8fe7edaec0e96d` 引入官方 `browser` 与 `computer-automation` skills，并 MUST 将其唯一事实来源放在 `.agents/skills/`。仓库 MUST 记录上游仓库、commit、Git blob 与 MIT license，MUST NOT 同时引入 Android、iOS、HarmonyOS 或 `vitest-midscene-e2e` skill。

#### Scenario: 引入官方 skills
- **WHEN** 维护者执行本 change 的 skill vendoring 任务
- **THEN** `.agents/skills/browser/SKILL.md` 的 Git blob 为 `b5e3a2a21f84015d106dfcb0155ad4c795a606de`
- **AND** `.agents/skills/computer-automation/SKILL.md` 的 Git blob 为 `102613fafc799292f62b29452494df9a459bda93`
- **AND** `.codex`、`.kimi-code` 与 `.grok` 通过现有挂载发现同一份 skills

#### Scenario: 检查引入范围
- **WHEN** 维护者检查本 change 新增的 Midscene skill 目录
- **THEN** 只存在 `browser`、`computer-automation` 与仓库级 `midscene-tdd`
- **AND** 不存在本 change 引入的移动端或 Vitest Midscene skill

### Requirement: Midscene TDD 使用独立 bridge skill
仓库 MUST 提供 `.agents/skills/midscene-tdd/SKILL.md`，用于连接 Superpowers `test-driven-development` 与两个官方 Midscene skills，并 MUST NOT 修改 Superpowers 或官方 Midscene skill 源文件来实现编排。

#### Scenario: 可见 UI task 触发 bridge skill
- **WHEN** task 新增或修改用户可见 UI、交互状态、布局或视觉反馈
- **THEN** agent 同时使用 `test-driven-development` 与 `midscene-tdd`
- **AND** OpenSpec `tasks.md` 仍是唯一持久化 task 状态

### Requirement: Web UI 使用双层 red-green
可见 Web UI task MUST 在实现前定义确定性 Playwright assertion 和 Midscene 语义验收场景，MUST 观察两层测试因目标行为尚未实现而失败，并 MUST 在最小实现后使用同一场景取得 GREEN。Midscene MUST 使用 `@midscene/web` 与 Playwright 集成，MUST NOT 替代单元、组件、集成或普通 Playwright assertion。

#### Scenario: 新增可见 UI 行为
- **WHEN** agent 开始实现新的 React WebView UI 行为
- **THEN** agent 先运行确定性 Playwright 与 Midscene 语义验收并确认失败原因是目标行为缺失
- **AND** agent 完成最小实现后运行相同 assertions 与 prompts 并取得通过结果
- **AND** agent 不通过放宽 prompt、删除 assertion 或改用手工截图伪造 GREEN

#### Scenario: 重构已通过的 UI
- **WHEN** agent 在 GREEN 后重构可见 UI 实现
- **THEN** agent 重新运行确定性测试与 Midscene 语义验收
- **AND** 两层验证均通过后才能完成 task

### Requirement: Desktop 自动化用于真实应用验收
仓库 MUST 使用 `@midscene/computer` 验证真实 Tauri `.app` 的里程碑和发布场景，覆盖原生文件选择、通知、退出与重启恢复、sidecar 启动失败与异常退出，以及无 Node.js 环境运行。Desktop 自动化 MUST NOT 被要求加入每个普通 UI task 的日常 red-green 循环。

#### Scenario: 执行里程碑或发布验收
- **WHEN** change 到达明确的里程碑、发布候选或涉及原生桌面能力
- **THEN** agent 在受控 Mac 上完成 Midscene computer health check
- **AND** agent 启动真实 `.app`、执行适用场景并使用可观察的 screen assertion 验证结果

### Requirement: 本地与 CI 使用不同门禁
本地可见 UI task MUST 在完成前运行 Midscene Web 验收。CI MUST 始终将确定性 Playwright 测试作为硬门禁；只有 Midscene 模型配置可用时才运行 Midscene job，缺少配置时 MUST 明确报告 `skipped` 原因，MUST NOT 将未执行伪装为通过。

#### Scenario: 本地完成可见 UI task
- **WHEN** agent 准备勾选修改可见 UI 的 task
- **THEN** fresh evidence 同时包含确定性测试和 Midscene Web 验收结果
- **AND** 任一已执行验证失败都会阻止 task 完成

#### Scenario: CI 缺少 Midscene 模型配置
- **WHEN** CI 可以运行确定性 Playwright 但没有所需 `MIDSCENE_MODEL_*` secrets
- **THEN** 确定性 Playwright 仍作为硬门禁运行
- **AND** Midscene job 显式标记为 `skipped` 并说明缺少模型配置

### Requirement: Midscene 失败必须保留真实状态
Midscene 语义 assertion 失败 MUST 阻止相关 task 完成；模型服务、浏览器、macOS Accessibility 或自动化基础设施不可用时，agent MUST 将 task 标记为 `BLOCKED` 并报告证据，MUST NOT 将基础设施故障当作 GREEN。agent MUST 使用实际失败报告诊断问题，MUST NOT 通过任意重试隐藏不稳定性。

#### Scenario: Midscene assertion 失败
- **WHEN** Midscene 已执行且语义 assertion 返回失败
- **THEN** agent 保留报告路径和失败理由
- **AND** agent 修复产品、测试或已证实的环境问题后重新运行同一场景

#### Scenario: Desktop 缺少 Accessibility 权限
- **WHEN** `@midscene/computer` health check 因 macOS Accessibility 权限失败
- **THEN** agent 停止后续桌面操作并报告具体前置条件
- **AND** 该验收保持 `BLOCKED` 而不是通过

### Requirement: 模型凭据与运行产物不得进入仓库
仓库 MUST 忽略 `.env`、`.env.*` 与 `midscene_run/`，但 MUST 允许提交不含凭据的 `.env.example`。agent MUST NOT 提交 Midscene API Key、模型 secrets、缓存、截图、日志或可能包含敏感画面的 HTML 报告；完成证据 MUST 记录命令、结果和本地或 CI artifact 位置。

#### Scenario: 配置本地模型
- **WHEN** 开发者使用 `MIDSCENE_MODEL_*` 或 `codex://app-server` 配置本地 Midscene
- **THEN** 真实凭据只存在于受忽略的本地环境或系统配置
- **AND** 仓库只允许保存无敏感值的示例配置

### Requirement: M0 必须建立可运行测试基础设施
M0 工程初始化 MUST 安装 `@midscene/web`、`playwright`、`@playwright/test` 与 `@midscene/computer`，并 MUST 建立 Playwright Midscene fixture、reporter、稳定测试数据、固定 viewport、Web red-green 命令、Desktop 里程碑或发布命令和条件式 CI Midscene job。在这些基础设施通过对应 OpenSpec change 落地前，agent MUST NOT 宣称项目已经完整支持 Midscene UI TDD。

#### Scenario: 初始化 M0 测试工程
- **WHEN** M0 change 创建 Node.js 与 Tauri/React 工程配置
- **THEN** 该 change 同时实现已规定的 Midscene 与 Playwright dependencies、fixture、reporter、命令和 CI 条件门禁
- **AND** 至少一个 Web red-green 示例和一个 Desktop health check 提供可重复验证证据

#### Scenario: 当前 change 完成但应用尚未初始化
- **WHEN** 本 change 已安装 skills 并落盘流程规则，但仓库仍无应用测试工程
- **THEN** agent 只声明 Midscene skills 与 TDD 契约已就绪
- **AND** agent 不声明 `@midscene/web`、Playwright 或 `@midscene/computer` 测试已经可运行
