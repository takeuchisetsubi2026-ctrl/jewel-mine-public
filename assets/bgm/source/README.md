# N1 / L1 supplied extracts

These two JS files are byte-preserved extracts supplied in the 2026-11-10 ZIP,
not the complete jmn14 / jmfl audition HTML/JavaScript engines.
`node tests/bgm-source.cjs` checks all eight bars, durations, chords, bass and hashes.

They are intentionally not loaded by the game yet. The complete audition engines
are not available in this workspace or the current project source list. In
particular, tone/noise envelopes and snare/hat durations are not defined by these
extracts. Do not invent the missing parameters or call this an exact reproduction.

The existing SFX balance branch's music remains unchanged until the full engines
can be compared. A build of this branch is a CI recovery build, not an N1/L1 test.
