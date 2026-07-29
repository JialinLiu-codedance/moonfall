## Why

`docs/midscene/llms.md` 仅提供 Midscene 中文文档的索引，仓库内缺少索引引用的 Markdown 正文，导致离线检索和本地内容消费不完整。需要按索引声明的相对路径拉取对应源文件，并保留原目录结构。

## What Changes

- 解析 `docs/midscene/llms.md` 中所有指向 `.md` 的相对链接。
- 以 `https://midscenejs.com/` 为源站基址，下载每个引用对应的 Markdown 内容。
- 将下载结果写入 `docs/midscene/` 下与链接一致的相对路径，包括所需的嵌套文件夹。
- 校验每个索引引用均有对应本地文件，下载失败或响应无效时不得将任务视为完成。
- 非目标：不递归抓取下载文档中的其他链接，不改写源文档内容，不修改 `docs/midscene/llms.md` 的索引结构。

## Capabilities

### New Capabilities

- `midscene-document-mirror`: 定义根据 Midscene 索引下载 Markdown 文档、保持路径映射并验证完整性的行为。

### Modified Capabilities

无。

## Impact

- 新增 `docs/midscene/zh/` 下由 `docs/midscene/llms.md` 引用的 Markdown 文件及嵌套目录。
- 实施过程依赖对 `https://midscenejs.com/` 的网络访问，但不新增项目运行时依赖或公开 API。
- 可能覆盖目标路径中已存在的镜像文件；实施前需识别现有文件，且仅更新索引明确引用的路径。
