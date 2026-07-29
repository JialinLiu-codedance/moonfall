## Context

ToTheMoon 的测试路线已经区分单元、组件、集成和桌面 E2E，并要求任何可见 UI 变更提供浅色、深色、默认窗口和最小窗口截图证据。仓库同时已建立“OpenSpec 外层 lifecycle、Superpowers 阶段内方法”的编排规则，但当前 `test-driven-development` 只规定确定性的 red-green，没有基于真实画面的语义 UI 验收。

Midscene 主项目提供 `@midscene/web`、Playwright 集成与 `@midscene/computer`；官方 `web-infra-dev/midscene-skills` 仓库提供 agent 可直接调用的 browser 与 desktop skills。当前仓库没有 `package.json`、Tauri/React 工程或测试配置，因此本 change 只引入 agent skills、bridge skill、流程规则与 M0 契约，不提前创建空测试工程。

## Goals / Non-Goals

**Goals:**

- 引入官方 Midscene browser 与 computer automation skills，并保持可追溯、可升级的固定来源。
- 使用独立 `midscene-tdd` bridge skill 将 Midscene 纳入 Superpowers TDD，而不 fork Superpowers。
- 让 `@midscene/web` + Playwright 成为可见 UI task 的日常双层 red-green 验收。
- 让 `@midscene/computer` 承担真实 Tauri `.app` 的里程碑、原生能力和发布验收。
- 明确本地、CI、模型、失败、报告、缓存和敏感信息边界。
- 将未来 M0 需要落地的 dependencies、fixture、reporter、命令和 CI 条件门禁变成正式契约。

**Non-Goals:**

- 本 change 不创建 `package.json`、应用源码、测试目录、fixture、CI workflow 或可运行的 Midscene 测试。
- 不引入 Android、iOS、HarmonyOS 或 `vitest-midscene-e2e` skill。
- 不修改 Superpowers `test-driven-development` 或任何官方 Midscene skill 的内容。
- 不让 AI 语义 assertion 取代确定性单元、组件、集成或 Playwright assertion。
- 不把 Midscene 模型调用设置为所有 CI 环境的无条件硬门禁。

## Decisions

### 1. 使用官方 skills 加仓库级 bridge skill

将官方 `browser` 和 `computer-automation` 原样 vendoring 到 `.agents/skills/`，再新增由仓库维护的 `midscene-tdd`。官方 skills 负责具体 CLI 操作和平台前置条件，bridge skill 只负责 TDD 阶段、证据和门禁编排。

这种结构保留上游升级能力，也符合 `.agents/skills/` canonical source 与现有 CLI 根级软链接约定。

**备选方案：** 只安装官方 skills，在 `AGENTS.md` 中散落全部规则。该方案缺少明确 trigger 和可复用的 red-green 协议，因此不采用。

**备选方案：** 直接修改 Superpowers `test-driven-development`。该方案违反现有仓库规则，并使上游升级产生 fork 冲突，因此不采用。

### 2. 固定上游 commit 并校验 Git blob

官方来源固定为 `web-infra-dev/midscene-skills@83bf1241d767a150ff801ea6ea8fe7edaec0e96d`。实施时在系统临时目录下载该 commit，校验 `browser/SKILL.md` 的 Git blob 为 `b5e3a2a21f84015d106dfcb0155ad4c795a606de`，校验 `computer-automation/SKILL.md` 的 Git blob 为 `102613fafc799292f62b29452494df9a459bda93`，然后只 vendoring 这两个文件。

上游仓库、commit、blob 与 MIT license 记录在 `.agents/skills/midscene-tdd/references/`。官方文件保持字节级不变，仓库特有规则只写入 bridge skill。

**备选方案：** 直接运行不固定版本的 `npx skills add`。该命令可能引入全部平台 skills，且同一 change 在不同时间可能获得不同内容，因此不采用。

### 3. Web UI 使用确定性与语义双层 red-green

确定性 Playwright assertion 负责 URL、可访问属性、文本、状态值、事件结果和其他可重复业务条件；Midscene 负责视觉定位、自然语言操作、整体画面语义与 `aiAssert`。可见 UI task 必须先观察同一功能在两层验收中因未实现而失败，再完成最小实现并让同一场景通过。

GREEN 不允许通过放宽 prompt、删除 assertion 或改成只看截图获得。重构后重复两层验证。Midscene 报告用于诊断和人工审阅，但 OpenSpec `tasks.md` 仍是唯一正式状态。

