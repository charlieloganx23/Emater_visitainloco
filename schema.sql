-- Schema MySQL para Sistema de Observação In Loco - Emater-RO
-- Este schema armazena todas as informações das visitas in loco

CREATE DATABASE IF NOT EXISTS observacao_in_loco CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE observacao_in_loco;

-- Tabela principal de visitas
CREATE TABLE IF NOT EXISTS visitas (
    id VARCHAR(50) PRIMARY KEY,
    agricultor VARCHAR(255),
    municipio VARCHAR(255),
    propriedade VARCHAR(255),
    data_visita DATE,
    auditor VARCHAR(255),
    tecnico VARCHAR(255),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- C1: Práticas produtivas sustentáveis (10 itens)
CREATE TABLE IF NOT EXISTS criterio_c1 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visita_id VARCHAR(50) NOT NULL,
    item_index INT NOT NULL,
    item_label VARCHAR(500),
    status ENUM('sim', 'nao', 'parcial') DEFAULT NULL,
    observacao TEXT,
    FOREIGN KEY (visita_id) REFERENCES visitas(id) ON DELETE CASCADE,
    INDEX idx_visita (visita_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- C2: Resultados percebidos (5 itens)
CREATE TABLE IF NOT EXISTS criterio_c2 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visita_id VARCHAR(50) NOT NULL,
    item_index INT NOT NULL,
    item_label VARCHAR(500),
    status ENUM('sim', 'nao', 'parcial') DEFAULT NULL,
    observacao TEXT,
    FOREIGN KEY (visita_id) REFERENCES visitas(id) ON DELETE CASCADE,
    INDEX idx_visita (visita_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- C3: Estrutura para agregação de valor (6 itens)
CREATE TABLE IF NOT EXISTS criterio_c3 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visita_id VARCHAR(50) NOT NULL,
    item_index INT NOT NULL,
    item_label VARCHAR(500),
    status ENUM('sim', 'nao', 'parcial') DEFAULT NULL,
    observacao TEXT,
    FOREIGN KEY (visita_id) REFERENCES visitas(id) ON DELETE CASCADE,
    INDEX idx_visita (visita_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- C4: Inserção em mercados (5 itens + descrição)
CREATE TABLE IF NOT EXISTS criterio_c4 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visita_id VARCHAR(50) NOT NULL,
    item_index INT NOT NULL,
    item_label VARCHAR(500),
    status ENUM('sim', 'nao', 'parcial') DEFAULT NULL,
    observacao TEXT,
    descricao_comercializacao TEXT,
    FOREIGN KEY (visita_id) REFERENCES visitas(id) ON DELETE CASCADE,
    INDEX idx_visita (visita_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Barreiras e limitações
CREATE TABLE IF NOT EXISTS barreiras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visita_id VARCHAR(50) NOT NULL,
    impedimentos_praticas_sustentaveis TEXT,
    gargalos_comercializacao TEXT,
    infraestrutura_beneficiamento TEXT,
    adequacao_assistencia_tecnica TEXT,
    FOREIGN KEY (visita_id) REFERENCES visitas(id) ON DELETE CASCADE,
    INDEX idx_visita (visita_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Síntese do auditor
CREATE TABLE IF NOT EXISTS sintese (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visita_id VARCHAR(50) NOT NULL,
    texto_sintese TEXT,
    FOREIGN KEY (visita_id) REFERENCES visitas(id) ON DELETE CASCADE,
    INDEX idx_visita (visita_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- View para relatório consolidado
CREATE OR REPLACE VIEW vw_visitas_completas AS
SELECT 
    v.*,
    COUNT(DISTINCT CASE WHEN c1.status = 'sim' THEN c1.id END) as c1_sim,
    COUNT(DISTINCT c1.id) as c1_total,
    ROUND(COUNT(DISTINCT CASE WHEN c1.status = 'sim' THEN c1.id END) * 100.0 / NULLIF(COUNT(DISTINCT c1.id), 0), 0) as indice_sustentabilidade,
    (SELECT COUNT(*) FROM criterio_c4 c4 WHERE c4.visita_id = v.id AND c4.status = 'sim') > 0 as tem_insercao_mercado
FROM visitas v
LEFT JOIN criterio_c1 c1 ON c1.visita_id = v.id
GROUP BY v.id;
