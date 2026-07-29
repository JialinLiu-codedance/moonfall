## 1. 更新 V1 工作包路线

- [x] 1.1 更新 `docs/v1-technical-roadmap.md` 的迭代计划，保留 B0-B2 与 A0-A8 milestone，并在各阶段写入已确认的 54 个工作包编号、change 名称、单一开发结果和完成门禁
- [x] 1.2 将版本节点标准化为 `0.0.1`、`0.0.2`、`0.0.3 Backend Preview`、`0.1.0`、`0.2.0`、`0.3.0`、`0.4.0`、`0.5.0`、`0.9.0` 和 `1.0.0`，并映射到对应阶段末工作包
- [x] 1.3 在路线中写入单 active 工作包、独立 OpenSpec lifecycle、通常 3-7 个 task 和上下文恢复协议

## 2. 检查规格与文档一致性

- [x] 2.1 对照 delta spec 检查路线包含且只包含 54 个唯一工作包，阶段数量分别为 B0 3、B1 4、B2 4、A0 4、A1 6、A2 5、A3 6、A4 5、A5 5、A6 4、A7 4、A8 4
- [x] 2.2 检查每个工作包只描述一个开发结果，名称、顺序、版本映射和依赖门禁与 proposal、design、delta spec 一致
- [x] 2.3 检查 `README.md` 与细化后的路线没有冲突，仓库仍明确处于规划和工程初始化阶段，且本 change 未引入应用代码、依赖、Kimi Code checkout、SEA 或构建缓存

## 3. 验证、同步与归档

- [x] 3.1 运行 Markdown 结构、54 个工作包集合、唯一性、阶段计数、版本节点、文档链接和变更边界检查，并保留 fresh evidence
- [x] 3.2 使用 `openspec-verify-change` 检查 completeness、correctness 与 coherence，修复所有 CRITICAL，并修复 WARNING 或在 `design.md` 记录接受理由与影响
- [x] 3.3 运行 `openspec validate --all --strict` 并修复全部失败
- [x] 3.4 使用 `openspec-sync-specs` 将 `v1-development-roadmap` delta spec 同步到 main spec，并验证工作包目录和规范要求完整一致
- [x] 3.5 在全部 tasks 完成且检查通过后使用 `openspec-archive-change` 归档 `refine-v1-work-packages`

## 4. 处理独立复审反馈

- [x] 4.1 将 A0 测试基础设施调整到 UI foundation 之前，并明确 A0.1 不产生用户可见产品功能
- [x] 4.2 增加 sidecar 诊断、完整工作区管理和会话组织工作包，将目录扩展为 54 项并更新版本映射
- [x] 4.3 明确附件、输入历史、单次 turn Thinking override 与持久化默认参数的工作包所有权
- [x] 4.4 将 V1 完成定义改为 B0.1-A8.4 的 54 个工作包全部完成 OpenSpec lifecycle
- [x] 4.5 重新运行目录一致性、唯一性、阶段计数、版本节点、核心能力覆盖、`openspec-verify-change` 和 `openspec validate --all --strict`
- [x] 4.6 重新同步修订后的 `v1-development-roadmap` main spec，并验证 delta、main spec 与 roadmap 一致
- [x] 4.7 在所有复审反馈关闭后重新归档 `refine-v1-work-packages`
- [x] 4.8 关闭独立复审发现的 A1.6 与 A7.3 诊断导出所有权重叠，重新验证、同步并归档
- [x] 4.9 补齐 delta spec 中 54 个工作包全部完成 lifecycle 的 V1 完成门禁，重新验证并归档
