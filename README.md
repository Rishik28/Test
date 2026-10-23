# Embergrove

A 16-bit woodland forge incremental game. Stoke the forge, hire companions, purchase upgrades, and rekindle the grove for permanent ancient-seed bonuses.

## Play locally

Requires only a static HTTP server, for example:

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. Progress is stored in this browser; settings include save export/import and reset. Offline production is capped at eight hours.

## Project

- `dist/`: standalone deployable game, with no build dependencies
- `DESIGN.md`: game systems and balance
- `art/`: generated artwork prompt, pipeline manifest, and verification
- `tests/` and `QA.md`: checks and verification results

Artwork was generated specifically for this game. See `art/README.md` for regeneration instructions.
