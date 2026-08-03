# Kimi Code 上游锁定与拉取（B0.1 / B0.2 / B0.3）

本目录保存 Moonfall 对 [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code) 的可审计 pin，以及按 pin 拉取后的本地 cache 与工具链门禁约定。

## 唯一事实来源

| 文件 / 路径 | 作用 |
| --- | --- |
| `upstream-lock.json` | 进入 Git 的上游 pin 实例 |
| `upstream-lock.schema.json` | lock 字段 schema |
| `../../scripts/verify-upstream-lock.mjs` | 本地 schema 与业务规则校验（B0.1） |
| `../../scripts/fetch-pinned-kimi-code.mjs` | 按 pin 拉取并校验 checkout（B0.2） |
| `../../scripts/verify-kimi-toolchain.mjs` | 校验 Node / pnpm / platform / source（B0.3） |
| `.cache/src/` | **唯一** canonical 上游 checkout（gitignore，不进仓库） |

**唯一 pin 来源是 `upstream-lock.json` 中的 `repository` + 完整 `commit`。**

不要把下列内容当作上游锁定或构建输入：

- 本机 `~/.kimi-code`
- 本机已安装的 `kimi` CLI
- 任意本地 checkout 目录（例如开发者自己的 `kimi-code` 工作树）
- branch 名、浮动 tag 或短 SHA
- 仓库根下的 `.cache/kimi-code/`（B0.1 预留忽略路径，**B0.2/B0.3 不使用**）

`refNote` 仅供人类阅读，不得参与 pin 决策。

## 当前 pin

见 `upstream-lock.json`。首份锁定内容包括：

- repository: `https://github.com/MoonshotAI/kimi-code.git`
- commit: 完整 40 位 SHA
- kimiCodeVersion / toolchain.node / toolchain.packageManager
- upstreamTarget: `darwin-arm64`

## B0.1：校验 lock

```bash
node scripts/verify-upstream-lock.mjs
```

可选：校验任意 lock 样本（用于失败用例）：

```bash
node scripts/verify-upstream-lock.mjs --lock /path/to/sample.json
```

成功退出码为 `0`，失败为非 `0`，并打印字段级错误。

本脚本 **不访问网络、不调用 git**。

## B0.2：拉取 pin 并校验 checkout

```bash
node scripts/fetch-pinned-kimi-code.mjs
```

行为：

1. 校验 `upstream-lock.json`（复用 B0.1 规则）。
2. 若不存在则 `git clone` 到 `backend/kimi-code/.cache/src`；若已存在则校验 `origin` 后 `git fetch --tags origin`。
3. `git checkout --detach <commit>`，断言 `HEAD` 等于 lock.commit。
4. 断言 `git status --porcelain` 为空。
5. 成功时打印 path / repository / commit，退出码 `0`。

### 选项

| 选项 | 含义 |
| --- | --- |
| `--lock <path>` | 使用指定 lock 文件（测试用） |
| `--offline` | 不访问网络；本地 cache 必须已含 pin commit 与正确 remote |

### 失败语义（阶段标签）

| 阶段 | 典型原因 |
| --- | --- |
| `lock` | schema 或业务规则失败 |
| `clone` / `fetch` | 网络或 git 失败；offline 且 cache 不存在 |
| `remote` | `origin` URL 与 lock.repository 不一致（不会静默改 remote） |
| `checkout` | commit 不可达或 HEAD 不匹配 |
| `worktree` | 工作树不干净 |

**默认不会** `git clean` 或 force reset。若 worktree 脏了，请手动清理，或删除 cache 后重跑：

```bash
rm -rf backend/kimi-code/.cache/src
node scripts/fetch-pinned-kimi-code.mjs
```

### 成功后自检

```bash
CACHE=backend/kimi-code/.cache/src
git -C "$CACHE" rev-parse HEAD          # 应等于 lock.commit
git -C "$CACHE" status --porcelain      # 应为空
git -C "$CACHE" remote get-url origin   # 应与 lock.repository 等价
```

## B0.3：校验工具链与源码元数据

```bash
node scripts/verify-kimi-toolchain.mjs
```

前置：B0.2 已在 `backend/kimi-code/.cache/src` 得到 clean detached pin checkout。

行为：

