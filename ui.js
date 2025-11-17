
const criteriaC1 = [
  "Orientação técnica ambiental da Emater (placas, materiais, etc.)",
  "Práticas de conservação de solo e água (curvas de nível, terraceamento, barraginhas)",
  "Uso de compostagem ou adubação orgânica",
  "Manejo integrado de pragas ou controle biológico",
  "Sistema de produção agroecológico/orgânico (mesmo sem certificação)",
  "Diversificação produtiva (consórcios, rotação, quintais produtivos)",
  "Presença de área de reserva legal / APP com proteção ativa",
  "Utilização de sementes crioulas, nativas ou adaptadas",
  "Captação e uso racional da água (cisternas, gotejamento, reutilização)",
  "Adequação sanitária/ambiental do local de criação de animais"
];

const criteriaC3 = [
  "Estrutura de beneficiamento/processamento (agroindústria, casa de farinha, queijaria)",
  "Rótulos, embalagens ou marca própria para produtos",
  "Certificação (orgânico, SIPPO, produção integrada, etc.)",
  "Apoio técnico da Emater visível na estrutura física/organizacional",
  "Equipamentos que agregam valor (seladoras, balanças, resfriadores, etc.)",
  "Apoio para acesso a linhas de fomento à agroindústria/beneficiamento"
];

const criteriaC4 = [
  "Evidência de venda para PAA/PNAE (notas, entregas, contratos, etc.)",
  "Participação em feiras, circuitos curtos ou cooperativas de comercialização",
  "Relação comercial com mercados locais/regionais (supermercados, restaurantes, etc.)",
  "Materiais de divulgação/canais de venda direta (redes sociais, QR code, etc.)",
  "Articulação com centrais de abastecimento ou agroindústrias regionais"
];

const criteriaC2 = [
  "Melhoria na produtividade (aumento na produção por área/ciclo)",
  "Melhoria na renda familiar (relato e/ou registros auxiliares)",
  "Adoção de novas práticas com base na orientação da Emater-RO",
  "Melhoria nas condições de trabalho (mecanização, ergonomia, EPIs, etc.)",
  "Boas práticas com potencial de replicação em outras propriedades"
];

function renderCriteria(containerId, basePrefix, items) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  items.forEach((label, index) => {
    const idBase = `${basePrefix}_${index}`;
    const card = document.createElement("div");
    card.className = "criteria-card";
    card.innerHTML = `
      <div class="criteria-card-title">${label}</div>
      <div class="criteria-options">
        <button type="button" class="chip" data-target="${idBase}" data-value="sim">Sim</button>
        <button type="button" class="chip" data-target="${idBase}" data-value="nao">Não</button>
        <button type="button" class="chip" data-target="${idBase}" data-value="parcial">Parcial</button>
      </div>
      <textarea name="${idBase}_obs" placeholder="Observações (opcional)"></textarea>
      <input type="hidden" name="${idBase}_status" id="${idBase}_status">
    `;
    container.appendChild(card);
  });
}

function initChips() {
  document.querySelectorAll(".criteria-grid").forEach(grid => {
    grid.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      const target = btn.getAttribute("data-target");
      const value = btn.getAttribute("data-value");
      const hidden = document.getElementById(target + "_status");
      if (hidden) hidden.value = value;

      const parent = btn.parentElement;
      parent.querySelectorAll(".chip").forEach(c => {
        c.classList.remove("active-sim", "active-nao", "active-parcial");
      });
      if (value === "sim") btn.classList.add("active-sim");
      if (value === "nao") btn.classList.add("active-nao");
      if (value === "parcial") btn.classList.add("active-parcial");
    });
  });
}

function getCurrentStep() {
  const active = document.querySelector(".form-step.active");
  return active ? parseInt(active.getAttribute("data-step"), 10) : 1;
}

function setStep(step) {
  const total = document.querySelectorAll(".form-step").length;
  document.querySelectorAll(".form-step").forEach(div => {
    div.classList.toggle("active", parseInt(div.getAttribute("data-step"), 10) === step);
  });
  document.querySelectorAll(".step-dot").forEach(dot => {
    const d = parseInt(dot.getAttribute("data-step"), 10);
    dot.classList.toggle("active", d <= step);
  });
  const fill = document.getElementById("formProgressFill");
  if (fill) {
    fill.style.width = ((step - 1) / (total - 1)) * 100 + "%";
  }
  const label = document.getElementById("formProgressLabel");
  if (label) {
    label.textContent = `Etapa ${step} de ${total}`;
  }
}

