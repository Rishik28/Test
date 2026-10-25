# Oddfolk

A small village, a little music, a lot of joy. A browser incremental game pairing a Flemish pixel-art village with a muted flax-and-olive editorial interface.

## Play locally

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. Tap the piper or bell for JOY. Hold either for one second to trigger a five-second frenzy (40 automatic notes), followed by ten seconds of recharge. Space and Enter also work. Hire a Piper, Dancer, Baker or Bell to generate JOY while away, buy upgrades, and begin a Reprise at 100K JOY for permanent renown.

Characters use transparent four-frame sprite sheets. Recruiting villagers adds characters to the square; further progress unlocks a larger gathering and festival flags. Reduced-motion settings freeze decorative animation. The responsive layout fits one viewport; settings can scroll on short screens.

Saves stay on the current browser. Export/import is available in settings. Existing Embergrove saves are compatible: the original storage key, numeric fields and IDs are preserved. Offline progress is capped at eight hours.

## Source and verification

- `dist/`: deployable static game, no build dependencies
- `DESIGN.md`: systems, balance, art direction and save compatibility
- `art/selected-pipeline.json`: current background and frame-sheet contracts
- `art/`: prompts, generation history and PNG verifier
- `tests/`: economy, interactions, viewport, frame animation and migration checks
- `QA.md`: verification results and limitations

```sh
node --test tests/engine.test.mjs
node art/verify.mjs
node tests/run-browser.cjs interaction.test.cjs browser-smoke.cjs oddfolk.cjs
```

Browser checks use preinstalled Playwright and Chromium. They launch their own temporary static server and close it when finished. This managed environment requires sandboxed network permission for browser checks.
