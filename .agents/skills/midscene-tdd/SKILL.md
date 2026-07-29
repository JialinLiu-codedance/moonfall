---
name: midscene-tdd
description: Use when an OpenSpec task adds or changes user-visible UI, interaction state, layout, or visual feedback, or when a Tauri milestone, native capability, or release candidate needs real-app acceptance.
---

# Midscene TDD

## Overview

Midscene provides semantic visual acceptance inside Superpowers TDD. It complements deterministic tests; it never replaces unit, component, integration, or Playwright assertions.

**Core principle:** a visible UI task is GREEN only when the same deterministic assertions and Midscene semantic scenario that proved RED both pass after the minimal implementation.

**REQUIRED SUB-SKILL:** Use `test-driven-development` for the enclosing red-green-refactor loop.

## Select The Acceptance Layer

| Change | Required acceptance |
|---|---|
| React WebView UI, interaction, layout, visual feedback | Deterministic Playwright plus Midscene Web |
| Pure non-UI logic | Normal TDD only; Midscene is not required |
| Tauri milestone, release candidate, or native desktop capability | Applicable tests plus Midscene Desktop on the real `.app` |

Use `browser-automation` for interactive browser CLI details. Use `computer-automation` for desktop CLI, health checks, displays, screenshots, and Accessibility troubleshooting.

OpenSpec `tasks.md` remains the only persistent task state. Midscene reports are evidence, not another task ledger.

## Web Dual-Layer Red-Green

For every visible UI task:

1. Before implementation, define one observable user scenario with both:
   - deterministic Playwright assertions for URL, accessible role/name, text, values, state, and events;
   - Midscene actions and semantic assertions for visual location, visible feedback, and whole-screen meaning.
2. Freeze the assertions and prompts for this cycle.
3. Run both layers for RED. Each MUST fail because the target behavior is absent. A model, browser, fixture, or configuration error is `BLOCKED`, not RED.
4. Implement only enough behavior to satisfy the scenario.
5. Run the unchanged deterministic assertions and unchanged Midscene prompts for GREEN. Either failure blocks completion.
6. Refactor only after GREEN, then run both layers again.

Do not weaken a prompt, delete an assertion, replace interaction with a final screenshot, or retry until a favorable answer appears. A changed requirement requires updating the OpenSpec artifacts and obtaining confirmation before changing the scenario.

### Minimal Example

For a Settings save task, the deterministic layer verifies the Save button's accessible name, persisted value, and success event. Midscene performs the same save flow and asserts that the saved state and confirmation are visibly understandable. Both fail before the behavior exists; both pass unchanged afterward.

## Desktop Acceptance

Desktop automation is not part of every UI task. Run it for milestones, release candidates, or changes involving file pickers, notifications, restart recovery, sidecar failures, or operation without Node.js.

Before touching the real desktop:

1. Bring the target `.app` to the foreground by a deterministic launcher.
2. Run `@midscene/computer` connect health checks.
3. Take and inspect a screenshot; confirm the target app, correct display, unlocked screen, and non-black capture.
4. Confirm macOS Accessibility permission before actions.
5. Execute the applicable flow and use observable screen assertions.
6. Disconnect and record results and artifact paths.

Stop as `BLOCKED` on missing Accessibility permission, black or locked screen, wrong display, failed health check, or uncertain foreground app. Do not continue operating another app or display.

## Local And CI Gates

| Environment | Deterministic Playwright | Midscene |
|---|---|---|
| Local visible UI task | Hard gate | Midscene Web hard gate |
| CI with model configuration | Hard gate | Run; assertion failure blocks the job |
| CI without model configuration | Hard gate | Mark `skipped` with the missing-configuration reason |

An unexecuted Midscene job is never `passed`. Local Midscene cannot be skipped merely because CI lacks secrets.

Local model configuration may use protected `MIDSCENE_MODEL_*` environment values or `codex://app-server`. CI uses protected secrets only; never print either configuration's sensitive values.

Until M0 installs `@midscene/web`, `playwright`, `@playwright/test`, and `@midscene/computer` with fixtures, reporters, stable data, fixed viewports, commands, and CI jobs, report dependent visible UI work as `BLOCKED` or update the confirmed artifacts. Do not claim runnable Midscene UI TDD from skills alone.

## Failure And Evidence Contract

Classify a failure before changing anything:

| Failure | Response |
|---|---|
| Product behavior is wrong | Fix implementation; rerun the same scenario |
| Assertion or prompt contradicts confirmed requirements | Update OpenSpec artifacts and obtain confirmation first |
| Model, browser, permission, fixture, or automation is unavailable | Preserve evidence and report `BLOCKED` |

Completion evidence MUST include the command, result, and local or CI artifact path for deterministic RED/GREEN and Midscene RED/GREEN. Keep reports for diagnosis and human review, but do not commit `midscene_run/`, screenshots, caches, logs, `.env`, API keys, or model secrets.

## Red Flags

- "Playwright passed, so Midscene can wait."
- "The final screenshot looks right."
- "Loosen the prompt to make GREEN."
- "Retry until the model passes."
- "CI has no secret, so skip locally too."
- "Infrastructure failure is close enough to RED."

All indicate the acceptance loop is incomplete. Keep the task unchecked and report the actual failed or `BLOCKED` state.

## Common Mistakes

| Mistake | Correction |
|---|---|
| Running deterministic Playwright only after implementation | Observe deterministic and semantic RED before implementation |
| Treating a screenshot as an assertion | Use deterministic assertions and Midscene `assert`/`aiAssert` |
| Using Desktop for every WebView change | Reserve Desktop for real-app milestone, release, and native flows |
| Printing model configuration in evidence | Record only configuration presence and result, never values |
| Tracking completion in reports | Update only the current OpenSpec `tasks.md` checkbox |

## Upstream Provenance

Read [references/upstream.md](references/upstream.md) when validating or upgrading the vendored official skills.
