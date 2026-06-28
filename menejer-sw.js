// ZIYOKOR Menejer — desktop PWA service worker
// Maqsad: o'rnatiladigan ilova (Install) + qobiq (shell) tez ochilishi.
// Strategiya: HTML/JSON uchun network-first (doim yangi), zaxira — kesh.
var CACHE = 'zq-menejer-v11';
var SHELL = [
  './qabul-menejer.html',
  './menejer.webmanifest',
  './mathjax/tex-svg.js',
  './qabul-assets/menejer-icon-192.png',
  './qabul-assets/menejer-icon-512.png'
];
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
  }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;                 // yozuvlar (POST/PUT) — to'g'ridan-to'g'ri tarmoqqa
  var url = new URL(req.url);
  if (url.origin.indexOf('firebaseio.com') > -1) return; // ma'lumot bazasi — keshlanmaydi
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok && url.origin === location.origin) {
        var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, cp); });
      }
      return res;
    }).catch(function () { return caches.match(req); })
  );
});
