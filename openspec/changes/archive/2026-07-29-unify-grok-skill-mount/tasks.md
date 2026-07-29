## 1. 前置检查

- [x] 1.1 确认仓库根目录不存在冲突的 `.grok` 实体目录或文件
- [x] 1.2 确认现有 `.codex` 与 `.kimi-code` 仍为指向 `.agents` 的软链接

## 2. 创建 Grok 挂载

- [x] 2.1 在仓库根目录创建 `.grok -> .agents` 软链接
- [x] 2.2 验证 `.grok`、`.codex`、`.kimi-code` 的 `readlink` 结果均为 `.agents`
- [x] 2.3 验证 `.grok/skills` 与 `.agents/skills` 内容一致，且现有 skill 可见

## 3. 验证与收尾

- [x] 3.1 运行 `openspec-verify-change` 检查实现与 artifacts 一致
- [x] 3.2 修复所有 CRITICAL；WARNING 修复或在 design.md 记录接受理由
- [x] 3.3 运行 `openspec validate --all --strict`
- [x] 3.4 使用 `openspec-sync-specs` 同步 delta specs
- [x] 3.5 使用 `openspec-archive-change` 归档本 change
