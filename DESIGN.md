# Oddfolk — flax and olive

A Flemish village becomes livelier through music, dancing, bread and bell-ringing. The selected direction combines crisp pixel-art scenery and characters with modern oversized typography, cutout shapes and muted print graphics. Palette: flax `#e3ddcb`, charcoal olive `#30362e`, dusty sage `#8c977b`, restrained ochre `#b7a574`.

## Play

Tap the piper or bell to earn JOY. Hold either (or Space/Enter) for one second to begin a five-second frenzy: 40 notes at the current tap strength, then ten seconds of recharge. Short taps earn one note. Pointer cancellation, blur and hidden tabs clear held input and stop active frenzies. Notes already earned remain. Import, reset and Reprise clear transient input state. No frenzy income accrues offline.

Recruit villagers for passive income. Each worker costs `ceil(base * 1.15 ** owned)`. Bulk UI purchases require the displayed full batch cost. The pure engine can buy an affordable partial batch. Spending does not reduce run/lifetime earned JOY.

| Villager | Preserved ID | Base cost | JOY/sec each |
| --- | --- | ---: | ---: |
| Piper | sprite | 15 | 0.2 |
| Dancer | tender | 100 | 1.5 |
| Baker | fox | 650 | 8 |
| Bell | golem | 4,000 | 40 |

At 10, 25 and 50 of a worker, that type's output doubles cumulatively. Multiply the sum by purchased production upgrades and renown multiplier. Tap upgrades multiply tap yield. Renown applies once to each income source.

| Upgrade | Preserved ID | Cost | Effect |
| --- | --- | ---: | --- |
| Wooden whistle | hammer | 50 | Taps ×2 |
| Sunday songbook | bellows | 300 | Taps ×3 |
| Dancing shoes | coals | 750 | Production ×2 |
| Silver flute | moonhammer | 2,500 | Taps ×4 |
| Village feast | heart | 6,000 | Production ×2 |
| Grand festival | star | 25,000 | Production ×3 |

Reprise unlocks at 100,000 run-earned JOY. Reward is `floor(sqrt(runEarned / 100000))` renown. Every point adds 10% to taps and passive production, additively. Reprise resets currency, workers, run earnings and upgrades, preserving lifetime earnings, renown and settings. Confirmation previews reward/reset.

Lifetime narrative milestones remain at 100, 1K, 10K, 100K, 1M and 10M JOY. They grant no hidden multiplier.

## Animation and visual progression

The piper and dancer have four-frame transparent sheets; CSS switches between equally sized cells with discrete frame timing. Taps animate the piper for 800ms. Frenzies animate all sprites faster. Owned Dancers, Bakers and Bells reveal additional figures in the square (supporting figures reuse the two available sprite sheets). Village stage advances at population 1/5/15 or run earnings 1K/10K; higher stages reveal extra ambient figures and festival flags. Bell input swings the bell icon. Reduced motion freezes frame animation and removes decorative bursts.

The scene backdrop is painted pixel art with an open foreground for actual animated figures. It does not replace the sprite layer. Touch targets live on the piper and bell. The page and shop fit one dynamic viewport at tested phone/desktop dimensions; short screens condense secondary copy. Native settings dialogs allow scrolling. Text remains real HTML.

## Saving and compatibility

For existing players, retain `embergrove-save-v1`, schema version1, `embers` (displayed as JOY), `seeds` (renown), worker IDs and upgrade IDs. This is a visual/narrative migration, not an economy reset. Saved exports use `oddfolk-save.json`; old exports import normally.

Autosave every5 seconds, after purchases/reprise, and on page hide. One monotonic clock settles pending passive production before writes. On load, validate numbers/counts/upgrades and award up to8 hours offline production, then immediately save the new timestamp. Future timestamps award nothing. Storage failures leave the game playable and report that local saving is unavailable.
