# Embergrove QA

## Passed

`node --test tests/engine.test.mjs`

Ten economic and persistence scenarios: strike earnings; atomic affordability; exponential worker prices and spending counters; cumulative worker milestones; upgrade uniqueness and stacking; seed multiplier applied once; prestige threshold, reset and permanent progress; eight-hour offline cap and counters; future save timestamps; malformed save shapes and numeric sanitation.

`node --check dist/game.js` and `node --check dist/engine.mjs`

Static integration check: every literal DOM ID referenced by game.js exists in index.html; engine, UI script, stylesheet and generated forge asset exist.

Reviewed elapsed-time settlement: actions save after advancing the shared monotonic clock, saves accrue pending passive production before stamping wall time, and replacement/reset/prestige reset the clock before subsequent progression.

## Browser verification limitation

Preinstalled Chromium could not start within the execution sandbox. Launch exited with SIGTRAP after `setsockopt: Operation not permitted` from Crashpad. A retry with crash-reporting flags disabled also failed. Browser interactions, rendered appearance and mobile overflow remain unverified unless the parent can run the supplied smoke script in its permitted environment.

Reproducible browser check, with a static server serving `dist/` on port 8080:

`BASE_URL=http://127.0.0.1:8080 node tests/browser-smoke.cjs`

This checks clicking, purchases, passive output, tabs, settings, saving/reload, 390px horizontal overflow, reset confirmation and JavaScript errors. On success, screenshots are `/tmp/embergrove-desktop.png` and `/tmp/embergrove-mobile.png`.
