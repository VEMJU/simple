/* Lets the app open without a connection.
   With a connection every file comes from the network, so a new version shows at once, and a copy is saved.
   Without one, the saved copy is used. Videos are not saved: they are large and load in pieces.
   js/app.js adds the sign pictures to the same store, so its name is written there too. */
const CACHE = 'simple-v1';
const SHELL = ['./', 'index.html', 'css/app.css', 'js/plan-data.js', 'js/permit-data.js', 'js/permit-questions.js', 'js/app.js'];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.endsWith('.mp4')) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || Response.error())));
});
