// The Price Ledger — hand-in program for black-friday-deal-finder-01 (Node 22, standard library only).
//
// The site lives in app/ beside this file: plain static files (index.html, style.css,
// data.js, main.js) that a browser opens directly, with every deal baked into its own
// data file — nothing the page loads comes over the network, and each deal links out
// to the store page our researchers checked.
//
// This program hands the entry in: it copies app/ and screenshots/ into the output
// directory and writes dossier.json there with the vendored make.fun library.
// vendor/makefun-frontend.ts is left exactly as the kit shipped it: the scorer
// requires dossier.json to be byte-for-byte what its own copy writes.
//
// Local run:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader's sandbox, /output is used when MAKEFUN_OUTPUT_DIR is unset.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(here, 'app'), join(outDir, 'app'), { recursive: true });

const shotsDir = join(outDir, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), shotsDir, { recursive: true });
}

// The scorer's own caps, passed to the dossier builder so an entry the scorer
// would refuse is refused here first: at most 4 screenshots of 256 KiB each,
// at most 993 files and directories in app/, at most 16 MiB of app files.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