function formToObject(form) {
  const fd = new FormData(form);
  const obj = {
    id: "v_" + Date.now(),
    c1: [],
    c2: [],
    c3: [],
    c4: [],
    barreiras: {},
    sintese: {}
  };
  
  // Dados básicos
  obj.agricultor = fd.get('agricultor') || '';
  obj.municipio = fd.get('municipio') || '';
  obj.propriedade = fd.get('propriedade') || '';
  obj.dataVisita = fd.get('dataVisita') || '';
  obj.auditor = fd.get('auditor') || '';
  obj.tecnico = fd.get('tecnico') || '';
  
  // Critérios C1
  criteriaC1.forEach((label, index) => {
    const status = fd.get(`c1_${index}_status`);
    const observacao = fd.get(`c1_${index}_obs`) || '';
    if (status) {
      obj.c1.push({
        item_index: index,
        item_label: label,
        status: status,
        observacao: observacao
      });
    }
  });
  
  // Critérios C2
  criteriaC2.forEach((label, index) => {
    const status = fd.get(`c2_${index}_status`);
    const observacao = fd.get(`c2_${index}_obs`) || '';
    if (status) {
      obj.c2.push({
        item_index: index,
        item_label: label,
        status: status,
        observacao: observacao
      });
    }
  });
  
  // Critérios C3
  criteriaC3.forEach((label, index) => {
    const status = fd.get(`c3_${index}_status`);
    const observacao = fd.get(`c3_${index}_obs`) || '';
    if (status) {
      obj.c3.push({
        item_index: index,
        item_label: label,
        status: status,
        observacao: observacao
      });
    }
  });
  
  // Critérios C4
  criteriaC4.forEach((label, index) => {
    const status = fd.get(`c4_${index}_status`);
    const observacao = fd.get(`c4_${index}_obs`) || '';
    const descricao = fd.get('c4_descr') || '';
    if (status) {
      obj.c4.push({
        item_index: index,
        item_label: label,
        status: status,
        observacao: observacao,
        descricao_comercializacao: descricao
      });
    }
  });
  
  // Barreiras
  obj.barreiras = {
    b1: fd.get('b1') || '',
    b2: fd.get('b2') || '',
    b3: fd.get('b3') || '',
    b4: fd.get('b4') || ''
  };
  
  // Síntese
  obj.sintese = {
    texto: fd.get('sintese') || ''
  };
  
  return obj;
}

function computeSustainabilityIndex(record) {
  let sim = 0, total = 0;
  
  // Se temos os dados estruturados (da API)
  if (record.c1 && Array.isArray(record.c1)) {
    record.c1.forEach(item => {
      if (item.status) {
        total++;
        if (item.status === "sim") sim++;
      }
    });
  } else {
    // Fallback para formato antigo
    Object.entries(record).forEach(([k, v]) => {
      if (k.startsWith("c1_") && k.endsWith("_status")) {
        if (v === "sim" || v === "nao" || v === "parcial") {
          total++;
          if (v === "sim") sim++;
        }
      }
    });
  }
  
  return total ? Math.round((sim / total) * 100) : 0;
}

function hasMarketInsertion(record) {
  // Se temos os dados estruturados (da API)
  if (record.c4 && Array.isArray(record.c4)) {
    return record.c4.some(item => item.status === "sim");
  }
  
  // Fallback para formato antigo
  return Object.entries(record).some(
    ([k, v]) => k.startsWith("c4_") && k.endsWith("_status") && v === "sim"
  );
}

async function refreshTable() {
  const tbody = document.querySelector("#tableEntrevistas tbody");
  const empty = document.getElementById("tableEmpty");
  const list = await db_list();
  
  // Atualizar cache global e filtro de municípios
  allVisitas = list;
  updateMunicipioFilter(list);
  
  // Aplicar filtros
  const filtered = applyFilters(list);

  tbody.innerHTML = "";
  let countRows = 0;

  filtered.forEach(r => {
    const ag = (r.agricultor || "").toString();
    const mu = (r.municipio || "").toString();
    const idx = computeSustainabilityIndex(r);
    const mercados = hasMarketInsertion(r) ? "Sim" : "Não";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${ag || "-"}</td>
      <td>${mu || "-"}</td>
      <td>${r.data_visita || r.dataVisita || "-"}</td>
      <td>${idx}%</td>
      <td><span class="badge-pill">${mercados}</span></td>
      <td>
        <button type="button" class="btn ghost small" data-open-espelho="${r.id}">Ver</button>
        <button type="button" class="btn primary ghost small" data-duplicate="${r.id}" title="Duplicar visita">📋</button>
        <button type="button" class="btn danger ghost small" data-delete="${r.id}" title="Deletar visita">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
    countRows++;
  });

  empty.style.display = countRows ? "none" : "block";
}

