/* VeganToGo – Zutaten-Analyse (läuft komplett lokal auf dem Gerät)
 * Jede Regel: re = Muster, veg / vegan = 'no' | 'maybe' | null (keine Auswirkung)
 */
(function (root) {
  'use strict';
  var E = function (n) { return 'e\\s?-?' + n + '(?![0-9])'; };
  var B = '(?:^|[^a-zäöüß])';           // Wortanfang
  var A = '(?![a-zäöüß])';              // Wortende

  // Begriffe, die harmlos sind, obwohl sie ein „Tier-Wort“ enthalten
  var EXCLUDE = [
    'kakaobutter', 'kakao-butter', 'sheabutter', 'shea-butter', 'erdnussbutter', 'mandelbutter', 'nussbutter',
    'cashewbutter', 'kokosbutter', 'butterbohne', 'butterpilz', 'butternut', 'cocoa butter', 'shea butter', 'peanut butter',
    'kokosmilch', 'kokosnussmilch', 'hafermilch', 'sojamilch', 'mandelmilch', 'reismilch', 'dinkelmilch', 'haselnussmilch',
    'cashewmilch', 'erbsenmilch', 'pflanzenmilch', 'coconut milk', 'almond milk', 'oat milk', 'soy milk', 'soya milk', 'rice milk',
    'milchsäure', 'milchsaure', 'milchsaeure', 'lactic acid', 'milchdistel', 'milchfrei', 'ohne milch', 'frei von milch',
    'laktosefrei', 'lactosefrei', 'lactose free', 'lactose-free', 'dairy free', 'dairy-free', 'eifrei', 'ohne ei',
    'kokossahne', 'hafersahne', 'sojasahne', 'pflanzensahne', 'kokosrahm', 'pflanzenrahm', 'hafer-cuisine', 'soja-cuisine',
    'sojajoghurt', 'soja-joghurt', 'kokosjoghurt', 'haferjoghurt', 'joghurtkultur', 'joghurt-kultur', 'joghurtalternative',
    'cashewkäse', 'veganer käse', 'vegan cheese', 'käsealternative', 'honigmelone', 'fruchtfleisch', 'kokosfleisch',
    'fleischtomate', 'fleischersatz', 'ohne fleisch', 'fleischlos', 'fleischfrei', 'lammsalat', 'lämmersalat', 'wildreis',
    'wilder reis', 'wildkräuter', 'mikrobielles lab', 'mikrobielle lab', 'mikrobiellem lab', 'pflanzliches lab',
    'ohne tierische', 'frei von tierischen', 'keine tierischen', 'nicht tierisch', 'jackfruit', 'zimtrinde',
    'muschelnudel', 'hirschhornsalz', 'austernpilz', 'austernseitling', 'eier-nudel-form', 'blutorange'
  ];

  var RULES = [
    // ---------- nicht vegetarisch ----------
    { k: 'Fleisch', re: 'fleisch|meat' + A + '|fleischextrakt', veg: 'no', vegan: 'no' },
    { k: 'Schwein', re: 'schwein|pork|porc', veg: 'no', vegan: 'no' },
    { k: 'Rind', re: 'rind(?!e(?![rn]))|beef', veg: 'no', vegan: 'no' },
    { k: 'Kalb', re: 'kalb|veal', veg: 'no', vegan: 'no' },
    { k: 'Lamm', re: 'lamm|hammel|' + B + 'lamb' + A + '|mutton', veg: 'no', vegan: 'no' },
    { k: 'Geflügel', re: 'geflügel|huhn|hühner(?!ei)|hähnchen|poulet|' + B + 'puten?|truthahn|' + B + 'ente' + A + '|enten(?:fleisch|fett|brust|leber)|' + B + 'gans' + A + '|gänse|chicken|turkey|' + B + 'duck' + A, veg: 'no', vegan: 'no' },
    { k: 'Wild', re: 'wildfleisch|hirsch|' + B + 'reh' + A + '|rehfleisch|venison', veg: 'no', vegan: 'no' },
    { k: 'Wurst/Schinken', re: 'schinken|speck|salami|wurst|chorizo|pancetta|prosciutto|bacon|' + B + 'ham' + A, veg: 'no', vegan: 'no' },
    { k: 'Innereien/Blut', re: B + 'leber' + A + '|innereien|knochen|' + B + 'blut' + A + '|blutplasma|' + E('542'), veg: 'no', vegan: 'no' },
    { k: 'Fisch/Meeresfrüchte', re: 'fisch|' + B + 'fish|lachs|salmon|thunfisch|tuna|kabeljau|hering|sardelle|sardine|anchovi|anchov|makrele|forelle|garnele|shrimp|prawn|krabbe|' + B + 'crab|krebs|hummer|lobster|langust|muschel|auster|tintenfisch|kalmar|oktopus|surimi|kaviar|' + B + 'rogen|lebertran', veg: 'no', vegan: 'no' },
    { k: 'Gelatine', re: 'gelatine|gelatin|' + E('441'), veg: 'no', vegan: 'no' },
    { k: 'Tierisches Fett', re: 'schmalz|' + B + 'talg' + A + '|tallow|' + B + 'lard' + A + '|tierische[sn]? fett', veg: 'no', vegan: 'no' },
    { k: 'Karmin (Läuse)', re: 'karmin|carmin|cochenille|cochineal|' + E('120'), veg: 'no', vegan: 'no' },
    { k: 'Tierisches Lab', re: 'kälberlab|kalbslab|tierisches lab|animal rennet', veg: 'no', vegan: 'no' },

    // ---------- vegetarisch, aber nicht vegan ----------
    { k: 'Milch', re: 'milch|milk' + '|' + B + 'lait' + A, veg: null, vegan: 'no' },
    { k: 'Molke', re: 'molke|whey', veg: null, vegan: 'no' },
    { k: 'Laktose', re: 'laktose|lactose|milchzucker', veg: null, vegan: 'no' },
    { k: 'Kasein', re: 'kasein|casein|caseinat|kaseinat', veg: null, vegan: 'no' },
    { k: 'Butter', re: 'butter|' + B + 'ghee', veg: null, vegan: 'no' },
    { k: 'Sahne/Rahm', re: 'sahne|' + B + '(?:sauer|schlag|voll)?rahm|' + B + 'cream' + A + '|schmand|crème fraîche|creme fraiche|schlagobers', veg: null, vegan: 'no' },
    { k: 'Käse/Joghurt', re: 'käse|kaese|cheese|parmesan|mozzarella|gouda|emmentaler|cheddar|' + B + 'quark|joghurt|jogurt|yoghurt|yogurt|kefir|skyr|ricotta|mascarpone', veg: null, vegan: 'no' },
    { k: 'Ei', re: B + '(?:ei|eier|eigelb|eiklar|eiweiß|eiweiss|eidotter)' + A + '|hühnerei|vollei|eigelb|eiklar|eipulver|eidotter|freilandei|' + B + 'eggs?' + A + '|' + E('1105') + '|lysozym', veg: null, vegan: 'no' },
    { k: 'Honig/Bienenprodukte', re: 'honig|honey|propolis|gel[ée]e royale|bienenwachs|beeswax|' + E('901'), veg: null, vegan: 'no' },
    { k: 'Schellack', re: 'schellack|shellac|' + E('904'), veg: null, vegan: 'no' },
    { k: 'Lanolin (Wollfett)', re: 'lanolin|wollwachs|wollfett|' + E('913'), veg: null, vegan: 'no' },
    { k: 'Lactit', re: 'lactit|laktit|' + E('966'), veg: null, vegan: 'no' },
    { k: 'Tierische Herkunft', re: 'tierisch', veg: 'maybe', vegan: 'no' },

    // ---------- möglicherweise tierisch ----------
    { k: 'Emulgator E471 & Co.', re: E('47[0-9][a-f]?') + '|' + E('48[12]') + '|' + E('49[1-5]') + '|' + E('570') + '|mono-? ?und diglyceride|monoglyceride|diglyceride', veg: 'maybe', vegan: 'maybe' },
    { k: 'Geschmacksverstärker E627/E631', re: E('62[7-9]') + '|' + E('63[0-5]') + '|inosinat|guanylat|ribonukleotid', veg: 'maybe', vegan: 'maybe' },
    { k: 'L-Cystein E920', re: E('92[01]') + '|cystein|cystin', veg: 'maybe', vegan: 'maybe' },
    { k: 'Vitamin D3', re: 'vitamin d3|cholecalciferol', veg: null, vegan: 'maybe' },
    { k: 'Omega-3 (evtl. Fischöl)', re: 'omega-?3|' + B + 'dha' + A + '|' + B + 'epa' + A, veg: 'maybe', vegan: 'maybe' },
    { k: 'Lab', re: B + 'lab' + A + '|labferment|rennet', veg: 'maybe', vegan: 'maybe' }
  ];
  RULES.forEach(function (r) { r.rx = new RegExp(r.re, 'g'); });

  var TRACE_RX = /((kann|können)\s+(auch\s+)?(geringe\s+)?(spuren|anteile)|spuren\s+von|may contain|traces of|hergestellt in einem betrieb|in einem betrieb[^.]*verarbeitet|produziert in einem betrieb)[^.]*\.?/g;

  var TC = { n: 'no', m: 'maybe', y: null, '-': null, s: null };
  var CLASS_RX = /^(?:emulgatoren?|emulsifiers?|säuerungsmittel|säureregulatoren?|verdickungsmittel|geliermittel|stabilisatoren?|farbstoffe?|konservierungsstoffe?|antioxidationsmittel|backtriebmittel|feuchthaltemittel|überzugsmittel|geschmacksverstärker|süßungsmittel|süssungsmittel|trennmittel|festigungsmittel|mehlbehandlungsmittel|komplexbildner|füllstoffe?|zusatzstoffe?|bio-?|organic|aus)\s+/;
  function taxKey(seg) {
    return seg.toLowerCase()
      .replace(/\d+(?:[.,]\d+)?\s*%/g, ' ')
      .replace(/(^|[^a-z])e[\s-]?(\d{3,4})\s?([a-f]|\((?:i|ii|iii|iv|v)\))?(?![0-9a-z])/g, function (_, p, n, x) { return p + 'e' + n + (x || ''); })
      .replace(/\s+/g, ' ').replace(/^[\s\-–.]+|[\s\-–.]+$/g, '');
  }
  function lookupTax(TAX, seg) {
    var k = taxKey(seg), c = TAX[k];
    if (c === undefined) { var k2 = k.replace(CLASS_RX, ''); if (k2 !== k) c = TAX[k2]; }
    if (c === undefined) { var k3 = k.replace(/\s+\d+(?:\.\d+)?\s*(?:g|mg|kg)?$/, ''); if (k3 !== k) c = TAX[k3]; }
    return c;
  }

  function mask(s, start, len) { return s.slice(0, start) + ' '.repeat(len) + s.slice(start + len); }

  /* Ergebnis: { hits:[{k,veg,vegan,term,start,end}], traces:[Text], hasText } */
  function analyseText(text) {
    var res = { hits: [], traces: [], soft: [], hasText:!!(text && text.trim().length > 2) };
    if (!res.hasText) return res;
    var s = text.toLowerCase().replace(/[_*]/g, ' ');
    if (s.length !== text.length) s = text.replace(/[_*]/g, ' ').toLowerCase(); // Sicherheitsnetz
    var m;
    TRACE_RX.lastIndex = 0;
    while ((m = TRACE_RX.exec(s))) { res.traces.push(text.substr(m.index, m[0].length).trim()); s = mask(s, m.index, m[0].length); }

    // 1) Ganze Zutaten mit der Open-Food-Facts-Taxonomie abgleichen (eingebettet, offline)
    var TAX = root.VCTax;
    if (TAX) {
      var segSrc = s.replace(/(\d),(\d)/g, '$1.$2').replace(/\.(?=\s)/g, ','), SEG = /[^,;()\[\]{}:•·\n]+/g, sm;
      while ((sm = SEG.exec(segSrc))) {
        var raw = sm[0], l = 0, r = raw.length;
        while (l < r && /[\s.\-–]/.test(raw[l])) l++;
        while (r > l && /[\s.\-–]/.test(raw[r - 1])) r--;
        if (r - l < 2) continue;
        var code = lookupTax(TAX, raw.slice(l, r));
        if (!code) continue;
        var a = sm.index + l, b = sm.index + r;
        if (code === 'ss') res.soft.push(text.slice(a, b).trim());
        else if (code[0] !== 'y' || code[1] === 'n' || code[1] === 'm') {
          res.hits.push({ k: 'Datenbank', veg: TC[code[1]], vegan: TC[code[0]], term: text.slice(a, b).replace(/\s*\d+(?:[.,]\d+)?\s*%/g, '').trim(), start: a, end: b, ws: a, we: b, tax: 1 });
        }
        s = mask(s, a, b - a); // bekannte Zutat: nicht nochmal mit Stichwörtern prüfen
      }
    }

    // 2) Stichwort-Regeln für alles, was die Datenbank nicht kennt
    EXCLUDE.forEach(function (ex) {
      var i = s.indexOf(ex);
      while (i !== -1) { s = mask(s, i, ex.length); i = s.indexOf(ex, i + ex.length); }
    });
    var taken = new Array(s.length);
    RULES.forEach(function (r) {
      r.rx.lastIndex = 0;
      while ((m = r.rx.exec(s))) {
        var start = m.index, str = m[0];
        // führendes Trennzeichen aus dem Wortanfangs-Muster abschneiden
        while (str.length && /[^a-zäöüß0-9]/.test(str[0])) { start++; str = str.slice(1); }
        if (!str.length) { r.rx.lastIndex++; continue; }
        if (taken[start]) continue;
        // ganzes Wort für die Anzeige erweitern
        var ws = start, we = start + str.length;
        while (ws > 0 && /[a-zäöüß-]/.test(s[ws - 1])) ws--;
        while (we < s.length && /[a-zäöüß0-9]/.test(s[we])) we++;
        for (var i = start; i < start + str.length; i++) taken[i] = 1;
        res.hits.push({ k: r.k, veg: r.veg, vegan: r.vegan, term: text.slice(ws, we).replace(/^[-\s]+|[-\s]+$/g, ''), start: start, end: start + str.length, ws: ws, we: we });
      }
    });
    res.hits.sort(function (a, b) { return a.start - b.start; });
    return res;
  }

  var NOISY = ['en:sugar', 'en:cane-sugar', 'en:white-sugar', 'en:beet-sugar', 'en:raw-cane-sugar', 'en:brown-sugar', 'en:icing-sugar', 'en:flavouring', 'en:natural-flavouring', 'en:colour', 'en:vitamins'];

  function flattenIngredients(list, out) {
    out = out || [];
    (list || []).forEach(function (i) { out.push(i); if (i.ingredients) flattenIngredients(i.ingredients, out); });
    return out;
  }

  function hasTag(tags, names) {
    return (tags || []).some(function (t) {
      var v = String(t).toLowerCase().split(':').pop();
      return names.indexOf(v) !== -1;
    });
  }

  /* Gesamturteil. status: yes | likely | maybe | no | unknown */
  function evaluate(p) {
    p = p || {};
    var text = p.ingredients_text_de || p.ingredients_text || p.ingredients_text_en || '';
    var local = analyseText(text);
    var offIngr = flattenIngredients(p.ingredients);
    var tags = p.ingredients_analysis_tags || [];
    var labels = p.labels_tags || [];
    var notes = [];

    function decide(diet) {
      var key = diet === 'vegan' ? 'vegan' : 'vegetarian';
      var localKey = diet === 'vegan' ? 'vegan' : 'veg';
      var labelYes = diet === 'vegan'
        ? hasTag(labels, ['vegan', 'eu-vegan', 'v-label-vegan', 'vegan-society', 'certified-vegan'])
        : hasTag(labels, ['vegetarian', 'vegetarisch', 'eu-vegetarian', 'v-label-vegetarian', 'vegan', 'eu-vegan', 'v-label-vegan']);
      var offTag = 'unknown';
      if (hasTag(tags, ['non-' + key])) offTag = 'no';
      else if (hasTag(tags, ['maybe-' + key])) offTag = 'maybe';
      else if (hasTag(tags, [key])) offTag = 'yes';

      var no = [], maybe = [];
      local.hits.forEach(function (h) { if (h[localKey] === 'no') no.push(h.term); else if (h[localKey] === 'maybe') maybe.push(h.term); });
      var offMaybeReal = 0;
      offIngr.forEach(function (i) {
        var t = (i.text || i.id || '').replace(/^[a-z]{2}:/, '');
        if (i[key] === 'no') no.push(t);
        else if (i[key] === 'maybe' && NOISY.indexOf(i.id) === -1) { maybe.push(t); offMaybeReal++; }
      });
      // OFF stuft z. B. Zucker als „vielleicht“ ein (Knochenkohle, in der EU unüblich) – nur das? Dann ignorieren.
      if (offTag === 'maybe' && !offMaybeReal && offIngr.length && !local.hits.some(function (h) { return h[localKey] === 'maybe'; })) offTag = 'unknown';
      var status;
      if (no.length || offTag === 'no') status = 'no';
      else if (labelYes) status = 'yes';
      else if (maybe.length || offTag === 'maybe') status = 'maybe';
      else if (offTag === 'yes') status = 'yes';
      else if (local.hasText) status = 'likely';
      else status = 'unknown';
      if (labelYes && status === 'no') notes.push('Das Produkt trägt ein ' + (diet === 'vegan' ? 'Vegan' : 'Vegetarisch') + '-Label, die Zutatenliste enthält aber Hinweise auf tierische Zutaten. Bitte Packung prüfen.');
      return { status: status, label: labelYes, offTag: offTag, no: uniq(no), maybe: uniq(maybe) };
    }
    var vegan = decide('vegan'), veg = decide('veg');
    if (veg.status === 'no') vegan.status = 'no';
    if (vegan.status === 'yes' && veg.status !== 'no') veg.status = 'yes';
    if (vegan.status === 'likely' && (veg.status === 'maybe' || veg.status === 'unknown')) veg.status = 'likely';
    if (local.soft.length && vegan.status === 'likely')
      notes.push('Enthält ' + uniq(local.soft).join(', ') + ' – Aromen sind fast immer pflanzlich, können in seltenen Fällen aber tierisch sein.');
    return { vegan: vegan, veg: veg, local: local, text: text, notes: uniq(notes) };
  }

  function uniq(a) {
    var seen = {}, out = [];
    a.forEach(function (x) { var k = String(x).toLowerCase().trim(); if (k && !seen[k]) { seen[k] = 1; out.push(String(x).trim()); } });
    return out;
  }

  var api = { analyseText: analyseText, evaluate: evaluate, RULES: RULES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.VCAnalyse = api;
})(typeof window !== 'undefined' ? window : globalThis);
