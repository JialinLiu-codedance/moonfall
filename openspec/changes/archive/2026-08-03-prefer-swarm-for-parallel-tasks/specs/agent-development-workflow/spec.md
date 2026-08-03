## ADDED Requirements

### Requirement: 可并行工作优先使用 swarm 并由主 Agent 审核
当开发过程中出现 2 个及以上无共享写冲突的调查、取证或互不重叠的修改切片时，主 Agent MUST 优先使用 swarm 或多 subagent 并行执行；主 Agent MUST 划分边界、汇总结果并审核后再继续，MUST NOT 让 subagent 声明替代 fresh verification 或 OpenSpec task 完成状态。

#### Scenario: 并行只读调查
- **WHEN** 当前任务需要在多个独立模块或路径上做只读调查且彼此无依赖
- **THEN** 主 Agent 使用 swarm 或多 subagent 并行调查
- **AND** 主 Agent 汇总并审核结论后才据此决策下一步

#### Scenario: 并行无冲突修改
- **WHEN** 已确认的 OpenSpec tasks 中存在文件集合不重叠、无接口耦合的可并行修改切片
- **THEN** 主 Agent 优先并行派发这些切片
- **AND** 主 Agent 审核各切片 diff 与验证证据后，才更新唯一的 OpenSpec `tasks.md` 完成状态

#### Scenario: 存在写冲突或强顺序依赖
- **WHEN** 子任务会争用同一文件、同一共享状态，或后一步依赖前一步输出
- **THEN** 主 Agent MUST NOT 为并行而并行
- **AND** 主 Agent 按依赖顺序执行或重新划分无冲突边界

#### Scenario: Subagent 完成声明不可直接采信
- **WHEN** subagent 报告某切片已完成
- **THEN** 主 Agent MUST 审核范围、正确性与相关验证证据
- **AND** 不得仅凭 subagent 声明勾选 OpenSpec task 或进入 sync/archive
