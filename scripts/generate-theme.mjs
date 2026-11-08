import { readFile, writeFile } from 'node:fs/promises';

const tokens = JSON.parse(
  await readFile(new URL('../src/styles/tokens.json', import.meta.url), 'utf8'),
);
const variables = {
  'font-handwriting': `"${tokens.typography.family.primary}", ${tokens.typography.family.fallback}`,
  'color-cover': tokens.color.cover.main,
  'color-spine': tokens.color.cover.spine,
  'color-paper': tokens.color.surface.paper,
  'color-paper-edge': tokens.color.surface.paperEdge,
  'color-canvas': tokens.color.surface.canvas,
  'color-ink': tokens.color.text.main,
  'color-focus': tokens.color.focus,
  'shadow-notebook': tokens.shadow.notebook,
};
const output = [
  '/* Generated from tokens.json by scripts/generate-theme.mjs. */',
  '@theme static {',
  ...Object.entries(variables).map(([name, value]) => `  --${name}: ${value};`),
  '}',
  '',
].join('\n');
const destination = new URL('../src/styles/theme.css', import.meta.url);

if (process.argv.includes('--check')) {
  const current = await readFile(destination, 'utf8');
  if (current !== output) {
    console.error('Theme is out of date. Run npm run theme.');
    process.exitCode = 1;
  } else {
    console.log('Theme matches the design tokens.');
  }
} else {
  await writeFile(destination, output);
  console.log('Generated src/styles/theme.css from tokens.json.');
}
