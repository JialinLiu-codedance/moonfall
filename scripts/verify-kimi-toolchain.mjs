#!/usr/bin/env node
/**
 * Verify host Node/pnpm/platform and B0.2 checkout metadata against upstream lock.
 * B0.3: exact match only. No network, no install, no build, no cache mutation.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { validateUpstreamLock } from "./verify-upstream-lock.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const DEFAULT_LOCK_PATH = resolve(
  repoRoot,
  "backend/kimi-code/upstream-lock.json",
);
const SCHEMA_PATH = resolve(
  repoRoot,
  "backend/kimi-code/upstream-lock.schema.json",
);
const DEFAULT_CACHE_PATH = resolve(repoRoot, "backend/kimi-code/.cache/src");

/**
 * @param {string} message
 * @param {string} [stage]
 * @returns {never}
 */
function fail(message, stage) {
  const prefix = stage ? `[${stage}] ` : "";
  console.error(`${prefix}${message}`);
  process.exitCode = 1;
  throw new Error(`${prefix}${message}`);
}

/**
 * @param {string} path
 * @returns {unknown}
 */
function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`无法读取 JSON：${path}\n${message}`);
  }
}

/**
 * @param {string} version
 * @returns {string}
 */
export function normalizeNodeVersion(version) {
  const trimmed = version.trim();
  return trimmed.startsWith("v") ? trimmed.slice(1) : trimmed;
}

/**
 * @param {string} packageManager
 * @returns {string}
 */
export function parsePackageManagerVersion(packageManager) {
  const match = /^pnpm@([0-9]+\.[0-9]+\.[0-9]+)$/.exec(packageManager.trim());
  if (!match) {
    throw new Error(
      `无法解析 toolchain.packageManager：${JSON.stringify(packageManager)}`,
    );
  }
  return match[1];
}

/**
 * @param {string[]} argv
 * @returns {{ lockPath: string, cachePath: string }}
 */
function parseArgs(argv) {
  let lockPath = DEFAULT_LOCK_PATH;
  let cachePath = DEFAULT_CACHE_PATH;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--lock") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("--lock 需要文件路径参数");
      }
      lockPath = resolve(value);
      i += 1;
      continue;
    }
    if (arg === "--cache") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("--cache 需要目录路径参数");
      }
      cachePath = resolve(value);
      i += 1;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log(`用法: node scripts/verify-kimi-toolchain.mjs [--lock <path>] [--cache <path>]

按 backend/kimi-code/upstream-lock.json 校验本机 Node/pnpm/platform，
以及 backend/kimi-code/.cache/src 内的 lockfile 与源码元数据。

  --lock <path>    指定 lock 文件（默认仓库内 upstream-lock.json）
  --cache <path>   指定 checkout 路径（默认 backend/kimi-code/.cache/src）
`);
      process.exit(0);
    }
    throw new Error(`未知参数：${arg}`);
  }

  return { lockPath, cachePath };
}

/**
 * @param {string[]} args
 * @param {{ cwd?: string, stage: string }} options
 * @returns {string}
 */
function runGit(args, options) {
  const result = spawnSync("git", args, {
    cwd: options.cwd,
    encoding: "utf8",
    env: process.env,
  });

  if (result.error) {
    fail(
      `无法执行 git ${args.join(" ")}：${result.error.message}`,
      options.stage,
    );
  }

  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    const stdout = (result.stdout || "").trim();
    const detail = stderr || stdout || `exit ${result.status}`;
    fail(`git ${args.join(" ")} 失败：${detail}`, options.stage);
  }

  return (result.stdout || "").trim();
}

/**
 * @param {unknown} lock
 * @param {unknown} schema
 * @param {string} lockPath
 */
function assertLockValid(lock, schema, lockPath) {
  const errors = validateUpstreamLock(lock, schema);
  if (errors.length > 0) {
    const detail = errors.map((error) => `  - ${error}`).join("\n");
    fail(`upstream lock 校验失败：${lockPath}\n${detail}`, "lock");
  }
}

