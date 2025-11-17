// === FILTROS E EXPORTAÇÃO ===

let allVisitas = []; // Cache de visitas para filtros
let currentFilters = {
  search: '',
  municipio: '',
  periodo: ''
};

// Atualizar filtros de município dinamicamente
function updateMunicipioFilter(visitas) {
  const select = document.getElementById('filterMunicipio');
  if (!select) return;
  
  const municipios = [...new Set(visitas.map(v => v.municipio).filter(Boolean))].sort();
  const currentValue = select.value;
  
  select.innerHTML = '<option value="">Todos os municípios</option>';
  municipios.forEach(m => {
    const option = document.createElement('option');
    option.value = m;
    option.textContent = m;
    select.appendChild(option);
  });
  
  if (currentValue && municipios.includes(currentValue)) {
    select.value = currentValue;
  }
}

// Aplicar filtros
function applyFilters(visitas) {
  let filtered = [...visitas];
  
  // Filtro de busca
  if (currentFilters.search) {
    const search = currentFilters.search.toLowerCase();
    filtered = filtered.filter(v => 
      (v.agricultor || '').toLowerCase().includes(search) ||
      (v.municipio || '').toLowerCase().includes(search) ||
      (v.propriedade || '').toLowerCase().includes(search)
    );
  }
  
  // Filtro de município
  if (currentFilters.municipio) {
    filtered = filtered.filter(v => v.municipio === currentFilters.municipio);
  }
  
  // Filtro de período
  if (currentFilters.periodo) {
    const days = parseInt(currentFilters.periodo);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    filtered = filtered.filter(v => {
      const visitDate = new Date(v.data_visita || v.dataVisita);
      return visitDate >= cutoffDate;
    });
  }
  
  return filtered;
}

// Duplicar visita
async function duplicateVisita(id) {
  const original = await db_get(id);
  if (!original) {
    alert('Visita não encontrada!');
    return;
  }
  
  if (!confirm(`Duplicar visita de ${original.agricultor || 'sem nome'}?`)) {
    return;
  }
  
  // Criar nova visita com dados duplicados e novo ID
  const newId = 'v_' + Date.now();
  const duplicate = {
    ...original,
    id: newId,
    data_visita: '', // Limpar data para forçar nova entrada
    dataVisita: ''
  };
  
  try {
    await db_add(duplicate);
    alert('Visita duplicada com sucesso!');
    await refreshTable();
    await updateDashboard();
  } catch (err) {
    console.error('Erro ao duplicar:', err);
    alert('Erro ao duplicar visita: ' + err.message);
  }
}

// Exportar para Excel
function exportToExcel() {
  const visitas = applyFilters(allVisitas);
  
  if (visitas.length === 0) {
    alert('Nenhuma visita para exportar!');
    return;
  }
  
  // Preparar dados para Excel
  const data = visitas.map(v => ({
    'Agricultor': v.agricultor || '',
    'Município': v.municipio || '',
    'Propriedade': v.propriedade || '',
    'Data da Visita': v.data_visita || v.dataVisita || '',
    'Auditor': v.auditor || '',
    'Técnico': v.tecnico || '',
    'Índice Sustentabilidade': computeSustainabilityIndex(v) + '%',
    'Inserção Mercados': hasMarketInsertion(v) ? 'Sim' : 'Não'
  }));
  
  // Criar workbook
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Visitas');
  
  // Ajustar largura das colunas
  const colWidths = [
    { wch: 25 }, // Agricultor
    { wch: 20 }, // Município
    { wch: 25 }, // Propriedade
    { wch: 12 }, // Data
    { wch: 20 }, // Auditor
    { wch: 20 }, // Técnico
    { wch: 15 }, // Índice
    { wch: 12 }  // Mercados
  ];
  ws['!cols'] = colWidths;
  
  // Download
  const filename = `visitas-emater-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// Exportar para PDF
function exportToPDF() {
  const visitas = applyFilters(allVisitas);
  
  if (visitas.length === 0) {
    alert('Nenhuma visita para exportar!');
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'mm', 'a4'); // landscape
  
  // Título
  doc.setFontSize(16);
  doc.text('Relatório de Observação In Loco - Emater-RO', 14, 15);
  
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22);
  doc.text(`Total de visitas: ${visitas.length}`, 14, 28);
  
  // Preparar dados da tabela
  const tableData = visitas.map(v => [
    v.agricultor || '-',
    v.municipio || '-',
    v.data_visita || v.dataVisita || '-',
    computeSustainabilityIndex(v) + '%',
    hasMarketInsertion(v) ? 'Sim' : 'Não'
  ]);
  
  // Gerar tabela
  doc.autoTable({
    head: [['Agricultor', 'Município', 'Data', 'Índice Sust.', 'Mercados']],
    body: tableData,
    startY: 35,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' }
    }
  });
  
  // Download
  const filename = `relatorio-visitas-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

// Inicializar filtros e eventos
function initFiltersAndExports() {
  // Event listeners para filtros
  const searchInput = document.getElementById('tableSearch');
  const municipioSelect = document.getElementById('filterMunicipio');
  const periodoSelect = document.getElementById('filterPeriodo');
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilters.search = e.target.value;
      refreshTable();
    });
  }
  
  if (municipioSelect) {
    municipioSelect.addEventListener('change', (e) => {
      currentFilters.municipio = e.target.value;
      refreshTable();
    });
  }
  
  if (periodoSelect) {
    periodoSelect.addEventListener('change', (e) => {
      currentFilters.periodo = e.target.value;
      refreshTable();
    });
  }
  
  // Event listeners para exportação
  const btnExcel = document.getElementById('btnExportExcel');
  const btnPDF = document.getElementById('btnExportPDF');
  
  if (btnExcel) {
    btnExcel.addEventListener('click', exportToExcel);
  }
  
  if (btnPDF) {
    btnPDF.addEventListener('click', exportToPDF);
  }
}
