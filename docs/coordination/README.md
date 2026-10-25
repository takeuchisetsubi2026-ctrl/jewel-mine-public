# Jewel Mine — single source of truth for development coordination

This directory is the **proposed** shared coordination space. It does not activate Codex, poll for changes, or supersede existing PRs automatically.

## Roles
- Owner: approve priorities, app identity, migration, release, merges.
- ChatGPT: inspect GitHub, prepare tasks, review evidence and report results.
- One designated Codex thread: read the task queue, implement approved tasks on separate branches, report evidence.
- Other Codex threads: review/investigate only; do not independently modify the same feature.

## Start here
1. Read [CURRENT_STATE.md](CURRENT_STATE.md) and [TASK_QUEUE.md](TASK_QUEUE.md).
2. Verify PR/branch heads, commits, and CI before any edits; GitHub may have advanced.
3. Claim one task by recording its ID, owner, branch and status in a dedicated work branch/PR. Never treat a prose task as permission to merge or delete data.
4. Use separate implementation branches; do not modify or merge PR #1–#4 or main without explicit approval.
5. Write a completion report including changed files, commit, PR, CI, APK artifact, and what remains unverified.
6. Do not launch another task solely because this file changed. A person must initiate Codex unless an explicitly approved automation is installed.

## Non-negotiable safety
- Do not delete/uninstall either existing Android test app (v4.0.7/v4.0.8).
- Do not clear, rewrite, or infer/convert existing save data or best scores.
- No app ID or signing key changes without explicit owner approval.
- No automatic merges or production releases.
- Do not reimplement completed score/FEVER/drag/battery work.
- App label, versionCode, versionName, on-screen build ID and artifact provenance must be traceable to a real commit.

## Handoff to Codex (one-time)
"Use docs/coordination/README.md, CURRENT_STATE.md and TASK_QUEUE.md in branch coordination/single-task-queue-20261025 as the shared task source. First report which task you will work on and your proposed branch. Do not assume files trigger automatic execution. Do not edit main or PR #1–#4, merge anything, change app IDs or delete saves. Report your PR/commit/CI/APK after completion."

This is an initial coordination proposal. It becomes the canonical workflow only after the owner chooses the single active Codex thread.
