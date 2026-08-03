## Context

B0.1 已在仓库内固定 `backend/kimi-code/upstream-lock.json` 与 `scripts/verify-upstream-lock.mjs`，并在 `.gitignore` 预留 `backend/kimi-code/.cache/`。当前没有按 pin 拉取上游的脚本；开发者可能误用本机 `~/project/kimi-code` 或 `~/.kimi-code`，二者都不是 Moonfall 可审计输入。

本 change 对应工作包 B0.2，只负责把 lock 变成干净的 detached checkout；不校验工具链、不构建 SEA。

## Goals / Non-Goals

**Goals:**

- 以 `upstream-lock.json` 为唯一 pin 来源，在约定 cache 路径得到目标 commit 的源码树。
- 校验 `origin` remote URL、detached HEAD 与 clean worktree。
- 提供单一 Node 脚本入口与字段/阶段级失败信息。
- 更新 README，固化 B0.2 命令与职责边界。

**Non-Goals:**

- 不校验本机 Node、pnpm、platform 或 `pnpm-lock.yaml`（B0.3）。
- 不构建 Kimi Web、SEA 或 Tauri App。
- 不修改 lock schema 或 pin 内容。
- 不默认 `git clean -fdx` 或破坏性重置用户任意目录。
- 不引入 ajv、vitest 等新依赖。

## Decisions

### 1. 缓存路径与布局

```text
backend/kimi-code/
  upstream-lock.json          # B0.1 pin（只读消费）
  upstream-lock.schema.json
  README.md
  .cache/                     # gitignored
    src/                      # 完整 git worktree（canonical checkout）
scripts/
  fetch-pinned-kimi-code.mjs  # B0.2 入口
  verify-upstream-lock.mjs    # B0.1 校验（被 import 或先调用）
```

**Canonical path**：`backend/kimi-code/.cache/src`。  
B0.1 还预留了 `.cache/kimi-code/`，本 change **不使用**该路径，避免双真相；README 标明唯一 checkout 为 `.cache/src`。

被否决：bare repo + separate worktree——多一层路径，B0.2 无收益。  
被否决：clone 到仓库外绝对路径——破坏可移植与 CI 约定。

### 2. 脚本流程

`node scripts/fetch-pinned-kimi-code.mjs`：

1. 解析仓库根与默认 lock 路径；支持 `--lock <path>`（测试用）。
2. 通过 import `validateUpstreamLock`（或子进程调用 verify 脚本）确保 lock 合法。
3. 读取 `repository` 与 `commit`。
4. 若 `backend/kimi-code/.cache/src` 不存在：`git clone <repository> <path>`。
5. 若已存在：
   - 确认是 git 目录；
   - 读取 `remote.origin.url`，规范化后与 lock.repository 比较（允许尾部 `.git` 与否的等价，但不允许不同 host/path）；
   - 不一致 → 失败，不自动改 remote；
   - 一致 → `git fetch --tags origin`（或等价 fetch 使 pin commit 可达）。
6. `git checkout --detach <commit>`（或 `git switch --detach`）。
7. 断言 `git rev-parse HEAD` 等于 pin commit。
8. 断言 `git status --porcelain` 为空；非空则失败。
9. 成功：stdout 打印 path、repository、commit，exit 0。

可选参数：

- `--offline`：不访问网络；仅当本地对象已含 pin commit 时完成 checkout 与校验，否则失败。
- **不提供**默认的 `--force-clean`；B0.2 要求 worktree 本就干净。若实施中发现无法恢复的脏树，文档说明手动清理 cache 后重跑。

### 3. 与 lock 校验的集成

优先 `import { validateUpstreamLock } from './verify-upstream-lock.mjs'`（B0.1 已 export），避免重复实现 schema 规则。若 import 不便，则子进程 `node scripts/verify-upstream-lock.mjs` 且要求 exit 0。

### 4. remote 比较规则

比较前规范化：

- trim
- 去掉末尾 `/`
- 若一侧无 `.git` 后缀而另一侧有，视为等价（仅针对该后缀）

精确匹配规范化后的 HTTPS URL 字符串；不把 SSH 与 HTTPS 视为等价（lock 固定 HTTPS）。

### 5. clone 深度策略

默认 **完整 clone**（或至少能解析任意 pin SHA 的 fetch），避免 shallow 导致历史 pin 不可达。  
若后续体积成为问题，由独立 change 引入 `blob:none` partial clone 等优化，不在 B0.2 引入。

### 6. 失败语义

| 阶段 | 条件 | 行为 |
| --- | --- | --- |
| lock | schema/业务规则失败 | 非 0，复用/转发 lock 字段错误 |
| clone/fetch | 网络或 git 失败 | 非 0，标注阶段 `clone`/`fetch` |
| remote | origin 与 pin 不一致 | 非 0，打印期望与实际 URL |
| checkout | commit 不存在或 HEAD 不匹配 | 非 0，阶段 `checkout` |
| worktree | porcelain 非空 | 非 0，阶段 `worktree`，列出简要 dirty 摘要 |

不静默删除无关目录；不把本机其他 kimi-code 路径当作 fallback。

### 7. 验证策略

- 成功路径：真实对 GitHub 执行一次 fetch，检查 HEAD、porcelain、remote。
- 失败路径：在临时目录构造错误 remote / dirty file / 错误 commit，确认非 0；不提交脏状态。
- 回归：`node scripts/verify-upstream-lock.mjs` 仍通过。

## Risks / Trade-offs

- [完整 clone 体积大、首次慢] → 接受；cache 复用后增量 fetch；路径 gitignored。
- [脏 worktree 导致反复失败] → 明确错误信息；文档指导删除 `.cache/src` 后重跑；不自动 force clean。
- [remote 被人手动改掉] → 严格失败，防止拉错上游。
- [GitHub 不可达] → `--offline` 仅在对象已存在时可用；否则失败并说明需要网络。
- [import 校验函数与 CLI 主逻辑耦合] → 保持 verify 脚本既可 CLI 也可 import，与 B0.1 一致。

## Migration Plan

- 无运行中服务迁移。
- 开发者首次运行 fetch 脚本即可建立 cache。
- 回滚：删除 `scripts/fetch-pinned-kimi-code.mjs` 与 README 相关段落，并 `rm -rf backend/kimi-code/.cache`；lock 文件不受影响。

## Open Questions

- 无阻塞问题。若用户确认 artifacts 时要求改用 bare+worktree 或允许 `--force-clean`，再更新 design 后实施。
