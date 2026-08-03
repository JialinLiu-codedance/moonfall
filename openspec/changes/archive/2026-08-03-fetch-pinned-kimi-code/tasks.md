## 1. Fetch 脚本核心流程

- [x] 1.1 新增 `scripts/fetch-pinned-kimi-code.mjs`：解析仓库根与 `--lock` / `--offline`，先校验 upstream lock（import `validateUpstreamLock` 或调用 verify 脚本），失败时非 0 退出且不改 cache
- [x] 1.2 实现 clone/fetch：cache 不存在时 clone 到 `backend/kimi-code/.cache/src`；已存在时校验规范化后的 `origin` URL 与 lock.repository，一致则 fetch，不一致则失败且不改 remote
- [x] 1.3 实现 detached checkout 到 pin commit，断言 `HEAD` 等于 lock.commit；实现 clean worktree 校验（`git status --porcelain` 为空）与分阶段错误输出；成功时打印 path/repository/commit 并 exit 0

## 2. 文档

- [x] 2.1 更新 `backend/kimi-code/README.md`：补充 fetch 命令、`.cache/src` 为唯一 canonical checkout、失败语义、`--offline`，以及 B0.2 / B0.3 / B1 职责边界

## 3. 验证与收尾

- [x] 3.1 成功路径：运行 `node scripts/fetch-pinned-kimi-code.mjs`，确认 HEAD、porcelain、remote 与 lock 一致；再跑 `node scripts/verify-upstream-lock.mjs` 确认仍通过
- [x] 3.2 失败路径：在临时/可清理环境验证 remote 错配、dirty worktree、非法 lock、offline 缺 commit 均以非 0 退出；清理临时脏状态，不提交 cache
- [x] 3.3 运行 `openspec-verify-change`，修复全部 CRITICAL；WARNING 修复或在 `design.md` 记录接受理由
- [x] 3.4 运行 `openspec validate --all --strict` 并确保通过
- [x] 3.5 使用 `openspec-sync-specs` 同步 `kimi-upstream-fetch` 到主 specs
- [x] 3.6 使用 `openspec-archive-change` 归档本 change
