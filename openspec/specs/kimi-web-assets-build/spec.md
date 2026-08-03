## Purpose

定义 Moonfall 在 B0 pin checkout 上以单一机读入口完成 frozen install、官方 Kimi Web 构建与 Web assets 复制（`dist-web`）的行为、失败语义与职责边界，使 B1.2 SEA 构建拥有可验收的 Web assets 输入。

## Requirements

### Requirement: 提供单一机读入口构建 Web assets
仓库 MUST 提供 `scripts/build-kimi-web-assets.mjs` 作为 B1.1 唯一机读入口，并 MUST 仅在 B0 pin checkout（`backend/kimi-code/.cache/src`）上编排官方 Kimi Web 构建与 Web assets 复制；成功时 MUST 以退出码 0 结束，失败时 MUST 以非 0 退出。

#### Scenario: 成功构建并复制 Web assets
- **WHEN** lock 合法、B0.3 工具链门禁通过、cache 可安装依赖且官方 web build 与 copy 成功
- **THEN** 脚本以退出码 0 结束，并保证 `apps/kimi-code/dist-web/index.html` 存在

#### Scenario: 前置门禁失败
- **WHEN** lock 非法、cache 缺失、HEAD 不匹配、worktree 脏，或 Node / pnpm / platform / source 与 lock 不一致
- **THEN** 脚本在进入 install 之前以非 0 退出，并标注对应阶段（如 `lock`、`toolchain` 或复用 B0.3 阶段标签）

### Requirement: 使用 frozen-lockfile 安装依赖
脚本在构建前 MUST 于 cache 根目录执行 `pnpm install --frozen-lockfile`；MUST NOT 在无 lock 或允许更新 lock 的模式下安装；install 失败时 MUST 以非 0 退出并标注阶段 `install`。

#### Scenario: frozen install 成功
- **WHEN** cache 内 `pnpm-lock.yaml` 与源码一致且 registry 可达
- **THEN** 依赖安装完成并进入 web build 阶段

#### Scenario: frozen install 失败
- **WHEN** lockfile 与 package.json 不匹配、网络失败，或 pnpm 返回非 0
- **THEN** 脚本以非 0 退出并标注阶段 `install`，且 MUST NOT 继续 web build

### Requirement: 复现官方 Kimi Web 构建与 copy
脚本 MUST 在 cache 内依次执行与上游 `_native-build.yml` 一致的 Web assets 步骤：`pnpm --filter @moonshot-ai/kimi-web run build`，以及 `node apps/kimi-code/scripts/copy-web-assets.mjs`；MUST NOT 跳过官方 copy 脚本或手写替代复制逻辑。

#### Scenario: 官方 web build 与 copy 成功
- **WHEN** install 已完成且上述两条命令均 exit 0
- **THEN** `apps/kimi-web/dist/index.html` 与 `apps/kimi-code/dist-web/index.html` 均存在

#### Scenario: web build 失败
- **WHEN** `@moonshot-ai/kimi-web` 的 build 返回非 0
- **THEN** 脚本以非 0 退出并标注阶段 `web-build`，且 MUST NOT 将失败伪装为 copy 成功

#### Scenario: copy 时缺少 web dist
- **WHEN** web build 未产出 `apps/kimi-web/dist/index.html` 或官方 copy 脚本失败
- **THEN** 脚本以非 0 退出并标注阶段 `copy`

### Requirement: 校验 dist-web 产物并打印摘要
脚本在官方 copy 完成后 MUST 断言 `apps/kimi-code/dist-web/index.html` 为文件；成功时 MUST 在 stdout 打印至少包含 cache 路径、pin commit、`dist-web` 路径的摘要。

#### Scenario: 产物校验通过
- **WHEN** `dist-web/index.html` 存在且为文件
- **THEN** 脚本打印摘要并以退出码 0 结束

#### Scenario: 产物缺失
- **WHEN** copy 命令返回 0 但 `dist-web/index.html` 仍不存在或不是文件
- **THEN** 脚本以非 0 退出并标注阶段 `verify`

### Requirement: 不构建 SEA 且不改 pin
B1.1 入口 MUST NOT 执行 `build:native:release`、`build:native:sea`、native smoke、package 或 manifest 步骤；MUST NOT 修改 `upstream-lock.json` 或 lock schema；产物 MUST 仅写入 gitignored 的 cache 路径。

#### Scenario: 成功路径不产生 SEA 交付要求
- **WHEN** B1.1 脚本成功完成
- **THEN** 完成标准仅要求 Web assets（`dist-web`），不要求 `dist-native` 可执行文件存在

#### Scenario: pin 保持不变
- **WHEN** 开发者运行 B1.1 构建脚本
- **THEN** `backend/kimi-code/upstream-lock.json` 内容不被脚本改写

### Requirement: 文档化 B1.1 命令与职责边界
`backend/kimi-code/README.md` MUST 说明 B1.1 命令、阶段错误含义、Node/pnpm 前置，以及与 B0.1–B0.3 / B1.2 的职责边界。

#### Scenario: 阅读 B1.1 文档
- **WHEN** 开发者阅读 `backend/kimi-code/README.md`
- **THEN** 文档给出 `node scripts/build-kimi-web-assets.mjs` 用法、阶段错误表，并标明本步不构建 SEA
