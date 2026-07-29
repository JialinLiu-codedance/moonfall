## 1. 布局与来源核验

- [x] 1.1 盘点 `.agents/skills/<skill-name>` 下受管 skill 目录及 `SKILL.md`，确认不存在以 `.agents/skills/superpowers` 为事实来源的聚合目录
- [x] 1.2 核对 `.codex`、`.kimi-code`、`.grok` 均为指向 `.agents` 的根级软链接，并验证入口访问的 skill 内容与 canonical source 一致
- [x] 1.3 核对固定 vendored skill 文件的路径与 SHA-256 记录，确认验证脚本能在缺失、错误链接或内容漂移时失败

## 2. 规格一致性核验

- [x] 2.1 对照实际目录、软链接和固定内容检查 `superpowers-skill` delta spec 的每个 Requirement 与 Scenario
- [x] 2.2 核对 proposal、spec、design 与 tasks 对 canonical source、非目标和迁移边界的描述一致
- [x] 2.3 确认本 change 不修改 `.agents/skills/openspec-*`、skill 正文或应用实现文件

## 3. 验证与生命周期收尾

- [x] 3.1 运行布局、软链接和内容完整性检查，并记录失败路径与通过结果
- [x] 3.2 使用 `/skill:openspec-verify-change` 检查 completeness、correctness 与 coherence
- [x] 3.3 修复 verify 报告中的所有 CRITICAL；修复所有 WARNING，或在 `design.md` 记录接受理由与影响并重新获得用户确认
- [x] 3.4 运行 `openspec validate --all --strict` 并确认通过
- [x] 3.5 在全部前置任务完成后使用 `/skill:openspec-sync-specs` 同步 `superpowers-skill` delta spec
- [x] 3.6 确认 tasks 全部完成且没有未解决检查项后，使用 `/skill:openspec-archive-change` 归档 `align-superpowers-skill-layout`
