## 1. 品牌资源核验

- [x] 1.1 确认 `assets/logo-dark.png` 与 `assets/logo-light.png` 均存在于固定路径且未被空文件或其他格式替换
- [x] 1.2 使用图片工具核对两个文件为可读取的非交错 RGBA PNG，尺寸均为 2106x2048
- [x] 1.3 计算并记录两个文件的 SHA-256，确认与 `project-brand-assets` spec 中的资源完整性约束一致

## 2. 规格一致性核验

- [x] 2.1 对照实际图片属性检查每个 Requirement 与 Scenario 可验证且没有扩展到应用品牌接入
- [x] 2.2 核对 proposal、spec、design 与 tasks 对固定路径、明暗主题用途和非目标的描述一致
- [x] 2.3 确认本 change 不修改 Tauri、React、README、构建配置或其他现有 capability

## 3. 验证与生命周期收尾

- [x] 3.1 运行 PNG 格式、尺寸、非空和 SHA-256 完整性检查，并记录两个资源的通过结果
- [x] 3.2 使用 `/skill:openspec-verify-change` 检查 completeness、correctness 与 coherence
- [x] 3.3 修复 verify 报告中的所有 CRITICAL；修复所有 WARNING，或在 `design.md` 记录接受理由与影响并重新获得用户确认
- [x] 3.4 运行 `openspec validate --all --strict` 并确认通过
- [x] 3.5 在全部前置任务完成后使用 `/skill:openspec-sync-specs` 同步 `project-brand-assets` delta spec
- [x] 3.6 确认 tasks 全部完成且没有未解决检查项后，使用 `/skill:openspec-archive-change` 归档 `add-project-logo-assets`
