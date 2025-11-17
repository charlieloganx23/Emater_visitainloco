// offline-storage.js - Gerenciamento de armazenamento offline com IndexedDB

const DB_NAME = 'EmaterOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'visitas_pendentes';

class OfflineStorage {
  constructor() {
    this.db = null;
  }

  // Inicializar banco de dados IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Erro ao abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB inicializado');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Criar object store se não existir
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('status', 'status', { unique: false });
          objectStore.createIndex('created_at', 'created_at', { unique: false });
          objectStore.createIndex('synced_at', 'synced_at', { unique: false });
          console.log('✅ Object store criado:', STORE_NAME);
        }
      };
    });
  }

  // Salvar visita offline
  async save(visitaData) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const visitaOffline = {
        id: visitaData.id,
        data: visitaData,
        status: 'pending',
        retries: 0,
        created_at: Date.now(),
        synced_at: null,
        error: null
      };

      const request = store.add(visitaOffline);

      request.onsuccess = () => {
        console.log('✅ Visita salva offline:', visitaData.id);
        resolve(visitaOffline);
      };

      request.onerror = () => {
        console.error('❌ Erro ao salvar offline:', request.error);
        reject(request.error);
      };
    });
  }

  // Buscar todas as visitas pendentes
  async getPending() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('❌ Erro ao buscar pendentes:', request.error);
        reject(request.error);
      };
    });
  }

  // Buscar todas as visitas (pendentes + sincronizadas)
  async getAll() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('❌ Erro ao buscar todas:', request.error);
        reject(request.error);
      };
    });
  }

  // Buscar visita por ID
  async get(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('❌ Erro ao buscar visita:', request.error);
        reject(request.error);
      };
    });
  }

  // Marcar visita como sincronizada
  async markSynced(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const visita = request.result;
        if (visita) {
          visita.status = 'synced';
          visita.synced_at = Date.now();
          visita.error = null;

          const updateRequest = store.put(visita);
          updateRequest.onsuccess = () => {
            console.log('✅ Visita marcada como sincronizada:', id);
            resolve(visita);
          };
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Incrementar contador de retries
  async incrementRetry(id, errorMessage = null) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const visita = request.result;
        if (visita) {
          visita.retries = (visita.retries || 0) + 1;
          visita.error = errorMessage;

          const updateRequest = store.put(visita);
          updateRequest.onsuccess = () => {
            console.warn('⚠️ Retry incrementado:', id, 'tentativa', visita.retries);
            resolve(visita);
          };
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Deletar visita do armazenamento local
  async delete(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('🗑️ Visita deletada do offline:', id);
        resolve(true);
      };

      request.onerror = () => {
        console.error('❌ Erro ao deletar:', request.error);
        reject(request.error);
      };
    });
  }

  // Limpar visitas sincronizadas antigas (mais de 7 dias)
  async cleanOldSynced() {
    if (!this.db) await this.init();

    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const visitas = request.result || [];
        let deletedCount = 0;

        visitas.forEach(visita => {
          if (visita.status === 'synced' && visita.synced_at < sevenDaysAgo) {
            store.delete(visita.id);
            deletedCount++;
          }
        });

        console.log(`🧹 ${deletedCount} visitas antigas removidas`);
        resolve(deletedCount);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Contar visitas pendentes
  async countPending() {
    const pending = await this.getPending();
    return pending.length;
  }

  // Obter estatísticas
  async getStats() {
    const all = await this.getAll();
    const pending = all.filter(v => v.status === 'pending');
    const synced = all.filter(v => v.status === 'synced');
    const withErrors = all.filter(v => v.retries > 0);

    return {
      total: all.length,
      pending: pending.length,
      synced: synced.length,
      withErrors: withErrors.length,
      oldestPending: pending.length > 0 
        ? Math.min(...pending.map(v => v.created_at))
        : null
    };
  }
}

// Instância global
const offlineStorage = new OfflineStorage();

// Inicializar automaticamente quando o script carregar
if (typeof window !== 'undefined') {
  offlineStorage.init().catch(err => {
    console.error('Erro ao inicializar offline storage:', err);
  });
}
