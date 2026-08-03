## Context

Moonfall 尚未引入任何后端构建或 App 工程代码。V1 路线要求 B0 先锁定 Kimi Code 上游，再进入 SEA 构建与协议验收。本地存在 `/Users/liujialin/project/kimi-code` 与 `~/.kimi-code`，但二者都不是 Moonfall 仓库内的可审计事实来源。

本 change 对应工作包 B0.1，只建立 lock schema 与首份 pin；不执行 fetch、toolchain 校验或 native build。

## Goals / Non-Goals

**Goals:**

- 在仓库内固定上游 remote 与完整 commit。
- 定义可机读的 version lock schema 与校验入口。
- 记录该 commit 上的 Kimi Code version 与构建工具链 pin。
- 为 B0.2/B0.3 预留 cache 路径与职责边界说明。

**Non-Goals:**

- 不拉取、缓存或 checkout 上游源码。
- 不校验本机 Node/pnpm/platform 或 `pnpm-lock.yaml` 哈希一致性。
- 不构建 Kimi Web、SEA 或 Tauri App。
- 不记录 SEA SHA-256、Mach-O 架构校验结果或协议 snapshot（属于 B1/B2）。

## Decisions

### 1. 文件布局

```text
backend/kimi-code/
  upstream-lock.schema.json
  upstream-lock.json
  README.md
scripts/
  verify-upstream-lock.mjs
```

选择 `backend/kimi-code/` 作为 B0–B2 后端基座配置根，避免把上游锁定散落在 docs 或根目录。

被否决：把 lock 放在 `docs/`——文档目录不应成为机读构建输入。  
被否决：把 lock 放在 `vendor/`——本阶段不 vendoring 源码，只 pin 远程 commit。

### 2. pin 策略

首份 lock pin：

| 字段 | 值 |
| --- | --- |
| `repository` | `https://github.com/MoonshotAI/kimi-code.git` |
| `commit` | `75395f6abb17f83f30d16b51f4e060a639f43622` |
| `kimiCodeVersion` | `0.31.1` |
| `toolchain.node` | `24.15.0` |
| `toolchain.packageManager` | `pnpm@10.33.0` |
| `upstreamTarget` | `darwin-arm64` |

选择 origin/main HEAD 而非本地旧 checkout，避免落后 50 commits 的协议与构建脚本。  
被否决：pin 本地 `d03a488…`——可复现本机调试态，但不适合作为 V1 基线。  
被否决：pin 浮动 `main`/`latest`——违反“禁止跟随浮动分支”。

### 3. schema 字段边界

B0.1 schema 只覆盖来源身份与 toolchain pin：

- 必填：`schemaVersion`、`repository`、`commit`、`kimiCodeVersion`、`toolchain`、`upstreamTarget`、`recordedAt`
- 可选：`refNote`（仅备注，不得参与 pin 决策）
- 固定业务规则：`schemaVersion === 1`、`repository` 精确匹配 HTTPS URL、`commit` 为 40 位小写 hex、`upstreamTarget === "darwin-arm64"`

被否决：把 SEA checksum、Mach-O、Tauri triple 写入 B0.1 lock——这些是 B1.4 manifest 产物，不是上游 pin 输入。

### 4. 校验脚本范围

`scripts/verify-upstream-lock.mjs` 只做本地文件校验：

1. 读取 schema 与 lock
2. 执行 JSON Schema 校验
3. 执行业务规则校验
4. 成功 exit 0，失败 exit 非 0 并打印字段级错误

不访问网络、不调用 git。网络与 git 身份校验留给 B0.2。

### 5. cache 路径约定

在 `.gitignore` 忽略：

- `backend/kimi-code/.cache/`
- `.cache/kimi-code/`

B0.1 只预留路径；实际 fetch 脚本在 B0.2 创建。

### 6. 校验实现策略

优先使用 Node 内建能力手写最小 schema/业务规则校验，避免为本任务引入重量级依赖。若后续多 schema 复用再评估 `ajv`。

被否决：为单个 lock 文件新增完整 monorepo 测试框架——B0.1 保持最小可运行校验入口。

## Risks / Trade-offs

- [main HEAD 后续可能不可构建] → B0.1 只锁定来源；构建问题在 B1 暴露后通过独立 change 升 commit。
- [手写校验弱于完整 JSON Schema 生态] → 以明确业务规则与可测失败用例补偿；字段集合刻意保持小。
- [version/toolchain 手填漂移] → 实施时从 pin commit 读取真实文件内容写入 lock。
- [开发者误用本地 kimi-code 目录] → README 明确唯一事实来源是仓库内 lock 文件。

## Migration Plan

1. 合并本 change 后，后续 B0.2 必须读取 `upstream-lock.json` 作为唯一 pin。
2. 升级上游时：更新 lock 字段 → 跑 `node scripts/verify-upstream-lock.mjs` → 再执行 B0.2/B0.3/B1 相关 change。
3. 回滚：删除或还原 `backend/kimi-code/` 与校验脚本即可；无运行时数据迁移。

## Open Questions

无阻塞问题。B0.2 的具体 cache 目录最终命名若需调整，可在 B0.2 design 中细化，但不改变本 lock 的 pin 语义。
