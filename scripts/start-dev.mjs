import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const phase4 = join(repository, '.worktrees', 'p4-content');
const phase5 = join(repository, '.worktrees', 'p5-navigation');
const snapshot = join(repository, '.cache', 'phase4-preview');
const hasReader = (directory) =>
  existsSync(join(directory, 'src', 'app', 'NotebookReader.tsx'));
// Preview the active implementation before main integration.
const source = [phase5, repository, phase4].find(hasReader);
const savedPreview = !source && existsSync(join(snapshot, 'index.html'));
if (!source && !savedPreview) {
  console.error(
    'The reader checkout is missing. Restore the implementation worktree or integrate its approved implementation before starting this preview.',
  );
  process.exit(1);
}
const checkout = source ?? repository;
const vite = join(checkout, 'node_modules', 'vite', 'bin', 'vite.js');
if (!existsSync(vite)) {
  console.error(
    `Dependencies are missing in ${checkout}. Run npm ci there first.`,
  );
  process.exit(1);
}
console.log(`Serving notebook from: ${savedPreview ? snapshot : checkout}`);
const theme = savedPreview
  ? { status: 0 }
  : spawnSync(
      process.execPath,
      [join(checkout, 'scripts', 'generate-theme.mjs')],
      {
        cwd: checkout,
        stdio: 'inherit',
        windowsHide: true,
      },
    );
if (theme.status !== 0) process.exit(theme.status ?? 1);
const extraArgs = process.argv.slice(2);
const portIndex = extraArgs.indexOf('--port');
const requestedPort =
  portIndex >= 0
    ? extraArgs[portIndex + 1]
    : (extraArgs.find((arg) => arg.startsWith('--port='))?.slice(7) ?? '5193');
// Keep older review links useful without exposing the archived Phase 4 build.
const legacy =
  checkout === phase5 && requestedPort === '5193'
    ? createServer((request, response) => {
        response.writeHead(302, {
          Location: `http://127.0.0.1:5193${request.url ?? '/'}`,
          'Cache-Control': 'no-store',
        });
        response.end();
      })
    : null;
legacy?.on('error', (error) =>
  console.error(`Legacy port 5173 redirect could not start: ${error.message}`),
);
legacy?.listen(5173, '127.0.0.1', () =>
  console.log(
    'Old preview links on http://127.0.0.1:5173/ redirect to port 5193.',
  ),
);
const server = spawn(
  process.execPath,
  [
    vite,
    ...(savedPreview
      ? [
          'preview',
          '--config',
          join(snapshot, 'vite.config.mjs'),
          '--outDir',
          snapshot,
        ]
      : []),
    '--port',
    '5193',
    ...extraArgs,
  ],
  {
    cwd: checkout,
    stdio: 'inherit',
    windowsHide: true,
  },
);
server.on('error', (error) => {
  legacy?.close();
  console.error(error.message);
  process.exitCode = 1;
});
server.on('exit', (code) => {
  legacy?.close();
  process.exitCode = code ?? 1;
});
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    legacy?.close();
    server.kill(signal);
  });
