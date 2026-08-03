## ADDED Requirements

### Requirement: 按 lock 拉取并缓存上游源码
仓库 MUST 提供 `scripts/fetch-pinned-kimi-code.mjs`，并以 `backend/kimi-code/upstream-lock.json` 中的 `repository` 与完整 `commit` 为唯一拉取目标，将源码置于 `backend/kimi-code/.cache/src`。

#### Scenario: 首次成功拉取
- **WHEN** cache 目录不存在且 lock 校验通过
- **THEN** 脚本从 lock 中的 `repository` clone 到 `backend/kimi-code/.cache/src`，并将 HEAD 置于 lock 的完整 `commit`，以退出码 0 结束

#### Scenario: 复用已有 cache 增量更新
- **WHEN** `backend/kimi-code/.cache/src` 已存在且 `origin` remote 与 lock.repository 一致
- **THEN** 脚本 fetch 后 checkout 到 pin commit，不得重新 clone 到其他路径，并以退出码 0 结束

#### Scenario: 拒绝非 lock 来源
- **WHEN** 调用方试图依赖本机任意 kimi-code 目录、`~/.kimi-code` 或未写入 lock 的路径作为上游事实来源
- **THEN** 脚本 MUST NOT 将这些路径视为合法输入，只操作约定 cache 路径

### Requirement: 校验 remote 身份
在更新或验收 cache 时，脚本 MUST 校验 `origin` remote URL 与 lock 中的 `repository` 一致（允许规范化后的 `.git` 后缀等价），不一致时 MUST 以非 0 退出且不得静默改写 remote。

#### Scenario: remote 与 pin 一致
- **WHEN** 规范化后的 `origin` URL 等于 lock.repository
- **THEN** remote 校验通过并继续 checkout 流程

#### Scenario: remote 与 pin 不一致
- **WHEN** cache 的 `origin` URL 指向其他仓库或 host
- **THEN** 脚本以非 0 退出，输出期望与实际 remote，且不得继续当作成功 checkout

### Requirement: detached checkout 到 pin commit
脚本 MUST 将 cache worktree 置于 detached HEAD，且 `HEAD` 的完整 SHA MUST 等于 lock 中的 `commit`。

#### Scenario: checkout 成功
- **WHEN** pin commit 在本地对象库中可达
- **THEN** worktree 为 detached HEAD，且 `git rev-parse HEAD` 等于 lock.commit

#### Scenario: commit 不可达
- **WHEN** 本地与（非 offline 时的）fetch 后仍无法解析 pin commit
- **THEN** 脚本以非 0 退出并标注 checkout 失败阶段

### Requirement: 要求 clean worktree
脚本在成功退出前 MUST 确认 cache worktree 干净：`git status --porcelain` 输出为空；存在已修改或未跟踪文件时 MUST 失败。

#### Scenario: worktree 干净
- **WHEN** porcelain 状态为空
- **THEN** clean 校验通过且脚本可以成功退出

#### Scenario: worktree 不干净
- **WHEN** 存在已修改或未跟踪文件
- **THEN** 脚本以非 0 退出，标注 worktree 阶段，且默认不得自动 `git clean` 或 force reset

### Requirement: 失败语义与离线模式可预期
脚本 MUST 在 lock 非法、clone/fetch 失败、remote 不匹配、checkout 失败或 dirty worktree 时以非 0 退出并给出可定位阶段的错误信息；MUST 支持 `--offline`：仅在本地已含 pin commit 时完成校验，缺少对象时失败且不得静默跳过。

#### Scenario: lock 非法
- **WHEN** upstream lock 未通过 schema 或业务规则校验
- **THEN** fetch 脚本在访问网络或改动 cache 之前以非 0 退出

#### Scenario: 离线且对象齐全
- **WHEN** 使用 `--offline` 且本地 cache 已含 pin commit 与正确 remote
- **THEN** 脚本不访问网络即可完成 detached checkout 与 clean 校验并以 0 退出

#### Scenario: 离线但缺少 commit
- **WHEN** 使用 `--offline` 且本地无法解析 pin commit
- **THEN** 脚本以非 0 退出并说明需要网络 fetch

### Requirement: 文档说明 B0.2 边界
`backend/kimi-code/README.md` MUST 说明 fetch 命令、canonical cache 路径、失败语义，并 MUST 声明 toolchain 校验属于 B0.3、SEA 构建属于 B1。

#### Scenario: 阅读上游文档
- **WHEN** 开发者阅读 `backend/kimi-code/README.md`
- **THEN** 文档给出 `node scripts/fetch-pinned-kimi-code.mjs` 用法、`.cache/src` 路径，以及 B0.2 与 B0.3/B1 的职责划分
