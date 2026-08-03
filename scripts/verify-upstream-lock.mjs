#!/usr/bin/env node
/**
 * Validate backend/kimi-code/upstream-lock.json against the local schema
 * and Moonfall B0.1 business rules. No network or git access.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

const EXPECTED_REPOSITORY = "https://github.com/MoonshotAI/kimi-code.git";
const EXPECTED_UPSTREAM_TARGET = "darwin-arm64";
const EXPECTED_SCHEMA_VERSION = 1;
const COMMIT_PATTERN = /^[0-9a-f]{40}$/;
const VERSION_PATTERN = /^[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z.-]+)?$/;
const NODE_PATTERN = /^[0-9]+\.[0-9]+\.[0-9]+$/;
const PACKAGE_MANAGER_PATTERN = /^pnpm@[0-9]+\.[0-9]+\.[0-9]+$/;
const ISO_DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

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
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @param {string} path
 * @param {string} message
 * @returns {string}
 */
function fieldError(path, message) {
  return `${path}: ${message}`;
}

/**
 * Minimal JSON Schema + business-rule validator for the B0.1 lock file.
 * @param {unknown} lock
 * @param {unknown} schema
 * @returns {string[]}
 */
export function validateUpstreamLock(lock, schema) {
  /** @type {string[]} */
  const errors = [];

  if (!isPlainObject(schema)) {
    return [fieldError("schema", "schema 必须是对象")];
  }
  if (!isPlainObject(lock)) {
    return [fieldError("$", "lock 必须是对象")];
  }

  const required = Array.isArray(schema.required) ? schema.required : [];
  for (const key of required) {
    if (!(key in lock)) {
      errors.push(fieldError(String(key), "缺少必填字段"));
    }
  }

  for (const key of Object.keys(lock)) {
    if (
      isPlainObject(schema.properties) &&
      schema.additionalProperties === false &&
      !(key in schema.properties)
    ) {
      errors.push(fieldError(key, "未声明字段（additionalProperties=false）"));
    }
  }

  if ("schemaVersion" in lock) {
    if (lock.schemaVersion !== EXPECTED_SCHEMA_VERSION) {
      errors.push(
        fieldError(
          "schemaVersion",
          `必须为 ${EXPECTED_SCHEMA_VERSION}，实际为 ${JSON.stringify(lock.schemaVersion)}`,
        ),
      );
    }
  }

  if ("repository" in lock) {
    if (lock.repository !== EXPECTED_REPOSITORY) {
      errors.push(
        fieldError(
          "repository",
          `必须精确匹配 ${EXPECTED_REPOSITORY}，实际为 ${JSON.stringify(lock.repository)}`,
        ),
      );
    }
  }

  if ("commit" in lock) {
    if (typeof lock.commit !== "string" || !COMMIT_PATTERN.test(lock.commit)) {
      errors.push(
        fieldError(
          "commit",
          "必须是完整 40 位小写 hex SHA，禁止 branch、短 SHA 或 tag 名",
        ),
      );
    }
  }

  if ("kimiCodeVersion" in lock) {
    if (
      typeof lock.kimiCodeVersion !== "string" ||
      !VERSION_PATTERN.test(lock.kimiCodeVersion)
    ) {
      errors.push(fieldError("kimiCodeVersion", "必须是语义化版本字符串"));
    }
  }

  if ("upstreamTarget" in lock) {
    if (lock.upstreamTarget !== EXPECTED_UPSTREAM_TARGET) {
      errors.push(
        fieldError(
          "upstreamTarget",
          `必须为 ${EXPECTED_UPSTREAM_TARGET}，实际为 ${JSON.stringify(lock.upstreamTarget)}`,
        ),
      );
    }
  }

  if ("recordedAt" in lock) {
    if (
      typeof lock.recordedAt !== "string" ||
      !ISO_DATE_TIME_PATTERN.test(lock.recordedAt) ||
      Number.isNaN(Date.parse(lock.recordedAt))
    ) {
      errors.push(fieldError("recordedAt", "必须是有效的 ISO-8601 date-time"));
    }
  }

  if ("source" in lock) {
    if (typeof lock.source !== "string" || lock.source.trim().length === 0) {
      errors.push(fieldError("source", "必须是非空字符串"));
    }
  }

  if ("refNote" in lock) {
    if (typeof lock.refNote !== "string" || lock.refNote.trim().length === 0) {
      errors.push(fieldError("refNote", "若提供则必须是非空字符串"));
    }
  }

  if ("toolchain" in lock) {
    if (!isPlainObject(lock.toolchain)) {
      errors.push(fieldError("toolchain", "必须是对象"));
    } else {
      const toolchain = lock.toolchain;
      for (const key of ["node", "packageManager"]) {
        if (!(key in toolchain)) {
          errors.push(fieldError(`toolchain.${key}`, "缺少必填字段"));
        }
      }
      for (const key of Object.keys(toolchain)) {
        if (key !== "node" && key !== "packageManager") {
          errors.push(
            fieldError(`toolchain.${key}`, "未声明字段（additionalProperties=false）"),
          );
        }
      }
      if (
        "node" in toolchain &&
        (typeof toolchain.node !== "string" ||
          !NODE_PATTERN.test(toolchain.node))
      ) {
        errors.push(
          fieldError("toolchain.node", "必须是 x.y.z 形式的 Node 版本"),
        );
      }
      if (
        "packageManager" in toolchain &&
        (typeof toolchain.packageManager !== "string" ||
          !PACKAGE_MANAGER_PATTERN.test(toolchain.packageManager))
      ) {
        errors.push(
          fieldError(
            "toolchain.packageManager",
            "必须是 pnpm@x.y.z 形式",
          ),
        );
      }
    }
  }

  return errors;
}

/**
 * @param {string[]} argv
 * @returns {string}
 */
function resolveLockPath(argv) {
  const flagIndex = argv.indexOf("--lock");
  if (flagIndex !== -1) {
    const value = argv[flagIndex + 1];
    if (!value) {
      throw new Error("--lock 需要文件路径参数");
    }
    return resolve(value);
  }
  return DEFAULT_LOCK_PATH;
}

/**
 * @param {string[]} argv
 * @returns {number}
 */
export function main(argv = process.argv.slice(2)) {
  try {
    const lockPath = resolveLockPath(argv);
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

    console.log(`upstream lock 校验通过：${lockPath}`);
    return 0;
  } catch (error) {
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
