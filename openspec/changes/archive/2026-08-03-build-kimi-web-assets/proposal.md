## Why

B0 已固定上游 pin、得到干净 detached checkout，并校验本机 Node / pnpm / platform 与源码元数据。B1 官方 SEA 构建的第一步是在 pin 源码上 `pnpm install --frozen-lockfile`、构建 Kimi Web，再把产物复制进 `apps/kimi-code/dist-web`；仓库尚无单一机读入口复现该步，B1.2 的 `build:native:release` 会缺少可验收的 Web assets 输入。

## What Changes

- 新增 `kimi-web-assets-build` capability：在 B0 cache 上执行 frozen install、官方 Kimi Web build 与 `copy-web-assets.mjs`，并校验 `dist-web` 产物。
- 新增 `scripts/build-kimi-web-assets.mjs` 作为唯一机读入口：门禁 B0 lock/toolchain → install → web build → copy → 产物断言；分阶段失败并以非 0 退出。
- 更新 `backend/kimi-code/README.md`：补充 B1.1 命令、阶段错误表、与 B0 / B1.2 的职责边界。
- 不构建 SEA / native release；不跑 smoke / package / manifest；不初始化 Tauri App；不修改 `upstream-lock.json` pin。

## Capabilities

### New Capabilities
- `kimi-web-assets-build`: 以 B0 pin checkout 与工具链门禁为前提，在约定 cache 内完成 frozen install、Kimi Web 构建与官方 Web assets 复制，并定义成功产物与失败语义。

### Modified Capabilities
- （无）本 change 不修改 `kimi-upstream-lock`、`kimi-upstream-fetch`、`kimi-upstream-toolchain` 的 requirement；只消费其产出作为输入。

## Impact

- 影响范围：`scripts/build-kimi-web-assets.mjs`、`backend/kimi-code/README.md`、OpenSpec 新 capability；运行时在 `backend/kimi-code/.cache/src` 写入 `node_modules/`、`apps/kimi-web/dist/`、`apps/kimi-code/dist-web/`（均 gitignore，不进 Git）。
- 上游 pin：继续消费 `https://github.com/MoonshotAI/kimi-code.git` @ `75395f6abb17f83f30d16b51f4e060a639f43622`，期望 Node `24.15.0`、`pnpm@10.33.0`、`darwin-arm64`。
- 依赖：B0.2 clean detached checkout；B0.3 工具链门禁通过；网络用于 `pnpm install`（若 registry 可达）；复用官方 `apps/kimi-code/scripts/copy-web-assets.mjs`。
- 下游：B1.2 必须以本脚本产出的 `apps/kimi-code/dist-web` 为 native release 前置输入。
- 非目标：不改 lock schema/pin；不执行 `build:native:release`；不 smoke/package；不初始化 App。
