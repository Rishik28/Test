# Oddfolk image pipeline

## Current game: ODDFOLK — FLAX / OLIVE

`selected-pipeline.json` is the current asset manifest. The earlier forge image and pipeline remain as history. Current assets were generated concurrently through `image_gen.imagegen` and visually inspected against the selected FLAX / OLIVE board; no cancelled colorful assets are used.

| Asset | Native size | Layout | Notes |
| --- | --- | --- | --- |
| `village.png` | 1536 × 1024 | Environment | Open cobbles in lower half; bell tower near 69% x, 35% y |
| `piper.png` | 2172 × 724 | 4 columns × 1 row | Transparent RGBA, 543 × 724 cells, inhale/squeeze/left step/right step |
| `dancer.png` | 2172 × 724 | 4 columns × 1 row | Transparent RGBA, 543 × 724 cells, four dance poses |

Sprite CSS can use `background-size: 400% 100%` with positions `0%`, `33.333%`, `66.667%`, `100%`. Each frame has a 3:4 cell aspect; feet are near 94% of canvas height. Keep the whole cell for coherent animation. Pixel render at modest sizes. Sheets contain genuine changing poses rather than CSS motion on a single drawing.

To regenerate all current art through the agent tool, read each asset's promptFile and generationArguments from `selected-pipeline.json`, invoke `image_gen.imagegen` independently (parallel where available), inspect each result, and copy returned PNGs to their output paths. Preserve original generations. The expected sprite dimensions document the shipped artifacts; a different generated size must still divide equally into four columns and requires manifest/CSS review. `node art/verify.mjs` validates all current PNG dimensions, alpha channel presence, and equal cells plus the historical forge.

The CLI below regenerates only the historical forge, whose dimensions are supported by its configured API model. Current 3:1 transparent sheets use the image-generation agent tool; do not silently crop or stretch a new API output to match them.

The generated forge scene is served from `dist/assets/forge.png`.

The repeatable brief lives in `forge.prompt.txt`; `pipeline.json` specifies generation arguments, the output contract, and visual checks. The initial run used the `image_gen.imagegen` tool, then copied the generated PNG to the output path, preserving the original generation. Generation was inspected for framing, palette, crisp pixels, and absence of UI/text.

To regenerate through an image-generation-capable agent, read the manifest and prompt, invoke `image_gen.imagegen` with the prompt and `transparent_background: false`, inspect the returned image, and copy the returned local PNG to the manifest's output path. Never embed tool credentials in files. Run `node art/verify.mjs` to validate the resulting PNG contract before publication.

The 1536 × 1024 image supports desktop and mobile crops. Keep `object-position: center`; the forge is to the right of center and anvil below center.

## Automated CLI

Run `node art/generate.mjs --dry-run` to validate the manifest and prompt without credentials or network requests. To regenerate, supply `OPENAI_API_KEY` through your shell's secret manager or process environment and run `node art/generate.mjs`. The dependency-free Node CLI calls the OpenAI image generation API with the manifest's model and output settings, validates the returned PNG before replacing artwork atomically, and runs the verifier. It never writes or prints credentials. The API generation is billable; the shipped scene was generated with the agent image tool, and the CLI was checked in dry-run mode only. Do not commit API keys.
