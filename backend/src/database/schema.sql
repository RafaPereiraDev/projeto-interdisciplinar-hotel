-- ====================================================================
-- BANCO DE DADOS: SQLite - VIGILANT HOTEL (POO II)
-- ====================================================================
PRAGMA foreign_keys = ON;

-- 1. TABELA DE CLIENTES (Requisito 3.1)
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_cliente TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    telefone TEXT,
    cpf TEXT UNIQUE,
    tipo_perfil TEXT NOT NULL DEFAULT 'CLIENTE', -- 'CLIENTE' ou 'FUNCIONARIO'
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE QUARTOS (Requisito 3.2)
CREATE TABLE IF NOT EXISTS quartos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_quarto TEXT UNIQUE NOT NULL,        -- Código para reserva (ex: 'Q-101')
    numero TEXT UNIQUE NOT NULL,               -- Número físico do quarto
    nome TEXT NOT NULL,                        -- Nome comercial do quarto
    tipo TEXT NOT NULL,                        -- Categoria (Standard, Luxo, Suíte Master, etc.)
    preco_unitario REAL NOT NULL,              -- Diária base (R$)
    capacidade_maxima INTEGER NOT NULL,        -- Quantidade máx. de hóspedes
    status TEXT NOT NULL DEFAULT 'DISPONIVEL', -- 'DISPONIVEL', 'OCUPADO', 'RESERVADO', 'MANUTENCAO'
    descricao TEXT,
    imagem_url TEXT
);

-- 3. TABELA DE RESERVAS (Requisitos 3.2 e 3.3)
CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_reserva TEXT UNIQUE NOT NULL,       -- Código da reserva (ex: 'RES-8041')
    cliente_id INTEGER NOT NULL,
    quarto_id INTEGER NOT NULL,
    data_prevista_entrada DATE NOT NULL,
    data_prevista_saida DATE NOT NULL,
    num_hospedes INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'CONFIRMADA', -- 'CONFIRMADA', 'CHECKIN_REALIZADO', 'CANCELADA'
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (quarto_id) REFERENCES quartos(id) ON DELETE RESTRICT
);

-- 4. TABELA DE HOSPEDAGENS / CHECK-IN E CHECK-OUT (Requisitos 3.3 e 3.4)
CREATE TABLE IF NOT EXISTS hospedagens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_hospedagem TEXT UNIQUE NOT NULL,    -- Código de controle da estadia (ex: 'HOSP-1001')
    reserva_id INTEGER,                        -- Opcional se for check-in direto balcão
    cliente_id INTEGER NOT NULL,
    quarto_id INTEGER NOT NULL,
    data_entrada DATETIME NOT NULL,            -- Data e hora do check-in
    data_previsao_saida DATE NOT NULL,         -- Previsão informada no check-in
    data_saida DATETIME,                       -- Data e hora do check-out efetivo
    num_hospedes INTEGER NOT NULL,
    valor_unitario REAL NOT NULL,              -- Valor da diária fixado no check-in
    valor_total REAL,                          -- Calculado no check-out (dias * diária)
    status TEXT NOT NULL DEFAULT 'ATIVA',      -- 'ATIVA', 'FINALIZADA'
    FOREIGN KEY (reserva_id) REFERENCES reservas(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (quarto_id) REFERENCES quartos(id)
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_quartos_status ON quartos(status);
CREATE INDEX IF NOT EXISTS idx_reservas_codigo ON reservas(codigo_reserva);
CREATE INDEX IF NOT EXISTS idx_hospedagens_status ON hospedagens(status);
CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON clientes(codigo_cliente);
