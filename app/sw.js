// ===== ZP10 DIAGNOSE – SERVICE WORKER v5 =====
const CACHE_NAME = 'zp10-v5';

const CORE_ASSETS = [
    './',
    'index.html',
    'css/variables.css',
    'css/base.css',
    'css/components.css',
    'js/shared.js',
    'manifest.json'
];

const ALL_PAGES = [
    'escape-room.html',
    'module/zp10-terme-gleichungen.html',
    'module/zp10-terme-muster.html',
    'module/zp10-terme-vereinfachen.html',
    'module/zp10-lineare-funktionen.html',
    'module/zp10-quadratische-funktionen.html',
    'module/zp10-potenzen-wurzeln.html',
    'module/zp10-lgs.html',
    'module/zp10-geometrie.html',
    'module/zp10-stochastik.html',
    'module/zp10-strahlensatz.html',
    'module/zp10-prozent-wachstum.html',
    'module/zp10-expo-grundlagen.html',
    'module/zp10-exponentialfunktionen.html',
    'extras/zp10-daily.html',
    'extras/zp10-ueben.html',
    'extras/zp10-duell.html',
    'extras/zp10-escape-room.html',
    'extras/zp10-interleaving.html',
    'extras/zp10-fehleranalyse.html',
    'extras/zp10-pruefungsangst.html',
    'extras/zp10-highscore.html',
    'extras/zp10-stationen.html',
    'extras/zp10-stationen-qr.html',
    'schueler/zp10-profil.html',
    'schueler/zp10-lernplaner.html',
    'schueler/zp10-guide.html',
    'schueler/zp10-formelsammlung.html',
    'schueler/zp10-pruefung.html',
    'lehrer/zp10-lehrer-lokal.html',
    'lehrer/zp10-stationen-lehrer.html'
];

// Install: Pre-cache core, lazy-cache pages
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>
            cache.addAll(CORE_ASSETS).then(() =>
                Promise.allSettled(ALL_PAGES.map(url =>
                    cache.add(url).catch(() => console.log('Skip:', url))
                ))
            )
        ).then(() => self.skipWaiting())
    );
});

// Activate: Clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(names =>
            Promise.all(names.map(n => n !== CACHE_NAME ? caches.delete(n) : null))
        ).then(() => self.clients.claim())
    );
});

// Fetch: Stale-while-revalidate for HTML, cache-first for assets
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    // HTML: Stale-while-revalidate
    if (url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                const net = fetch(event.request).then(r => {
                    if (r && r.status === 200) {
                        const c = r.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, c));
                    }
                    return r;
                }).catch(() => cached || caches.match('index.html'));
                return cached || net;
            })
        );
        return;
    }

    // Assets: Cache-first
    event.respondWith(
        caches.match(event.request).then(cached =>
            cached || fetch(event.request).then(r => {
                if (r && r.status === 200) {
                    const c = r.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, c));
                }
                return r;
            }).catch(() => null)
        )
    );
});
