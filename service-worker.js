// 梅花易數排盤 service worker
const CACHE_NAME = 'plum-blossom-divination-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/css/style.css',
  '/src/js/app.js',
  '/src/js/apiClient.js',
  '/src/js/components.js',
  '/src/js/divinationData.js',
  '/src/js/divinationService.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 檢測是否處於開發環境
const isDevelopment = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
console.log('Service Worker 運行環境：', isDevelopment ? '開發模式' : '生產模式');

// 安装事件 - 預先快取重要資源
self.addEventListener('install', event => {
  // 如果在開發模式下，跳過預先快取
  if (isDevelopment) {
    console.log('開發模式：跳過快取安裝');
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('正在快取資源');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
      .catch(error => console.log('預先快取時發生錯誤:', error))
  );
});

// 啟動事件 - 清理舊快取
self.addEventListener('activate', event => {
  // 如果在開發模式下，清理所有快取
  if (isDevelopment) {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        ).then(() => {
          console.log('開發模式：已清理所有快取');
          return self.clients.claim();
        });
      })
    );
    return;
  }

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 攔截請求 - 實現離線優先策略
self.addEventListener('fetch', event => {
  // 忽略POST請求和非同源請求
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // 忽略API請求
  if (event.request.url.includes