// service-worker.js - Service Worker para cache e funcionamento offline

const CACHE_NAME = 'emater-v1.4.0';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/styles/form.css',
  '/styles/table.css',
  '/styles/dashboard.css',
  '/ui.js',
  '/db.js',
  '/dashboard.js',
  '/charts.js',
  '/filters-export.js',
  '/offline-storage.js',
  '/sync-manager.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📥 Service Worker: Cache aberto');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('✅ Service Worker: Todos os arquivos em cache');
        return self.skipWaiting(); // Ativa imediatamente
      })
      .catch(err => {
        console.error('❌ Service Worker: Erro ao cachear:', err);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Deletar caches antigos
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Service Worker: Deletando cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Ativado');
        return self.clients.claim(); // Toma controle de todas as páginas
      })
  );
});

// Interceptar requisições (Fetch)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições de API (deixar db.js gerenciar)
  if (url.pathname.startsWith('/api/')) {
    return; // Não cachear APIs
  }

  // Estratégia: Cache First (tenta cache, depois rede)
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // console.log('💾 Cache hit:', url.pathname);
          return cachedResponse;
        }

        // console.log('🌐 Buscando na rede:', url.pathname);
        return fetch(request)
          .then(response => {
            // Não cachear respostas inválidas
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Cachear resposta válida
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(err => {
            console.error('❌ Erro na requisição:', url.pathname, err);
            
            // Retornar página offline se disponível
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            throw err;
          });
      })
  );
});

// Background Sync - Sincronizar quando voltar online
self.addEventListener('sync', (event) => {
  console.log('🔄 Background Sync ativado:', event.tag);
  
  if (event.tag === 'sync-visitas') {
    event.waitUntil(
      // Notificar cliente para sincronizar
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'BACKGROUND_SYNC',
            action: 'sync-visitas'
          });
        });
      })
    );
  }
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  const { type, action } = event.data;

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log('🗑️ Cache limpo');
        event.ports[0].postMessage({ success: true });
      })
    );
  }

  if (type === 'GET_CACHE_STATUS') {
    event.waitUntil(
      caches.has(CACHE_NAME).then(exists => {
        event.ports[0].postMessage({
          cacheName: CACHE_NAME,
          exists: exists
        });
      })
    );
  }
});

// Notificações Push (futuro)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Nova atualização disponível',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    vibrate: [200, 100, 200],
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Emater', options)
  );
});

console.log('✅ Service Worker carregado');
