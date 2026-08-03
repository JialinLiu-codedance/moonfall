## Context

B0.1 已提供 `backend/kimi-code/upstream-lock.json` 与 `scripts/verify-upstream-lock.mjs`；B0.2 已提供 `scripts/fetch-pinned-kimi-code.mjs`，并将 pin 源码置于 `backend/kimi-code/.cache/src`。当前 lock 期望 Node `24.15.0`、`pnpm@10.33.0`、`upstreamTarget: darwin-arm64`，但本机 PATH 可能仍是其他版本，cache 内 `packageManager` / `.nvmrc` / `apps/kimi-code` version 也可能与 lock 漂移。

本 change 对应工作包 B0.3，只负责把工具链与源码元数据一致性变成可失败的机读门禁；不安装依赖、不构建 SEA。

## Goals / Non-Goals

**Goals:**

- 以 lock 为唯一期望来源，校验本机 Node、pnpm 与 lock **精确匹配**。
- 校验宿主 platform/arch 对应 `darwin-arm64`。
- 校验 B0.2 cache 存在且其 lockfile / packageManager / `.nvmrc` / kimi version 与 lock 一致。
- 提供分阶段错误信息与文档化的升级失败规则。
- 保持与 B0.1/B0.2 一致的零重量依赖脚本风格。

**Non-Goals:**

- 不修改 `upstream-lock.json` pin 或 schema。
- 不执行 `git fetch` / clone（缺 cache 时失败并提示先跑 B0.2）。
- 不 `pnpm install`、不构建 Kimi Web / SEA / Tauri App。
- 不接受 “semver 兼容” 或 major 相同即通过。
- 不引入 vitest/ajv 等新依赖或 monorepo 测试框架。

## Decisions

### 1. 入口与布局

```text
backend/kimi-code/
  upstream-lock.json          # B0.1 pin（只读）
  upstream-lock.schema.json
  README.md                   # 补充 B0.3
  .cache/src/                 # B0.2 checkout（只读消费）
scripts/
  verify-kimi-toolchain.mjs   # B0.3 入口
  verify-upstream-lock.mjs    # import validateUpstreamLock
  fetch-pinned-kimi-code.mjs  # 前置，不在本脚本内调用
```

命令：`node scripts/verify-kimi-toolchain.mjs`  
选项：`--lock <path>`（测试用）；不提供网络或安装类选项。

### 2. 校验顺序与阶段标签

1. **`lock`**：import `validateUpstreamLock`，失败立即退出。  
2. **`checkout`**：`backend/kimi-code/.cache/src` 必须存在；执行轻量 git 断言：`HEAD` 等于 `lock.commit` 且 `git status --porcelain` 为空。不 clone、不 fetch、不 clean。  
3. **`platform`**：`process.platform === "darwin"` 且 `process.arch === "arm64"`（对应 lock `upstreamTarget: darwin-arm64`）。  
4. **`node`**：规范化 `process.version`（去掉前导 `v`）后与 `lock.toolchain.node` **字符串精确相等**。  
5. **`pnpm`**：`spawnSync("pnpm", ["--version"], { encoding: "utf8" })`，trim 后与 `lock.toolchain.packageManager` 去掉 `pnpm@` 前缀后的版本精确相等；命令不存在或非 0 同失败。  
6. **`source`**（源码元数据 / lockfile 一致性）：在 cache 内检查：
   - 存在 `pnpm-lock.yaml`
   - 根 `package.json` 的 `packageManager` 等于 `lock.toolchain.packageManager`
   - `.nvmrc` 内容（trim）等于 `lock.toolchain.node`
   - `apps/kimi-code/package.json` 的 `version` 等于 `lock.kimiCodeVersion`

成功：stdout 打印 node、pnpm、platform、checkout path、commit，exit 0。  
失败：stderr 带 `[stage]` 前缀，exit 非 0。

被否决：把 B0.2 fetch 嵌进本脚本——职责混淆，且可能引入网络。  
被否决：仅检查 major 版本——违反可复现 pin。  
被否决：用 `corepack` 强制切换 pnpm——脚本只验证，不改变环境。

### 3. checkout 轻量断言范围

B0.3 **重复** B0.2 的 HEAD/clean 断言作为前置条件，避免在错误或脏 cache 上做工具链结论。  
不重复 remote 比较与 fetch 逻辑；若 HEAD 不匹配，错误信息提示先运行 `node scripts/fetch-pinned-kimi-code.mjs`。

### 4. 升级失败规则（文档 + 行为）

| 场景 | 行为 |
| --- | --- |
| 本机 Node/pnpm ≠ lock | `[node]` / `[pnpm]` 失败，禁止近似通过 |
| 宿主非 darwin-arm64 | `[platform]` 失败 |
| 只改 commit 未同步 toolchain/version | `[source]` 失败 |
| 缺少 cache 或 dirty/HEAD 错 | `[checkout]` 失败 |
| 推荐升级路径 | 更新 lock → `verify-upstream-lock` → `fetch-pinned-kimi-code` → `verify-kimi-toolchain` → B1 |

### 5. 验证策略

- **失败路径**（当前本机 Node 22 / pnpm 9 即可）：直接运行脚本应非 0，且出现 `node` 或 `pnpm` 阶段。  
- **成功路径**：在 PATH 上提供 Node 24.15.0 与 pnpm 10.33.0 后 exit 0（可用 nvm / 临时 PATH；实施时记录所用方式）。  
- **source 失败**：临时改写 lock 副本中的 `kimiCodeVersion` 或 `toolchain` 指向错误值，确认 `[source]` 失败（不污染仓库 pin）。  
- **checkout 失败**：对不存在 cache 路径或错误 `--lock` 样本确认非 0。  
- **回归**：`verify-upstream-lock` 与 `fetch-pinned-kimi-code --offline` 仍通过。

### 6. 实现风格

- 纯 Node ESM，与 B0.1/B0.2 一致。  
- export 可测函数（如 `parsePackageManagerVersion`、`normalizeNodeVersion`、校验主流程），CLI 与 import 双入口。  
- 不新增 package.json 依赖。

## Risks / Trade-offs

- [本机默认 Node/pnpm 未对齐，成功路径需额外安装] → README 给出 nvm/corepack 提示；失败路径先可测。  
- [PATH 上存在多个 pnpm，取到的不是期望版本] → 明确校验“当前 PATH 解析到的 pnpm”；文档要求用正确环境再构建。  
- [`.nvmrc` 格式含注释或空白] → trim 后精确比较；若上游格式变化再单独 change。  
- [轻量 git 断言与 B0.2 重复] → 接受少量重复，避免错误 cache 上的假通过。  
- [误把 B0.3 扩成 install/build] → design/tasks 写死 non-goal。

## Migration Plan

1. 合并后，B1 与本地 SEA 构建前应先跑 `node scripts/verify-kimi-toolchain.mjs`。  
2. 开发者若失败：按 README 对齐 Node/pnpm，或先 `fetch-pinned-kimi-code`。  
3. 回滚：删除 `scripts/verify-kimi-toolchain.mjs` 与 README 相关段落；不影响 lock 与 cache。

## Open Questions

无阻塞问题。若确认 artifacts 时要求改为 “Node 仅校验 major” 或允许 Linux CI stub，需先更新 design/specs 再实施；默认保持精确匹配与 darwin-arm64 only。
