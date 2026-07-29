## ADDED Requirements

### Requirement: 项目提供明暗主题 logo 资源
项目 MUST 在固定路径提供 `assets/logo-dark.png` 与 `assets/logo-light.png` 两个 PNG 资源；前者用于深色背景或深色主题，后者用于浅色背景或浅色主题。资源命名和路径 MUST 保持稳定，供后续应用初始化引用。

#### Scenario: 应用选择深色主题资源
- **WHEN** 消费者需要在深色背景上展示项目 logo
- **THEN** 消费者可以从 `assets/logo-dark.png` 读取深色主题资源

#### Scenario: 应用选择浅色主题资源
- **WHEN** 消费者需要在浅色背景上展示项目 logo
- **THEN** 消费者可以从 `assets/logo-light.png` 读取浅色主题资源

### Requirement: logo 文件必须保持有效且可验证
两个 logo 文件 MUST 是非空、可读取、非交错的 RGBA PNG，且 MUST 保持当前约定的有效尺寸 2106x2048。验收检查 MUST 核对文件格式、尺寸和 SHA-256，发现资源损坏或意外替换时必须失败。

#### Scenario: 资源完整性检查通过
- **WHEN** 两个路径均存在且文件格式、尺寸和 SHA-256 与记录值一致
- **THEN** 品牌资源检查通过

#### Scenario: 资源被替换或损坏
- **WHEN** 任一 logo 不是有效 PNG、尺寸不符、为空或 SHA-256 发生变化
- **THEN** 品牌资源检查失败并指出对应文件

### Requirement: 本 capability 不预设完整品牌接入范围
`project-brand-assets` capability MUST 只约束两个 logo 文件的资源契约，不得要求应用代码、Tauri 配置、React 组件、README 文案或完整品牌系统在本 change 中接入这些资源。

#### Scenario: 后续应用初始化引用资源
- **WHEN** 后续 change 设计应用图标或界面品牌接入
- **THEN** 可以引用本 capability 的固定资源路径
- **AND** 该接入仍需由独立 change 定义可观察行为
