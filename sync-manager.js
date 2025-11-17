// sync-manager.js - Gerenciamento de sincronização automática

class SyncManager {
  constructor() {
    this.isSyncing = false;
    this.syncInterval = null;
    this.listeners = [];
    this.retryDelay = 5000; // 5 segundos entre retries
    this.batchSize = 5; // Sincroniza 5 visitas por vez
  }

  // Iniciar monitoramento
  async init() {
    console.log('🔄 SyncManager inicializado');

    // Detectar mudanças de conexão
    window.addEventListener('online', () => {
      console.log('✅ Conexão restaurada');
      this.notifyListeners('online');
      this.syncPending();
    });

    window.addEventListener('offline', () => {
      console.log('❌ Conexão perdida');
      this.notifyListeners('offline');
    });

    // Sincronizar periodicamente se estiver online (a cada 2 minutos)
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncPending();
      }
    }, 120000); // 2 minutos

    // Sincronizar na inicialização se estiver online
    if (navigator.onLine) {
      setTimeout(() => this.syncPending(), 2000); // Aguarda 2s após carregar
    }

    // Registrar Background Sync (PWA)
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-visitas');
        console.log('✅ Background Sync registrado');
      } catch (err) {
        console.warn('⚠️ Background Sync não disponível:', err.message);
      }
    }
  }

  // Adicionar listener de eventos
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Notificar listeners
  notifyListeners(event, data = null) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (err) {
        console.error('Erro ao notificar listener:', err);
      }
    });
  }

  // Sincronizar visitas pendentes
  async syncPending() {
    if (this.isSyncing) {
      console.log('⏳ Sincronização já em andamento...');
      return;
    }

    if (!navigator.onLine) {
      console.log('📡 Offline - sincronização adiada');
      return;
    }

    this.isSyncing = true;
    this.notifyListeners('sync-start');

    try {
      const pending = await offlineStorage.getPending();
      
      if (pending.length === 0) {
        console.log('✅ Nenhuma visita pendente');
        this.isSyncing = false;
        this.notifyListeners('sync-complete', { success: 0, failed: 0, total: 0 });
        return;
      }

      console.log(`🔄 Sincronizando ${pending.length} visita(s) pendente(s)...`);

      let successCount = 0;
      let failedCount = 0;

      // Sincronizar em batches
      for (let i = 0; i < pending.length; i += this.batchSize) {
        const batch = pending.slice(i, i + this.batchSize);
        
        const results = await Promise.allSettled(
          batch.map(visitaOffline => this.syncOne(visitaOffline))
        );

        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            successCount++;
          } else {
            failedCount++;
          }
        });

        // Delay entre batches para não sobrecarregar servidor
        if (i + this.batchSize < pending.length) {
          await this.delay(500);
        }
      }

      console.log(`✅ Sincronização completa: ${successCount} sucesso, ${failedCount} falhas`);
      
      this.notifyListeners('sync-complete', {
        success: successCount,
        failed: failedCount,
        total: pending.length
      });

      // Limpar visitas sincronizadas antigas
      await offlineStorage.cleanOldSynced();

    } catch (err) {
      console.error('❌ Erro na sincronização:', err);
      this.notifyListeners('sync-error', { error: err.message });
    } finally {
      this.isSyncing = false;
    }
  }

  // Sincronizar uma visita
  async syncOne(visitaOffline) {
    const { id, data, retries } = visitaOffline;

    // Limite de retries (máximo 10 tentativas)
    if (retries >= 10) {
      console.error(`❌ Visita ${id} excedeu limite de retries (10)`);
      await offlineStorage.incrementRetry(id, 'Limite de retries excedido');
      return false;
    }

    try {
      console.log(`📤 Enviando visita ${id}...`);

      const API_URL = window.location.origin + '/api';
      const response = await fetch(`${API_URL}/visitas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      // Marcar como sincronizada
      await offlineStorage.markSynced(id);
      
      console.log(`✅ Visita ${id} sincronizada com sucesso`);
      this.notifyListeners('sync-item-success', { id, data: result });
      
      return true;

    } catch (err) {
      console.error(`❌ Erro ao sincronizar visita ${id}:`, err.message);
      
      // Incrementar contador de retries
      await offlineStorage.incrementRetry(id, err.message);
      
      this.notifyListeners('sync-item-error', { id, error: err.message });
      
      return false;
    }
  }

  // Forçar sincronização manual
  async forcSync() {
    console.log('🔄 Sincronização manual forçada');
    await this.syncPending();
  }

  // Obter status de sincronização
  async getStatus() {
    const stats = await offlineStorage.getStats();
    return {
      isOnline: navigator.onLine,
      isSyncing: this.isSyncing,
      pending: stats.pending,
      synced: stats.synced,
      withErrors: stats.withErrors,
      total: stats.total
    };
  }

  // Utility: delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Destruir (cleanup)
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    window.removeEventListener('online', this.syncPending);
    window.removeEventListener('offline', () => {});
    this.listeners = [];
  }
}

// Instância global
const syncManager = new SyncManager();

// Inicializar automaticamente
if (typeof window !== 'undefined') {
  // Aguardar DOM carregar e offline storage inicializar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => syncManager.init(), 1000);
    });
  } else {
    setTimeout(() => syncManager.init(), 1000);
  }
}
