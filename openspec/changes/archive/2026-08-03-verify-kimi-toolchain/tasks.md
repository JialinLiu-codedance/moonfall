## 1. 工具链校验脚本

- [x] 1.1 新增 `scripts/verify-kimi-toolchain.mjs`：解析仓库根与 `--lock`，先 import `validateUpstreamLock` 校验 lock；再校验 `backend/kimi-code/.cache/src` 存在、`HEAD` 等于 pin 且 worktree 干净；失败时非 0 退出且不改 cache
- [x] 1.2 实现 platform / node / pnpm 精确匹配：darwin+arm64、规范化 Node 版本、`pnpm --version` 与 `pnpm@x.y.z` 解析版本；分阶段错误标签 `platform` / `node` / `pnpm`
- [x] 1.3 实现 source/lockfile 一致性：校验 cache 内 `pnpm-lock.yaml`、根 `packageManager`、`.nvmrc`、`apps/kimi-code` version 与 lock 一致；成功时打印摘要并 exit 0

## 2. 文档

- [x] 2.1 更新 `backend/kimi-code/README.md`：补充 B0.3 命令、阶段错误表、本机 Node/pnpm 对齐提示、升级失败规则与推荐升级路径，以及 B0.1/B0.2/B0.3/B1 职责边界

## 3. 验证与收尾

- [x] 3.1 失败路径：在当前或故意错误的 Node/pnpm、错误 lock 副本、缺失/错误 checkout 场景下运行脚本，确认非 0 且阶段标签正确；不污染仓库 pin 与 cache
- [x] 3.2 成功路径：在 PATH 提供 Node `24.15.0` 与 pnpm `10.33.0` 后运行 `node scripts/verify-kimi-toolchain.mjs` 确认 exit 0；回归 `verify-upstream-lock` 与 `fetch-pinned-kimi-code --offline`
- [x] 3.3 运行 `openspec-verify-change`，修复全部 CRITICAL；WARNING 修复或在 `design.md` 记录接受理由
- [x] 3.4 运行 `openspec validate --all --strict` 并确保通过
- [x] 3.5 使用 `openspec-sync-specs` 同步 `kimi-upstream-toolchain` 到主 specs
- [x] 3.6 使用 `openspec-archive-change` 归档本 change