/**
 * @param {string} cachePath
 * @param {string} commit
 */
function assertCheckout(cachePath, commit) {
  if (!existsSync(cachePath)) {
    fail(
      `缺少 B0.2 checkout：${cachePath}\n请先运行：node scripts/fetch-pinned-kimi-code.mjs`,
      "checkout",
    );
  }

  const gitDir = spawnSync("git", ["-C", cachePath, "rev-parse", "--git-dir"], {
    encoding: "utf8",
  });
  if (gitDir.status !== 0) {
    fail(
      `checkout 不是 git 目录：${cachePath}\n请先运行：node scripts/fetch-pinned-kimi-code.mjs`,
      "checkout",
    );
  }

  const head = runGit(["rev-parse", "HEAD"], {
    cwd: cachePath,
    stage: "checkout",
  });
  if (head !== commit) {
    fail(
      `HEAD 与 lock.commit 不一致\n  期望：${commit}\n  实际：${head}\n请先运行：node scripts/fetch-pinned-kimi-code.mjs`,
      "checkout",
    );
  }

  const porcelain = runGit(["status", "--porcelain"], {
    cwd: cachePath,
    stage: "checkout",
  });
  if (porcelain.length > 0) {
    const summary = porcelain.split("\n").slice(0, 10).join("\n");
    fail(
      `worktree 不干净，拒绝在脏 checkout 上校验工具链\n${summary}\n请先运行：node scripts/fetch-pinned-kimi-code.mjs`,
      "checkout",
    );
  }
}

/**
 * @param {string} upstreamTarget
 */
export function assertPlatform(upstreamTarget) {
  if (upstreamTarget !== "darwin-arm64") {
    fail(
      `不支持的 upstreamTarget：${JSON.stringify(upstreamTarget)}（B0.3 仅处理 darwin-arm64）`,
      "platform",
    );
  }

  const actual = `${process.platform}-${process.arch}`;
  if (process.platform !== "darwin" || process.arch !== "arm64") {
    fail(
      `宿主 platform 与 lock.upstreamTarget 不匹配\n  期望：darwin-arm64\n  实际：${actual}`,
      "platform",
    );
  }
}

/**
 * @param {string} expectedNode
 * @param {string} [actualVersion]
 */
export function assertNodeVersion(expectedNode, actualVersion = process.version) {
  const actual = normalizeNodeVersion(actualVersion);
  if (actual !== expectedNode) {
    fail(
      `Node 版本与 lock.toolchain.node 不完全相等\n  期望：${expectedNode}\n  实际：${actual}`,
      "node",
    );
  }
}

/**
 * @param {string} packageManager
 * @param {() => string} [versionReader]
 */
export function assertPnpmVersion(
  packageManager,
  versionReader = () => {
    const result = spawnSync("pnpm", ["--version"], {
      encoding: "utf8",
      env: process.env,
    });
    if (result.error) {
      fail(
        `无法执行 pnpm --version：${result.error.message}`,
        "pnpm",
      );
    }
    if (result.status !== 0) {
      const detail =
        (result.stderr || "").trim() ||
        (result.stdout || "").trim() ||
        `exit ${result.status}`;
      fail(`pnpm --version 失败：${detail}`, "pnpm");
    }
    return (result.stdout || "").trim();
  },
) {
  let expected;
  try {
    expected = parsePackageManagerVersion(packageManager);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(message, "pnpm");
  }

  const actual = versionReader().trim();
  if (actual !== expected) {
    fail(
      `pnpm 版本与 lock.toolchain.packageManager 不完全相等\n  期望：${expected}\n  实际：${actual}`,
      "pnpm",
    );
  }
}

/**
 * @param {string} cachePath
 * @param {{
 *   packageManager: string,
 *   node: string,
 *   kimiCodeVersion: string,
 * }} expected
 */
