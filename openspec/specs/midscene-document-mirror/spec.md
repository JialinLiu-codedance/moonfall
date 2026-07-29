# Midscene 文档镜像规范

## Purpose

定义根据 Midscene 文档索引获取 Markdown 文件、保持源站与本地路径映射、限制写入边界并验证镜像完整性的要求。

## Requirements

### Requirement: 按索引解析 Markdown 清单
同步过程 SHALL 从 `docs/midscene/llms.md` 提取所有以 `./` 开头且以 `.md` 结尾的链接目标，并将去重后的结果作为唯一下载清单。

#### Scenario: 提取当前索引清单
- **WHEN** 同步过程读取当前 `docs/midscene/llms.md`
- **THEN** 系统生成包含 43 个唯一相对路径的下载清单
- **AND** 清单包含 `./zh/advanced/bdd-style-scripts-with-gherkin.md`

### Requirement: 保持源站与本地路径映射
同步过程 MUST 从 `https://midscenejs.com/` 下与索引相对路径对应的 URL 获取每个文档，并 SHALL 将响应内容保存到 `docs/midscene/` 下的同一相对路径。

#### Scenario: 下载嵌套路径文档
- **GIVEN** 索引包含 `./zh/advanced/bdd-style-scripts-with-gherkin.md`
- **WHEN** 同步过程处理该链接
- **THEN** 系统请求 `https://midscenejs.com/zh/advanced/bdd-style-scripts-with-gherkin.md`
- **AND** 将响应保存为 `docs/midscene/zh/advanced/bdd-style-scripts-with-gherkin.md`

### Requirement: 限制本地写入边界
同步过程 MUST 验证规范化后的每个目标路径位于 `docs/midscene/` 内，并 MUST 拒绝绝对路径或路径穿越结果。

#### Scenario: 遇到越界链接
- **WHEN** 索引链接规范化后指向 `docs/midscene/` 之外
- **THEN** 同步过程失败并报告该链接
- **AND** 不写入越界目标

### Requirement: 失败时不得接受不完整镜像
同步过程 MUST 将 HTTP 错误、请求失败、空响应或明显 HTML 文档响应视为失败，并 SHALL 仅在全部清单项下载及校验成功后写入最终目标集合。

#### Scenario: 任一文档下载失败
- **GIVEN** 下载清单中至少一个请求失败或响应无效
- **WHEN** 同步过程校验临时下载结果
- **THEN** 同步过程返回失败
- **AND** 不将临时结果写入最终目标集合

### Requirement: 验证本地镜像完整性
同步完成后 SHALL 逐项验证去重清单中的本地目标文件存在且非空，并 MUST 确认目标数量与清单数量一致。

#### Scenario: 全部文档成功落盘
- **WHEN** 43 个清单项均已成功下载并写入对应路径
- **THEN** 完整性检查确认 43 个目标文件全部存在且非空
- **AND** 示例目标文件包含预期的 Markdown 标题
