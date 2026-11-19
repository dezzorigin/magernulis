// Rangkai docs/screenshots/*.png menjadi docs/demo/demo.mp4:
// tiap adegan 5 detik dengan zoom-pan halus (ffmpeg zoompan), 1280x720.
// Prasyarat: ffmpeg di PATH. Jalankan setelah `npm run screenshots`.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = join(ROOT, 'docs', 'screenshots');
const DEMO = join(ROOT, 'docs', 'demo');
const TMP = join(DEMO, '.segments');
const OUT = join(DEMO, 'demo.mp4');

const shots = readdirSync(SHOTS).filter((f) => f.endsWith('-desktop.png')).sort();
if (shots.length === 0) {
  console.error('tidak ada screenshot *-desktop.png di docs/screenshots — jalankan `npm run screenshots` dulu.');
  process.exit(1);
}
mkdirSync(TMP, { recursive: true });

const list = [];
shots.forEach((file, i) => {
  const seg = join(TMP, `seg-${String(i).padStart(2, '0')}.mp4`);
  // zoompan: zoom 1.00 -> 1.08 selama 150 frame @30fps (= 5 detik).
  execFileSync('ffmpeg', ['-y', '-v', 'error',
    '-loop', '1', '-i', join(SHOTS, file),
    '-vf', `zoompan=z='min(zoom+0.0006,1.08)':d=150:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps=30`,
    '-t', '5', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', seg],
  { stdio: 'inherit' });
  list.push(`file '${seg}'`);
});
writeFileSync(join(TMP, 'list.txt'), list.join('\n'));
execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0',
  '-i', join(TMP, 'list.txt'), '-c', 'copy', OUT], { stdio: 'inherit' });
rmSync(TMP, { recursive: true, force: true });
console.log(`make-video OK -> ${OUT} (${shots.length} adegan)`);
