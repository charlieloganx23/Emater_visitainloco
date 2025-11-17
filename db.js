// db.js - API REST com suporte offline

const API_URL = window.location.origin + '/api';

async function db_list() {
  try {
    // Tentar buscar online
    if (navigator.onLine) {
      const response = await fetch(`${API_URL}/visitas`);
      if (!response.ok) throw new Error('Erro ao buscar visitas');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } else {
      // Offline: retornar visitas do IndexedDB
      console.log('📡 Offline - buscando visitas locais');
      const offlineVisitas = await offlineStorage.getAll();
      return offlineVisitas.map(v => v.data);
    }
  } catch (e) {
    console.warn("Erro ao ler DB:", e);
    // Fallback: tentar IndexedDB
    try {
      const offlineVisitas = await offlineStorage.getAll();
      return offlineVisitas.map(v => v.data);
    } catch (err) {
      console.error("Erro ao acessar storage offline:", err);
      return [];
    }
  }
}

async function db_add(registro) {
  try {
    // Tentar enviar online
    if (navigator.onLine) {
      const response = await fetch(`${API_URL}/visitas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registro)
      });
      
      if (!response.ok) throw new Error('Erro ao salvar visita');
      
      const result = await response.json();
      console.log('✅ Visita salva online');
      return result;
    } else {
      // Offline: salvar no IndexedDB
      console.log('📡 Offline - salvando localmente');
      await offlineStorage.save(registro);
      return { success: true, id: registro.id, offline: true };
    }
  } catch (e) {
    console.warn("Erro ao salvar visita online, salvando offline:", e);
    // Fallback: salvar offline
    try {
      await offlineStorage.save(registro);
      return { success: true, id: registro.id, offline: true };
    } catch (err) {
      console.error("Erro ao salvar offline:", err);
      throw err;
    }
  }
}

async function db_get(id) {
  try {
    // Tentar buscar online
    if (navigator.onLine) {
      const response = await fetch(`${API_URL}/visitas/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Erro ao buscar visita');
      }
      return await response.json();
    } else {
      // Offline: buscar no IndexedDB
      console.log('📡 Offline - buscando visita local');
      const visitaOffline = await offlineStorage.get(id);
      return visitaOffline ? visitaOffline.data : null;
    }
  } catch (e) {
    console.warn("Erro ao buscar visita:", e);
    // Fallback: tentar IndexedDB
    try {
      const visitaOffline = await offlineStorage.get(id);
      return visitaOffline ? visitaOffline.data : null;
    } catch (err) {
      return null;
    }
  }
}

async function db_delete(id) {
  try {
    const response = await fetch(`${API_URL}/visitas/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erro ao deletar visita');
    return await response.json();
  } catch (e) {
    console.warn("Erro ao deletar visita:", e);
    throw e;
  }
}

async function db_clear() {
  try {
    const response = await fetch(`${API_URL}/visitas`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erro ao limpar banco');
    return await response.json();
  } catch (e) {
    console.warn("Erro ao limpar banco:", e);
    throw e;
  }
}
