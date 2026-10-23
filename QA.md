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

## v1.1 interaction and viewport checks

`node tests/interaction.test.cjs` (same local static server; run browser with sandboxed network access).

Passed at 1440×900, 1366×768, 1024×768, 390×844, 375×667, 320×568, 844×390 and 667×375, on both shop tabs: no page overflow, no clipped purchase controls, no overflowing cards. Checked short taps; pointer and keyboard holds; exactly 40 burst strikes over 5 seconds; recharge; pointer cancellation; holding past burst completion without retriggering; interruption by window blur; rapid touch taps without duplicate earnings or viewport scale changes; reduced-motion behavior; and no JavaScript page errors. Desktop and mobile screenshots inspected.

Mobile gesture checks use touch-enabled Chromium. Physical vibration and Safari behavior require device verification; unsupported vibration gracefully falls back to visual feedback.
