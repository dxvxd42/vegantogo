import json, sys, re
LANGS = sys.argv[1].split(','); files = sys.argv[3:]; outp = sys.argv[2]
def norm(s): return re.sub(r'\s+', ' ', s.replace('\\,', ',').strip().lower().replace('’', "'"))
entries = []
for f in files:
    tag = f.split('/')[-1]
    block = []
    for line in open(f, encoding='utf-8').read().split('\n') + ['']:
        line = line.strip()
        if not line:
            if block: entries.append((tag, block)); block = []
            continue
        if line.startswith('#'): continue
        block.append(line)
E = []; byname = {}
for tag, block in entries:
    if re.match(r'^(stopwords|synonyms):', block[0]): continue
    e = {'parents': [], 'names': {}, 'props': {}, 'f': tag}
    for l in block:
        if l.startswith('<'): e['parents'].append(re.sub(r'^([a-z]{2}):\s*', r'\1:', norm(l[1:]))); continue
        m = re.match(r'^([a-z_]+):([a-z]{2}):\s*(.*)$', l)
        if m and len(m.group(1)) > 2: e['props'][m.group(1)] = m.group(3).strip().lower(); continue
        m = re.match(r'^([a-z]{2}):\s*(.*)$', l)
        if m:
            names = [norm(x) for x in re.split(r'(?<!\\),', m.group(2)) if x.strip()]
            e['names'].setdefault(m.group(1), []).extend(names)
    if not e['names']: continue
    i = len(E); E.append(e)
    for L, ns in e['names'].items():
        for n in ns: byname.setdefault((tag, L + ':' + n), i)
def own(i, p):
    v = E[i]['props'].get(p); return v if v in ('yes', 'no', 'maybe') else None
memo = {}
def eff(i, p, depth=0):
    if (i, p) in memo: return memo[(i, p)]
    v = own(i, p)
    if v is None and depth < 40:
        ps = []
        for pr in E[i]['parents']:
            j = byname.get((E[i]['f'], pr))
            if j is not None and j != i: ps.append(eff(j, p, depth + 1))
        v = next((x for x in ps if x), None)  # wie OFF: erster Elternteil mit Angabe
    memo[(i, p)] = v; return v
C = {'yes': 'y', 'no': 'n', 'maybe': 'm', None: '-'}
pick = lambda x, y: 'n' if 'n' in (x, y) else 'm' if 'm' in (x, y) else 'y' if 'y' in (x, y) else '-'
out = {}; prio = {}
for i, e in enumerate(E):
    vg, vt = eff(i, 'vegan'), eff(i, 'vegetarian')
    if vt == 'no': vg = 'no'
    if vg == 'yes' and vt is None: vt = 'yes'
    code = C[vg] + C[vt]
    if code == '--': continue
    for L in LANGS + ['xx']:
        for idx, n in enumerate(e['names'].get(L, [])):
            if len(n) < 2 or len(n) > 60: continue
            pr = 2 if idx == 0 else 1
            if n not in out or prio[n] < pr: out[n] = code; prio[n] = pr
            elif prio[n] == pr: out[n] = pick(out[n][0], code[0]) + pick(out[n][1], code[1])
# in der EU praktisch immer pflanzlich bzw. sehr häufig und meist unkritisch
for n in list(out):
    if re.search(r'(^|\s|-)(zucker|sugar)|zucker$|^lecithin|lecithin(e)?$', n) and not re.search(r'(^|[^a-zäöü])ei|egg|hühner|milch|milk|butter|honig|honey', n):
        if out[n][0] == 'm': out[n] = 'y' + out[n][1]
    if re.search(r'aroma|aromen|flavou?r', n) and out[n] in ('mm', 'my'): out[n] = 'ss'
st = {}
for c in out.values(): st[c] = st.get(c, 0) + 1
print(len(E), json.dumps(st), file=sys.stderr)
json.dump(out, open(outp, 'w'), ensure_ascii=False, separators=(',', ':'))
