const CACHE = 'review-packet-__BUILD_SHA__';
const SHELL = ['/', '/demo', '/404.html', '/review-packet-diorama.webp', '/review-packet-social.webp', '/favicon.svg', '/apple-touch-icon.png', '/legal.css', '/route-focus.js', '/privacy/', '/terms/'];
self.addEventListener('install', (event) => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  await cache.addAll(SHELL);
  const html = await (await fetch('/')).text();
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
  await cache.addAll(assets);
  await self.skipWaiting();
})()));
self.addEventListener('activate', (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Vite Preview (and some Static Web App configurations) send `Vary: Origin`
    // for module files. The install fetch has no Origin header while a module
    // request does, so a normal Cache match misses a perfectly valid precache.
    const cached = await cache.match(event.request, { ignoreVary: true });
    if (cached) return cached;

    try {
      const response = await fetch(event.request);
      if (response.ok) void cache.put(event.request, response.clone());
      return response;
    } catch {
      // Only HTML navigations can sensibly fall back to the application shell.
      // Returning index.html for a missing script turns an offline app into an
      // inert page because browsers reject HTML module responses.
      if (event.request.mode === 'navigate') {
        const shell = await cache.match('/', { ignoreVary: true });
        if (shell) return shell;
      }
      return Response.error();
    }
  })());
});
