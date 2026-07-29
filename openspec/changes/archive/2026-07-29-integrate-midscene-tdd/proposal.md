## Why

仓库已经要求 Superpowers TDD 提供确定性的 red-green 证据，但可见 UI 行为还缺少基于真实画面和自然语言语义的验收层。引入 Midscene 的浏览器与桌面 skills，可以让 agent 在日常 UI 开发中验证 React WebView，并在里程碑和发布阶段验证真实 Tauri `.app`。

## What Changes

- 从 `web-infra-dev/midscene-skills` 固定上游 commit，引入官方 `browser` 与 `computer-automation` skills 到 `.agents/skills/` canonical source。
- 新增仓库级 `midscene-tdd` bridge skill，在不修改 Superpowers `test-driven-development` 源文件的前提下定义 UI red-green、桌面验收、CI、失败和证据处理。
- 更新 `AGENTS.md`，要求可见 UI task 同时使用 `test-driven-development` 与 `midscene-tdd`。
- 规定 Playwright 确定性 assertion 与 Midscene 语义 assertion 的职责边界；Midscene 不能替代普通单元、组件、集成或 Playwright 测试。
- 规定 `@midscene/web` + Playwright 作为日常 UI red-green 验收层，`@midscene/computer` 作为真实 Tauri `.app` 的里程碑和发布验收层。
- 规定本地与 CI 门禁、模型配置、报告、缓存、敏感信息和基础设施故障处理。
- 在 `.gitignore` 中忽略 `.env` 与 `midscene_run/` 生成物，并允许未来提交不含凭据的 `.env.example`。
- 记录 M0 工程初始化必须安装的 Midscene 与 Playwright dependencies 和必须建立的测试基础设施，但本 change 不创建 `package.json`、测试目录或应用代码。
- 不引入 Android、iOS、HarmonyOS 或 Vitest Midscene skills。
- **BREAKING**: 无。

## Capabilities

### New Capabilities

- `midscene-tdd`: 定义 Midscene skills 的固定来源、UI red-green、桌面验收、CI 条件门禁、模型与报告安全边界，以及 M0 后续测试基础设施契约。

### Modified Capabilities

- `agent-development-workflow`: 将 `midscene-tdd` 加入可见 UI task 的 Superpowers 阶段内方法，并规定它与 `test-driven-development`、OpenSpec task 状态和完成证据的关系。

## Impact

- 受影响路径包括 `.agents/skills/browser/`、`.agents/skills/computer-automation/`、`.agents/skills/midscene-tdd/`、`AGENTS.md`、`.gitignore` 和对应 OpenSpec specs。
- `.codex`、`.kimi-code` 与 `.grok` 继续通过现有根级软链接发现 `.agents/skills/`，不增加独立 skill 副本。
- 本 change 不新增 Node.js runtime 或 dev dependencies，不运行尚不存在的应用测试，也不改变产品运行时行为。
- 后续 M0 工程初始化必须通过独立或现有已确认 OpenSpec change 落地 `@midscene/web`、Playwright、`@playwright/test`、`@midscene/computer`、fixture、reporter、命令和 CI 配置。
