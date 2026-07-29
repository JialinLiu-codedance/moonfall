## Purpose

定义 Moonfall 仓库 README 对项目定位、V1 技术路线、当前状态和进一步阅读入口的说明要求，使新参与者能够从仓库首页获得准确且不过度承诺的信息。

## Requirements

### Requirement: README 说明项目定位
仓库 README MUST 说明 Moonfall 是基于 Kimi Code 后端构建的 macOS Agent 工作台，并说明 V1 完全重建前端。

#### Scenario: 新参与者阅读仓库首页
- **WHEN** 新参与者打开 `README.md`
- **THEN** 能够识别项目用途、目标平台以及与 Kimi Code 的关系

### Requirement: README 说明已确认技术路线
仓库 README MUST 列出 Tauri 2、React、HeroUI v3 和 Kimi Code SEA sidecar 等已确认的 V1 技术基线。

#### Scenario: 开发者评估技术栈
- **WHEN** 开发者阅读 README 的技术架构部分
- **THEN** 能够识别桌面宿主、前端框架、组件库和后端运行时

### Requirement: README 准确描述当前状态
仓库 README MUST 明确项目仍处于 V1 规划和工程初始化阶段，且 MUST NOT 提供尚未实现或验证的安装与启动命令。

#### Scenario: 工程骨架尚未建立
- **WHEN** README 在应用工程初始化前发布
- **THEN** 读者不会被引导执行不存在或未经验证的命令

### Requirement: README 提供详细文档入口
仓库 README MUST 链接 V1 技术路线文档，使读者可以继续查看架构、范围、里程碑和完成定义。

#### Scenario: 读者需要了解实施细节
- **WHEN** 读者从 README 寻找进一步技术信息
- **THEN** 可以访问 `docs/v1-technical-roadmap.md`
