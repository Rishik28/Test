# Embergrove — systems design

A quiet woodland forge wakes one ember at a time. The player stokes a central forge, recruits forest workers, improves tools, and eventually rekindles the grove for permanent growth.

## Core loop

**Stoke → hire → improve → rekindle.** Start with 0 embers and 1 ember per click. Embers are both spendable currency and production output. Show current balance, effective click strength, embers per second, and run-earned embers. Buying things never reduces run-earned embers.

Use one continuous screen: title/status at top, large illustrated forge in the center-left, recruit/upgrade cards to the right, and compact milestone/prestige panels below. The forge is a native button usable with pointer, touch, Enter, or Space. Floating `+N` feedback makes every strike visible. Respect reduced motion. Avoid forcing rapid tapping for basic progress.

## Economy

| Worker | Base cost | Base output/sec | Fiction |
| --- | ---: | ---: | --- |
| Spark Sprite | 15 | 0.2 | Carries a glowing coal |
| Moss Tender | 100 | 1.5 | Feeds the woodland furnace |
| Forge Fox | 650 | 8 | Hammers enchanted iron |
| Ancient Golem | 4,000 | 40 | Keeps the great bellows breathing |

For a worker with `n` owned, next cost is `ceil(baseCost * 1.15 ** n)`. Its total output is `n * baseOutput * tierMultiplier`. At 10, 25, and 50 owned, that worker's tier multiplier doubles (2×, 4×, then 8× cumulative). Milestones are automatic and always derivable from counts, with a toast when reached. All worker types are visible from the start; unaffordable cards remain readable and show their price. Batch purchases require the full displayed batch cost.

Effective passive output is `sum(workerOutput) * globalProductionMultiplier * seedMultiplier`. Effective click output is `baseClick * clickUpgradeMultiplier * seedMultiplier`. Use floating-point balances internally and sensible display rounding. Clamp purchase amounts to integers and refuse purchases atomically when funds are insufficient.

## One-time upgrades

| Upgrade | Cost | Effect |
| --- | ---: | --- |
| Copper Poker | 50 | Click output ×2 |
| Iron Bellows | 300 | Click output ×3 (6 total) |
| Living Coals | 750 | All passive output ×2 |
| Moonsteel Hammer | 2,500 | Click output ×4 (24 total) |
| Heartwood Furnace | 6,000 | All passive output ×2 (4 total) |
| Starfire Crucible | 25,000 | All passive output ×3 (12 total) |

Purchased upgrades visibly change state and cannot be repurchased. Show an upgrade's actual effect, not an ambiguous level number. Workers and upgrades have clearly labeled tabs; upgrades show a remaining count.

## Progress and rekindling

Lifetime milestones: **First light** at 100 lifetime-earned embers, **A warmer welcome** at 1,000, **The grove awakens** at 10,000, **Ancient magic** at 100,000, **A forest of fireflies** at 1,000,000, and **An everlasting flame** at 10,000,000. Milestones are narrative rewards; they do not secretly change the economy and persist across rekindling. The current objective shows progress to the next milestone.

Rekindling unlocks at **100,000 run-earned embers**. Preview reward as `floor(sqrt(runEarned / 100000))` Grove Seeds. Each permanent seed provides **+10%** to clicks and passive production, additive with other seeds: `seedMultiplier = 1 + totalSeeds * 0.1`. Rekindling adds the previewed seeds, then resets currency, run-earned embers, workers, and purchased upgrades. Preserve total seeds, lifetime-earned embers, settings, and rekindle count. Confirm this reset in an in-game dialog describing the precise reward and reset. Never grant zero seeds or allow a double-trigger.

## Saving and offline progress

Autosave to a versioned localStorage key every 5 seconds, after purchases, after rekindling, and on page hide. Save balance, run/lifetime earnings, worker counts, upgrade IDs, seeds, rekindle count, settings, and last-update timestamp. Show a small saved indicator; storage failure should leave the game playable and show a nonblocking status.

On load, validate every numeric field as finite and nonnegative, worker counts as safe integers, and upgrade IDs against the known list. Ignore malformed saves without crashing. Offline reward is `savedEffectiveEPS * min(max(elapsedSeconds, 0), 28800)` (8-hour cap), awarded to balance plus run/lifetime earnings. A brief “While you were away” summary appears for rewards of at least one ember. Update the timestamp immediately to prevent repeated offline claims on reload. Active animation ticks use actual elapsed time capped at eight hours per resumed tick. A future clock timestamp grants no offline reward. Settings also provide save export/import and a confirmed full reset.

## Feel and presentation

16-bit pixel-art woodland at twilight: charcoal navy shadows, moss greens, copper framing, honey-gold type accents, and bright orange embers. Main scene: small stone forge beneath a great old tree, tiny smith/fox silhouette, fireflies, and warm window light. Preserve crisp nearest-neighbor image rendering; actual text stays selectable HTML for readability. Dark beveled panels and restrained pixel borders should support the scene without overwhelming it.

Sound is an opt-in toggle (light forge tick/chime; no autoplay dependence). A concise strike hint and visible first-worker price introduce the loop. Large numbers use compact K/M/B suffixes. Mobile stacks the forge above the shop. At 320px width, all actions remain reachable without horizontal scrolling.

## Acceptance criteria

- A fresh game earns currency immediately, buys the first worker at 15, and produces while idle.
- Purchase and upgrade prices are exact; affordability and displayed output update immediately.
- The 10th worker applies the tier bonus exactly once; prestige bonuses apply once to each income source.
- Save/load preserves state, accounts for offline time once, handles corrupted saves, and obeys the 8-hour cap.
- Rekindling pays the previewed reward and performs only the specified reset.
- Keyboard/touch, reduced motion, narrow layout, and insufficient-funds behavior work.
- No required network or account is needed to play after assets load.

## v1.1: compact playfield and ember burst

The main game fills the dynamic viewport without page or shop scrolling. Portrait phones show two-column companion/upgrade grids; landscape and desktop keep the scene beside the shop. Small screens condense narrative copy and milestone icons while keeping currency, progression, rebirth, settings and every purchase reachable. Settings remain a modal with overflow for short screens.

Hold the forge (pointer or Space/Enter) for 1 second to charge a 5-second burst: 40 automatic strikes at the current click strength, followed by 10 seconds of recharge. A short tap still grants one strike. Releasing after charging does not add a duplicate strike. Cancellation, window blur and hidden tabs clear held input; interrupted bursts stop and recharge. Burst time is active-session-only and does not add offline earnings. Import, reset and rebirth clear transient burst state.

Firelight, drifting fireflies, press compression, impact flashes, spark showers and floating currency accompany input; a meter shows charge, burst time and recharge. Optional vibration uses the browser Vibration API where supported, with visual feedback on all devices. Reduced-motion preferences disable decorative animation and flashes. Touch-action rules suppress double-tap zoom on the game and preserve browser pinch zoom outside the forge control.
