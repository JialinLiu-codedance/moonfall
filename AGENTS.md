# Repository Instructions

## OpenSpec 流程是强制要求

- 所有仓库变更 MUST 在实施前创建对应的 OpenSpec change。
- 纯文档、配置、工具链和内部重构也 MUST 执行完整流程。
- 只有确实不改变可观察行为时，才能在 change 的 `.openspec.yaml` 中设置 `skip_specs: true`；这只跳过 delta specs，不跳过其他阶段。
- proposal、适用的 delta specs、design 和 tasks 获得用户明确确认前，不得修改实现文件。
- 实施中发现 scope、specs、design 或 tasks 需要变化时，必须先更新 artifacts 并重新获得用户确认，不得让实现静默偏离 artifacts。

## 必须完整执行的生命周期

1. 必要时使用 `/skill:openspec-explore` 探索需求；该步骤可选。
2. 使用 `/skill:openspec-propose` 创建 change，并生成 proposal、适用的 delta specs、design 和 tasks。
3. 等待用户明确确认全部 artifacts。
4. 使用 `/skill:openspec-apply-change` 按 tasks 的依赖顺序实施。
5. 运行与变更相关的测试、静态检查和构建检查。
6. 使用 `/skill:openspec-verify-change` 检查 completeness、correctness 和 coherence。
7. 修复所有 CRITICAL；WARNING 必须修复，或在 `design.md` 中记录接受理由和影响。
8. 运行 `openspec validate --all --strict`。
9. 使用 `/skill:openspec-sync-specs` 同步适用的 delta specs。
10. 使用 `/skill:openspec-archive-change` 归档 change。

以上阶段不得跳过。tasks 未完成、检查失败、存在未解决的 CRITICAL 或 strict validation 失败时，不得同步或归档。

## OpenSpec 与 Superpowers 编排

### 职责边界

- OpenSpec 是仓库变更的外层 lifecycle，也是 change 标识、proposal、delta specs、design、tasks、人工确认、实施授权、sync 和 archive 状态的唯一事实来源。
- Superpowers skills 只提供 OpenSpec 各阶段内的工作方法，包括需求探索、任务拆分、隔离工作区、TDD、系统化调试、代码评审、fresh verification 和分支收尾；不得建立独立于 OpenSpec 的 change lifecycle。
- 本文件的仓库规则高于各 skill 的通用默认行为。发生冲突时必须遵守本文件，且不得通过修改 `.agents/skills/openspec-*` 或 Superpowers skill 源文件绕过冲突。

### Planning artifacts 保持单一来源

- `brainstorming` 形成的正式结论必须进入当前 OpenSpec change 的 proposal、适用的 delta specs 和 `design.md`；不得默认创建 `docs/superpowers/specs/` 下的并行正式 design。
- `writing-plans` 的文件范围、接口、依赖、任务粒度、TDD 步骤和验证命令必须进入当前 OpenSpec change 的 `tasks.md`；不得默认创建 `docs/superpowers/plans/` 下的并行正式 plan。
- 实施阶段只有 `openspec-apply-change` 可以选择 task、读取 change 上下文并更新正式完成状态。其他 skills 只能作为当前 task 的执行方法。
- `.superpowers/sdd/` 下的 gitignored ledger 只能用于执行恢复，不得替代 OpenSpec `tasks.md`；task 完成后必须立即更新 OpenSpec checkbox。

### 阶段内调用规则

1. 新功能或范围、方案、成功标准不清晰时，在 `openspec-explore` 阶段使用 `brainstorming` 澄清需求和比较方案；正式结论通过 `openspec-propose` 写入 OpenSpec artifacts。
2. 缺陷根因未知时，可以先使用 `systematic-debugging` 执行只读诊断；确认根因后，任何仓库修改仍必须先创建或更新 OpenSpec change 并取得 artifacts 确认。
3. artifacts 获得确认后，使用 `openspec-apply-change` 按依赖顺序实施。根据 task 性质使用 `test-driven-development`、`systematic-debugging` 和 `requesting-code-review`；需要多代理或批次执行时，可以选用 `subagent-driven-development` 或 `executing-plans`，但不得产生第二套正式 task 状态。
4. 每个 task 只有在实现完成且相关 fresh verification 通过后才能勾选；agent 或 subagent 的完成声明不能替代测试、静态检查、构建或需求核对证据。

### Midscene UI TDD

