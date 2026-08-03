## Why

Moonfall 的后端基座必须固定 Kimi Code 上游来源，否则后续 SEA 构建、协议基线与 App 集成无法审计和复现。V1 路线的首个工作包 B0.1 需要在仓库中建立完整 commit pin 与 version lock schema，作为 B0.2 拉取校验与 B0.3 工具链校验的唯一输入。

## What Changes

- 新增 `kimi-upstream-lock` capability，规定上游仓库、完整 commit 与 lock schema 的行为边界。
- 在 `backend/kimi-code/` 写入 `upstream-lock.schema.json` 与首份 `upstream-lock.json`。
- 新增 `scripts/verify-upstream-lock.mjs`，仅校验 lock 文件结构与字面约束，不访问网络、不操作 git。
- 新增 `backend/kimi-code/README.md`，说明升级步骤、失败语义以及与 B0.2/B0.3 的职责边界。
- 在 `.gitignore` 预留上游 cache / checkout 路径，避免后续脚本产物误入 Git。
- 不实现上游拉取、detached checkout、toolchain 校验、SEA 构建或 App 工程初始化。

## Capabilities

### New Capabilities
- `kimi-upstream-lock`: 定义 Kimi Code 上游仓库、完整 commit pin、version lock schema、校验失败语义与升级边界。

### Modified Capabilities
- （无）本 change 不修改现有 capability 的 requirement 语义；`v1-development-roadmap` 已授权 B0.1 工作包，无需 delta。

## Impact

- 影响范围：`backend/kimi-code/`、`scripts/verify-upstream-lock.mjs`、`.gitignore`、OpenSpec 新 capability。
- 上游 pin：`https://github.com/MoonshotAI/kimi-code.git` @ `75395f6abb17f83f30d16b51f4e060a639f43622`（Kimi Code `0.31.1`）。
- 下游依赖：B0.2 必须以本 lock 为唯一拉取目标；B0.3 必须以本 lock 中的 toolchain 字段为校验基线。
- 非目标：不修改 `.agents/skills/openspec-*`；不复用 `~/.kimi-code` 或本机已安装 CLI 作为上游事实来源。
