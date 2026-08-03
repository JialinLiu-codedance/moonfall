#!/usr/bin/env node
/**
 * Build Kimi Web assets into the B0.2 pin checkout (B1.1).
 * Gates on B0 lock + toolchain, then: frozen install → web build → copy-web-assets → verify dist-web.
 * Does not build SEA / smoke / package / App.
 */

import { existsSync, readFileSync, statSync } from "node:fs";
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
const VERIFY_TOOLCHAIN_SCRIPT = resolve(
  repoRoot,
  "scripts/verify-kimi-toolchain.mjs",
);

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
      console.log(`用法: node scripts/build-kimi-web-assets.mjs [--lock <path>] [--cache <path>]

在 B0 pin checkout 上构建 Kimi Web 并复制到 apps/kimi-code/dist-web。
前置：合法 lock、B0.2 clean checkout、B0.3 工具链门禁通过。
本脚本不构建 SEA / 不 smoke / 不 package。

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
 * @param {string} lockPath
 * @param {string} cachePath
 */
function runToolchainGate(lockPath, cachePath) {
  if (!existsSync(VERIFY_TOOLCHAIN_SCRIPT)) {
    fail(
      `缺少 B0.3 脚本：${VERIFY_TOOLCHAIN_SCRIPT}`,
      "toolchain",
    );
  }

  const result = spawnSync(
    process.execPath,
    [
      VERIFY_TOOLCHAIN_SCRIPT,
      "--lock",
      lockPath,
      "--cache",
      cachePath,
    ],
    {
      encoding: "utf8",
      env: process.env,
      cwd: repoRoot,
    },
  );

  if (result.error) {
    fail(
      `无法执行 verify-kimi-toolchain：${result.error.message}`,
      "toolchain",
    );
  }

  const stdout = (result.stdout || "").trim();
  const stderr = (result.stderr || "").trim();
  if (stdout) {
    console.log(stdout);
  }
  if (stderr) {
    console.error(stderr);
  }

  if (result.status !== 0) {
    fail(
      `B0.3 工具链门禁失败（exit ${result.status}）。请先对齐 Node/pnpm 并确认 clean pin checkout。`,
      "toolchain",
    );
  }
}

/**
 * @param {string} command
 * @param {string[]} args
 * @param {{ cwd: string, stage: string }} options
 */
function runCommand(command, args, options) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: "utf8",
    env: process.env,
    shell: false,
  });

  if (result.error) {
    fail(
      `无法执行 ${command} ${args.join(" ")}：${result.error.message}`,
      options.stage,
    );
  }

  const stdout = (result.stdout || "").trim();
  const stderr = (result.stderr || "").trim();
  if (stdout) {
    console.log(stdout);
  }
  if (stderr) {
    // pnpm often writes progress to stderr; still surface it
    console.error(stderr);
  }

  if (result.status !== 0) {
    const detail =
      stderr ||
      stdout ||
      `exit ${result.status ?? "null"}`;
    fail(
      `${command} ${args.join(" ")} 失败：${detail}`,
      options.stage,
    );
  }
}

/**
 * @param {string} cachePath
 * @param {string} commit
 */
function assertDistWeb(cachePath, commit) {
  const distWebIndex = resolve(
    cachePath,
    "apps/kimi-code/dist-web/index.html",
  );
  if (!existsSync(distWebIndex)) {
    fail(
      `缺少 dist-web 产物：${distWebIndex}`,
      "verify",
    );
  }

  let info;
  try {
    info = statSync(distWebIndex);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`无法读取 dist-web 产物：${distWebIndex}\n${message}`, "verify");
  }

  if (!info.isFile()) {
    fail(
      `dist-web index 不是文件：${distWebIndex}`,
      "verify",
    );
  }

  const distWebDir = resolve(cachePath, "apps/kimi-code/dist-web");
  console.log("kimi web assets 构建通过");
  console.log(`  checkout: ${cachePath}`);
  console.log(`  commit: ${commit}`);
  console.log(`  dist-web: ${distWebDir}`);
  console.log(`  index: ${distWebIndex}`);
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

    runToolchainGate(lockPath, cachePath);

    runCommand("pnpm", ["install", "--frozen-lockfile"], {
      cwd: cachePath,
      stage: "install",
    });

    runCommand(
      "pnpm",
      ["--filter", "@moonshot-ai/kimi-web", "run", "build"],
      {
        cwd: cachePath,
        stage: "web-build",
      },
    );

    runCommand(
      process.execPath,
      ["apps/kimi-code/scripts/copy-web-assets.mjs"],
      {
        cwd: cachePath,
        stage: "copy",
      },
    );

    assertDistWeb(cachePath, commit);
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
