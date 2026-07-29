## 1. 清单与安全校验

- [x] 1.1 从 `docs/midscene/llms.md` 提取并去重全部本地 Markdown 链接，确认当前清单为 43 项
- [x] 1.2 规范化每个目标路径并验证其位于 `docs/midscene/` 内，同时检查目标集合不存在待保护的用户修改

## 2. 文档下载与落盘

- [x] 2.1 在独立临时目录中创建清单对应的嵌套目录结构
- [x] 2.2 从 `https://midscenejs.com/` 下载全部 43 个 Markdown 响应，并校验 HTTP 状态、非空内容及非 HTML 文档特征
- [x] 2.3 仅在全部临时结果通过校验后，将文件写入 `docs/midscene/` 下的对应相对路径

## 3. 完整性与内容验证

- [x] 3.1 逐项确认索引的 43 个目标文件均存在且非空，目标路径与索引清单一一对应
- [x] 3.2 抽查 `docs/midscene/zh/advanced/bdd-style-scripts-with-gherkin.md` 等文件的 Markdown 标题和内容特征
- [x] 3.3 运行 `git diff --check` 并审查变更清单，确认未修改索引外文件和用户无关改动

## 4. OpenSpec 验证与归档

- [x] 4.1 使用 `openspec-verify-change` 检查实现的 completeness、correctness 和 coherence，并修复全部 CRITICAL 与未接受的 WARNING
- [x] 4.2 运行 `openspec validate --all --strict` 并确保通过
- [x] 4.3 使用 `openspec-sync-specs` 将 `midscene-document-mirror` delta spec 同步到主 specs
- [x] 4.4 使用 `openspec-archive-change` 归档 `fetch-midscene-markdown-docs` change
