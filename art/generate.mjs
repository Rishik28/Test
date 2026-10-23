import { readFile, mkdir, writeFile, rename, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

// No dependencies, credential persistence, or network requests in dry-run mode.
const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('art/pipeline.json', root), 'utf8'));
const args = process.argv.slice(2);
if (args.some(arg => arg !== '--dry-run')) throw new Error('Usage: node art/generate.mjs [--dry-run]');
for (const field of ['promptFile', 'output']) {
  if (typeof manifest[field] !== 'string' || manifest[field].startsWith('/') || manifest[field].split('/').includes('..')) {
    throw new Error(`Invalid relative ${field}`);
  }
}
if (!manifest.api?.model || manifest.api.size !== `${manifest.expected.width}x${manifest.expected.height}` || manifest.api.output_format !== 'png') {
  throw new Error('API configuration does not match expected PNG contract');
}
const prompt = (await readFile(new URL(manifest.promptFile, root), 'utf8')).trim();
if (!prompt) throw new Error('Image prompt is empty');
const destination = new URL(manifest.output, root);
if (args.includes('--dry-run')) {
  console.log(JSON.stringify({ dryRun: true, endpoint: 'https://api.openai.com/v1/images/generations', ...manifest.api, promptFile: manifest.promptFile, promptCharacters: prompt.length, output: manifest.output }, null, 2));
  process.exit(0);
}
if (!process.env.OPENAI_API_KEY) throw new Error('Set OPENAI_API_KEY in the process environment, or use --dry-run');
const response = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...manifest.api, prompt, n: 1, background: manifest.generationArguments.transparent_background ? 'transparent' : 'opaque' }),
  signal: AbortSignal.timeout(300_000),
});
if (!response.ok) throw new Error(`Image API returned HTTP ${response.status}; existing artwork preserved`);
const result = await response.json();
const encoded = result.data?.[0]?.b64_json;
if (typeof encoded !== 'string' || !encoded) throw new Error('Image API did not return PNG bytes');
const bytes = Buffer.from(encoded, 'base64');
if (bytes.length < 24 || !bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error('Image API returned invalid PNG data');
if (bytes.readUInt32BE(16) !== manifest.expected.width || bytes.readUInt32BE(20) !== manifest.expected.height) throw new Error('Generated image dimensions do not match output contract');
const target = fileURLToPath(destination);
const temporary = `${target}.tmp-${process.pid}`;
await mkdir(dirname(target), { recursive: true });
try {
  await writeFile(temporary, bytes, { flag: 'wx' });
  await rename(temporary, target);
} finally {
  await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
}
const verification = spawnSync(process.execPath, [fileURLToPath(new URL('art/verify.mjs', root))], { stdio: 'inherit' });
if (verification.status !== 0) throw new Error('Generated artwork verification failed');
console.log('Generated artwork installed. Review visual composition before publishing.');
