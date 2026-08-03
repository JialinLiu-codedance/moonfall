## 1. 规则写入

- [x] 1.1 在 `AGENTS.md`「OpenSpec 与 Superpowers 编排」中新增「并行与 Swarm」小节，写明：可并行调查/修改优先 swarm；主 Agent 划分边界、审核结果并维护唯一 task 状态；禁止写冲突并行、禁止跳过 OpenSpec 门禁、不并行多个 V1 工作包
- [x] 1.2 更新同文件「阶段内调用规则」实施相关条目，指向可并行时优先 swarm / 多 subagent，并强调主 Agent 审核与单一 OpenSpec task 状态

## 2. 验证与收尾

- [x] 2.1 通读 `AGENTS.md` 新规则与既有 OpenSpec / Superpowers / Midscene 段落无矛盾
- [x] 2.2 运行 `openspec-verify-change`，修复 CRITICAL；WARNING 修复或在 `design.md` 记录
- [x] 2.3 运行 `openspec validate --all --strict`
- [x] 2.4 使用 `openspec-sync-specs` 将 `agent-development-workflow` delta 同步到主 specs
- [x] 2.5 使用 `openspec-archive-change` 归档本 change
