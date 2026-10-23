# Embergrove QA

## Passed

`node --test tests/engine.test.mjs`

Ten economic and persistence scenarios: strike earnings; atomic affordability; exponential worker prices and spending counters; cumulative worker milestones; upgrade uniqueness and stacking; seed multiplier applied once; prestige threshold, reset and permanent progress; eight-hour offline cap and counters; future save timestamps; malformed save shapes and numeric sanitation.

`node --check dist/game.js` and `node --check dist/engine.mjs`

Static integration check: every literal DOM ID referenced by game.js exists in index.html; engine, UI script, stylesheet and generated forge asset exist.

Reviewed elapsed-time settlement: actions save after advancing the shared monotonic clock, saves accrue pending passive production before stamping wall time, and replacement/reset/prestige reset the clock before subsequent progression.

## Browser verification passed

The parent ran the supplied browser smoke script with sandboxed network permission, resolving Chromium's initial sandbox launch restriction. Desktop (1440px) and mobile (390px) screenshots were visually inspected. Clicking, purchases, passive output, tabs, settings, save/reload, mobile horizontal overflow, reset cancellation/confirmation and absence of JavaScript page errors all passed.

Reproduce with a static server serving `dist/` on port 8080:

`BASE_URL=http://127.0.0.1:8080 node tests/browser-smoke.cjs`

The script writes desktop and mobile screenshots under `/tmp/`.
