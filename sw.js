/* ZIYOKOR qabul testi — service worker (ES5, eski WebView mos). Network-first. */
var CACHE = 'ziyokor-qabul-v2';
var ASSETS = [
  './', './index.html', './kiosk.html', './app.bundle.js',
  './questions.json', './manifest.json',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS).catch(function () {}); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  // Firebase real-time — keshlamaymiz, to'g'ridan tarmoqqa
  if (url.hostname.indexOf('firebaseio.com') > -1) return;
  // Network-first: online bo'lsa eng yangi, tarmoq yo'q bo'lsa keshdan
  e.respondWith(
    fetch(req).then(function (r) {
      var c = r.clone();
      caches.open(CACHE).then(function (ca) { ca.put(req, c); });
      return r;
    }).catch(function () { return caches.match(req); })
  );
});
