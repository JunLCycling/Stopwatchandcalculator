const CACHE_NAME = "ratios-sw-cache-v6";
const CORE_ASSETS = ["./", "./index.html", "./scorer.html"];

// 1. 安裝時強制從伺服器抓取最新版存入本機快取
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        CORE_ASSETS.map((url) =>
          fetch(url, { cache: "reload" }).then((res) => {
            if (res.ok) return cache.put(url, res);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

// 2. 啟動時清除舊版 (v1~v5) 快取並立即接管頁面
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 3. 攔截請求：有網抓最新版並更新快取；沒網時無條件回傳本機快取畫面
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const matched = await cache.match(event.request, { ignoreSearch: true });
        if (matched) return matched;

        const reqUrl = new URL(event.request.url);
        if (reqUrl.pathname.endsWith("/scorer.html")) {
          return await cache.match("./scorer.html", { ignoreSearch: true });
        }

        if (
          event.request.mode === "navigate" ||
          event.request.destination === "document"
        ) {
          return (
            (await cache.match("./index.html", { ignoreSearch: true })) ||
            (await cache.match("./", { ignoreSearch: true }))
          );
        }
      })
  );
});
