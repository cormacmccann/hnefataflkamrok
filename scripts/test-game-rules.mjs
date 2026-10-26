import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const directory = await mkdtemp(join(tmpdir(), 'tafl-rules-'));
try {
  for (const entry of ['game-rules', 'chess-rules']) {
    const outfile = join(directory, `${entry}.mjs`);
    await build({ entryPoints: [`scripts/${entry}.test.ts`], bundle: true, platform: 'node', format: 'esm', outfile, tsconfig: 'tsconfig.app.json' });
    await import(pathToFileURL(outfile).href);
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}
