## 1. 编排规则落盘

- [x] 1.1 在 `AGENTS.md` 中新增 OpenSpec 与 Superpowers 编排章节，明确 OpenSpec 是外层 lifecycle 和持久化 artifacts 的唯一事实来源
- [x] 1.2 在编排章节中记录 `brainstorming` 与 `writing-plans` 到 OpenSpec `design.md` 与 `tasks.md` 的映射，并禁止默认创建并行的正式 design 或 plan
- [x] 1.3 在编排章节中记录探索、缺陷诊断、apply、TDD、系统化调试、代码评审和 task 状态维护的调用顺序
- [x] 1.4 在编排章节中记录 artifact 漂移时通过 `openspec-update-change` 停止、修订、重新确认和恢复实施的流程
- [x] 1.5 在编排章节中记录 fresh verification、`openspec-verify-change`、CRITICAL 与 WARNING 处理、strict validation、sync、archive 和分支收尾的完成门禁
- [x] 1.6 确认新增规则明确声明 `AGENTS.md` 的仓库约束覆盖通用 skills 的冲突默认行为，且不修改任何 skill 源文件

## 2. 验证与收尾

- [x] 2.1 检查 `AGENTS.md` 的章节结构、中文表述、命令和路径准确性，并确认未创建 `docs/superpowers/specs/` 或 `docs/superpowers/plans/` 下的并行 artifacts
- [x] 2.2 使用 `openspec-verify-change` 检查 completeness、correctness 和 coherence
- [x] 2.3 修复所有 CRITICAL；修复所有 WARNING，或在 `design.md` 中记录接受理由和影响
- [x] 2.4 运行 `openspec validate --all --strict`
- [x] 2.5 使用 `openspec-sync-specs` 同步 `agent-development-workflow` delta spec
- [x] 2.6 使用 `openspec-archive-change` 归档 `document-openspec-superpowers-orchestration`
