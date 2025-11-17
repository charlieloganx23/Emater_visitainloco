-- Schema MySQL para Sistema de Observação In Loco - Emater-RO
-- Apenas as tabelas, sem CREATE DATABASE ou USE

-- Tabela principal de visitas
CREATE TABLE IF NOT EXISTS visitas (
    id VARCHAR(50) PRIMARY KEY,
    agricultor VARCHAR(255),
    municipio VARCHAR(255),
    propriedade VARCHAR(255),
    data_visita DATE NULL,
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
    status ENUM('sim', 'nao', 'parcial', 'n/a') DEFAULT NULL,
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
    status ENUM('sim', 'nao', 'parcial', 'n/a') DEFAULT NULL,
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
    status ENUM('sim', 'nao', 'parcial', 'n/a') DEFAULT NULL,
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
    status ENUM('sim', 'nao', 'parcial', 'n/a') DEFAULT NULL,
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
