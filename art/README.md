# Embergrove image pipeline

The generated forge scene is served from `dist/assets/forge.png`.

The repeatable brief lives in `forge.prompt.txt`; `pipeline.json` specifies generation arguments, the output contract, and visual checks. The initial run used the `image_gen.imagegen` tool, then copied the generated PNG to the output path, preserving the original generation. Generation was inspected for framing, palette, crisp pixels, and absence of UI/text.

To regenerate through an image-generation-capable agent, read the manifest and prompt, invoke `image_gen.imagegen` with the prompt and `transparent_background: false`, inspect the returned image, and copy the returned local PNG to the manifest's output path. Never embed tool credentials in files. Run `node art/verify.mjs` to validate the resulting PNG contract before publication.

The 1536 × 1024 image supports desktop and mobile crops. Keep `object-position: center`; the forge is to the right of center and anvil below center.

## Automated CLI

Run `node art/generate.mjs --dry-run` to validate the manifest and prompt without credentials or network requests. To regenerate, supply `OPENAI_API_KEY` through your shell's secret manager or process environment and run `node art/generate.mjs`. The dependency-free Node CLI calls the OpenAI image generation API with the manifest's model and output settings, validates the returned PNG before replacing artwork atomically, and runs the verifier. It never writes or prints credentials. The API generation is billable; the shipped scene was generated with the agent image tool, and the CLI was checked in dry-run mode only. Do not commit API keys.
