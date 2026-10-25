# Jewel Mine — verified baseline and open questions
Updated: 2026-10-25 UTC

Repository: wild-uncle/jewel-mine-public

## GitHub status
- PR #1: fix/android-feedback-ui.
- PR #2: feature/score-adaptive-piece-generation.
- PR #3: feature/reward-balance-battery.
- PR #4: feature/score-versioning-difficulty, implementation 298c901aa71af1bd0751685d1657ca53aa69d882, report d513c89a95d0bfc382ef2e5257720e66df9142e6.
- PR #5: feature/apk-build-identity, draft/open when checked. Source build commit 2b489f1809e8f0588556fb52db7ebcfa2c92528f; PR head may have later report commits.
- PR #6: coordination/single-task-queue-20261025, this documentation proposal.
- No existing PR or main should be merged or changed without owner approval.

## Inheritance audit (PR #5 report)
PR #1, #2 and #3 heads are ancestors of PR #4. Older separate commit 87dde26 is not an ancestor; its key UX features were implemented independently in PR #1. Earlier effect implementation was intentionally replaced. No missing gameplay feature was found in the inspected Git history and archived APK. Do not cherry-pick old features wholesale.

## Game and save state
- PR #4 new score rule line-v2-20261025, separate save namespace jewel-mine-v36-score-rules and score-records ledger.
- Existing/unknown-origin records preserved; no retroactive score conversion.
- New games use old-formula-equivalent difficulty progression (B) experimentally. Resumed unversioned games retain prior behavior.
- Score, FEVER, drag, battery work inherited; PR #5 reports identical gameplay JS/CSS to PR #4.
- Device-level saved-state migration, responsiveness, battery and heat still unverified.

## PR #5 numbered APK candidate (GitHub evidence, NOT device-verified)
- Label: 09 ジュエルマイン; footer TEST 09 / v4.0.9 / actual build SHA.
- Package: com.wilduncle.jewelmine.codextest.
- Android versionName: 4.0.9; versionCode: 9000271.
- Signing certificate SHA-256: adf316980df6f14b7b5510eafd42c6557d6b6f70623dc35466940bc9c2a4b029.
- CI: https://github.com/wild-uncle/jewel-mine-public/actions/runs/40170315521
- APK artifact: https://github.com/wild-uncle/jewel-mine-public/actions/runs/40170315521/artifacts/12589722990
- Release record: https://github.com/wild-uncle/jewel-mine-public/actions/runs/40170315521/artifacts/12588963945
- Report: docs/reports/2026-10-25-apk-identity-and-thread-audit.md on PR #5 branch.
- CI reported label/version/source/signature and regression checks successful. No real-device update yet.

## Unknown installed apps
User has two separately visible app icons labeled v4.0.7 and v4.0.8. Their actual package IDs, signing identity, versionCode, build source and saved-data scope remain unverified. v4.0.8 source could not be mapped from repository history. Two icons do NOT by themselves prove distinct package IDs; browser/PWA/profile explanations remain possible.

Preserve both. Before installing TEST09, identify intended update target from Android app info / read-only APK inspection. If installation offers a new app instead of an expected update, or refuses update, stop. Do not uninstall or clear data.

## Next decisions
1. Read-only device identification and safe TEST09 update path.
2. Owner confirms device saved-game restoration and usability.
3. B-mode and piece-generation candidate evaluation with larger sample and real feedback.
4. Non-destructive recovery UI and separate best details after approval.
