## 1. 资源准备

- [x] 1.1 确认 `superpowers` skill 的来源与最终内容，并准备 `.agents/skills/superpowers` 作为 canonical source
- [x] 1.2 扫描仓库中实际存在的 CLI 入口目录，整理需要挂载 `superpowers` 的目标清单

## 2. 软链接挂载

- [x] 2.1 在 `.agents/skills/` 下创建或更新 `superpowers` skill 目录
- [x] 2.2 为每个目标 CLI 入口目录创建指向 `.agents/skills/superpowers` 的软链接
- [x] 2.3 确认现有 `openspec` skill 目录和挂载方式未被破坏
- [x] 2.4 确认 `.codex` 下没有创建 `superpowers` 软链接或副本

## 3. 验证与收尾

- [x] 3.1 验证所有软链接解析结果都指向 `.agents/skills/superpowers`
- [x] 3.2 运行相关最小验证，确认 CLI 入口可以发现该 skill
- [x] 3.3 运行 `openspec validate --all --strict`
- [x] 3.4 按 OpenSpec 流程同步适用的 delta specs
- [x] 3.5 归档 `add-superpowers-skill` change
