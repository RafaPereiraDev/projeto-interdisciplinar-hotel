import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Conexão direta com o banco SQLite nativo do Node.js (sem bibliotecas externas pesadas).
 * Responsável por criar as tabelas e fornecer métodos simples de consulta (all, get, run).
 */
export class DatabaseManager {
    static #instance = null;

    constructor() {
        // Define o caminho do arquivo do banco SQLite
        const dbPath = path.join(__dirname, 'vigilant.db');
        const dbDir = path.dirname(dbPath);

        // Cria a pasta se não existir
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        // Abre ou cria o arquivo do banco SQLite
        this.db = new DatabaseSync(dbPath);

        // Habilita integridade referencial de chaves estrangeiras (Foreign Keys)
        this.db.exec('PRAGMA foreign_keys = ON;');

        // Cria as tabelas necessárias e insere dados iniciais de teste
        this.criarTabelas();
        this.popularDadosIniciais();
    }

    /**
     * Retorna a mesma conexão para todo o sistema (Padrão Singleton simples)
     */
    static getInstance() {
        if (!DatabaseManager.#instance) {
            DatabaseManager.#instance = new DatabaseManager();
        }
        return DatabaseManager.#instance;
    }

    /**
     * Criação explícita das 4 tabelas do sistema hoteleiro:
     * 1. clientes
     * 2. quartos
     * 3. reservas
     * 4. hospedagens (check-in / check-out)
     */
    criarTabelas() {
        this.db.exec(`
            -- Tabela de Clientes e Funcionários
            CREATE TABLE IF NOT EXISTS clientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                codigo_cliente TEXT UNIQUE NOT NULL,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                senha TEXT NOT NULL,
                telefone TEXT,
                cpf TEXT UNIQUE,
                tipo_perfil TEXT NOT NULL DEFAULT 'CLIENTE',
                data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Tabela de Quartos
            CREATE TABLE IF NOT EXISTS quartos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                codigo_quarto TEXT UNIQUE NOT NULL,
                numero TEXT UNIQUE NOT NULL,
                nome TEXT NOT NULL,
                tipo TEXT NOT NULL,
                preco_unitario REAL NOT NULL,
                capacidade_maxima INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'DISPONIVEL',
                descricao TEXT,
                imagem_url TEXT
            );

            -- Tabela de Reservas
            CREATE TABLE IF NOT EXISTS reservas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                codigo_reserva TEXT UNIQUE NOT NULL,
                cliente_id INTEGER NOT NULL,
                quarto_id INTEGER NOT NULL,
                data_prevista_entrada DATE NOT NULL,
                data_prevista_saida DATE NOT NULL,
                num_hospedes INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'CONFIRMADA',
                data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
                FOREIGN KEY (quarto_id) REFERENCES quartos(id) ON DELETE RESTRICT
            );

            -- Tabela de Hospedagens (Check-in e Check-out)
            CREATE TABLE IF NOT EXISTS hospedagens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                codigo_hospedagem TEXT UNIQUE NOT NULL,
                reserva_id INTEGER,
                cliente_id INTEGER NOT NULL,
                quarto_id INTEGER NOT NULL,
                data_entrada DATETIME NOT NULL,
                data_previsao_saida DATE NOT NULL,
                data_saida DATETIME,
                num_hospedes INTEGER NOT NULL,
                valor_unitario REAL NOT NULL,
                valor_total REAL,
                status TEXT NOT NULL DEFAULT 'ATIVA',
                FOREIGN KEY (reserva_id) REFERENCES reservas(id),
                FOREIGN KEY (cliente_id) REFERENCES clientes(id),
                FOREIGN KEY (quarto_id) REFERENCES quartos(id)
            );
        `);
    }

    /**
     * Insere quartos e usuários de teste se a base estiver vazia
     */
    popularDadosIniciais() {
        // Verifica se já existem quartos cadastrados
        const check = this.get('SELECT COUNT(*) as total FROM quartos');
        if (check && check.total === 0) {
            const insereQuarto = this.db.prepare(`
                INSERT INTO quartos (codigo_quarto, numero, nome, tipo, preco_unitario, capacidade_maxima, status, descricao, imagem_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const quartosIniciais = [
                ['Q-101', '101', 'Standard Executivo Single', 'Standard', 190.00, 1, 'DISPONIVEL', 'Quarto confortável com cama de solteiro e mesa de trabalho.', '/images/rooms/standard-single.jpg'],
                ['Q-102', '102', 'Standard Conforto Casal', 'Standard', 260.00, 2, 'DISPONIVEL', 'Cama queen size, Wi-Fi rápido e TV a cabo.', '/images/rooms/standard-double.jpg'],
                ['Q-201', '201', 'Luxo Superior Vista Cidade', 'Luxo', 390.00, 3, 'DISPONIVEL', 'Varanda privativa com bela vista da cidade.', '/images/rooms/luxo-city.jpg'],
                ['Q-202', '202', 'Luxo Família Premium', 'Luxo', 480.00, 4, 'DISPONIVEL', 'Espaço amplo ideal para famílias com crianças.', '/images/rooms/luxo-family.jpg'],
                ['Q-301', '301', 'Suíte Master Imperial', 'Suíte', 750.00, 3, 'DISPONIVEL', 'Hidromassagem, cama king size e amenities especiais.', '/images/rooms/suite-master.jpg'],
                ['Q-401', '401', 'Cobertura Presidencial', 'Presidencial', 1200.00, 4, 'DISPONIVEL', 'Máximo conforto, jacuzzi privativa e sala integrada.', '/images/rooms/presidential.jpg']
            ];

            for (const q of quartosIniciais) {
                insereQuarto.run(...q);
            }
        }

        // Insere clientes de teste caso não existam
        const checkCli = this.get("SELECT id FROM clientes WHERE codigo_cliente = 'CLI-1001'");
        if (!checkCli) {
            this.run(
                "INSERT INTO clientes (codigo_cliente, nome, email, senha, telefone, cpf, tipo_perfil) VALUES (?, ?, ?, ?, ?, ?, ?)",
                ['CLI-1001', 'Hóspede Demonstração', 'cliente@hotelvigilant.com', '123456', '(47) 90000-0001', '000.000.000-01', 'CLIENTE']
            );
        }

        const checkFunc = this.get("SELECT id FROM clientes WHERE codigo_cliente = 'FUNC-101'");
        if (!checkFunc) {
            this.run(
                "INSERT INTO clientes (codigo_cliente, nome, email, senha, telefone, cpf, tipo_perfil) VALUES (?, ?, ?, ?, ?, ?, ?)",
                ['FUNC-101', 'Recepção / Atendente', 'recepcao@hotelvigilant.com', 'admin123', '(47) 90000-0002', '000.000.000-02', 'FUNCIONARIO']
            );
        }
    }

    /**
     * Executa SELECT retornando várias linhas
     */
    all(sql, params = []) {
        return this.db.prepare(sql).all(...params);
    }

    /**
     * Executa SELECT retornando uma única linha
     */
    get(sql, params = []) {
        return this.db.prepare(sql).get(...params);
    }

    /**
     * Executa INSERT, UPDATE ou DELETE
     */
    run(sql, params = []) {
        return this.db.prepare(sql).run(...params);
    }

    /**
     * Executa comandos DDL em bloco
     */
    exec(sql) {
        this.db.exec(sql);
    }
}
