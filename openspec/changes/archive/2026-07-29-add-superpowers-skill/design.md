## Context

当前仓库已经通过 `.agents/skills/openspec-*` 这种目录结构管理 OpenSpec 相关 skill，说明项目已经接受“仓库内保留 canonical source，再通过挂载路径暴露给 CLI”的模式。本次要引入的 `superpowers` skill 需要沿用同一思路，避免在多个 CLI 目录中复制同一份内容。

仓库当前根目录下还没有现成的 `cli` 子目录，因此实现不能假设固定路径存在，而应当先识别实际存在的 CLI 入口目录，再按需建立软链接。

## Goals / Non-Goals

**Goals:**
- 在 `.agents/skills/superpowers` 保留 `superpowers` skill 的唯一事实来源。
- 让实际存在的 CLI 入口目录通过软链接访问同一份 skill。
- 保持与现有 `openspec` skill 的组织方式一致，降低后续维护成本。
- 让新增或调整 CLI 入口目录时，只需要更新软链接挂载，不需要复制 skill 内容。

**Non-Goals:**
- 不重构现有 `openspec` skill 的目录结构。
- 不引入新的 skill 分发框架或包管理机制。
- 不修改产品业务逻辑或运行时功能。
- 不预先创建仓库里并不存在的 CLI 目录。
- 不在 `.codex` 下建立 `superpowers` 的挂载点。

## Decisions

### 1. 采用 `.agents/skills/superpowers` 作为 canonical source

原因是仓库已经在 `.agents/skills` 下建立了既有约定，继续沿用可以避免引入新的顶层约定，也能让后续维护者一眼看懂 skill 的真实来源。

**备选方案：** 将 skill 放到其他路径，再从 `.agents` 反向指向它。该方案会让 skill 来源变得更分散，和现有仓库结构不一致，因此不采用。

### 2. 通过软链接而不是复制文件来暴露 skill

软链接能保证所有 CLI 入口看到的是同一份内容，更新时不会出现多个副本漂移的问题。对 skill 这种需要一致性的资源，软链接比复制更适合。

**备选方案：** 在每个 CLI 目录复制一份 skill 文件。该方案维护成本更高，且容易产生内容不一致，因此不采用。

### 3. 只对仓库中实际存在的 CLI 入口目录建链

实现时先扫描仓库，确认哪些目录确实承担 CLI skill discovery 职责，再对这些目录创建软链接。这样可以避免为不存在的目录写入无效路径，也能让变更对当前仓库状态保持准确。

**备选方案：** 预先创建一组约定目录并统一挂载。该方案会引入额外目录噪音，并且与当前仓库现状不匹配，因此不采用。

## Risks / Trade-offs

- [仓库中没有统一的 CLI 目录约定] → 实现需要先做目录发现，再建立软链接；同时在文档或变更说明中记录当前实际挂载点。
- [软链接目标路径写错] → 在实施后验证每个链接的解析结果，确保都指向 `.agents/skills/superpowers`。
- [未来新增 CLI 入口目录时忘记补链] → 在变更说明中明确挂载约定，后续新增目录时按同一规则处理。
- [不同平台对软链接的处理差异] → 仅使用仓库内本地路径，避免依赖平台特有语义；如需检查，使用文件系统级验证而不是业务逻辑验证。

## Migration Plan

1. 先创建 `.agents/skills/superpowers` 的 canonical source。
2. 再扫描仓库内实际存在的 CLI 入口目录。
3. 为每个目标目录创建指向 canonical source 的软链接。
4. 验证所有软链接的目标一致，且不会影响现有 `openspec` skill。
5. 如验证失败，删除错误软链接并重新创建；必要时只保留 canonical source，不保留挂载点。

## Open Questions

- 当前仓库最终会识别哪些目录为 CLI 入口目录，需要在实施时按实际结构确认。
