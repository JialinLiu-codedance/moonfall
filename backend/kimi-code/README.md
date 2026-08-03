# Kimi Code 上游锁定（B0.1）

本目录保存 Moonfall 对 [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code) 的可审计 pin。

## 唯一事实来源

| 文件 | 作用 |
| --- | --- |
| `upstream-lock.json` | 进入 Git 的上游 pin 实例 |
| `upstream-lock.schema.json` | lock 字段 schema |
| `../../scripts/verify-upstream-lock.mjs` | 本地 schema 与业务规则校验 |

**唯一 pin 来源是 `upstream-lock.json` 中的 `repository` + 完整 `commit`。**

不要把下列内容当作上游锁定：

- 本机 `~/.kimi-code`
- 本机已安装的 `kimi` CLI
- 任意本地 checkout 目录（例如开发者自己的 `kimi-code` 工作树）
- branch 名、浮动 tag 或短 SHA

`refNote` 仅供人类阅读，不得参与 pin 决策。

## 当前 pin

见 `upstream-lock.json`。B0.1 首份锁定内容包括：

- repository: `https://github.com/MoonshotAI/kimi-code.git`
- commit: 完整 40 位 SHA
- kimiCodeVersion / toolchain.node / toolchain.packageManager
- upstreamTarget: `darwin-arm64`

## 校验

```bash
node scripts/verify-upstream-lock.mjs
```

可选：校验任意 lock 样本（用于失败用例）：

```bash
node scripts/verify-upstream-lock.mjs --lock /path/to/sample.json
```

成功退出码为 `0`，失败为非 `0`，并打印字段级错误。

本脚本 **不访问网络、不调用 git**。远程身份、detached checkout 与 clean worktree 校验属于 B0.2。

## 升级上游 commit

1. 选定目标完整 commit SHA（禁止 branch / 浮动 tag）。
2. 从该 commit 读取：
   - `apps/kimi-code/package.json` → `kimiCodeVersion`
   - `.nvmrc` → `toolchain.node`
   - 根 `package.json` → `toolchain.packageManager`
3. 更新 `upstream-lock.json` 的 `commit`、version/toolchain 字段、`recordedAt` 与可选 `refNote`。
4. 运行 `node scripts/verify-upstream-lock.mjs`。
5. 通过独立 OpenSpec change 完成后续 B0.2 拉取校验、B0.3 工具链校验，以及需要时的 B1/B2 重建。

## 工作包职责边界

| 工作包 | 职责 |
| --- | --- |
| **B0.1（本目录）** | 定义 schema、写入 pin、本地 lock 校验 |
| **B0.2** | 按 pin 拉取/缓存上游，校验 remote、detached checkout、clean worktree |
| **B0.3** | 校验 Node、pnpm、platform、lockfile 与升级失败规则 |

缓存目录约定（由 B0.2 使用，已在仓库 `.gitignore` 中忽略）：

- `backend/kimi-code/.cache/`
- `.cache/kimi-code/`