async function openEspelho(id) {
  const r = await db_get(id);
  if (!r) return;
  
  // Armazenar visita para exportação
  currentVisitaForExport = r;
  
  const overlay = document.getElementById("modalOverlay");
  const body = document.getElementById("modalBody");
  const sub = document.getElementById("modalSub");

  sub.textContent = `${r.agricultor || "Agricultor não informado"} • ${r.municipio || "Município não informado"} • ${r.data_visita || r.dataVisita || ""}`;

  function renderSection(title, items, criteriaLabels) {
    let html = `<div class="modal-section-title">${title}</div><div class="modal-grid">`;
    
    if (Array.isArray(items)) {
      items.forEach((item) => {
        const label = item.item_label || criteriaLabels[item.item_index] || '';
        const status = item.status || '';
        const obs = item.observacao || '';
        
        let badgeClass = "neutro", badgeLabel = "Não informado";
        if (status === "sim") { badgeClass = "sim"; badgeLabel = "Sim"; }
        if (status === "nao") { badgeClass = "nao"; badgeLabel = "Não"; }
        if (status === "parcial") { badgeClass = "parcial"; badgeLabel = "Parcial"; }
        
        html += `
          <div>
            <div><strong>${label}</strong></div>
            <div class="badge ${badgeClass}" style="margin:4px 0 2px;">${badgeLabel}</div>
            ${obs ? `<div class="muted">Obs.: ${obs}</div>` : ""}
          </div>
        `;
      });
    }
    
    html += "</div>";
    return html;
  }

  const barreiraData = r.barreiras || {};
  const sinteseData = r.sintese || {};

  body.innerHTML = `
    <div class="modal-section-title">Identificação</div>
    <div class="modal-grid">
      <div><strong>Agricultor:</strong> ${r.agricultor || "-"}</div>
      <div><strong>Município:</strong> ${r.municipio || "-"}</div>
      <div><strong>Propriedade:</strong> ${r.propriedade || "-"}</div>
      <div><strong>Data da visita:</strong> ${r.data_visita || r.dataVisita || "-"}</div>
      <div><strong>Auditor:</strong> ${r.auditor || "-"}</div>
      <div><strong>Técnico acompanhante:</strong> ${r.tecnico || "-"}</div>
      <div><strong>Índice C1 (sustentabilidade):</strong> ${computeSustainabilityIndex(r)}%</div>
      <div><strong>Inserção em mercados (C4):</strong> ${hasMarketInsertion(r) ? "Sim" : "Não aparente"}</div>
    </div>

    ${renderSection("C1 – Práticas produtivas sustentáveis", r.c1 || [], criteriaC1)}
    ${renderSection("C3 – Estrutura para agregação de valor", r.c3 || [], criteriaC3)}
    ${renderSection("C4 – Inserção em mercados", r.c4 || [], criteriaC4)}
    ${renderSection("C2 – Resultados percebidos", r.c2 || [], criteriaC2)}

    <div class="modal-section-title">Barreiras e síntese</div>
    <div class="modal-grid">
      <div><strong>Impedimentos à adoção de práticas sustentáveis:</strong><br>${barreiraData.impedimentos_praticas_sustentaveis || barreiraData.b1 || "-"}</div>
      <div><strong>Gargalos para comercialização:</strong><br>${barreiraData.gargalos_comercializacao || barreiraData.b2 || "-"}</div>
      <div><strong>Uso da infraestrutura de beneficiamento:</strong><br>${barreiraData.infraestrutura_beneficiamento || barreiraData.b3 || "-"}</div>
      <div><strong>Adequação da assistência técnica:</strong><br>${barreiraData.adequacao_assistencia_tecnica || barreiraData.b4 || "-"}</div>
    </div>
    <div style="margin-top:10px;">
      <strong>Síntese do auditor:</strong><br>
      <div class="muted">${sinteseData.texto_sintese || sinteseData.texto || "Sem síntese registrada."}</div>
    </div>
  `;

  overlay.classList.remove("hidden");
}

function closeEspelho() {
  document.getElementById("modalOverlay").classList.add("hidden");
}

async function switchView(viewId) {
  document.querySelectorAll(".view").forEach(v => {
    v.classList.toggle("active", v.id === viewId);
  });
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });

  const title = document.getElementById("topbar-title");
  const sub = document.getElementById("topbar-subtitle");
  if (viewId === "view-form") {
    title.textContent = "Nova visita in loco";
    sub.textContent = "Preencha os dados da propriedade e registre as evidências observadas.";
  } else if (viewId === "view-table") {
    title.textContent = "Entrevistas coletadas";
    sub.textContent = "Visualize, filtre e abra o espelho das visitas já registradas.";
    await refreshTable();
  } else if (viewId === "view-dashboard") {
    title.textContent = "Painel de indicadores";
    sub.textContent = "Acompanhe o retrato consolidado das propriedades visitadas.";
    
    // Se dashboard.js está carregado, usar versão avançada
    if (typeof initDashboard !== 'undefined') {
      initDashboard();
    } else {
      // Fallback para versão básica
      await updateDashboard();
    }
  }
}

