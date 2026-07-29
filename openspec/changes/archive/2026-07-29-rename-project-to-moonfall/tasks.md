## 1. 当前项目身份统一

- [x] 1.1 在保留用户已有修改的前提下，将 `README.md` 与 `docs/v1-technical-roadmap.md` 中剩余的当前项目名称统一为 `Moonfall`
- [x] 1.2 将当前 main specs 的叙述性项目名称统一为 `Moonfall`，但不改写 `openspec/changes/archive/` 中的历史记录
- [x] 1.3 确认 `docs/idea.md`、Kimi Code 上游标识、Git remote 与本地仓库目录未被本次内容替换误改

## 2. 命名边界验证

- [x] 2.1 扫描 `README.md`、当前 `docs/` 与 `openspec/specs/`，确认旧名称不再被用作当前项目名称
- [x] 2.2 检查最终 diff 与 Markdown 格式，确认只包含本 change 和用户已有改动

## 3. OpenSpec 完成门禁

- [x] 3.1 使用 `openspec-verify-change` 检查 completeness、correctness 和 coherence
- [x] 3.2 修复全部 CRITICAL，并修复 WARNING 或在 `design.md` 记录接受理由和影响
- [x] 3.3 运行 `openspec validate --all --strict` 并确认全部检查通过
- [x] 3.4 使用 `openspec-sync-specs` 同步 `project-identity` 与 `project-readme` delta specs
- [x] 3.5 使用 `openspec-archive-change` 归档 change，并再次确认 strict validation 通过
