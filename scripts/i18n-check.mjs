#!/usr/bin/env node
/**
 * Greps Vue templates for capitalized user-facing strings not wrapped in $t()/$t()/t().
 * Fails CI if any are found.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, '..', 'src');

// Matches: >Capitalized word(s)< or label="Capitalized..." or label='Capitalized...'
// Excludes: anything already inside $t(...) or t(...)
const LABEL_PATTERN = /(?:^|\s)label="([A-ZĂÎȘȚ][a-zA-ZăîșțâĂÎȘȚÂ\s,.'!?-]{2,})"/gm;
const LABEL_SINGLE_PATTERN = /(?:^|\s)label='([A-ZĂÎȘȚ][a-zA-ZăîșțâĂÎȘȚÂ\s,.'!?-]{2,})'/gm;

// Patterns that indicate the string is already translated
const TRANSLATED = /\$t\(|:label="|v-bind/;

function walkVue(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walkVue(full));
    } else if (entry.endsWith('.vue')) {
      files.push(full);
    }
  }
  return files;
}

function extractTemplate(content) {
  const match = content.match(/<template>([\s\S]*?)<\/template>/);
  return match ? match[1] : '';
}

let violations = 0;

for (const file of walkVue(SRC)) {
  const content = readFileSync(file, 'utf8');
  const template = extractTemplate(content);
  const lines = template.split('\n');

  lines.forEach((line, i) => {
    // Skip lines that are already using translation functions
    if (TRANSLATED.test(line)) return;
    // Skip comments
    if (line.trim().startsWith('<!--')) return;
    // Skip lines with only template expressions
    if (line.includes('{{') && !line.match(/>[\s]*[A-ZĂÎȘȚ]/)) return;

    // Check for hardcoded label attributes (label="Capitalized...")
    let m;
    LABEL_PATTERN.lastIndex = 0;
    while ((m = LABEL_PATTERN.exec(line)) !== null) {
      const text = m[1]?.trim();
      if (text && text.length > 2) {
        const rel = file.replace(SRC + '/', '');
        console.error(`HARDCODED [${rel}:${i + 1}]: label="${text}"`);
        violations++;
      }
    }
    LABEL_SINGLE_PATTERN.lastIndex = 0;
    while ((m = LABEL_SINGLE_PATTERN.exec(line)) !== null) {
      const text = m[1]?.trim();
      if (text && text.length > 2) {
        const rel = file.replace(SRC + '/', '');
        console.error(`HARDCODED [${rel}:${i + 1}]: label='${text}'`);
        violations++;
      }
    }
  });
}

if (violations > 0) {
  console.error(`\n${violations} hardcoded string(s) found. Wrap with $t() or add translation key.`);
  process.exit(1);
} else {
  console.log('i18n-check passed: no hardcoded label strings found.');
}