1. 校验 `upstream-lock.json`（复用 B0.1）。
2. 校验 cache 存在、`HEAD` 等于 pin、worktree 干净（不 fetch / 不 clean）。
3. 校验宿主为 `darwin` + `arm64`（对应 `upstreamTarget: darwin-arm64`）。
4. 校验本机 Node 版本与 `toolchain.node` **字符串精确相等**（禁止 semver 近似通过）。
5. 校验 PATH 上 `pnpm --version` 与 `toolchain.packageManager`（`pnpm@x.y.z`）精确相等。
6. 校验 cache 内：
   - 存在 `pnpm-lock.yaml`
   - 根 `package.json#packageManager` 等于 lock
   - `.nvmrc` 等于 `toolchain.node`
   - `apps/kimi-code/package.json#version` 等于 `kimiCodeVersion`
7. 成功时打印摘要，退出码 `0`。

### 选项

| 选项 | 含义 |
| --- | --- |
| `--lock <path>` | 使用指定 lock 文件（测试用） |
| `--cache <path>` | 使用指定 checkout 路径（测试用） |

本脚本 **不访问网络、不安装依赖、不构建 SEA、不修改 cache 或 lock**。

### 失败语义（阶段标签）

| 阶段 | 典型原因 |
| --- | --- |
| `lock` | schema 或业务规则失败 |
| `checkout` | 缺少 cache、HEAD 不匹配或 worktree 脏 |
| `platform` | 宿主不是 darwin-arm64 |
| `node` | 本机 Node 与 lock 不完全相等 |
| `pnpm` | pnpm 不在 PATH 或版本与 lock 不完全相等 |
| `source` | `pnpm-lock.yaml` / packageManager / `.nvmrc` / kimi version 与 lock 不一致 |

### 本机对齐 pin 工具链

当前 pin 见 `upstream-lock.json` 的 `toolchain` 字段（例如 Node `24.15.0`、`pnpm@10.33.0`）。安装方式任选其一，脚本只检查 **当前 PATH 解析到的版本**：

```bash
# 示例：nvm + corepack（非唯一方式）
nvm install 24.15.0
nvm use 24.15.0
corepack enable
corepack prepare pnpm@10.33.0 --activate
node -v    # v24.15.0
pnpm -v    # 10.33.0
```

### 升级失败规则

下列情况 **必须失败**，不得静默继续 B1：

1. 本机 Node 或 pnpm 与 lock 不完全相等（包括 major 相同但 patch 不同）。
2. 宿主不是 Apple Silicon macOS（`darwin-arm64`）。
3. 只更新了 `commit`，未同步 `toolchain.*` 或 `kimiCodeVersion`，导致 cache 源码元数据与 lock 不一致。
4. 尚未建立 B0.2 clean checkout，或 checkout 已脏 / HEAD 漂移。

## 升级上游 commit

1. 选定目标完整 commit SHA（禁止 branch / 浮动 tag）。
2. 从该 commit 读取：
   - `apps/kimi-code/package.json` → `kimiCodeVersion`
   - `.nvmrc` → `toolchain.node`
   - 根 `package.json` → `toolchain.packageManager`
3. 更新 `upstream-lock.json` 的 `commit`、version/toolchain 字段、`recordedAt` 与可选 `refNote`。
4. 运行 `node scripts/verify-upstream-lock.mjs`。
5. 运行 `node scripts/fetch-pinned-kimi-code.mjs` 刷新 cache。
6. 运行 `node scripts/verify-kimi-toolchain.mjs` 确认本机工具链与源码元数据。
7. 需要时通过独立 OpenSpec change 执行 B1/B2 重建。

推荐顺序：

```text
更新 lock
  → verify-upstream-lock
  → fetch-pinned-kimi-code
  → verify-kimi-toolchain
  → B1
```

## 工作包职责边界

| 工作包 | 职责 |
| --- | --- |
| **B0.1** | 定义 schema、写入 pin、本地 lock 校验 |
| **B0.2** | 按 pin 拉取/缓存上游，校验 remote、detached checkout、clean worktree |
| **B0.3** | 校验 Node、pnpm、platform、lockfile/源码元数据与升级失败规则 |
| **B1** | 构建 Kimi Web / SEA / smoke / manifest |

B0.3 **不**安装依赖，**不**构建 SEA 或 App。

## 缓存路径

| 路径 | 状态 |
| --- | --- |
| `backend/kimi-code/.cache/src` | B0.2/B0.3 **唯一** canonical checkout |
| `backend/kimi-code/.cache/` | gitignore 父目录 |
| `.cache/kimi-code/` | 仅 gitignore 预留，B0.2/B0.3 不使用 |
