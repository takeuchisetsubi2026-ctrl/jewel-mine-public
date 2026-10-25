# Jewel Mine — verified baseline and open questions
Updated: 2026-10-25 (Japan time)

Repository: wild-uncle/jewel-mine-public

- PR #1: fix/android-feedback-ui (earlier Android feedback). The head commit 8b598c808cdf3e17a7952575965129bee22b7033 is an ancestor of feature/score-versioning-difficulty, per GitHub compare.
- PR #2: feature/score-adaptive-piece-generation.
- PR #3: feature/reward-balance-battery.
- PR #4: feature/score-versioning-difficulty; draft, open when checked.
- PR #4 implementation: 298c901aa71af1bd0751685d1657ca53aa69d882.
- PR #4 report: d513c89a95d0bfc382ef2e5257720e66df9142e6.
- Report: docs/reports/2026-10-25-score-versioning-difficulty.md.
- Android test APK for PR #4: https://github.com/wild-uncle/jewel-mine-public/actions/runs/40161734949/artifacts/12585894845
- Build reported as successful; on-device update, save restoration, heat and battery have NOT been verified.

### Implemented according to report
- New score rule ID line-v2-20261025 and separate save namespace jewel-mine-v36-score-rules.
- Old saves preserved read-only; separate legacy/unknown, new-rule and reference bests.
- New games: old-formula-equivalent progression for the 80% difficulty switch (B, trial).
- Resumed unversioned games: existing progression and generation behavior.
- Piece generation evaluation modified experimentally; not proven better in human play.
- FEVER, multiplier display, drag and idle power work inherited, not to be reimplemented.

### Android versions are NOT yet identified
Two separately installed Android icons are observed, showing v4.0.7 and v4.0.8. The user believes v4.0.7 may have newer behavior. Screen labels alone do not prove source commit, app ID, signing identity, save namespace, or versionCode. Preserve both until traced.

### Open decisions
1. Map each installed Android app to its package ID, build source, signature and save scope.
2. Confirm update-install and save recovery on device without uninstall or data clear.
3. Retain unknown-provenance best as an explicitly provisional B-mode baseline; no retroactive conversion.
4. Compare B-mode and piece-generation candidate with larger tests and human feedback.
5. Only then prioritize non-destructive recovery UI and separate best-score details.
