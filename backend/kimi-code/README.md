# Kimi Code 上游锁定与拉取（B0.1 / B0.2）

本目录保存 Moonfall 对 [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code) 的可审计 pin，以及按 pin 拉取后的本地 cache 约定。

## 唯一事实来源

| 文件 / 路径 | 作用 |
| --- | --- |
| `upstream-lock.json` | 进入 Git 的上游 pin 实例 |
| `upstream-lock.schema.json` | lock 字段 schema |
| `../../scripts/verify-upstream-lock.mjs` | 本地 schema 与业务规则校验（B0.1） |
| `../../scripts/fetch-pinned-kimi-code.mjs` | 按 pin 拉取并校验 checkout（B0.2） |
| `.cache/src/` | **唯一** canonical 上游 checkout（gitignore，不进仓库） |

**唯一 pin 来源是 `upstream-lock.json` 中的 `repository` + 完整 `commit`。**

不要把下列内容当作上游锁定或构建输入：

- 本机 `~/.kimi-code`
- 本机已安装的 `kimi` CLI
- 任意本地 checkout 目录（例如开发者自己的 `kimi-code` 工作树）
- branch 名、浮动 tag 或短 SHA
- 仓库根下的 `.cache/kimi-code/`（B0.1 预留忽略路径，**B0.2 不使用**）

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

## 升级上游 commit

1. 选定目标完整 commit SHA（禁止 branch / 浮动 tag）。
2. 从该 commit 读取：
   - `apps/kimi-code/package.json` → `kimiCodeVersion`
   - `.nvmrc` → `toolchain.node`
   - 根 `package.json` → `toolchain.packageManager`
3. 更新 `upstream-lock.json` 的 `commit`、version/toolchain 字段、`recordedAt` 与可选 `refNote`。
4. 运行 `node scripts/verify-upstream-lock.mjs`。
5. 运行 `node scripts/fetch-pinned-kimi-code.mjs` 刷新 cache。
6. 通过独立 OpenSpec change 完成 B0.3 工具链校验，以及需要时的 B1/B2 重建。

## 工作包职责边界

| 工作包 | 职责 |
| --- | --- |
| **B0.1** | 定义 schema、写入 pin、本地 lock 校验 |
| **B0.2（本脚本）** | 按 pin 拉取/缓存上游，校验 remote、detached checkout、clean worktree |
| **B0.3** | 校验 Node、pnpm、platform、lockfile 与升级失败规则 |
| **B1** | 构建 Kimi Web / SEA / smoke / manifest |

B0.2 **不**校验本机 toolchain，**不**构建 SEA 或 App。

## 缓存路径

| 路径 | 状态 |
| --- | --- |
| `backend/kimi-code/.cache/src` | B0.2 **唯一** canonical checkout |
| `backend/kimi-code/.cache/` | gitignore 父目录 |
| `.cache/kimi-code/` | 仅 gitignore 预留，B0.2 不使用 |
