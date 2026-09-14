import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Padrão Singleton para Gerenciamento da Conexão SQLite do Hotel Vigilant.
 * Responsável por conectar, estruturar as tabelas e executar operações atômicas.
 */
export class DatabaseManager {
    static #instance = null;

    /**
     * @private
     */
    constructor() {
        const dbPath = path.join(__dirname, 'vigilant.db');
        this.db = new DatabaseSync(dbPath);
        this.db.exec('PRAGMA foreign_keys = ON;');
        this.#initializeSchema();
        this.#seedInitialData();
    }

    /**
     * Obtém a instância única do DatabaseManager (Singleton).
     * @returns {DatabaseManager}
     */
    static getInstance() {
        if (!DatabaseManager.#instance) {
            DatabaseManager.#instance = new DatabaseManager();
        }
        return DatabaseManager.#instance;
    }

    /**
     * Executa o script de inicialização do DDL.
     */
    #initializeSchema() {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        this.db.exec(schemaSql);

        // Migração suave caso a tabela clientes já existisse sem a coluna tipo_perfil
        try {
            this.db.exec("ALTER TABLE clientes ADD COLUMN tipo_perfil TEXT NOT NULL DEFAULT 'CLIENTE'");
        } catch (e) {
            // Coluna já existe no schema
        }
    }

    /**
     * Popula o banco com quartos e dados de teste se estiver vazio.
     */
    #seedInitialData() {
        const countQuartos = this.get('SELECT COUNT(*) as count FROM quartos');
        if (countQuartos && countQuartos.count === 0) {
            const insertQuarto = this.db.prepare(`
                INSERT INTO quartos (codigo_quarto, numero, nome, tipo, preco_unitario, capacidade_maxima, status, descricao, imagem_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const quartosSeed = [
                ['Q-101', '101', 'Standard Executivo Single', 'Standard', 190.00, 1, 'DISPONIVEL', 'Quarto confortável com cama de solteiro, bancada de trabalho e ar-condicionado.', '/images/rooms/standard-single.jpg'],
                ['Q-102', '102', 'Standard Conforto Casal', 'Standard', 260.00, 2, 'DISPONIVEL', 'Cama queen size, Wi-Fi ultra rápido, frigobar e smart TV 4K.', '/images/rooms/standard-double.jpg'],
                ['Q-201', '201', 'Luxo Superior Vista Cidade', 'Luxo', 390.00, 3, 'DISPONIVEL', 'Amplo espaço, varanda privativa com vista panorâmica, cafeteira Nespresso e roupões.', '/images/rooms/luxo-city.jpg'],
                ['Q-202', '202', 'Luxo Família Premium', 'Luxo', 480.00, 4, 'DISPONIVEL', 'Dois ambientes integrados, ideal para família com crianças, banheiro duplo.', '/images/rooms/luxo-family.jpg'],
                ['Q-301', '301', 'Suíte Master Vigilant Imperial', 'Suíte', 750.00, 3, 'DISPONIVEL', 'Hidromassagem com vista, cama king size, amenities exclusivos e serviço de quarto VIP.', '/images/rooms/suite-master.jpg'],
                ['Q-401', '401', 'Cobertura Presidencial Vigilant', 'Presidencial', 1200.00, 4, 'DISPONIVEL', 'O ápice do luxo e privacidade. Jacuzzi privativa, sala de estar completa e adega climatizada.', '/images/rooms/presidential.jpg']
            ];

            for (const q of quartosSeed) {
                insertQuarto.run(...q);
            }
        }

        // Garante a existência das contas de demonstração fictícias (Cliente e Funcionário)
        try {
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
        } catch (err) {
            // Ignora se já estiverem persistidos
        }
    }

    /**
     * Executa uma consulta que retorna múltiplas linhas.
     * @param {string} sql 
     * @param {any[]} params 
     * @returns {any[]}
     */
    all(sql, params = []) {
        const stmt = this.db.prepare(sql);
        return stmt.all(...params);
    }

    /**
     * Executa uma consulta que retorna apenas uma linha.
     * @param {string} sql 
     * @param {any[]} params 
     * @returns {any}
     */
    get(sql, params = []) {
        const stmt = this.db.prepare(sql);
        return stmt.get(...params);
    }

    /**
     * Executa uma instrução de alteração (INSERT, UPDATE, DELETE).
     * @param {string} sql 
     * @param {any[]} params 
     * @returns {{ changes: number, lastInsertRowid: number }}
     */
    run(sql, params = []) {
        const stmt = this.db.prepare(sql);
        return stmt.run(...params);
    }

    /**
     * Executa comandos DDL em bloco.
     * @param {string} sql 
     */
    exec(sql) {
        this.db.exec(sql);
    }
}
