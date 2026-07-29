## 1. 固定并校验 Midscene 官方来源

- [x] 1.1 在系统临时目录获取 `web-infra-dev/midscene-skills@83bf1241d767a150ff801ea6ea8fe7edaec0e96d`，确认上游仓库身份与 MIT license
- [x] 1.2 校验 `skills/browser/SKILL.md` 的 Git blob 为 `b5e3a2a21f84015d106dfcb0155ad4c795a606de`，并校验 `skills/computer-automation/SKILL.md` 的 Git blob 为 `102613fafc799292f62b29452494df9a459bda93`

## 2. 引入官方 Midscene skills

- [x] 2.1 将固定上游的 `browser/SKILL.md` 原样 vendoring 到 `.agents/skills/browser/SKILL.md`，并验证文件内容与上游字节级一致
- [x] 2.2 将固定上游的 `computer-automation/SKILL.md` 原样 vendoring 到 `.agents/skills/computer-automation/SKILL.md`，并验证文件内容与上游字节级一致
- [x] 2.3 检查本 change 的引入范围仅包含 `browser` 与 `computer-automation`，确认未引入 Android、iOS、HarmonyOS 或 `vitest-midscene-e2e` skill

## 3. 建立 Midscene TDD bridge skill

- [x] 3.1 使用 `writing-skills` 创建 `.agents/skills/midscene-tdd/SKILL.md`，定义与 `test-driven-development` 配合的 Web 双层 red-green、Desktop 里程碑验收、本地与 CI 门禁、失败及证据处理
- [x] 3.2 创建 `.agents/skills/midscene-tdd/references/upstream.md` 与 `LICENSE.midscene-skills`，记录上游仓库、固定 commit、两个 Git blob 和 MIT license
- [x] 3.3 使用 `writing-skills` 的验证流程检查 `midscene-tdd` trigger、步骤、边界和引用，确认没有修改 Superpowers 或两个官方 Midscene skill 的源文件

## 4. 落盘仓库级编排与安全规则

- [x] 4.1 更新 `AGENTS.md`，规定可见 UI task 在 `openspec-apply-change` 下同时使用 `test-driven-development` 与 `midscene-tdd`，并保持 OpenSpec `tasks.md` 为唯一正式状态
- [x] 4.2 在 `AGENTS.md` 中落盘 `@midscene/web` + Playwright 的日常双层 red-green、`@midscene/computer` 的真实 Tauri `.app` 验收，以及本地强制与 CI 条件式门禁
- [x] 4.3 更新 `.gitignore`，忽略 `.env`、`.env.*` 与 `midscene_run/`，同时通过 `!.env.example` 允许无凭据示例配置

## 5. 验证发现能力与变更边界

- [x] 5.1 验证 Codex、Kimi Code 与 Grok 三个 CLI 入口通过现有根级挂载发现 `.agents/skills/` 中同一份 `browser`、`computer-automation` 与 `midscene-tdd`
- [x] 5.2 验证官方 skill 文件的 Git blob、bridge references 和 vendoring 来源一致，并确认仓库中没有本 change 引入的其他 Midscene 平台 skill
- [x] 5.3 检查变更清单，确认本 change 未新增或修改 `package.json`、应用源码、测试目录、fixture、CI workflow 或可运行 Midscene 测试工程
- [x] 5.4 记录 M0 后续阻断项：安装 `@midscene/web`、`playwright`、`@playwright/test` 与 `@midscene/computer`，并建立 fixture、reporter、稳定数据、固定 viewport、Web 与 Desktop 命令及条件式 CI job

## 6. 测试、验证、同步与归档

- [x] 6.1 运行与 skill 结构、上游完整性、CLI 发现、忽略规则和变更边界相关的全部自动检查，并保留 fresh evidence
- [x] 6.2 使用 `openspec-verify-change` 检查 completeness、correctness 与 coherence，修复所有 CRITICAL，并修复 WARNING 或在 `design.md` 记录接受理由与影响
- [x] 6.3 运行 `openspec validate --all --strict` 并修复全部失败
- [x] 6.4 使用 `openspec-sync-specs` 将两份适用的 delta specs 同步到 main specs
- [x] 6.5 在所有 tasks 完成且检查通过后使用 `openspec-archive-change` 归档 `integrate-midscene-tdd`
