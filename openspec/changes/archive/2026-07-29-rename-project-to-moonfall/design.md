## Context

项目已正式更名为 `Moonfall`。`README.md` 和 `docs/v1-technical-roadmap.md` 已有部分用户修改，但当前有效内容与 main specs 仍存在 `ToTheMoon` 残留。应用工程尚未初始化，因此当前可以先统一文档与规格，并为后续 Tauri、React、Rust、构建和运行目录建立稳定命名约束。

本次变更必须保留工作区已有的 `docs/idea.md` 和技术路线修改，不得改写 OpenSpec 归档历史，也不得修改 Kimi Code 上游 package 与协议标识。

## Goals / Non-Goals

**Goals:**

- 将正式展示名统一为 `Moonfall`，自有技术 slug 统一为 `moonfall`。
- 清理当前维护文档和 main specs 中的旧项目名称。
- 约束未来应用配置、代码标识、运行目录和产物命名不得重新引入旧名称。
- 通过范围受控的文本检查验证重命名完整性。

**Non-Goals:**

- 不修改 OpenSpec 归档 change 中的历史记录。
- 不修改 Kimi Code 上游 package、协议、服务与命令名称。
- 不修改本地仓库目录、Git remote URL 或 GitHub 仓库名称。
- 不创建尚不存在的 Tauri、React、Rust 或构建配置。

## Decisions

### 使用正式名称与技术 slug 两级命名

面向用户和叙述性文档统一使用 `Moonfall`，未来 Moonfall 自有的 package、crate、binary、Bundle、目录和 artifact 标识使用 `moonfall` 或平台要求的等价形式。该规则既保持品牌一致，也适配区分大小写和标识符语法。

被否决方案是仅修改展示文案并保留旧技术标识，因为应用尚未初始化，此时继续保留旧名称只会把迁移成本推迟到后续阶段。

### 只修改当前事实来源

实施范围包括当前维护的 `README.md`、`docs/` 和 `openspec/specs/`。`openspec/changes/archive/` 是历史证据，保留其创建时名称；当前 change 自身为了说明迁移也可以引用旧名称。

被否决方案是全仓库无差别替换，因为这会篡改归档历史，并可能使已经验证过的 artifacts 与当时实现不一致。

### 保持上游 Kimi Code 标识稳定

Kimi Code 的 `kimi-code`、`kap-server`、`@moonshot-ai/*` 等名称属于外部集成契约，不随 Moonfall 品牌重命名。未来导入后端时继续保留这些标识，以降低上游同步与协议兼容成本。

被否决方案是重命名导入后端的 package，因为它会制造持续 patch、破坏 workspace 引用并扩大每次上游同步的冲突面。

### 外部仓库资源单独迁移

本地目录 `/Users/liujialin/project/ToTheMoon` 与 Git remote `JialinLiu-codedance/ToTheMoon` 不属于仓库内容，无法通过本 change 的文件修改原子迁移。本次记录为非目标；若需要改名，后续通过明确授权执行 GitHub 仓库重命名、本地目录迁移和 remote 校验。

## Risks / Trade-offs

- [用户已暂存的路线图修改被覆盖] → 基于当前文件内容做最小替换，不重写或取消用户暂存内容。
- [文本扫描误报迁移说明与历史记录] → 验证只扫描当前维护范围，并明确排除本 change 与归档目录。
- [未来配置重新使用旧名称] → 在 `project-identity` capability 中建立可测试的长期约束。
- [外部仓库仍显示旧名称] → 明确区分产品身份完成度与外部资源迁移状态，不把未执行的外部操作声明为已完成。

## Migration Plan

1. 在当前文件基础上完成 `README.md` 与技术路线中的剩余替换。
2. 更新 main specs 的叙述性项目名称，并同步 `project-readme` requirement。
3. 对当前维护范围执行旧名称残留扫描、Markdown 检查与 OpenSpec 验证。
4. 如需回滚，仅恢复本 change 修改的项目名称；不触碰用户新增文档和归档历史。

## Open Questions

无。具体 Bundle ID 的 reverse-DNS 前缀将在 Tauri 工程初始化 change 中确定，但其中的产品段必须使用 `moonfall`。
