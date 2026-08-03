## 1. Web assets 构建脚本

- [x] 1.1 新增 `scripts/build-kimi-web-assets.mjs`：解析仓库根与默认 lock/cache 路径；先 `validateUpstreamLock`，再子进程调用 `scripts/verify-kimi-toolchain.mjs` 作为工具链门禁；前置失败时非 0 退出且不进入 install
- [x] 1.2 实现 `install` / `web-build` / `copy`：在 cache 根依次执行 `pnpm install --frozen-lockfile`、`pnpm --filter @moonshot-ai/kimi-web run build`、`node apps/kimi-code/scripts/copy-web-assets.mjs`；各阶段失败标注 `install` / `web-build` / `copy` 并以非 0 退出
- [x] 1.3 实现 `verify` 与成功摘要：断言 `apps/kimi-code/dist-web/index.html` 为文件；stdout 打印 cache 路径、pin commit、`dist-web` 路径；exit 0；不执行 native SEA / smoke / package

## 2. 文档

- [x] 2.1 更新 `backend/kimi-code/README.md`：补充 B1.1 命令、阶段错误表、Node/pnpm 前置、与 B0.1–B0.3 / B1.2 职责边界（本步不构建 SEA）

## 3. 验证与收尾

- [x] 3.1 失败路径：在错误 Node、缺失/错误 cache 等场景运行脚本，确认在 install 前非 0 且阶段标签正确；不污染仓库 pin
- [x] 3.2 成功路径：本机 Node 对齐 `24.15.0` 且 pnpm 对齐 pin 后，运行 `node scripts/build-kimi-web-assets.mjs` 确认 exit 0，并检查 `backend/kimi-code/.cache/src/apps/kimi-code/dist-web/index.html` 存在；回归 `verify-upstream-lock`、`fetch-pinned-kimi-code --offline`、`verify-kimi-toolchain`
- [x] 3.3 运行 `openspec-verify-change`，修复全部 CRITICAL；WARNING 修复或在 `design.md` 记录接受理由
- [x] 3.4 运行 `openspec validate --all --strict` 并确保通过
- [x] 3.5 使用 `openspec-sync-specs` 同步 `kimi-web-assets-build` 到主 specs
- [x] 3.6 使用 `openspec-archive-change` 归档本 change