async function exportAllJSON() {
  const list = await db_list();
  const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "observacao_in_loco_todas_visitas.json";
  a.click();
}

async function exportAllCSV() {
  const list = await db_list();
  if (!list.length) return;
  const cols = Array.from(
    list.reduce((set, r) => {
      Object.keys(r).forEach(k => set.add(k));
      return set;
    }, new Set())
  );
  const lines = [];
  lines.push(cols.join(";"));
  list.forEach(r => {
    const row = cols.map(c => {
      const v = r[c] ?? "";
      return '"' + String(v).replace(/"/g, '""') + '"';
    });
    lines.push(row.join(";"));
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "observacao_in_loco_todas_visitas.csv";
  a.click();
}

document.addEventListener("DOMContentLoaded", () => {
  renderCriteria("c1Container", "c1", criteriaC1);
  renderCriteria("c3Container", "c3", criteriaC3);
  renderCriteria("c4Container", "c4", criteriaC4);
  renderCriteria("c2Container", "c2", criteriaC2);
  initChips();

  setStep(1);

  document.getElementById("btnNext").addEventListener("click", () => {
    const total = document.querySelectorAll(".form-step").length;
    let s = getCurrentStep();
    if (s < total) {
      s++;
      setStep(s);
    }
  });
  document.getElementById("btnPrev").addEventListener("click", () => {
    let s = getCurrentStep();
    if (s > 1) {
      s--;
      setStep(s);
    }
  });

  const form = document.getElementById("formInLoco");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const obj = formToObject(form);
    try {
      await db_add(obj);
      form.reset();
      setStep(1);
      await refreshTable();
      await updateDashboard();
      await switchView("view-table");
      alert("Visita salva com sucesso!");
    } catch (error) {
      alert("Erro ao salvar visita. Verifique a conexão e tente novamente.");
      console.error(error);
    }
  });

  document.getElementById("btnLimpar").addEventListener("click", () => {
    if (confirm("Deseja limpar todos os campos do formulário?")) {
      document.getElementById("formInLoco").reset();
      setStep(1);
    }
  });

  document.getElementById("btnSalvarRascunho").addEventListener("click", async () => {
    const obj = formToObject(form);
    obj.id = "r_" + Date.now();
    try {
      await db_add(obj);
      await refreshTable();
      alert("Rascunho salvo na lista de entrevistas.");
    } catch (error) {
      alert("Erro ao salvar rascunho.");
      console.error(error);
    }
  });

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  document.getElementById("tableEntrevistas").addEventListener("click", async (e) => {
    // Abrir espelho
    const btnEspelho = e.target.closest("[data-open-espelho]");
    if (btnEspelho) {
      const id = btnEspelho.getAttribute("data-open-espelho");
      openEspelho(id);
      return;
    }
    
    // Duplicar visita
    const btnDuplicate = e.target.closest("[data-duplicate]");
    if (btnDuplicate) {
      const id = btnDuplicate.getAttribute("data-duplicate");
      await duplicateVisita(id);
      return;
    }
    
    // Deletar visita individual
    const btnDelete = e.target.closest("[data-delete]");
    if (btnDelete) {
      const id = btnDelete.getAttribute("data-delete");
      if (confirm("Tem certeza que deseja excluir esta visita?")) {
        try {
          await db_delete(id);
          await refreshTable();
          await updateDashboard();
          alert("Visita excluída com sucesso!");
        } catch (error) {
          alert("Erro ao excluir visita.");
          console.error(error);
        }
      }
      return;
    }
  });

  document.getElementById("btnCloseModal").addEventListener("click", closeEspelho);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "modalOverlay") closeEspelho();
  });

  // Inicializar filtros e exportação
  initFiltersAndExports();
  initVisitaExport();

  document.getElementById("btnClearAll").addEventListener("click", async () => {
    if (confirm("Tem certeza que deseja excluir todas as visitas registradas?")) {
      try {
        await db_clear();
        await refreshTable();
        await updateDashboard();
        alert("Todas as visitas foram excluídas.");
      } catch (error) {
        alert("Erro ao excluir visitas.");
        console.error(error);
      }
    }
  });

  document.getElementById("btnExportJson").addEventListener("click", exportAllJSON);
  document.getElementById("btnExportCsv").addEventListener("click", exportAllCSV);

  refreshTable();
  updateDashboard().catch(err => console.error('Erro ao atualizar dashboard:', err));
});
