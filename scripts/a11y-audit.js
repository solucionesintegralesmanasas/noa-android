// scripts/a11y-audit.js — Conteo de antipatrones de accesibilidad (solo informa, exit 0).
// Uso: npm run test:a11y
// Compara contra el último reporte en docs/metrics/a11y-*.json y guarda uno nuevo.
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..', 'src');
const OUT_DIR = join(import.meta.dirname, '..', 'docs', 'metrics');

const RULES = [
  { key: 'labelsSinFor', desc: '<label> sin for', re: /<label(?![^>]*\bfor=)/g, files: /\.vue$/ },
  { key: 'controlesVModelSinId', desc: 'input/select/textarea con v-model sin id', re: /<(input|select|textarea)\b(?![^>]*\bid=)[^>]*v-model/g, files: /\.vue$/ },
  { key: 'erroresSinRole', desc: 'bloques .invalid-feedback/.text-danger sin role', re: /class="(invalid-feedback d-block[^"]*|text-danger small[^"]*)"(?![^>]*\brole=)/g, files: /\.vue$/ },
  { key: 'ariaLabelsIngles', desc: 'aria-label en inglés (Close/Toggle Navigation/breadcrumb)', re: /aria-label="(Close|Toggle Navigation|breadcrumb)"/g, files: /\.vue$/ },
  { key: 'roleButtonEnRouterLink', desc: 'router-link con role="button"', re: /<router-link[^>]*\brole="button"/g, files: /\.vue$/ },
  { key: 'enlacesMuertos', desc: 'href="#" o javascript:void(0)', re: /href="(javascript:void\(0\)|#)"/g, files: /\.vue$/ },
  { key: 'aRoleButtonSinHref', desc: '<a role="button"> sin href', re: /<a\b(?![^>]*\bhref=)[^>]*\brole="button"/g, files: /\.vue$/ },
  { key: 'iconosSinAriaHidden', desc: '<i> decorativo sin aria-hidden (informativo)', re: /<i\b(?![^>]*\baria-hidden=)[^>]*class="[^"]*(fa-|fad |fas |pi )/g, files: /\.vue$/ },
];

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith('.vue')) yield p;
  }
}

// index.html: lang
const indexHtml = readFileSync(join(import.meta.dirname, '..', 'index.html'), 'utf8');
const langEn = /<html[^>]*\blang="en"/.test(indexHtml) ? 1 : 0;

const totals = { langEnHtml: langEn };
const byFile = {};
for (const rule of RULES) totals[rule.key] = 0;

for (const file of walk(ROOT)) {
  const text = readFileSync(file, 'utf8');
  const rel = relative(join(import.meta.dirname, '..'), file);
  for (const rule of RULES) {
    const n = (text.match(rule.re) || []).length;
    if (n > 0) {
      totals[rule.key] += n;
      (byFile[rel] ??= {})[rule.key] = n;
    }
  }
}

// Delta contra último reporte
let prev = null;
if (existsSync(OUT_DIR)) {
  const prevs = readdirSync(OUT_DIR).filter((f) => f.startsWith('a11y-') && f.endsWith('.json')).sort();
  if (prevs.length > 0) prev = JSON.parse(readFileSync(join(OUT_DIR, prevs[prevs.length - 1]), 'utf8'));
}

const stamp = new Date().toISOString().slice(0, 10);
const report = { fecha: stamp, totales: totals, porArchivo: byFile };
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, `a11y-${stamp}.json`), JSON.stringify(report, null, 2));

console.log('\n Auditoría a11y (conteo de patrones en src/)');
console.log(' Regla'.padEnd(52) + 'Total   Delta');
for (const rule of RULES.concat([{ key: 'langEnHtml', desc: 'index.html con lang="en"' }])) {
  const v = totals[rule.key] ?? 0;
  const d = prev ? v - (prev.totales[rule.key] ?? 0) : 0;
  const ds = prev ? (d === 0 ? '=' : (d > 0 ? `+${d}` : `${d}`)) : '—';
  console.log(` ${rule.desc.padEnd(50)} ${String(v).padStart(5)}   ${ds}`);
}
console.log(`\n Reporte: docs/metrics/a11y-${stamp}.json`);
process.exit(0);
