## ADDED Requirements

### Requirement: 仓库固定 Kimi Code 上游身份
仓库 MUST 以进入 Git 的 lock 文件固定 Kimi Code 上游仓库 URL 与完整 commit SHA，并 MUST NOT 以 branch 名、浮动 tag 或本机安装路径作为构建 pin。

#### Scenario: 读取上游 pin
- **WHEN** 开发者或脚本需要确定后端来源
- **THEN** 唯一事实来源是 `backend/kimi-code/upstream-lock.json` 中的 `repository` 与 40 位 `commit`

#### Scenario: 拒绝浮动引用作为 pin
- **WHEN** lock 文件试图使用 branch 名、短 SHA 或未解析 tag 作为 `commit`
- **THEN** 校验 MUST 失败且不得将该文件视为有效上游锁定

### Requirement: 定义 version lock schema
仓库 MUST 提供 `backend/kimi-code/upstream-lock.schema.json`，并 MUST 要求 lock 实例包含 `schemaVersion`、`repository`、`commit`、`kimiCodeVersion`、`toolchain.node`、`toolchain.packageManager`、`upstreamTarget` 与 `recordedAt`。

#### Scenario: schema 校验通过
- **WHEN** `upstream-lock.json` 字段齐全且符合 schema 与业务规则
- **THEN** `scripts/verify-upstream-lock.mjs` 以退出码 0 完成

#### Scenario: schema 校验失败
- **WHEN** lock 缺少必填字段、`repository` 不匹配、`commit` 非法或 `upstreamTarget` 不是 `darwin-arm64`
- **THEN** 校验脚本以非 0 退出码失败并输出可定位字段的错误信息

### Requirement: 首份 lock 指向可审计 commit
首份 `upstream-lock.json` MUST 将 `repository` 设为 `https://github.com/MoonshotAI/kimi-code.git`，将 `commit` 设为完整 SHA `75395f6abb17f83f30d16b51f4e060a639f43622`，并将 `kimiCodeVersion` 与 toolchain 字段设为该 commit 上的真实值。

#### Scenario: 检查首份 lock 内容
- **WHEN** 审查进入 Git 的首份 upstream lock
- **THEN** 文件记录 commit `75395f6abb17f83f30d16b51f4e060a639f43622`、`kimiCodeVersion` `0.31.1`、`toolchain.node` `24.15.0`、`toolchain.packageManager` `pnpm@10.33.0` 且 `upstreamTarget` 为 `darwin-arm64`

### Requirement: 升级与职责边界可文档化
仓库 MUST 提供升级说明，明确如何更换 commit，并 MUST 声明本 capability 不负责 git fetch、clean worktree 校验或本机 toolchain 匹配；这些行为分别属于后续 B0.2 与 B0.3。

#### Scenario: 升级上游 commit
- **WHEN** 维护者需要升级 Kimi Code 上游
- **THEN** 文档要求更新 lock 中的完整 commit 与对应 version/toolchain 字段，并重新通过 schema 校验

#### Scenario: 区分后续工作包职责
- **WHEN** 开发者阅读上游锁定说明
- **THEN** 文档明确 B0.1 只定义 lock 与 schema 校验，B0.2 负责拉取与 checkout 校验，B0.3 负责 Node/pnpm/lockfile/platform 校验
