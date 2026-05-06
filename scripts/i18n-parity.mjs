#!/usr/bin/env node
/**
 * Compares EN and RO locale key counts. Fails if they differ.
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function countKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...countKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

// Dynamic import to handle TS compiled output - use the JS-compatible approach
// Load locale files via eval of their exports (they are plain TS object exports)
async function loadLocale(path) {
  // We read the file and extract the default export object via a simple transform
  const content = readFileSync(path, 'utf8');
  // Strip TS type annotations and convert to evaluable JS
  const js = content
    .replace(/^export default /m, 'module.exports = ')
    .replace(/: string/g, '')
    .replace(/\bas\s+\w+/g, '');
  const mod = { exports: {} };
   
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports;
}

const enPath = join(__dirname, '..', 'src', 'i18n', 'en-US', 'index.ts');
const roPath = join(__dirname, '..', 'src', 'i18n', 'ro-RO', 'index.ts');

const en = await loadLocale(enPath);
const ro = await loadLocale(roPath);

const enKeys = countKeys(en).sort();
const roKeys = countKeys(ro).sort();

const onlyInEn = enKeys.filter(k => !roKeys.includes(k));
const onlyInRo = roKeys.filter(k => !enKeys.includes(k));

let failed = false;

if (onlyInEn.length > 0) {
  console.error('Keys in EN but missing in RO:');
  onlyInEn.forEach(k => console.error(`  - ${k}`));
  failed = true;
}
if (onlyInRo.length > 0) {
  console.error('Keys in RO but missing in EN:');
  onlyInRo.forEach(k => console.error(`  - ${k}`));
  failed = true;
}

if (failed) {
  console.error(`\nEN: ${enKeys.length} keys, RO: ${roKeys.length} keys — parity check FAILED.`);
  process.exit(1);
} else {
  console.log(`i18n-parity passed: ${enKeys.length} keys in both EN and RO.`);
}
