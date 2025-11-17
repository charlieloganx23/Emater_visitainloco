// dashboard.js - Lógica avançada de filtros e gráficos do dashboard

// Estado global dos filtros do dashboard
let dashboardFilters = {
  municipio: "",
  periodo: "",
  tecnico: ""
};

// Cache de dados filtrados
let filteredVisitas = [];
let chartInstances = {}; // Armazena instâncias dos gráficos Chart.js

// ========================================
// INICIALIZAÇÃO
// ========================================

function initDashboard() {
  setupDashboardFilters();
  loadChartJS(() => {
    updateAllCharts();
  });
}

// ========================================
// FILTROS DO DASHBOARD
// ========================================

function setupDashboardFilters() {
  const filterMunicipioEl = document.getElementById('dashFilterMunicipio');
  const filterPeriodoEl = document.getElementById('dashFilterPeriodo');
  const filterTecnicoEl = document.getElementById('dashFilterTecnico');
  const btnApplyFilters = document.getElementById('btnApplyDashFilters');
  const btnClearFilters = document.getElementById('btnClearDashFilters');

  if (!filterMunicipioEl || !filterPeriodoEl) return;

  // Popular dropdown de municípios
  populateDashboardMunicipios();

  // Popular dropdown de técnicos/auditores
  populateDashboardTecnicos();

  // Aplicar filtros
  btnApplyFilters?.addEventListener('click', () => {
    dashboardFilters.municipio = filterMunicipioEl.value;
    dashboardFilters.periodo = filterPeriodoEl.value;
    dashboardFilters.tecnico = filterTecnicoEl.value;
    updateAllCharts();
  });

  // Limpar filtros
  btnClearFilters?.addEventListener('click', () => {
    filterMunicipioEl.value = "";
    filterPeriodoEl.value = "";
    if (filterTecnicoEl) filterTecnicoEl.value = "";
    dashboardFilters = { municipio: "", periodo: "", tecnico: "" };
    updateAllCharts();
  });
}

async function populateDashboardMunicipios() {
  const select = document.getElementById('dashFilterMunicipio');
  if (!select) return;

  const list = await db_list();
  const municipios = [...new Set(list.map(v => v.municipio).filter(Boolean))].sort();

  select.innerHTML = '<option value="">Todos os municípios</option>';
  municipios.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    select.appendChild(opt);
  });
}

async function populateDashboardTecnicos() {
  const select = document.getElementById('dashFilterTecnico');
  if (!select) return;

  const list = await db_list();
  const tecnicos = [...new Set([
    ...list.map(v => v.auditor).filter(Boolean),
    ...list.map(v => v.tecnico).filter(Boolean)
  ])].sort();

  select.innerHTML = '<option value="">Todos os técnicos</option>';
  tecnicos.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    select.appendChild(opt);
  });
}

async function applyDashboardFilters() {
  let list = await db_list();
  
  // Garantir que list é um array
  if (!Array.isArray(list)) {
    console.error('db_list não retornou array:', list);
    list = [];
  }

  // Filtro de município
  if (dashboardFilters.municipio) {
    list = list.filter(v => v.municipio === dashboardFilters.municipio);
  }

  // Filtro de período
  if (dashboardFilters.periodo) {
    const now = new Date();
    const days = parseInt(dashboardFilters.periodo);
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    list = list.filter(v => {
      if (!v.dataVisita) return false;
      const visitaDate = new Date(v.dataVisita);
      return visitaDate >= cutoff;
    });
  }

  // Filtro de técnico/auditor
  if (dashboardFilters.tecnico) {
    list = list.filter(v => 
      v.auditor === dashboardFilters.tecnico || 
      v.tecnico === dashboardFilters.tecnico
    );
  }

  filteredVisitas = list;
  return list;
}

// ========================================
// GRÁFICOS COM CHART.JS
// ========================================

