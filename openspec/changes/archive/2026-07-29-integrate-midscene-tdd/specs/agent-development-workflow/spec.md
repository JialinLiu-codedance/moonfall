## ADDED Requirements

### Requirement: 可见 UI task 组合 Midscene TDD
当 OpenSpec task 新增或修改用户可见 UI、交互状态、布局或视觉反馈时，agent MUST 在 `openspec-apply-change` 控制下同时使用 Superpowers `test-driven-development` 与仓库级 `midscene-tdd`。确定性测试和 Midscene 验收都只能作为当前 task 的执行证据，MUST NOT 建立第二套正式 task 状态。

#### Scenario: 实施可见 UI change
- **WHEN** agent 从已确认的 OpenSpec `tasks.md` 选择一个可见 UI task
- **THEN** agent 使用 `test-driven-development` 建立确定性 red-green 循环
- **AND** agent 使用 `midscene-tdd` 建立适用的 Web 语义验收或 Desktop 验收
- **AND** 所有持久化完成状态仍由 `openspec-apply-change` 更新到当前 `tasks.md`

#### Scenario: Midscene 基础设施尚未落地
- **WHEN** 可见 UI task 依赖的 Midscene package、fixture、命令或模型配置尚不可用
- **THEN** agent 不得跳过 Midscene 后直接宣称 task 完成
- **AND** agent 将缺失基础设施纳入已确认 artifacts，或将 task 报告为 `BLOCKED`
