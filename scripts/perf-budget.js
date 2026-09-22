// scripts/perf-budget.js — Presupuesto de peso y HTML (solo informa, exit 0).
// Uso: npm run test:perf (requiere npm run build previo para medir dist/).
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const OUT_DIR = join(ROOT, 'docs', 'metrics');
const DIST = join(ROOT, 'dist', 'assets');

// Umbrales de aviso (kB). Solo informan, no fallan.
const BUDGETS = { totalJS: 1800, totalCSS: 1200, vendorPrimevue: 900, vendorUI: 200, indexJS: 150 };

const chunks = [];
let totalJS = 0;
let totalCSS = 0;
let distOk = true;
if (existsSync(DIST)) {
  for (const f of readdirSync(DIST)) {
    const st = statSync(join(DIST, f));
    const kb = Math.round((st.size / 1024) * 10) / 10;
    if (f.endsWith('.js')) { totalJS += kb; chunks.push({ archivo: f, kb, tipo: 'js' }); }
    else if (f.endsWith('.css')) { totalCSS += kb; chunks.push({ archivo: f, kb, tipo: 'css' }); }
  }
  chunks.sort((a, b) => b.kb - a.kb);
} else {
  distOk = false;
}

const pick = (frag) => chunks.find((c) => c.archivo.includes(frag))?.kb ?? null;
const metrics = {
  totalJS: Math.round(totalJS * 10) / 10,
  totalCSS: Math.round(totalCSS * 10) / 10,
  vendorPrimevue: pick('vendor-primevue'),
  vendorUI: pick('vendor-ui'),
  vendorFeedback: pick('vendor-feedback'),
  vendorHttp: pick('vendor-http'),
  vendorVue: pick('vendor-vue'),
  indexJS: pick('/index-') ?? chunks.find((c) => c.tipo === 'js' && c.archivo.startsWith('index-'))?.kb ?? null,
  numChunksJS: chunks.filter((c) => c.tipo === 'js').length,
  numChunksCSS: chunks.filter((c) => c.tipo === 'css').length,
};

// index.html: scripts sin defer, hojas de fonts, CSS muerto
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const classicScripts = [...html.matchAll(/<script\s+src="([^"]+)"([^>]*)>/g)];
const sinDefer = classicScripts.filter((m) => !/defer|async/.test(m[2])).map((m) => m[1]);
const fontSheets = (html.match(/fonts\.googleapis\.com\/css2/g) || []).length;
const deadCss = (html.match(/jquery\.toast/i) || []).length;

const checks = { scriptsSinDefer: sinDefer, hojasGoogleFonts: fontSheets, cssMuertoJqueryToast: deadCss };

const stamp = new Date().toISOString().slice(0, 10);
const report = { fecha: stamp, dist: distOk, metricas: metrics, html: checks, topChunks: chunks.slice(0, 10) };
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, `perf-${stamp}.json`), JSON.stringify(report, null, 2));

console.log('\n Presupuesto de rendimiento');
if (!distOk) console.log(' (sin dist/: ejecuta npm run build primero)');
for (const [k, v] of Object.entries(metrics)) {
  if (v === null || v === undefined) continue;
  if (k.startsWith('num')) {
    console.log(` ${k.padEnd(16)} ${String(v).padStart(8)}     (conteo)`);
    continue;
  }
  const b = BUDGETS[k];
  const flag = b !== undefined ? (v > b ? '⚠️ sobre presupuesto' : '✅') : '';
  console.log(` ${k.padEnd(16)} ${String(v).padStart(8)} kB  ${flag}`);
}
console.log(` hojasGoogleFonts: ${fontSheets} (objetivo ≤1)  ${fontSheets <= 1 ? '✅' : '⚠️'}`);
console.log(` scriptsSinDefer: ${sinDefer.length}  ${sinDefer.length === 0 ? '✅' : '⚠️ ' + sinDefer.join(', ')}`);
console.log(` cssMuertoJqueryToast: ${deadCss}  ${deadCss === 0 ? '✅' : '⚠️'}`);
console.log(`\n Reporte: docs/metrics/perf-${stamp}.json`);
process.exit(0);