function loadChartJS(callback) {
  if (typeof Chart !== 'undefined') {
    callback();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
  script.onload = callback;
  script.onerror = () => {
    console.warn('Chart.js não carregou. Usando fallback CSS.');
    callback();
  };
  document.head.appendChild(script);
}

async function updateAllCharts() {
  await applyDashboardFilters();
  
  // Atualizar métricas KPI (já existente, mas com dados filtrados)
  await updateDashboardMetrics();
  
  // Novos gráficos
  updatePieChart();
  updateRankingMunicipios();
  updateComparativoRegional();
  updateTrendLineChart();
  updateMapaVisual();
}

async function updateDashboardMetrics() {
  const list = filteredVisitas;
  const totalVisitas = list.length;

  let totalSim = 0, totalNao = 0, totalParcial = 0, totalNA = 0;
  let c1Sim = 0, c1Total = 0;
  let propsComMercado = 0;

  list.forEach(visita => {
    // Processar critérios que vêm como arrays
    ['c1', 'c2', 'c3', 'c4'].forEach(criterio => {
      if (Array.isArray(visita[criterio])) {
        visita[criterio].forEach(item => {
          Object.entries(item).forEach(([key, value]) => {
            if (value === "sim" || value === "nao" || value === "parcial" || value === "n/a") {
              if (value === "sim") totalSim++;
              if (value === "nao") totalNao++;
              if (value === "parcial") totalParcial++;
              if (value === "n/a") totalNA++;

              if (criterio === "c1") {
                if (value !== "n/a") c1Total++;
                if (value === "sim") c1Sim++;
              }
            }
          });
        });
      }
    });

    // Também processar campos flat (c1_01, c2_01, etc.) para compatibilidade
    Object.entries(visita).forEach(([key, value]) => {
      if (value === "sim" || value === "nao" || value === "parcial" || value === "n/a") {
        if (!key.includes('id') && !key.includes('visita')) {
          if (value === "sim") totalSim++;
          if (value === "nao") totalNao++;
          if (value === "parcial") totalParcial++;
          if (value === "n/a") totalNA++;

          if (key.startsWith("c1_")) {
            if (value !== "n/a") c1Total++;
            if (value === "sim") c1Sim++;
          }
        }
      }
    });

    // Verificar mercados (C4)
    const hasMercado = Array.isArray(visita.c4) 
      ? visita.c4.some(item => Object.values(item).some(v => v === "sim"))
      : Object.entries(visita).some(([key, value]) => key.startsWith("c4_") && value === "sim");
    
    if (hasMercado) propsComMercado++;
  });

  const totalResps = totalSim + totalNao + totalParcial; // N/A não conta no total
  const pctSim = totalResps ? (totalSim / totalResps) * 100 : 0;
  const c1Index = c1Total ? (c1Sim / c1Total) * 100 : 0;
  const pctMercados = totalVisitas ? (propsComMercado / totalVisitas) * 100 : 0;

  document.getElementById("kpiTotalVisitas").textContent = totalVisitas;
  document.getElementById("kpiPctSim").textContent = pctSim.toFixed(0) + "%";
  document.getElementById("kpiC1").textContent = c1Index.toFixed(0) + "%";
  document.getElementById("kpiMercados").textContent = pctMercados.toFixed(0) + "%";

  // Atualizar gráfico de barras simples (já existente)
  updateSimpleBarChart(totalSim, totalNao, totalParcial, totalNA);
}

function updateSimpleBarChart(totalSim, totalNao, totalParcial, totalNA) {
  const bar = document.getElementById("chartSimNaoParcial");
  if (!bar) return;
  
  bar.innerHTML = "";
  const rows = [
    ["Sim", totalSim, "sim"],
    ["Não", totalNao, "nao"],
    ["Parcial", totalParcial, "parcial"],
    ["N/A", totalNA, "na"]
  ];
  const maxVal = Math.max(1, totalSim, totalNao, totalParcial, totalNA);
  
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
}

function updatePieChart() {
  const canvas = document.getElementById('chartPieDistribution');
  if (!canvas || typeof Chart === 'undefined') return;

  const list = filteredVisitas;
  let totalSim = 0, totalNao = 0, totalParcial = 0, totalNA = 0;

  list.forEach(visita => {
    // Processar critérios que vêm como arrays
    ['c1', 'c2', 'c3', 'c4'].forEach(criterio => {
      if (Array.isArray(visita[criterio])) {
        visita[criterio].forEach(item => {
          Object.values(item).forEach(value => {
            if (value === "sim") totalSim++;
            if (value === "nao") totalNao++;
            if (value === "parcial") totalParcial++;
            if (value === "n/a") totalNA++;
          });
        });
      }
    });

    // Também processar campos flat para compatibilidade
    Object.entries(visita).forEach(([key, value]) => {
      if (value === "sim" || value === "nao" || value === "parcial" || value === "n/a") {
        if (!key.includes('id') && !key.includes('visita')) {
          if (value === "sim") totalSim++;
          if (value === "nao") totalNao++;
          if (value === "parcial") totalParcial++;
          if (value === "n/a") totalNA++;
        }
      }
    });
  });

  // Destruir gráfico anterior se existir
  if (chartInstances.pie) {
    chartInstances.pie.destroy();
  }

  const ctx = canvas.getContext('2d');
  chartInstances.pie = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Sim', 'Não', 'Parcial', 'N/A'],
      datasets: [{
        data: [totalSim, totalNao, totalParcial, totalNA],
        backgroundColor: ['#22c55e', '#ef4444', '#facc15', '#9ca3af'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 12 },
            padding: 10
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const value = context.parsed;
              const pct = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${value} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

function updateRankingMunicipios() {
  const container = document.getElementById('rankingMunicipios');
  if (!container) return;

  const list = filteredVisitas;
  const municipioStats = {};

  list.forEach(v => {
    if (!v.municipio) return;
    
    if (!municipioStats[v.municipio]) {
      municipioStats[v.municipio] = { sim: 0, total: 0, visitas: 0 };
    }

    municipioStats[v.municipio].visitas++;

    // Processar arrays de critérios
    ['c1', 'c2', 'c3', 'c4'].forEach(criterio => {
      if (Array.isArray(v[criterio])) {
        v[criterio].forEach(item => {
          Object.values(item).forEach(value => {
            if (value === "sim" || value === "nao" || value === "parcial") {
              municipioStats[v.municipio].total++;
              if (value === "sim") municipioStats[v.municipio].sim++;
            }
          });
        });
      }
    });

    // Processar campos flat para compatibilidade
    Object.entries(v).forEach(([key, value]) => {
      if (value === "sim" || value === "nao" || value === "parcial") {
        if (!key.includes('id') && !key.includes('visita') && !key.startsWith('c')) {
          municipioStats[v.municipio].total++;
          if (value === "sim") municipioStats[v.municipio].sim++;
        }
      }
    });
  });

  const ranking = Object.entries(municipioStats)
    .map(([municipio, stats]) => ({
      municipio,
      pct: stats.total ? (stats.sim / stats.total) * 100 : 0,
      visitas: stats.visitas
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  container.innerHTML = ranking.length === 0
    ? '<div class="empty-state">Nenhum dado disponível</div>'
    : ranking.map((item, idx) => `
      <div class="ranking-item">
        <div class="ranking-position">${idx + 1}º</div>
        <div class="ranking-municipio">${item.municipio}</div>
        <div class="ranking-badge">${item.visitas} visitas</div>
        <div class="ranking-value">${item.pct.toFixed(0)}%</div>
      </div>
    `).join('');
}

function updateComparativoRegional() {
  const container = document.getElementById('comparativoRegional');
  if (!container) return;

  const list = filteredVisitas;
  const municipioStats = {};

  list.forEach(v => {
    if (!v.municipio) return;
    
    if (!municipioStats[v.municipio]) {
      municipioStats[v.municipio] = {
        c1: { sim: 0, total: 0 },
        c2: { sim: 0, total: 0 },
        c3: { sim: 0, total: 0 },
        c4: { sim: 0, total: 0 }
      };
    }

    // Processar arrays de critérios
    ['c1', 'c2', 'c3', 'c4'].forEach(criterio => {
      if (Array.isArray(v[criterio])) {
        v[criterio].forEach(item => {
          Object.values(item).forEach(value => {
            if (value === "sim" || value === "nao" || value === "parcial") { // N/A não entra no cálculo
              municipioStats[v.municipio][criterio].total++;
              if (value === "sim") municipioStats[v.municipio][criterio].sim++;
            }
          });
        });
      }
    });

    // Processar campos flat para compatibilidade
    Object.entries(v).forEach(([key, value]) => {
      if (value === "sim" || value === "nao" || value === "parcial") { // N/A não entra no cálculo
        const prefix = key.split("_")[0];
        if (municipioStats[v.municipio][prefix] && !key.includes('id')) {
          municipioStats[v.municipio][prefix].total++;
          if (value === "sim") municipioStats[v.municipio][prefix].sim++;
        }
      }
    });
  });

  const municipios = Object.entries(municipioStats)
    .sort((a, b) => {
      const avgA = ['c1', 'c2', 'c3', 'c4'].reduce((sum, c) => {
        const stats = a[1][c];
        return sum + (stats.total ? stats.sim / stats.total : 0);
      }, 0) / 4;
      const avgB = ['c1', 'c2', 'c3', 'c4'].reduce((sum, c) => {
        const stats = b[1][c];
        return sum + (stats.total ? stats.sim / stats.total : 0);
      }, 0) / 4;
      return avgB - avgA;
    })
    .slice(0, 8);

  container.innerHTML = municipios.length === 0
    ? '<div class="empty-state">Nenhum dado disponível</div>'
    : municipios.map(([municipio, stats]) => {
      const c1Pct = stats.c1.total ? (stats.c1.sim / stats.c1.total) * 100 : 0;
      const c2Pct = stats.c2.total ? (stats.c2.sim / stats.c2.total) * 100 : 0;
      const c3Pct = stats.c3.total ? (stats.c3.sim / stats.c3.total) * 100 : 0;
      const c4Pct = stats.c4.total ? (stats.c4.sim / stats.c4.total) * 100 : 0;
      const avg = (c1Pct + c2Pct + c3Pct + c4Pct) / 4;

      return `
        <div class="regional-item">
          <div class="regional-municipio">${municipio}</div>
          <div class="regional-bars">
            <div class="regional-bar-wrap">
              <div class="regional-bar c1" style="width: ${c1Pct}%"></div>
            </div>
            <div class="regional-bar-wrap">
              <div class="regional-bar c2" style="width: ${c2Pct}%"></div>
            </div>
            <div class="regional-bar-wrap">
              <div class="regional-bar c3" style="width: ${c3Pct}%"></div>
            </div>
            <div class="regional-bar-wrap">
              <div class="regional-bar c4" style="width: ${c4Pct}%"></div>
            </div>
          </div>
          <div class="regional-avg">${avg.toFixed(0)}%</div>
        </div>
      `;
    }).join('');
}

function updateTrendLineChart() {
  const canvas = document.getElementById('chartTrendLine');
  if (!canvas || typeof Chart === 'undefined') return;

  const list = filteredVisitas.sort((a, b) => 
    (a.data_visita || a.dataVisita || '').localeCompare(b.data_visita || b.dataVisita || '')
  );

  const trendData = {};
  list.forEach(v => {
    const dataVisita = v.data_visita || v.dataVisita;
    if (!dataVisita) return;

    let sim = 0, total = 0;
    
    // Processar arrays de critérios
    ['c1', 'c2', 'c3', 'c4'].forEach(criterio => {
      if (Array.isArray(v[criterio])) {
        v[criterio].forEach(item => {
          Object.values(item).forEach(value => {
            if (value === "sim" || value === "nao" || value === "parcial") { // N/A não entra no cálculo
              total++;
              if (value === "sim") sim++;
            }
          });
        });
      }
    });

    // Processar campos flat para compatibilidade
    Object.entries(v).forEach(([key, value]) => {
      if (value === "sim" || value === "nao" || value === "parcial") { // N/A não entra no cálculo
        if (!key.includes('id') && !key.includes('visita')) {
          total++;
          if (value === "sim") sim++;
        }
      }
    });

    const pct = total ? (sim / total) * 100 : 0;
    const monthKey = dataVisita.slice(0, 7); // YYYY-MM

    if (!trendData[monthKey]) {
      trendData[monthKey] = { sum: 0, count: 0 };
    }
    trendData[monthKey].sum += pct;
    trendData[monthKey].count++;
  });

  const labels = Object.keys(trendData).sort();
  const data = labels.map(k => trendData[k].sum / trendData[k].count);

  // Destruir gráfico anterior
  if (chartInstances.trend) {
    chartInstances.trend.destroy();
  }

  const ctx = canvas.getContext('2d');
  chartInstances.trend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.map(l => {
        const [y, m] = l.split('-');
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${months[parseInt(m) - 1]}/${y.slice(2)}`;
      }),
      datasets: [{
        label: 'Taxa de conformidade (%)',
        data: data,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Taxa: ${context.parsed.y.toFixed(1)}%`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}

function updateMapaVisual() {
  const container = document.getElementById('mapaVisual');
  if (!container) return;

  const list = filteredVisitas;
  const municipioCount = {};

  list.forEach(v => {
    if (!v.municipio) return;
    municipioCount[v.municipio] = (municipioCount[v.municipio] || 0) + 1;
  });

  const sortedMunicipios = Object.entries(municipioCount)
    .sort((a, b) => b[1] - a[1]);

  const maxCount = Math.max(...Object.values(municipioCount), 1);

  container.innerHTML = sortedMunicipios.length === 0
    ? '<div class="empty-state">Nenhuma visita registrada</div>'
    : sortedMunicipios.map(([municipio, count]) => {
      const intensity = Math.ceil((count / maxCount) * 5);
      const colors = ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'];
      const color = colors[intensity - 1];

      return `
        <div class="mapa-item" style="border-left: 4px solid ${color}">
          <div class="mapa-icon" style="background: ${color}">📍</div>
          <div class="mapa-municipio">${municipio}</div>
          <div class="mapa-count">${count} visita${count > 1 ? 's' : ''}</div>
        </div>
      `;
    }).join('');
}

// ========================================
// EXPORTAÇÃO
// ========================================

window.initDashboard = initDashboard;
