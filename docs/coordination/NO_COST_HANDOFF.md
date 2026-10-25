# Jewel Mine — no-extra-cost Codex handoff

Status: **GitHub read/write relay VERIFIED; unattended Codex startup NOT VERIFIED.**
Test evidence: [connection-test-20261025.md](connection-test-20261025.md) contains `PING` from ChatGPT and `PONG JM-LINK-20261025-A` from Codex (UTC 2026-10-25 07:04:59).

## Single recurring Codex instruction

Use this same instruction in the designated Codex thread whenever the owner authorizes the next task:

> Read `docs/coordination/README.md`, `CURRENT_STATE.md`, and `TASK_QUEUE.md` from branch `coordination/single-task-queue-20261025` in `wild-uncle/jewel-mine-public`. Report the highest-priority task that is READY, its prerequisites, and the proposed work branch. Execute **only** if the queue explicitly marks it approved for execution; otherwise report what is blocked and wait. Never alter main, existing PRs, app IDs, signing, Android installed apps, or saved data. Return the task ID, commit, PR, CI, and remaining device checks.

This instruction **does not** start itself when GitHub files change. The human must send it to Codex. Do not claim fully unattended automation.

## Current gate: device identification

JM-001 still needs real-device evidence for the v4.0.7 and v4.0.8 icons. JM-002 TEST09 is implemented in draft PR #5 but not yet installed/tested on the device. No further code or APK update should be triggered until the intended package ID and update path are confirmed. If a user sees a new installation instead of an update, stop.

## Free workflow

1. Owner tells ChatGPT what to do; ChatGPT updates GitHub coordination docs.
2. Owner manually sends the recurring instruction to the designated Codex thread.
3. Codex reads the queue and, only if approved, creates a separate work branch/PR and reports evidence.
4. ChatGPT verifies GitHub outputs and asks owner for decisions or on-device checks.

GitHub Actions can run existing tests/builds, but they do not independently start a ChatGPT-subscription Codex session. Avoid paid API secrets, third-party unattended bots, and auto-merges. The existing Android debug workflow ignores changes confined to `docs/**`, so coordination-only commits should not trigger an APK build.

## Potential later exploration (not enabled)

Evaluate locally signed-in Codex CLI with an owner-controlled Windows PC, explicit allowlists, rate limits and a manual stop mechanism. Confirm authentication terms, actual unattended support and zero incremental cost **before** enabling. Never store account tokens in repository files or logs.
