#!/usr/bin/env node
/**
 * Fetch and pin-check Kimi Code upstream into backend/kimi-code/.cache/src.
 * B0.2: remote identity, detached HEAD, clean worktree. No toolchain checks.
 */

import { existsSync, mkdirSync, readFileSync } from "node:fs";
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
 * @param {string} url
 * @returns {string}
 */
export function normalizeRemoteUrl(url) {
  let normalized = url.trim().replace(/\/+$/, "");
  if (normalized.endsWith(".git")) {
    normalized = normalized.slice(0, -4);
  }
  return normalized;
}

/**
 * @param {string[]} argv
 * @returns {{ lockPath: string, offline: boolean }}
 */
function parseArgs(argv) {
  let lockPath = DEFAULT_LOCK_PATH;
  let offline = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--offline") {
      offline = true;
      continue;
    }
    if (arg === "--lock") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("--lock 需要文件路径参数");
      }
      lockPath = resolve(value);
      i += 1;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log(`用法: node scripts/fetch-pinned-kimi-code.mjs [--lock <path>] [--offline]

按 backend/kimi-code/upstream-lock.json 拉取上游到 backend/kimi-code/.cache/src，
并校验 remote、detached HEAD 与 clean worktree。

  --lock <path>   指定 lock 文件（默认仓库内 upstream-lock.json）
  --offline       不访问网络；本地须已含 pin commit
`);
      process.exit(0);
    }
    throw new Error(`未知参数：${arg}`);
  }

  return { lockPath, offline };
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
 * @param {string} cachePath
 * @returns {boolean}
 */
function isGitDir(cachePath) {
  if (!existsSync(cachePath)) {
    return false;
  }
  const result = spawnSync("git", ["-C", cachePath, "rev-parse", "--git-dir"], {
    encoding: "utf8",
  });
  return result.status === 0;
}

/**
 * @param {string} cachePath
 * @param {string} expectedRepository
 * @param {string} stage
 */
function assertRemoteMatches(cachePath, expectedRepository, stage) {
  const actual = runGit(["remote", "get-url", "origin"], {
    cwd: cachePath,
    stage,
  });
  if (normalizeRemoteUrl(actual) !== normalizeRemoteUrl(expectedRepository)) {
    fail(
      `origin remote 与 lock.repository 不一致\n  期望：${expectedRepository}\n  实际：${actual}`,
      stage,
    );
  }
}

/**
 * @param {string} cachePath
 * @param {string} commit
 * @param {boolean} offline
 */
function ensureCommitReachable(cachePath, commit, offline) {
  const probe = spawnSync("git", ["-C", cachePath, "cat-file", "-e", `${commit}^{commit}`], {
    encoding: "utf8",
  });
  if (probe.status === 0) {
    return;
  }
  if (offline) {
    fail(
      `本地无法解析 pin commit ${commit}；offline 模式需要先在有网络时 fetch`,
      "checkout",
    );
  }
  // Online path should have fetched already; still try one more explicit fetch of the SHA.
  runGit(["fetch", "--tags", "origin", commit], {
    cwd: cachePath,
    stage: "fetch",
  });
  const again = spawnSync(
    "git",
    ["-C", cachePath, "cat-file", "-e", `${commit}^{commit}`],
    { encoding: "utf8" },
  );
  if (again.status !== 0) {
    fail(`fetch 后仍无法解析 pin commit ${commit}`, "checkout");
  }
}

/**
 * @param {string} cachePath
 * @param {string} commit
 */
function checkoutDetached(cachePath, commit) {
  runGit(["checkout", "--detach", commit], {
    cwd: cachePath,
    stage: "checkout",
  });
  const head = runGit(["rev-parse", "HEAD"], {
    cwd: cachePath,
    stage: "checkout",
  });
  if (head !== commit) {
    fail(
      `HEAD 与 lock.commit 不一致\n  期望：${commit}\n  实际：${head}`,
      "checkout",
    );
  }
  const detached = spawnSync(
    "git",
    ["-C", cachePath, "symbolic-ref", "-q", "HEAD"],
    { encoding: "utf8" },
  );
  // symbolic-ref fails (non-zero) when detached — that is required.
  if (detached.status === 0) {
    fail("worktree 必须处于 detached HEAD，当前仍指向分支", "checkout");
  }
}

/**
 * @param {string} cachePath
 */
function assertCleanWorktree(cachePath) {
  const porcelain = runGit(["status", "--porcelain"], {
    cwd: cachePath,
    stage: "worktree",
  });
  if (porcelain.length > 0) {
    const summary = porcelain
      .split("\n")
      .slice(0, 20)
      .join("\n");
    fail(
      `worktree 不干净（git status --porcelain 非空）。请清理或删除 cache 后重跑。\n${summary}`,
      "worktree",
    );
  }
}

/**
 * @param {string} repository
 * @param {string} cachePath
 * @param {boolean} offline
 */
function ensureCache(repository, cachePath, offline) {
  if (!existsSync(cachePath)) {
    if (offline) {
      fail(
        `cache 不存在：${cachePath}；offline 模式无法 clone`,
        "clone",
      );
    }
    mkdirSync(dirname(cachePath), { recursive: true });
    console.error(`[clone] 正在 clone ${repository} → ${cachePath}`);
    runGit(["clone", repository, cachePath], { stage: "clone" });
    return;
  }

  if (!isGitDir(cachePath)) {
    fail(
      `cache 路径已存在但不是 git 仓库：${cachePath}`,
      "remote",
    );
  }

  assertRemoteMatches(cachePath, repository, "remote");

  if (!offline) {
    console.error(`[fetch] 正在 fetch origin（含 tags）`);
    runGit(["fetch", "--tags", "origin"], {
      cwd: cachePath,
      stage: "fetch",
    });
  }
}

/**
 * @param {string[]} argv
 * @returns {number}
 */
export function main(argv = process.argv.slice(2)) {
  try {
    const { lockPath, offline } = parseArgs(argv);
    const schema = readJson(SCHEMA_PATH);
    const lock = readJson(lockPath);
    const errors = validateUpstreamLock(lock, schema);

    if (errors.length > 0) {
      console.error(`upstream lock 校验失败：${lockPath}`);
      for (const error of errors) {
        console.error(`  - ${error}`);
      }
      return 1;
    }

    if (
      typeof lock !== "object" ||
      lock === null ||
      typeof lock.repository !== "string" ||
      typeof lock.commit !== "string"
    ) {
      console.error("[lock] lock 缺少 repository 或 commit");
      return 1;
    }

    const repository = lock.repository;
    const commit = lock.commit;
    const cachePath = DEFAULT_CACHE_PATH;

    ensureCache(repository, cachePath, offline);
    assertRemoteMatches(cachePath, repository, "remote");
    ensureCommitReachable(cachePath, commit, offline);
    checkoutDetached(cachePath, commit);
    assertCleanWorktree(cachePath);

    console.log("kimi-code upstream fetch 成功");
    console.log(`  path:       ${cachePath}`);
    console.log(`  repository: ${repository}`);
    console.log(`  commit:     ${commit}`);
    console.log(`  mode:       ${offline ? "offline" : "online"}`);
    return 0;
  } catch (error) {
    // fail() already printed and set exitCode; avoid double message when rethrown
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
