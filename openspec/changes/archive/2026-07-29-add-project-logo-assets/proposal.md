## Why

项目已经收到 ToTheMoon 的明暗主题 logo 资源，但当前没有 capability 约束它们的路径、用途和文件完整性。先建立独立的品牌资源契约，可以让后续应用初始化引用稳定资源，同时避免在本 change 中提前决定完整品牌范围或接入界面。

## What Changes

- 新增 `project-brand-assets` capability，登记 `assets/logo-dark.png` 与 `assets/logo-light.png`。
- 规定两张 PNG 的明暗主题用途、固定路径和可验证的图片有效性。
- 记录资源必须保持可读、非空、尺寸有效，并在变更验收中核对格式与哈希。
- 本 change 不接入 Tauri、React 或 README，不选择完整品牌命名、文案、图标体系或应用布局。

## Capabilities

### New Capabilities

- `project-brand-assets`: 约束项目明暗主题 logo 资源的路径、用途和完整性。

### Modified Capabilities

无。

## Impact

- 新增 `openspec/changes/add-project-logo-assets/` 下的 proposal、delta spec、design 和 tasks，并在生命周期完成时同步 `openspec/specs/project-brand-assets/spec.md`。
- apply 阶段纳入并验证 `assets/logo-dark.png` 与 `assets/logo-light.png`；不修改应用代码、构建配置、运行时行为或现有 capability。
