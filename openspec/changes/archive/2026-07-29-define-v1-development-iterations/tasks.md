## 1. 更新 V1 路线基线

- [x] 1.1 更新 `docs/v1-technical-roadmap.md` 的已确认决策，写入固定 Kimi Code 完整 commit 的机制要求、脚本构建官方完整 SEA、Apple Silicon 首发、独立 `KIMI_CODE_HOME` 和 App 私有 sidecar
- [x] 1.2 将现有 M0-M6 重构为 B0-B2、A0-A1、A2-A6 与 A7-A8，记录每个阶段的建议 OpenSpec change、目标、交付物、依赖和完成门禁
- [x] 1.3 写入 Backend Preview、`0.1` 至 `1.0` 的能力节点，并明确阶段节点不代表预设日历日期

## 2. 固化职责、验证与发布边界

- [x] 2.1 更新后端集成与前端状态边界，明确 Kimi Code 负责 Token 和业务状态生命周期，Moonfall 只消费官方连接契约、REST snapshot 与 WebSocket event
- [x] 2.2 写入构建、协议、能力三层后端完整性证据，以及静态检查、contract、SEA 集成、Playwright、Midscene、真实 `.app` 和干净机器验收层级
- [x] 2.3 更新 Kimi Code 升级、故障恢复、风险控制、V1 非目标和最终完成定义，确保 App 与 SEA 原子发布且不独立升级 sidecar

## 3. 检查文档与 artifacts 一致性

- [x] 3.1 对照 proposal、design 和 `v1-development-roadmap` spec 检查路线文档，确认阶段编号、依赖门禁、版本节点与职责边界一致
- [x] 3.2 检查 `README.md` 与更新后的路线没有冲突，且仓库仍明确处于规划和工程初始化阶段，没有新增未经验证的开发命令
- [x] 3.3 检查变更清单，确认本 change 未拉取或提交 Kimi Code 源码、SEA artifact、应用代码、依赖或构建缓存

## 4. 测试、验证、同步与归档

- [x] 4.1 运行 Markdown 结构、术语、阶段集合、版本节点、文档链接和变更边界检查，并保留 fresh evidence
- [x] 4.2 使用 `openspec-verify-change` 检查 completeness、correctness 与 coherence，修复所有 CRITICAL，并修复 WARNING 或在 `design.md` 记录接受理由与影响
- [x] 4.3 运行 `openspec validate --all --strict` 并修复全部失败
- [x] 4.4 使用 `openspec-sync-specs` 将 `v1-development-roadmap` delta spec 同步到 main specs
- [x] 4.5 在所有 tasks 完成且检查通过后使用 `openspec-archive-change` 归档 `define-v1-development-iterations`

## 5. 处理 PR 前独立审查反馈

- [x] 5.1 更新 `docs/v1-technical-roadmap.md`，区分上游 `darwin-arm64` target、Mach-O `arm64` 架构和 Tauri `aarch64-apple-darwin` staging triple，并完整记录官方 native build workflow
- [x] 5.2 将 A8 功能差异矩阵固定到 B0 的同一 Kimi Code commit，收紧 V1 条目状态与 OpenSpec scope exception 门禁
- [x] 5.3 重新运行结构检查、`openspec-verify-change` 和 `openspec validate --all --strict`，解决全部 CRITICAL 与 WARNING
- [x] 5.4 重新同步修订后的 `v1-development-roadmap` spec，并验证 delta 与 main spec 一致
- [x] 5.5 在全部新增 tasks 完成后重新归档 `define-v1-development-iterations`
