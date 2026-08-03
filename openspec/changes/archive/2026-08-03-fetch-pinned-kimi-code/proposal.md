## Why

B0.1 已将 Kimi Code 上游固定为可审计的 lock 文件，但仓库仍无法按 pin 拉取并得到可校验的本地源码树。B0.2 需要把 lock 中的 `repository` + 完整 commit 变成干净的 detached checkout，否则 B0.3 工具链校验与 B1 SEA 构建缺少唯一合法输入。

## What Changes

- 新增 `kimi-upstream-fetch` capability：按 `upstream-lock.json` 拉取/缓存上游，并校验 remote 身份、detached HEAD 与 clean worktree。
- 新增 `scripts/fetch-pinned-kimi-code.mjs` 作为唯一机读入口：读 lock、clone 或 fetch、checkout 到 pin commit、失败时非 0 退出。
- 使用约定缓存路径 `backend/kimi-code/.cache/src`（已在 `.gitignore` 中忽略），不把上游源码提交进 Git。
- 更新 `backend/kimi-code/README.md`：补充 B0.2 命令、缓存布局、失败语义，以及与 B0.3 的职责边界。
- 不实现 Node/pnpm/platform/lockfile 校验（B0.3），不构建 Kimi Web/SEA（B1），不初始化 App（A0）。

## Capabilities

### New Capabilities
- `kimi-upstream-fetch`: 按上游 lock 拉取并缓存 Kimi Code，校验 remote URL、detached checkout 到 pin commit，以及 clean worktree；定义成功与失败语义。

### Modified Capabilities
- （无）本 change 不修改 `kimi-upstream-lock` 的 requirement；lock 文件与 schema 校验仍是唯一 pin 输入，fetch 只消费它们。

## Impact

- 影响范围：`scripts/fetch-pinned-kimi-code.mjs`、`backend/kimi-code/README.md`、OpenSpec 新 capability；运行时写入 `backend/kimi-code/.cache/`（不进 Git）。
- 上游 pin：继续消费 B0.1 锁定的 `https://github.com/MoonshotAI/kimi-code.git` @ `75395f6abb17f83f30d16b51f4e060a639f43622`。
- 依赖：系统 `git`、网络访问 GitHub（cache 已含目标对象时可离线校验）；复用 `verify-upstream-lock` 确保 lock 合法。
- 下游：B0.3 必须以本脚本产出的 clean detached checkout 为工具链校验输入；B1 构建不得使用本机任意 kimi-code 目录。
- 非目标：不修改 lock schema/内容；不校验 toolchain；不引入重量级依赖或 monorepo 测试框架。
