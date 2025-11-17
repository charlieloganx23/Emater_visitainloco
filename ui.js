
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
  const obj = {};
  fd.forEach((v, k) => {
    obj[k] = v;
  });
  return obj;
}

function computeSustainabilityIndex(record) {
  let sim = 0, total = 0;
  Object.entries(record).forEach(([k, v]) => {
    if (k.startsWith("c1_") && k.endsWith("_status")) {
      if (v === "sim" || v === "nao" || v === "parcial") {
        total++;
        if (v === "sim") sim++;
      }
    }
  });
  return total ? Math.round((sim / total) * 100) : 0;
}

function hasMarketInsertion(record) {
  return Object.entries(record).some(
    ([k, v]) => k.startsWith("c4_") && k.endsWith("_status") && v === "sim"
  );
}

function refreshTable() {
  const tbody = document.querySelector("#tableEntrevistas tbody");
  const empty = document.getElementById("tableEmpty");
  const list = db_list();
  const search = (document.getElementById("tableSearch")?.value || "").toLowerCase();

  tbody.innerHTML = "";
  let countRows = 0;

  list.forEach(r => {
    const ag = (r.agricultor || "").toString();
    const mu = (r.municipio || "").toString();
    if (search && !ag.toLowerCase().includes(search) && !mu.toLowerCase().includes(search)) {
      return;
    }
    const idx = computeSustainabilityIndex(r);
    const mercados = hasMarketInsertion(r) ? "Sim" : "Não";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${ag || "-"}</td>
      <td>${mu || "-"}</td>
      <td>${r.dataVisita || "-"}</td>
      <td>${idx}%</td>
      <td><span class="badge-pill">${mercados}</span></td>
      <td><button type="button" class="btn ghost small" data-open-espelho="${r.id}">Ver espelho</button></td>
    `;
    tbody.appendChild(tr);
    countRows++;
  });

  empty.style.display = countRows ? "none" : "block";
}

function openEspelho(id) {
  const r = db_get(id);
  if (!r) return;
  const overlay = document.getElementById("modalOverlay");
  const body = document.getElementById("modalBody");
  const sub = document.getElementById("modalSub");

  sub.textContent = `${r.agricultor || "Agricultor não informado"} • ${r.municipio || "Município não informado"} • ${r.dataVisita || ""}`;

  function renderSection(title, prefix, items) {
    let html = `<div class="modal-section-title">${title}</div><div class="modal-grid">`;
    items.forEach((label, index) => {
      const status = r[`${prefix}_${index}_status`] || "";
      const obs = r[`${prefix}_${index}_obs`] || "";
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
    html += "</div>";
    return html;
  }

  body.innerHTML = `
    <div class="modal-section-title">Identificação</div>
    <div class="modal-grid">
      <div><strong>Agricultor:</strong> ${r.agricultor || "-"}</div>
      <div><strong>Município:</strong> ${r.municipio || "-"}</div>
      <div><strong>Propriedade:</strong> ${r.propriedade || "-"}</div>
      <div><strong>Data da visita:</strong> ${r.dataVisita || "-"}</div>
      <div><strong>Auditor:</strong> ${r.auditor || "-"}</div>
      <div><strong>Técnico acompanhante:</strong> ${r.tecnico || "-"}</div>
      <div><strong>Índice C1 (sustentabilidade):</strong> ${computeSustainabilityIndex(r)}%</div>
      <div><strong>Inserção em mercados (C4):</strong> ${hasMarketInsertion(r) ? "Sim" : "Não aparente"}</div>
    </div>

    ${renderSection("C1 – Práticas produtivas sustentáveis", "c1", criteriaC1)}
    ${renderSection("C3 – Estrutura para agregação de valor", "c3", criteriaC3)}
    ${renderSection("C4 – Inserção em mercados", "c4", criteriaC4)}
    ${renderSection("C2 – Resultados percebidos", "c2", criteriaC2)}

    <div class="modal-section-title">Barreiras e síntese</div>
    <div class="modal-grid">
      <div><strong>Impedimentos à adoção de práticas sustentáveis:</strong><br>${r.b1 || "-"}</div>
      <div><strong>Gargalos para comercialização:</strong><br>${r.b2 || "-"}</div>
      <div><strong>Uso da infraestrutura de beneficiamento:</strong><br>${r.b3 || "-"}</div>
      <div><strong>Adequação da assistência técnica:</strong><br>${r.b4 || "-"}</div>
    </div>
    <div style="margin-top:10px;">
      <strong>Síntese do auditor:</strong><br>
      <div class="muted">${r.sintese || "Sem síntese registrada."}</div>
    </div>
  `;

  overlay.classList.remove("hidden");
}

function closeEspelho() {
  document.getElementById("modalOverlay").classList.add("hidden");
}

function switchView(viewId) {
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
    refreshTable();
  } else if (viewId === "view-dashboard") {
    title.textContent = "Painel de indicadores";
    sub.textContent = "Acompanhe o retrato consolidado das propriedades visitadas.";
    updateDashboard();
  }
}

function exportAllJSON() {
  const list = db_list();
  const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "observacao_in_loco_todas_visitas.json";
  a.click();
}

function exportAllCSV() {
  const list = db_list();
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
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const obj = formToObject(form);
    obj.id = "v_" + Date.now();
    db_add(obj);
    form.reset();
    setStep(1);
    refreshTable();
    updateDashboard();
    switchView("view-table");
  });

  document.getElementById("btnLimpar").addEventListener("click", () => {
    if (confirm("Deseja limpar todos os campos do formulário?")) {
      document.getElementById("formInLoco").reset();
      setStep(1);
    }
  });

  document.getElementById("btnSalvarRascunho").addEventListener("click", () => {
    const obj = formToObject(form);
    obj.id = "r_" + Date.now();
    db_add(obj);
    refreshTable();
    alert("Rascunho salvo na lista de entrevistas.");
  });

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  document.getElementById("tableEntrevistas").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open-espelho]");
    if (!btn) return;
    const id = btn.getAttribute("data-open-espelho");
    openEspelho(id);
  });

  document.getElementById("btnCloseModal").addEventListener("click", closeEspelho);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "modalOverlay") closeEspelho();
  });

  document.getElementById("tableSearch").addEventListener("input", refreshTable);
  document.getElementById("btnClearAll").addEventListener("click", () => {
    if (confirm("Tem certeza que deseja excluir todas as visitas registradas neste dispositivo?")) {
      db_clear();
      refreshTable();
      updateDashboard();
    }
  });

  document.getElementById("btnExportJson").addEventListener("click", exportAllJSON);
  document.getElementById("btnExportCsv").addEventListener("click", exportAllCSV);

  refreshTable();
  updateDashboard();
});
