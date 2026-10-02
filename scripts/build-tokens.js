#!/usr/bin/env node
/**
 * build-tokens.js
 * Converts tokens/tokens.json into assets/css/tokens.css.
 *
 *   node scripts/build-tokens.js           write the CSS file
 *   node scripts/build-tokens.js --check   exit 1 if the CSS file is out of date (for CI)
 *
 * Rules
 *   - Any object with a "$value" is a token. Its CSS name is its path joined
 *     with "-": color.character.matty -> --color-character-matty
 *   - Keys starting with "$" are metadata and are skipped when walking.
 *   - "{group.key}" inside a value becomes var(--group-key).
 *   - "$breakpoints" entries become @media blocks that override tokens.
 *
 * No dependencies: plain Node 16+.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC  = path.join(ROOT, 'tokens', 'tokens.json');
const OUT  = path.join(ROOT, 'assets', 'css', 'tokens.css');

const toVar = (tokenPath) => `--${tokenPath.replace(/\./g, '-')}`;

// walk the JSON tree and return a flat list of tokens
function collect(node, prefix = [], out = []) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    if (value === null || typeof value !== 'object') continue;
    const here = [...prefix, key];
    if ('$value' in value) {
      out.push({ path: here.join('.'), value: String(value.$value), description: value.$description });
    } else {
      collect(value, here, out);
    }
  }
  return out;
}

// turn {color.ink} into var(--color-ink), failing loudly on typos
function resolveRefs(value, known, where) {
  return value.replace(/\{([^}]+)\}/g, (_, ref) => {
    if (!known.has(ref)) throw new Error(`Unknown token reference {${ref}} in ${where}`);
    return `var(${toVar(ref)})`;
  });
}

function build() {
  const json = JSON.parse(fs.readFileSync(SRC, 'utf8'));
  const tokens = collect(json);
  const known = new Set(tokens.map(t => t.path));

  const lines = [
    '/* ------------------------------------------------------------------',
    '   tokens.css (GENERATED FILE, do not edit by hand)',
    '   Source: tokens/tokens.json    Build: npm run tokens',
    '   ------------------------------------------------------------------ */',
    '',
    ':root {'
  ];

  let group = null;
  for (const t of tokens) {
    const top = t.path.split('.')[0];
    if (top !== group) {
      if (group !== null) lines.push('');
      lines.push(`  /* ${top} */`);
      group = top;
    }
    const css  = resolveRefs(t.value, known, t.path);
    const note = t.description ? ` /* ${t.description} */` : '';
    lines.push(`  ${toVar(t.path)}: ${css};${note}`);
  }
  lines.push('}');

  for (const bp of json.$breakpoints || []) {
    lines.push('');
    lines.push(`/* ${bp.name}${bp.$description ? ': ' + bp.$description : ''} */`);
    lines.push(`@media ${bp.media} {`);
    lines.push('  :root {');
    for (const [ref, value] of Object.entries(bp.tokens)) {
      if (!known.has(ref)) throw new Error(`Breakpoint "${bp.name}" overrides unknown token "${ref}"`);
      lines.push(`    ${toVar(ref)}: ${resolveRefs(String(value), known, `${bp.name} > ${ref}`)};`);
    }
    lines.push('  }');
    lines.push('}');
  }

  return lines.join('\n') + '\n';
}

try {
  const css = build();
  if (process.argv.includes('--check')) {
    const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (current !== css) {
      console.error('assets/css/tokens.css is out of date. Run `npm run tokens` and commit the result.');
      process.exit(1);
    }
    console.log('tokens.css is up to date.');
  } else {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, css);
    console.log(`Wrote ${path.relative(ROOT, OUT)}`);
  }
} catch (err) {
  console.error(`Token build failed: ${err.message}`);
  process.exit(1);
}
