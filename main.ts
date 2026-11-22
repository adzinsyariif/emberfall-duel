// Emberfall Duel — hand-in program (Node 22, standard library only).
//
// The game lives in this directory's game/ folder: plain static files a
// desktop browser loads offline (game/index.html plus its ES modules and
// stylesheets, no library, no network request). This program hands it in:
// it copies game/ and screenshots/ from beside this file into the output
// directory and writes dossier.json there, the summary the judge reads,
// using the vendored make.fun library.
//
// The grader runs this program twice and both runs must write the same
// bytes. Copying files and building the dossier from them is deterministic,
// so that holds. Nothing here touches the network or the clock.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The dossier library caps what it will carry; these are the same caps
// the sealed gate enforces, so a hand-in that passes here passes there:
// at most 4 screenshots of 256 KiB, game/ within 993 files and 48 MiB,
// every path inside game/ under 1000 bytes.
const dossierOptions = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function copyTree(from, to) {
  if (!existsSync(from)) return 0;
  cpSync(from, to, { recursive: true });
  return readdirSync(to, { recursive: true }).length;
}

mkdirSync(outputDir, { recursive: true });
const gameEntries = copyTree(join(repoRoot, 'game'), join(outputDir, 'game'));
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
const shotEntries = copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

const dossier = buildDossier(outputDir, dossierOptions);
const dossierPath = join(outputDir, 'dossier.json');
writeFileSync(dossierPath, dossier);

// A short human-readable summary of what was handed in.
const shotNames = existsSync(join(outputDir, 'screenshots'))
  ? readdirSync(join(outputDir, 'screenshots')).join(', ')
  : '(none)';
const dossierKiB = (statSync(dossierPath).size / 1024).toFixed(1);
console.log(
  `Emberfall Duel handed in: ${gameEntries} game entries, ${shotEntries} screenshots (${shotNames}), dossier.json ${dossierKiB} KiB -> ${outputDir}`,
);
