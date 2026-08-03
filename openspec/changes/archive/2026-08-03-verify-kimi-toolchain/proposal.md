## Why

B0.1 已固定上游 pin，B0.2 已能按 pin 得到干净 detached checkout，但仓库仍无法证明本机构建环境与 lock 中的 Node、pnpm 精确一致，也无法校验 cache 内 lockfile / 源码 version 是否与 pin 对齐。B0.3 需要把这些失败规则机读化，否则 B1 官方 SEA 构建会在错误工具链或漂移源码上静默进行。

## What Changes

- 新增 `kimi-upstream-toolchain` capability：校验本机 Node / pnpm 精确匹配 lock、宿主 platform 匹配 `darwin-arm64`，以及 B0.2 cache 内 lockfile 与源码元数据与 lock 一致。
- 新增 `scripts/verify-kimi-toolchain.mjs` 作为唯一机读入口：消费 `upstream-lock.json` 与 `backend/kimi-code/.cache/src`，分阶段失败并以非 0 退出。
- 更新 `backend/kimi-code/README.md`：补充 B0.3 命令、阶段错误表、本机工具链安装提示、升级失败规则，以及与 B0.1/B0.2/B1 的职责边界。
- 不修改 pin 内容或 schema；不拉取网络；不安装依赖；不构建 Kimi Web / SEA / App。

## Capabilities

### New Capabilities
- `kimi-upstream-toolchain`: 校验本机 Node、pnpm、platform 与 B0.2 checkout 内 lockfile/源码元数据相对 `upstream-lock.json` 的精确一致性，并定义失败语义与升级失败规则。

### Modified Capabilities
- （无）本 change 不修改 `kimi-upstream-lock` 或 `kimi-upstream-fetch` 的 requirement；只消费其产出作为输入。

## Impact

- 影响范围：`scripts/verify-kimi-toolchain.mjs`、`backend/kimi-code/README.md`、OpenSpec 新 capability。
- 上游 pin：继续消费 B0.1/B0.2 的 `https://github.com/MoonshotAI/kimi-code.git` @ `75395f6abb17f83f30d16b51f4e060a639f43622`，期望 Node `24.15.0`、`pnpm@10.33.0`、`darwin-arm64`。
- 依赖：B0.2 已建立的 clean detached checkout；本机 PATH 上的 Node/pnpm；复用 `validateUpstreamLock`。
- 下游：B1 构建前应以本脚本 exit 0 为门禁；本机工具链未对齐时必须明确失败。
- 非目标：不改 lock schema/pin；不 `pnpm install`；不构建 SEA；不初始化 App。