export function assertSourceMetadata(cachePath, expected) {
  const lockfilePath = resolve(cachePath, "pnpm-lock.yaml");
  if (!existsSync(lockfilePath)) {
    fail(`缺少 pnpm-lock.yaml：${lockfilePath}`, "source");
  }

  const rootPackagePath = resolve(cachePath, "package.json");
  if (!existsSync(rootPackagePath)) {
    fail(`缺少根 package.json：${rootPackagePath}`, "source");
  }
  const rootPackage = readJson(rootPackagePath);
  if (
    !rootPackage ||
    typeof rootPackage !== "object" ||
    Array.isArray(rootPackage)
  ) {
    fail(`根 package.json 非法：${rootPackagePath}`, "source");
  }
  const actualPackageManager = /** @type {Record<string, unknown>} */ (
    rootPackage
  ).packageManager;
  if (actualPackageManager !== expected.packageManager) {
    fail(
      `根 package.json packageManager 与 lock 不一致\n  期望：${expected.packageManager}\n  实际：${JSON.stringify(actualPackageManager)}`,
      "source",
    );
  }

  const nvmrcPath = resolve(cachePath, ".nvmrc");
  if (!existsSync(nvmrcPath)) {
    fail(`缺少 .nvmrc：${nvmrcPath}`, "source");
  }
  const nvmrc = readFileSync(nvmrcPath, "utf8").trim();
  if (nvmrc !== expected.node) {
    fail(
      `.nvmrc 与 lock.toolchain.node 不一致\n  期望：${expected.node}\n  实际：${nvmrc}`,
      "source",
    );
  }

  const kimiPackagePath = resolve(cachePath, "apps/kimi-code/package.json");
  if (!existsSync(kimiPackagePath)) {
    fail(`缺少 apps/kimi-code/package.json：${kimiPackagePath}`, "source");
  }
  const kimiPackage = readJson(kimiPackagePath);
  if (
    !kimiPackage ||
    typeof kimiPackage !== "object" ||
    Array.isArray(kimiPackage)
  ) {
    fail(`apps/kimi-code/package.json 非法：${kimiPackagePath}`, "source");
  }
  const actualVersion = /** @type {Record<string, unknown>} */ (kimiPackage)
    .version;
  if (actualVersion !== expected.kimiCodeVersion) {
    fail(
      `apps/kimi-code version 与 lock.kimiCodeVersion 不一致\n  期望：${expected.kimiCodeVersion}\n  实际：${JSON.stringify(actualVersion)}`,
      "source",
    );
  }
}

/**
 * @param {string[]} argv
 * @returns {number}
 */
export function main(argv = process.argv.slice(2)) {
  try {
    const { lockPath, cachePath } = parseArgs(argv);
    const schema = readJson(SCHEMA_PATH);
    const lock = readJson(lockPath);

    assertLockValid(lock, schema, lockPath);

    const lockRecord = /** @type {Record<string, unknown>} */ (lock);
    const commit = String(lockRecord.commit);
    const toolchain = /** @type {Record<string, unknown>} */ (
      lockRecord.toolchain
    );
    const expectedNode = String(toolchain.node);
    const packageManager = String(toolchain.packageManager);
    const kimiCodeVersion = String(lockRecord.kimiCodeVersion);
    const upstreamTarget = String(lockRecord.upstreamTarget);

    assertCheckout(cachePath, commit);
    assertPlatform(upstreamTarget);
    assertNodeVersion(expectedNode);
    assertPnpmVersion(packageManager);
    assertSourceMetadata(cachePath, {
      packageManager,
      node: expectedNode,
      kimiCodeVersion,
    });

    console.log("kimi toolchain 校验通过");
    console.log(`  lock: ${lockPath}`);
    console.log(`  checkout: ${cachePath}`);
    console.log(`  commit: ${commit}`);
    console.log(`  node: ${expectedNode}`);
    console.log(`  pnpm: ${parsePackageManagerVersion(packageManager)}`);
    console.log(`  platform: darwin-arm64`);
    console.log(`  kimiCodeVersion: ${kimiCodeVersion}`);
    return 0;
  } catch (error) {
    if (process.exitCode === 1) {
      return 1;
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    return 1;
  }
}

const isDirectRun =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  process.exit(main());
}
