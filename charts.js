
async function computeMetrics() {
  const list = await db_list();
  
  // Garantir que list é um array
  if (!Array.isArray(list)) {
    console.error('db_list não retornou um array:', list);
    return {
      totalVisitas: 0,
      totalSim: 0,
      totalNao: 0,
      totalParcial: 0,
      c1Sim: 0,
      c1Total: 0,
      propsComMercado: 0,
      timeline: []
    };
  }
  
  const totalVisitas = list.length;

  let totalSim = 0, totalNao = 0, totalParcial = 0;
  let c1Sim = 0, c1Total = 0;
  let propsComMercado = 0;
  const timelineMap = {};

  list.forEach(r => {
    Object.entries(r).forEach(([key, value]) => {
      if (value === "sim" || value === "nao" || value === "parcial") {
        if (value === "sim") totalSim++;
        if (value === "nao") totalNao++;
        if (value === "parcial") totalParcial++;

        if (key.startsWith("c1_")) {
          c1Total++;
          if (value === "sim") c1Sim++;
        }
      }
    });

    const hasMercado = Object.entries(r).some(
      ([key, value]) => key.startsWith("c4_") && value === "sim"
    );
    if (hasMercado) propsComMercado++;

    const data = r.dataVisita || "";
    if (data) {
      timelineMap[data] = (timelineMap[data] || 0) + 1;
    }
  });

  const totalResps = totalSim + totalNao + totalParcial;
  const pctSim = totalResps ? (totalSim / totalResps) * 100 : 0;
  const c1Index = c1Total ? (c1Sim / c1Total) * 100 : 0;
  const pctMercados = totalVisitas ? (propsComMercado / totalVisitas) * 100 : 0;

  return {
    totalVisitas,
    totalSim,
    totalNao,
    totalParcial,
    pctSim,
    c1Index,
    pctMercados,
    timelineMap
  };
}

async function updateDashboard() {
  const m = await computeMetrics();
  const elTotal = document.getElementById("kpiTotalVisitas");
  if (!elTotal) return; // dashboard ainda não montado

  elTotal.textContent = m.totalVisitas;
  document.getElementById("kpiPctSim").textContent = m.pctSim.toFixed(0) + "%";
  document.getElementById("kpiC1").textContent = m.c1Index.toFixed(0) + "%";
  document.getElementById("kpiMercados").textContent = m.pctMercados.toFixed(0) + "%";

  const bar = document.getElementById("chartSimNaoParcial");
  bar.innerHTML = "";
  const rows = [
    ["Sim", m.totalSim, "sim"],
    ["Não", m.totalNao, "nao"],
    ["Parcial", m.totalParcial, "parcial"]
  ];
  const maxVal = Math.max(1, m.totalSim, m.totalNao, m.totalParcial);
  rows.forEach(([label, value, key]) => {
    const row = document.createElement("div");
    row.className = "chart-row";
    row.innerHTML = `
      <div class="chart-row-label">${label}</div>
      <div class="chart-row-bar-bg">
        <div class="chart-row-bar-fill ${key}" style="width:${(value / maxVal) * 100}%"></div>
      </div>
      <div class="chart-row-value">${value}</div>
    `;
    bar.appendChild(row);
  });

  const crit = document.getElementById("chartCriteria");
  crit.innerHTML = "";
  const list = await db_list();
  
  // Garantir que list é um array
  if (!Array.isArray(list)) {
    console.error('db_list não retornou array:', list);
    return;
  }
  
  const critStats = { c1: { sim: 0, total: 0 }, c2: { sim: 0, total: 0 }, c3: { sim: 0, total: 0 }, c4: { sim: 0, total: 0 } };

  list.forEach(r => {
    Object.entries(r).forEach(([k, v]) => {
      if (v === "sim" || v === "nao" || v === "parcial") {
        const prefix = k.split("_")[0];
        if (critStats[prefix]) {
          critStats[prefix].total++;
          if (v === "sim") critStats[prefix].sim++;
        }
      }
    });
  });

  [
    ["c1", "C1 – Sustentabilidade"],
    ["c2", "C2 – Resultados"],
    ["c3", "C3 – Agregação de valor"],
    ["c4", "C4 – Mercados"]
  ].forEach(([key, label]) => {
    const st = critStats[key];
    const pct = st.total ? (st.sim / st.total) * 100 : 0;
    const card = document.createElement("div");
    card.className = "criteria-card";
    card.innerHTML = `
      <div class="criteria-label">${label}</div>
      <div class="criteria-bar-bg">
        <div class="criteria-bar-fill" style="width:${pct}%"></div>
      </div>
      <div class="criteria-value">${pct.toFixed(0)}% de itens "Sim"</div>
    `;
    crit.appendChild(card);
  });

  const timeline = document.getElementById("chartTimeline");
  timeline.innerHTML = "";
  const entries = Object.entries(m.timelineMap).sort(([d1], [d2]) => d1.localeCompare(d2));
  if (!entries.length) {
    const msg = document.createElement("div");
    msg.className = "empty-state";
    msg.textContent = "As visitas aparecerão aqui por data assim que forem registradas.";
    timeline.appendChild(msg);
  } else {
    const maxCount = Math.max(...entries.map(([, v]) => v));
    entries.forEach(([data, count]) => {
      const wrap = document.createElement("div");
      wrap.className = "timeline-bar-wrap";
      const bar = document.createElement("div");
      bar.className = "timeline-bar";
      bar.style.height = (count / maxCount) * 100 + "%";
      const label = document.createElement("div");
      label.className = "timeline-bar-label";
      label.textContent = data.slice(5);
      wrap.appendChild(bar);
      wrap.appendChild(label);
      timeline.appendChild(wrap);
    });
  }
}
