## Purpose

定义 Moonfall 对本机 Node / pnpm / platform 以及 B0.2 cache 内 lockfile 与源码元数据相对 `upstream-lock.json` 的精确一致性校验、失败语义与升级失败规则，使 B1 SEA 构建拥有合法工具链前提。

## Requirements

### Requirement: 校验本机 Node 精确匹配 lock
仓库 MUST 提供 `scripts/verify-kimi-toolchain.mjs`，并 MUST 将规范化后的本机 Node 版本与 `backend/kimi-code/upstream-lock.json` 中的 `toolchain.node` 做字符串精确比较；版本不一致时 MUST 以非 0 退出。

#### Scenario: Node 版本匹配
- **WHEN** 本机 `process.version` 去掉前导 `v` 后等于 lock 的 `toolchain.node`
- **THEN** Node 校验通过并继续后续阶段

#### Scenario: Node 版本不匹配
- **WHEN** 本机 Node 版本与 lock 的 `toolchain.node` 不完全相等
- **THEN** 脚本以非 0 退出，错误信息标注阶段 `node`，并打印期望与实际版本

### Requirement: 校验本机 pnpm 精确匹配 lock
脚本 MUST 解析 PATH 上的 `pnpm --version`，并 MUST 与 lock 中 `toolchain.packageManager`（`pnpm@x.y.z`）所声明的版本精确相等；pnpm 不可用或版本不一致时 MUST 以非 0 退出。

#### Scenario: pnpm 版本匹配
- **WHEN** `pnpm --version` 输出的版本等于 lock `toolchain.packageManager` 去掉 `pnpm@` 前缀后的版本
- **THEN** pnpm 校验通过并继续后续阶段

#### Scenario: pnpm 缺失或版本错误
- **WHEN** PATH 上找不到 pnpm，或版本与 lock 不完全相等
- **THEN** 脚本以非 0 退出并标注阶段 `pnpm`

### Requirement: 校验宿主 platform 匹配 darwin-arm64
当 lock 的 `upstreamTarget` 为 `darwin-arm64` 时，脚本 MUST 要求 `process.platform` 为 `darwin` 且 `process.arch` 为 `arm64`，否则 MUST 以非 0 退出。

#### Scenario: 平台匹配
- **WHEN** 宿主为 darwin arm64 且 lock.upstreamTarget 为 `darwin-arm64`
- **THEN** platform 校验通过

#### Scenario: 平台不匹配
- **WHEN** 宿主 platform 或 arch 不满足 darwin-arm64
- **THEN** 脚本以非 0 退出并标注阶段 `platform`

### Requirement: 校验 cache 源码元数据与 lockfile 一致性
脚本 MUST 以 `backend/kimi-code/.cache/src` 为唯一 checkout 输入，并 MUST 校验：存在 `pnpm-lock.yaml`；根 `package.json` 的 `packageManager` 等于 lock；`.nvmrc` 等于 `toolchain.node`；`apps/kimi-code/package.json` 的 `version` 等于 `kimiCodeVersion`。任一项不一致时 MUST 以非 0 退出。

#### Scenario: 源码元数据与 lock 一致
- **WHEN** cache 存在且上述字段均与 lock 精确匹配
- **THEN** source/lockfile 校验通过

#### Scenario: version 或 packageManager 漂移
- **WHEN** cache 内 kimi version、packageManager 或 `.nvmrc` 与 lock 不一致，或缺少 `pnpm-lock.yaml`
- **THEN** 脚本以非 0 退出并标注阶段 `source`

### Requirement: 要求合法 lock 与干净 pin checkout
脚本在工具链校验前 MUST 复用 upstream lock 校验，并 MUST 确认 cache checkout 的 `HEAD` 等于 lock.commit 且 worktree 干净；lock 非法、cache 缺失、HEAD 不匹配或 worktree 脏时 MUST 以非 0 退出，且 MUST NOT 自动 fetch、clean 或改写 cache。

#### Scenario: 前置条件满足
- **WHEN** lock 合法且 cache 为 pin commit 的 clean detached HEAD
- **THEN** 脚本进入 platform/node/pnpm/source 校验

#### Scenario: 缺少或错误的 checkout
- **WHEN** cache 不存在、HEAD 不等于 pin，或 worktree 不干净
- **THEN** 脚本以非 0 退出并标注阶段 `checkout`，提示先运行 `scripts/fetch-pinned-kimi-code.mjs`

### Requirement: 失败语义与升级规则可文档化
脚本 MUST 在各失败阶段输出可定位的阶段标签并以非 0 退出；`backend/kimi-code/README.md` MUST 说明 B0.3 命令、精确匹配规则、升级失败场景，以及推荐升级路径：更新 lock → verify-upstream-lock → fetch-pinned-kimi-code → verify-kimi-toolchain → B1。

#### Scenario: 阅读 B0.3 文档
- **WHEN** 开发者阅读 `backend/kimi-code/README.md`
- **THEN** 文档给出 `node scripts/verify-kimi-toolchain.mjs` 用法、阶段错误含义、本机工具链对齐提示，以及 B0.3 与 B0.1/B0.2/B1 的职责边界

#### Scenario: 升级未同步 toolchain 字段
- **WHEN** 维护者只更新 commit 而未同步 `toolchain` 或 `kimiCodeVersion` 后运行校验
- **THEN** 脚本因 source 不一致失败，文档将该行为列为升级失败规则

### Requirement: 不执行安装或构建
B0.3 脚本 MUST NOT 访问网络安装依赖，MUST NOT 执行 `pnpm install`，MUST NOT 构建 Kimi Web、SEA 或 App，MUST NOT 修改 lock 文件或 cache 内容。

#### Scenario: 成功完成工具链校验
- **WHEN** 全部校验阶段通过
- **THEN** 脚本仅打印校验摘要并以退出码 0 结束，不产生构建产物、不改动 cache
