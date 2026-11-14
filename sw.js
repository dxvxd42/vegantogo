/* VeganToGo Service Worker: hält nur die App selbst offline bereit.
   Produktabfragen (Open Food Facts) werden NICHT zwischengespeichert. */
const CACHE = 'vegantogo-v6';
const OCR_CACHE = 'vegantogo-ocr-tess7';   // große Texterkennungs-Dateien, ändern sich nur mit neuer Version
const APP = ['./', './index.html', './tax-data.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== OCR_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // fremde Anfragen nicht anfassen
  if (url.pathname.includes('/ocr/')) {
    // Cache zuerst: einmal geladen, danach offline und ohne erneuten Download
    e.respondWith(caches.open(OCR_CACHE).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }))));
    return;
  }
  // Netz zuerst (für Updates) – aber bei schlechtem Empfang (Supermarkt!) nach 3 s die gespeicherte Version nehmen
  e.respondWith((async () => {
    const net = fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); } return r; });
    const cached = await caches.match(e.request, { ignoreSearch: e.request.mode === 'navigate' }) || (e.request.mode === 'navigate' ? await caches.match('./index.html') : undefined);
    if (!cached) return net;
    const slow = new Promise(res => setTimeout(() => res(cached), 3000));
    try { return await Promise.race([net, slow]); } catch (err) { return cached; }
  })());
});
