## 1. Schema 与校验入口

- [x] 1.1 新增 `backend/kimi-code/upstream-lock.schema.json`，覆盖 `schemaVersion`、`repository`、`commit`、`kimiCodeVersion`、`toolchain`、`upstreamTarget`、`recordedAt` 与可选 `refNote`
- [x] 1.2 实现 `scripts/verify-upstream-lock.mjs`：读取 schema 与 lock，执行结构校验与业务规则（完整 40 位小写 commit、repository 精确匹配、`upstreamTarget === "darwin-arm64"`、`schemaVersion === 1`），失败时输出字段级错误并以非 0 退出
- [x] 1.3 用故意错误的临时 lock 样本验证校验脚本会失败，再删除临时样本；记录失败与恢复后的验证证据

## 2. 首份上游 lock 与文档

- [x] 2.1 写入 `backend/kimi-code/upstream-lock.json`，固定 `repository=https://github.com/MoonshotAI/kimi-code.git`、`commit=75395f6abb17f83f30d16b51f4e060a639f43622`、`kimiCodeVersion=0.31.1`、`toolchain.node=24.15.0`、`toolchain.packageManager=pnpm@10.33.0`、`upstreamTarget=darwin-arm64`
- [x] 2.2 编写 `backend/kimi-code/README.md`，说明唯一 pin 来源、升级步骤、校验命令，以及 B0.1 / B0.2 / B0.3 职责边界
- [x] 2.3 更新 `.gitignore`，忽略 `backend/kimi-code/.cache/` 与 `.cache/kimi-code/`

## 3. 验证与收尾

- [x] 3.1 运行 `node scripts/verify-upstream-lock.mjs`，确认首份 lock 通过
- [x] 3.2 运行 `openspec-verify-change`，修复全部 CRITICAL；WARNING 修复或在 `design.md` 记录接受理由
- [x] 3.3 运行 `openspec validate --all --strict` 并确保通过
- [x] 3.4 使用 `openspec-sync-specs` 同步 `kimi-upstream-lock` 到主 specs
- [x] 3.5 使用 `openspec-archive-change` 归档本 change
