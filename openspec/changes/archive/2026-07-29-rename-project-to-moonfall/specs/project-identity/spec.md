## ADDED Requirements

### Requirement: 项目使用统一正式名称
当前维护的产品说明、技术文档和项目规格 MUST 使用 `Moonfall` 作为正式展示名称，并 MUST 使用 `moonfall` 作为 Moonfall 自有技术标识的基础 slug。

#### Scenario: 维护者查看当前项目资料
- **WHEN** 维护者读取当前有效的 README、技术路线或 main specs
- **THEN** 项目正式名称显示为 `Moonfall`
- **AND** 不会将 `ToTheMoon` 描述为当前项目名称

### Requirement: Moonfall 自有技术标识不得沿用旧名称
未来新增的 Moonfall 自有 package、crate、binary、Tauri product、Bundle 产品段、应用数据目录、日志目录和发布 artifact MUST 使用 `Moonfall`、`moonfall` 或平台语法要求的等价形式，并 MUST NOT 使用 `ToTheMoon`、`tothemoon` 或 `to-the-moon`。

#### Scenario: 初始化应用工程
- **WHEN** 后续 change 创建 Tauri、React、Rust、构建或发布配置
- **THEN** 所有 Moonfall 自有技术标识基于 `moonfall`
- **AND** 新配置不引入旧项目名称

### Requirement: 重命名不得破坏历史与上游边界
项目身份检查 MUST 排除 OpenSpec 归档 change 与当前重命名 change 中必要的迁移说明，并 MUST 保留 Kimi Code 上游 package、协议、服务和命令标识。外部 GitHub 仓库名称与本地仓库目录 MUST NOT 被本 capability 视为仓库内容重命名已完成的证据。

#### Scenario: 验证旧名称残留
- **WHEN** 验证程序扫描当前维护的仓库内容
- **THEN** 归档历史、当前迁移说明和上游 Kimi Code 标识不会被误改
- **AND** README、当前技术文档与 main specs 中不存在作为当前项目名称使用的旧标识
