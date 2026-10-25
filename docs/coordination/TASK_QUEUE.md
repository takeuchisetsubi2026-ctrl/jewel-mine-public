# Jewel Mine — shared task queue
**Proposed coordination process, not an automatically executing queue.** One designated Codex thread implements only after a human starts the task. No automatic merges.

## JM-001 — Inventory installed v4.0.7 and v4.0.8 (PARTIAL; DEVICE EVIDENCE NEEDED)
GitHub-side investigation completed in PR #5: https://github.com/wild-uncle/jewel-mine-public/pull/5
- PR #1–#4 inheritance audited; no missing gameplay changes found in inspected evidence.
- PR #4 APK lineage identified; v4.0.8 lineage not identified.
- PR #5 TEST09 candidate package is com.wilduncle.jewelmine.codextest.
- **Outstanding:** device-side package ID, versionCode, signature and install origin of both visible icons. Do not guess.
- User task: open Android App Info for both icons; capture screenshots of app details/version/installation source. If package ID not visible, ask for read-only ADB steps only if a PC is available.
- Acceptance: update target identified with evidence; otherwise do not install.

## JM-002 — Numbered app label and build provenance (IMPLEMENTED IN PR #5; DEVICE TEST PENDING)
- TEST09 label and on-screen build ID, build SHA, package/version/signature verified by CI per report.
- PR #5 draft; no merge. APK: https://github.com/wild-uncle/jewel-mine-public/actions/runs/40170315521/artifacts/12589722990
- Outstanding: confirm on Android after safely identifying existing install. Do not uninstall, clear storage, or silently install as another app.

## JM-003 — Real-device compatibility and feel (BLOCKED BY JM-001)
- Once correct update target is confirmed, perform update without uninstall/data clear.
- Verify old save, score, BEST, board, pieces, FEVER, 80% switch and build label.
- Observe 9-cell frequency, 3+ line clears, responsiveness, heat and battery.
- No battery-improvement claims without comparable device measurements.

## JM-004 — Score/difficulty/generation evidence (BLOCKED BY JM-003)
- Separate score formula, B difficulty and generation evaluation in A/B/C tests.
- More seeds/player policies; report p10/p25/median/p75/p90, censoring, 3-line/full-clear rates and 9-cell leftovers.
- Preserve unknown-origin best; no speculative conversion.

## JM-005 — Save recovery and best-details UI (BLOCKED BY JM-003 AND OWNER APPROVAL)
- Design non-destructive retry/status/separate-slot flow.
- Preserve legacy keys and current BEST. Detailed score view only after review.

## Task lifecycle
BACKLOG -> READY -> IN PROGRESS -> REVIEW -> DONE (or BLOCKED).
Report source commit, branch, tests, CI, PR, APK, device verification and unknowns.
