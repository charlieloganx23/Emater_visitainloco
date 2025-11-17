// db.js - Agora usa API REST em vez de localStorage

const API_URL = window.location.origin + '/api';

async function db_list() {
  try {
    const response = await fetch(`${API_URL}/visitas`);
    if (!response.ok) throw new Error('Erro ao buscar visitas');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn("Erro ao ler DB:", e);
    return [];
  }
}

async function db_add(registro) {
  try {
    const response = await fetch(`${API_URL}/visitas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registro)
    });
    if (!response.ok) throw new Error('Erro ao salvar visita');
    return await response.json();
  } catch (e) {
    console.warn("Erro ao salvar visita:", e);
    throw e;
  }
}

async function db_get(id) {
  try {
    const response = await fetch(`${API_URL}/visitas/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Erro ao buscar visita');
    }
    return await response.json();
  } catch (e) {
    console.warn("Erro ao buscar visita:", e);
    return null;
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
