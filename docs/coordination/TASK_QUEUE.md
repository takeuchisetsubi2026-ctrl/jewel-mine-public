# Jewel Mine — shared task queue

**This is a proposal, not an automatically running job queue.** Only the designated Codex thread may implement a task after explicit start. Other threads must not execute independently.

## JM-001 — Inventory two installed APK identities (NEXT; investigation only)
Status: READY FOR MANUAL START
Owner: unassigned Codex thread
Code changes: NONE initially

- Trace v4.0.7 and v4.0.8 through repository history, build configs, workflow artifacts, app IDs, versionCode/versionName, signature and save namespaces.
- Map PR #4 build (jewel-mine-test-debug-25) to its exact source commit.
- List which facts require device-side screenshots/settings or APK inspection; do not infer from UI version labels.
- Report recommended canonical test-app ID and safe update path, **without installing, uninstalling, merging or changing app IDs**.
- Output: docs/coordination/reports/JM-001.md in a NEW investigation branch/PR, plus a short summary to the owner.
Acceptance: evidence-backed table, unknowns clearly marked, both old installs untouched.

## JM-002 — Numbered Android app label and build provenance
Status: BLOCKED BY JM-001 AND OWNER APPROVAL
- Show a monotonically managed test-build identifier at the start of Android app label and on-screen build info.
- Verify APK package/version/signature and actual Git commit match displayed identifiers.
- Do not confuse release version, PR number, artifact number, or screen label.
- Do not change package ID, signature or saves without approval.
- New implementation branch and draft PR; regression and CI.

## JM-003 — Android real-device compatibility and feel
Status: WAITING FOR OWNER DEVICE FEEDBACK
- Preserve installed apps and saved data.
- Verify score, BEST, board, pieces, FEVER and 80% switch on update.
- Observe 9-cell frequency, 3+ line clears, early game overs, responsiveness, heat and battery.
- No battery-improvement claims without comparable on-device measurement.

## JM-004 — Score/difficulty/generation evidence
Status: BLOCKED BY JM-003
- Separate score formula, B difficulty criterion and piece-generation evaluation in A/B/C tests.
- More seeds and player policies; report p10/p25/median/p75/p90, right-censoring, 3-line/full-clear rates and 9-cell leftovers.
- Unknown-origin legacy best remains untouched. Do not convert it or assert it is old-formula.

## JM-005 — Save recovery and best-details UI
Status: BLOCKED BY JM-003 AND DESIGN APPROVAL
- Design non-destructive retry/status/separate-slot flow for corrupt/unknown saves.
- Keep legacy keys intact. Keep current BEST display; add optional details later.
- Do not write migration code before compatibility and user approval.

## Task lifecycle
BACKLOG -> READY FOR MANUAL START -> IN PROGRESS -> REVIEW -> DONE (or BLOCKED).
For each task: record source commit, work branch, scope, tests, CI URL, PR URL, APK link (if any), device verification and risks.
