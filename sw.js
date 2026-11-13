/* VeganToGo Service Worker: hält nur die App selbst offline bereit.
   Produktabfragen (Open Food Facts) werden NICHT zwischengespeichert. */
const CACHE = 'vegantogo-v2';
const OCR_CACHE = 'vegantogo-ocr-tess7';   // große Texterkennungs-Dateien, ändern sich nur mit neuer Version
const APP = ['./', './index.html'];
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
  e.respondWith(
    fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); } return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
