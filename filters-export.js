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

// === EXPORTAÇÃO INDIVIDUAL DE VISITA ===

let currentVisitaForExport = null; // Armazena a visita atual do modal

// Exportar visita individual para Excel
function exportVisitaToExcel() {
  if (!currentVisitaForExport) {
    alert('Nenhuma visita selecionada!');
    return;
  }
  
  const v = currentVisitaForExport;
  const wb = XLSX.utils.book_new();
  
  // Aba 1: Identificação
  const identData = [
    ['Campo', 'Valor'],
    ['Agricultor', v.agricultor || ''],
    ['Município', v.municipio || ''],
    ['Propriedade', v.propriedade || ''],
    ['Data da Visita', v.data_visita || v.dataVisita || ''],
    ['Auditor', v.auditor || ''],
    ['Técnico', v.tecnico || '']
  ];
  const wsIdent = XLSX.utils.aoa_to_sheet(identData);
  wsIdent['!cols'] = [{ wch: 20 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsIdent, 'Identificação');
  
  // Função auxiliar para criar aba de critério
  function addCriterioSheet(criterios, sheetName) {
    if (!Array.isArray(criterios) || criterios.length === 0) return;
    
    const data = [['Item', 'Descrição', 'Status', 'Observação']];
    criterios.forEach(c => {
      data.push([
        c.item_index || '',
        c.item_label || '',
        c.status || '',
        c.observacao || ''
      ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 8 }, { wch: 50 }, { wch: 12 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }
  
  // Adicionar abas de critérios
  addCriterioSheet(v.c1, 'C1 - Sustentabilidade');
  addCriterioSheet(v.c2, 'C2 - Resultados');
  addCriterioSheet(v.c3, 'C3 - Agregação');
  addCriterioSheet(v.c4, 'C4 - Mercados');
  
  // Aba: Barreiras
  if (v.barreiras) {
    const b = v.barreiras;
    const barreirasData = [
      ['Campo', 'Descrição'],
      ['Impedimentos práticas sustentáveis', b.impedimentos_praticas_sustentaveis || ''],
      ['Gargalos comercialização', b.gargalos_comercializacao || ''],
      ['Infraestrutura beneficiamento', b.infraestrutura_beneficiamento || ''],
      ['Adequação assistência técnica', b.adequacao_assistencia_tecnica || '']
    ];
    const wsBarreiras = XLSX.utils.aoa_to_sheet(barreirasData);
    wsBarreiras['!cols'] = [{ wch: 35 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsBarreiras, 'Barreiras');
  }
  
  // Aba: Síntese
  if (v.sintese && v.sintese.texto_sintese) {
    const sinteseData = [
      ['Síntese do Auditor'],
      [v.sintese.texto_sintese]
    ];
    const wsSintese = XLSX.utils.aoa_to_sheet(sinteseData);
    wsSintese['!cols'] = [{ wch: 100 }];
    XLSX.utils.book_append_sheet(wb, wsSintese, 'Síntese');
  }
  
  // Download
  const filename = `visita-${v.agricultor || 'sem-nome'}-${v.data_visita || 'sem-data'}.xlsx`
    .replace(/[^a-z0-9-_.]/gi, '-')
    .toLowerCase();
  XLSX.writeFile(wb, filename);
}

// Exportar visita individual para PDF
function exportVisitaToPDF() {
  if (!currentVisitaForExport) {
    alert('Nenhuma visita selecionada!');
    return;
  }
  
  const v = currentVisitaForExport;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  
  let yPos = 15;
  
  // Título
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Espelho da Visita - Emater-RO', 14, yPos);
  yPos += 10;
  
  // Identificação
  doc.setFontSize(12);
  doc.text('Identificação', 14, yPos);
  yPos += 7;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const identInfo = [
    `Agricultor: ${v.agricultor || '-'}`,
    `Município: ${v.municipio || '-'}`,
    `Propriedade: ${v.propriedade || '-'}`,
    `Data: ${v.data_visita || v.dataVisita || '-'}`,
    `Auditor: ${v.auditor || '-'}`,
    `Técnico: ${v.tecnico || '-'}`
  ];
  
  identInfo.forEach(line => {
    doc.text(line, 14, yPos);
    yPos += 5;
  });
  
  // Função auxiliar para adicionar critério
  function addCriterioSection(criterios, titulo) {
    if (!Array.isArray(criterios) || criterios.length === 0) return;
    
    // Nova página se necessário
    if (yPos > 250) {
      doc.addPage();
      yPos = 15;
    }
    
    yPos += 5;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(titulo, 14, yPos);
    yPos += 7;
    
    const tableData = criterios.map(c => [
      c.item_label || '',
      c.status || '-',
      c.observacao || ''
    ]);
    
    doc.autoTable({
      startY: yPos,
      head: [['Item', 'Status', 'Observação']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 65 }
      },
      margin: { left: 14, right: 14 }
    });
    
    yPos = doc.lastAutoTable.finalY + 5;
  }
  
  // Adicionar seções de critérios
  addCriterioSection(v.c1, 'C1 - Práticas Produtivas Sustentáveis');
  addCriterioSection(v.c2, 'C2 - Resultados Percebidos');
  addCriterioSection(v.c3, 'C3 - Estrutura para Agregação de Valor');
  addCriterioSection(v.c4, 'C4 - Inserção em Mercados');
  
  // Barreiras
  if (v.barreiras) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 15;
    }
    
    yPos += 5;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Barreiras e Limitações', 14, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    const b = v.barreiras;
    const barreirasText = [
      `Impedimentos: ${b.impedimentos_praticas_sustentaveis || '-'}`,
      `Gargalos: ${b.gargalos_comercializacao || '-'}`,
      `Infraestrutura: ${b.infraestrutura_beneficiamento || '-'}`,
      `Assistência Técnica: ${b.adequacao_assistencia_tecnica || '-'}`
    ];
    
    barreirasText.forEach(line => {
      const splitText = doc.splitTextToSize(line, 180);
      doc.text(splitText, 14, yPos);
      yPos += splitText.length * 5;
    });
  }
  
  // Síntese
  if (v.sintese && v.sintese.texto_sintese) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 15;
    }
    
    yPos += 5;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Síntese do Auditor', 14, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    const splitSintese = doc.splitTextToSize(v.sintese.texto_sintese, 180);
    doc.text(splitSintese, 14, yPos);
  }
  
  // Download
  const filename = `visita-${v.agricultor || 'sem-nome'}-${v.data_visita || 'sem-data'}.pdf`
    .replace(/[^a-z0-9-_.]/gi, '-')
    .toLowerCase();
  doc.save(filename);
}

// Inicializar eventos de exportação individual
function initVisitaExport() {
  const btnExcel = document.getElementById('btnExportVisitaExcel');
  const btnPDF = document.getElementById('btnExportVisitaPDF');
  
  if (btnExcel) {
    btnExcel.addEventListener('click', exportVisitaToExcel);
  }
  
  if (btnPDF) {
    btnPDF.addEventListener('click', exportVisitaToPDF);
  }
}
