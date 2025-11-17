
const DB_KEY = "observacao_in_loco_registros_v1";

function db_list() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data;
  } catch (e) {
    console.warn("Erro ao ler DB:", e);
    return [];
  }
}

function db_save_all(list) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Erro ao salvar DB:", e);
  }
}

function db_add(registro) {
  const list = db_list();
  list.push(registro);
  db_save_all(list);
}

function db_get(id) {
  return db_list().find(r => r.id === id) || null;
}

function db_delete(id) {
  const list = db_list().filter(r => r.id !== id);
  db_save_all(list);
}

function db_clear() {
  db_save_all([]);
}
