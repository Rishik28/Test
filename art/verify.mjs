import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('art/pipeline.json', root), 'utf8'));
const selected = JSON.parse(await readFile(new URL('art/selected-pipeline.json', root), 'utf8'));
for (const asset of [manifest, ...selected.assets]) {
const path = new URL(asset.output, root);
const bytes = await readFile(path);
const signature = Buffer.from([137,80,78,71,13,10,26,10]);
if (!bytes.subarray(0, 8).equals(signature)) throw new Error('Generated asset is not a PNG');
const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
if (width !== asset.expected.width || height !== asset.expected.height) throw new Error(`Unexpected dimensions ${width}x${height}`);
if (asset.expected.alpha && ![4,6].includes(bytes[25])) throw new Error(`Missing alpha channel in ${asset.output}`);
if (asset.frames && width % asset.frames.columns !== 0) throw new Error(`Unequal sprite cells in ${asset.output}`);
console.log(`Art verified: ${fileURLToPath(path)} (${width}x${height}, ${bytes.length} bytes)`);
}
