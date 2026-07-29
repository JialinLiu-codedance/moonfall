## Context

ToTheMoon 当前已拥有两张 2106x2048 的 RGBA PNG logo，但资源尚未被 OpenSpec 约束。品牌资源需要先有稳定路径和明暗主题语义，后续 Tauri、React 或发布流程才能在独立 change 中安全引用。

## Goals / Non-Goals

**Goals:**

- 将两张现有 PNG 登记为项目级品牌资源。
- 通过路径、格式、尺寸和 SHA-256 建立可重复验收。
- 保持资源契约与应用接入解耦。

**Non-Goals:**

- 不生成、重绘、压缩或转换图片。
- 不把 logo 接入应用图标、窗口、README 或 UI。
- 不定义产品名称、文案、完整品牌色或信息架构。

## Decisions

### 保留现有二进制资源与固定路径

直接纳入 `assets/logo-dark.png` 与 `assets/logo-light.png`，沿用已有文件而不是复制到新的目录或转换格式。固定路径可被后续 change 稳定引用，也避免当前阶段引入构建工具链。

### 以主题语义区分资源

`logo-dark.png` 表示深色背景使用的版本，`logo-light.png` 表示浅色背景使用的版本。名称只表达当前资源用途，不延伸为完整主题切换 API。

### 用格式、尺寸和哈希做完整性门禁

资源检查同时验证 PNG 可读性、RGBA、非交错、2106x2048 尺寸以及已记录 SHA-256。未采用仅检查文件存在或仅检查扩展名，因为这无法发现空文件、错误替换或损坏图片。

## Risks / Trade-offs

- [风险] 后续设计需要不同尺寸或应用图标专用资源 → [控制] 另建品牌接入或图标资源 change，不修改本 capability 的既有文件契约。
- [风险] 二进制资源被无意优化导致哈希变化 → [控制] 在提交前运行格式、尺寸和哈希检查，并把哈希变更视为需审查的资源更新。
- [取舍] 固定哈希会降低后续自由替换的便利性 → [控制] 资源替换通过新的 OpenSpec change 更新记录，保留变更可追溯性。

## Migration Plan

apply 阶段验证现有文件并在需要时纳入资源；完成 verify、strict validation、sync 和 archive 后，后续消费者可按固定路径引用。回滚时在 sync 前移除 change 即可；已同步后必须通过新的 change 调整资源契约。

## Open Questions

暂无。应用图标是否直接复用 logo、是否需要多尺寸导出留待后续应用初始化 change 决定。
