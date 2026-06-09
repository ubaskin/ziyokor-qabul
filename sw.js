/* ZIYOKOR qabul testi — service worker (offline-first kesh) */
const CACHE = 'ziyokor-qabul-v1';
const ASSETS = [
  './kiosk.html',
  './questions.json',
  './manifest.json',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Firebase RTDB so'rovlari (real-time) — keshlanmaydi, to'g'ridan tarmoqqa
  if (url.hostname.endsWith('firebaseio.com')) return;

  // questions.json — avval tarmoq (yangilik), bo'lmasa kesh
  if (url.pathname.endsWith('questions.json')) {
    e.respondWith(
      fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(req, c)); return r; })
        .catch(() => caches.match(req))
    );
    return;
  }
  // Qolgani — avval kesh (tez, offline), bo'lmasa tarmoq
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