- OpenSpec task 新增或修改用户可见 UI、交互状态、布局或视觉反馈时，必须在 `openspec-apply-change` 下同时使用 `test-driven-development` 与 `midscene-tdd`；后者只是当前 task 的验收方法，OpenSpec `tasks.md` 仍是唯一正式状态。
- 日常 React WebView UI task 必须使用 `@midscene/web` + Playwright：确定性 Playwright assertion 与 Midscene 语义场景都必须在实现前因目标行为缺失而出现有效 RED，并在最小实现后使用相同 assertions 与 prompts 取得 GREEN；不得通过放宽 prompt、删除 assertion 或只看截图伪造 GREEN。
- 本地可见 UI task 的 Midscene Web 验收是完成硬门禁。CI 必须始终运行确定性 Playwright；只有 `MIDSCENE_MODEL_*` 配置可用时才运行 Midscene job，缺少配置时必须明确标记 `skipped` 及原因，不得标记为通过。
- 本地 Midscene 模型可以使用受保护的 `MIDSCENE_MODEL_*` 环境配置或 `codex://app-server`；CI 只使用受保护 secrets，任何完成证据都不得打印敏感配置值。
- `@midscene/computer` 只用于真实 Tauri `.app` 的里程碑、发布候选或原生能力验收，不进入每个普通 UI task。执行前必须完成 connect health check、截图、前台目标应用、正确显示器、未锁屏画面和 macOS Accessibility 权限确认。
- Midscene assertion 失败会阻止 task 完成；模型、浏览器、fixture、权限或自动化基础设施不可用时必须保留证据并报告 `BLOCKED`，不得无界重试或将基础设施错误当作 RED/GREEN。
- Midscene 报告、截图、日志和缓存只作为诊断与 fresh evidence；不得提交 `midscene_run/`、真实 `.env`、API Key 或模型 secrets。完成证据只记录命令、结果和本地或 CI artifact 路径。
- M0 工程初始化前，skills 与流程规则不等于测试可运行。M0 必须通过已确认的 OpenSpec change 安装 `@midscene/web`、`playwright`、`@playwright/test` 与 `@midscene/computer`，并建立 fixture、reporter、稳定数据、固定 viewport、Web/Desktop 命令和条件式 CI job。

### 漂移与完成门禁

- 实施发现 scope、specs、design 或 tasks 需要变化时，立即停止受影响 task，使用 `openspec-update-change` 提出并保持 artifacts 一致；获得用户重新明确确认后，才能恢复 `openspec-apply-change`。
- 完成顺序固定为：task 级 fresh verification → `openspec-verify-change` 检查 completeness、correctness 和 coherence → 解决所有 CRITICAL 与 WARNING → `openspec validate --all --strict` → `openspec-sync-specs` → `openspec-archive-change` → `finishing-a-development-branch`。
- `verification-before-completion` 提供测试、静态检查和构建的 fresh evidence；`openspec-verify-change` 检查实现与 requirements、scenarios、design 和 tasks 的一致性，两者不能互相替代。
- WARNING 必须修复，或在 `design.md` 中记录接受理由和影响。即使通用 archive skill 允许确认后继续，只要 tasks 未完成、检查失败、存在未解决的 CRITICAL 或 strict validation 失败，就不得 sync 或 archive。

## Artifact 写作规则

- 叙述性正文和任务描述使用中文。
- `MUST`、`SHALL`、`GIVEN`、`WHEN`、`THEN`、`AND` 等规范关键词保留英文。
- 技术术语、产品名、协议名、命令、文件路径和代码标识符可以使用英文。
- Requirement 和 Scenario 标题使用中文，必要的技术名词可以保留英文。
- 不得手工修改 `.agents/skills/openspec-*`；只能通过官方 OpenSpec CLI 生成或更新。


## Pull Reqeust 提交规范

- Branch base 分支必须是 main
- 每次创建 Pull Reqeust 前需要先 rebase 最新的 main 分支代码到当前分支
- PR title 必须以如下格式设置
  - <type>[scope]: <description>
    - type 类型：
      - feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
  - 示例：feat(auth): 增加用户登录功能
- 提交 Pull Reqeust 前，需要将本次的 commit 通过 git rebase 命令合并成一个 commit 再提交 PR
- commit summary 需要与 PR title 保持一致
- commit 必须携带 description
  - 主要解释 为什么 做这个改动（比“做了什么”更重要）
  - 可以多行，用空行分段
  - 可以包含：实现思路，相关背景，副作用或注意事项，测试方式
  - 格式要求：符合 Markdown 要求的格式
- Branch name 需要符合：<type>/<short-description>
  - 示例：feat/user-profile-page
