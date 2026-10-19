// 논리 미궁 서비스 워커: 앱으로 설치할 수 있게 하고, 연결이 끊겼을 때 저장해 둔 화면을 연다.
// 페이지는 항상 네트워크를 먼저 써서 새 버전을 바로 받는다. 글꼴·로그인처럼 다른 주소로 가는 요청은 건드리지 않는다.
const CACHE = 'logicmaze-v1';
const SHELL = ['./', './favicon.svg', './favicon-32.png', './apple-touch-icon.png', './icon-192.png', './icon-512.png', './manifest.webmanifest'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put('./', copy));
          return res;
        })
        .catch(() => caches.match('./')),
    );
    return;
  }
  event.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
