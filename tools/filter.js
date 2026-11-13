/* Erzeugt tax-data.js aus der geparsten OFF-Taxonomie.
   Aufruf: node filter.js <tax.json> <tax-data.js> <analyse.js>
   Schreibt nur, wenn sich die Daten geändert haben und der Plausibilitätscheck besteht. */
const fs = require('fs');
const [inp, outp, analysePath] = process.argv.slice(2);
const A = require(require('path').resolve(analysePath));
const t = JSON.parse(fs.readFileSync(inp, 'utf8'));
const out = {};
for (const [n, c] of Object.entries(t)) {
  if (c === 'yy' || c === '-y') { if (A.analyseText(n).hits.length) out[n] = 'yy'; continue; } // nur als Ausnahme nötig
  out[n] = c;
}
// Plausibilitätscheck: bricht ab, falls OFF das Dateiformat ändert o. Ä.
const MUST = { 'gelatine': 'nn', 'magermilchpulver': 'ny', 'schweinefleisch': 'nn', 'honig': 'ny', 'eigelb': 'ny', 'e120': 'nn' };
const n = Object.keys(out).length;
const bad = Object.entries(MUST).filter(([k, v]) => out[k] !== v);
if (n < 3000 || bad.length) { console.error('Plausibilitätscheck fehlgeschlagen:', n, 'Einträge', JSON.stringify(bad)); process.exit(1); }
let old = null;
try { const m = fs.readFileSync(outp, 'utf8').match(/var VCTax=(\{.*\});/s); if (m) old = JSON.parse(m[1]); } catch (e) {}
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
if (old && JSON.stringify(Object.fromEntries(Object.entries(old).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))) === JSON.stringify(sorted)) {
  console.log('Zutaten-Datenbank unverändert (' + n + ' Einträge).'); process.exit(0);
}
const date = new Date().toISOString().slice(0, 10);
fs.writeFileSync(outp, '/* Auszug aus der Open-Food-Facts-Zutaten-Taxonomie (ODbL, openfoodfacts.org), automatisch erzeugt.\n' +
  '   Wert: [vegan][vegetarisch], n=nein, m=vielleicht, y=ja, s=meist unbedenklich (Aroma) */\n' +
  'var VCTaxDate=' + JSON.stringify(date) + ';\nvar VCTax=' + JSON.stringify(sorted) + ';\n');
console.log('Zutaten-Datenbank aktualisiert: ' + n + ' Einträge (vorher ' + (old ? Object.keys(old).length : 0) + '), Stand ' + date);