**备选方案：** 仅使用 Midscene assertion。模型调用具有成本、延迟和非确定性，无法替代确定性测试，因此不采用。

### 4. Desktop 验收不进入每个 task 的日常循环

`@midscene/computer` 控制真实桌面、依赖 macOS Accessibility 权限，并可能操作屏幕上的其他应用。它只在里程碑、发布候选或涉及原生能力的 change 中运行，覆盖文件选择、通知、重启恢复、sidecar 故障与无 Node.js 环境。

每次执行先完成 connect health check、截图和前台应用确认；缺少权限、黑屏、锁屏或多显示器目标错误时停止并报告 `BLOCKED`。

**备选方案：** 每个 UI task 都运行 Desktop 自动化。该方案速度慢、权限侵入高，且对纯 WebView 变更重复，因此不采用。

### 5. 本地强制、CI 条件式执行

本地可见 UI task 必须运行 Midscene Web 验收。CI 中确定性 Playwright 始终是硬门禁；只有 `MIDSCENE_MODEL_*` secrets 可用时才运行 Midscene job。缺少配置时 job 必须显示 `skipped` 与原因，不能显示伪通过。

一旦 Midscene 实际运行，其 assertion 失败即阻止 task 或 CI job 完成。模型或基础设施不可用属于 `BLOCKED`，不能通过无界重试隐藏。

### 6. 模型 secrets 与运行产物默认不入库

`.gitignore` 增加 `.env`、`.env.*`、`!.env.example` 与 `midscene_run/`。本地可以使用 `MIDSCENE_MODEL_*` 或 `codex://app-server`，CI 只使用受保护 secrets。报告、截图、缓存和日志可能包含界面或业务信息，只记录运行命令、结果和 artifact 路径，不默认提交内容。

### 7. Dependencies 延后到 M0，但形成阻断性契约

M0 工程初始化必须安装 `@midscene/web`、`playwright`、`@playwright/test` 与 `@midscene/computer`，并建立 fixture、reporter、稳定数据、固定 viewport、Web red-green 命令、Desktop 验收命令和 CI 条件 job。在该 change 完成前，只能声明 skills 与流程契约已就绪，不能声明 Midscene 测试可运行。

## Risks / Trade-offs

- [上游 skills 过期] → 固定来源便于复现；升级必须新建 OpenSpec change、比较上游 diff 并更新 commit 与 blob。
- [Midscene 模型结果不稳定] → 关键状态使用确定性 assertion；prompt 保持具体且不在 GREEN 阶段临时放宽；失败时检查报告并定位产品、测试或基础设施责任。
- [本地模型成本与延迟] → 仅可见 UI task 强制使用，Desktop 限于里程碑和发布；未来使用稳定数据与缓存优化，但缓存不能替代模型回退能力。
- [Desktop 误操作真实桌面] → 只在受控 Mac、目标 `.app` 前台和 health check 通过后运行，不在后台或锁屏环境执行。
- [报告泄露界面或凭据] → 默认忽略完整 `midscene_run/`，CI artifact 使用访问控制与保留期，交付摘要不打印 secrets。
- [当前无工程导致无法实测 package] → 本 change 的完成声明严格限定为 skill、流程与契约；可运行测试必须由 M0 change 提供实际证据。

## Migration Plan

1. 在临时目录获取固定上游 commit，验证两个目标 Git blob 与 MIT license。
2. 只将官方 `browser` 和 `computer-automation` skills vendoring 到 `.agents/skills/`。
3. 使用 `writing-skills` 创建并验证仓库级 `midscene-tdd` bridge skill及其 upstream references。
4. 更新 `AGENTS.md` 的阶段内调用规则与 Midscene UI TDD 门禁。
5. 更新 `.gitignore` 的 secrets 和运行产物规则。
6. 验证三个 CLI 入口发现相同 skills，确认未引入移动端或 Vitest skill，确认没有新增 package 或应用文件。
7. 完成 OpenSpec verify、strict validation、sync 和 archive。

回滚时删除本 change 新增的三个 skill 目录，撤销 `AGENTS.md` 与 `.gitignore` 对应条目，并通过新的 OpenSpec change 删除已同步 requirements；不得直接静默修改 main specs。

## Open Questions

无。
