## Context

B0.1–B0.3 已归档：`upstream-lock.json` 固定 pin，`scripts/fetch-pinned-kimi-code.mjs` 产出 `backend/kimi-code/.cache/src` 的 clean detached checkout，`scripts/verify-kimi-toolchain.mjs` 校验 Node / pnpm / platform / source。当前 cache 无 `node_modules`，也无 `apps/kimi-web/dist` 或 `apps/kimi-code/dist-web`。

上游官方 native workflow（`.github/workflows/_native-build.yml`）在 SEA 构建前强制：

1. `pnpm install --frozen-lockfile`
2. `pnpm --filter @moonshot-ai/kimi-web run build`
3. `node apps/kimi-code/scripts/copy-web-assets.mjs`

本 change 对应工作包 B1.1，只把上述 Web assets 段变成 Moonfall 可重复机读入口；B1.2 再执行 `build:native:release`。

## Goals / Non-Goals

**Goals:**

- 提供 `scripts/build-kimi-web-assets.mjs` 作为 B1.1 唯一入口。
- 门禁 B0 lock + toolchain 后，在 pin cache 内 frozen install、官方 web build、官方 copy。
- 断言 `apps/kimi-code/dist-web/index.html` 存在；分阶段失败。
- 文档化命令、错误阶段与 B0/B1.2 边界。

**Non-Goals:**

- 不执行 `build:native:release` / `build:native:sea`。
- 不跑 `test:native:smoke`、`package:native`、manifest / Tauri staging。
- 不修改 lock pin 或 schema。
- 不初始化 Tauri / React App。
- 不维护剔除 Kimi Web 的上游 patch。
- 不引入 monorepo 测试框架或新 npm 依赖。

## Decisions

### 1. 入口与布局

```text
scripts/
  build-kimi-web-assets.mjs   # B1.1 入口
  verify-upstream-lock.mjs    # B0.1，复用
  fetch-pinned-kimi-code.mjs  # B0.2，前置不在本脚本内 clone
  verify-kimi-toolchain.mjs   # B0.3，门禁复用
backend/kimi-code/
  upstream-lock.json          # 只读
  README.md                   # 补充 B1.1
  .cache/src/                 # 唯一构建工作目录
    node_modules/             # install（gitignore）
    apps/kimi-web/dist/       # web build（gitignore）
    apps/kimi-code/dist-web/  # copy 目标（gitignore）
```

命令：`node scripts/build-kimi-web-assets.mjs`  
测试选项可保留 `--lock` / `--cache`（与 B0 一致），默认路径固定。

### 2. 执行顺序与阶段标签

1. **`lock`**：`validateUpstreamLock`（B0.1）。
2. **`toolchain`**：复用 B0.3 逻辑——优先子进程 `node scripts/verify-kimi-toolchain.mjs`（或 import 其校验函数，若已 export）；要求 exit 0。失败时转发/标注 `toolchain` 或保留 B0.3 原阶段标签（`checkout`/`platform`/`node`/`pnpm`/`source`）。
3. **`install`**：`cwd = cache`，`pnpm install --frozen-lockfile`。
4. **`web-build`**：同 cwd，`pnpm --filter @moonshot-ai/kimi-web run build`。
5. **`copy`**：同 cwd，`node apps/kimi-code/scripts/copy-web-assets.mjs`（官方实现，已断言 `kimi-web/dist/index.html`）。
6. **`verify`**：`stat` `apps/kimi-code/dist-web/index.html` 为文件；打印摘要，exit 0。

被否决：在 B0.3 脚本内顺带 install——违反 B0.3「不安装不构建」契约。  
被否决：手写 cp 替代 `copy-web-assets.mjs`——偏离官方 workflow。  
被否决：本 change 串联 `build:native:release`——跨 B1.2 边界。

### 3. 与 B0 门禁的集成方式

优先 **子进程调用** `verify-kimi-toolchain.mjs`，避免复制 platform/node/pnpm/source 规则；保持 B0.3 为工具链事实来源。  
若未来要减少进程开销，可再 export 共享函数；B1.1 不强制重构 B0.3。

### 4. worktree 洁净

上游 `.gitignore` 已忽略 `node_modules/`、`dist/`、`dist-web/`、`dist-native/`。B1.1 成功后 cache 的 `git status --porcelain` 应仍为空，使 B0.3 可重复作为门禁。若某上游脚本写出未忽略文件，视为实现 bug，须在 verify 阶段发现并处理（清理策略写入 tasks 证据，不得静默污染 pin 树）。

### 5. 文档

`backend/kimi-code/README.md` 增加 B1.1 节：

- 命令与前置（fetch + verify-toolchain + Node 24.15.0）
- 阶段错误表：`lock` / B0.3 阶段 / `install` / `web-build` / `copy` / `verify`
- 职责边界：B0 不安装；B1.1 只到 dist-web；B1.2 起 SEA

### 6. 验证策略

| 路径 | 做法 |
| --- | --- |
| 失败：错误 Node | 保持 PATH 为非 pin Node 时运行，期望非 0，不进入 install |
| 失败：缺 cache | 临时错误 `--cache` 或不存在路径，期望 `checkout`/`toolchain` 失败 |
| 成功 | Node 对齐 pin 后完整跑通；检查 `dist-web/index.html` |
| 回归 | `verify-upstream-lock`、`fetch-pinned-kimi-code --offline`、`verify-kimi-toolchain` |
| 范围 | 成功后不要求 `dist-native` 存在 |

### 7. 回滚

- 删除 `scripts/build-kimi-web-assets.mjs` 与 README B1.1 段落即可回滚仓库变更。
- cache 内 `node_modules` / dist 可用 `rm -rf backend/kimi-code/.cache/src` 后重跑 B0.2 恢复（不进 Git）。

## Risks / Trade-offs

| 风险 | 缓解 |
| --- | --- |
| 本机 Node ≠ 24.15.0（当前常见为 22.x） | 脚本硬门禁失败；文档写对齐步骤；实施前对齐 PATH |
| `pnpm install` 耗时长 / 网络不稳 | 允许正常耗时；frozen 失败即 `[install]` 退出；不改 lock |
| monorepo 依赖导致 filter build 失败 | 必须在 cache 根 install，禁止只装 kimi-web 子包 |
| 误扩展到 SEA | design/tasks/spec 写死非目标；verify 不检查 dist-native |
| 磁盘占用增大 | cache 已 gitignore；文档说明可删 `.cache` 重建 |

## Open Questions

- 无阻塞问题。可选：B1.2 是否复用同一编排脚本加子命令——留给 B1.2 design 决定，B1.1 只交付独立入口。
