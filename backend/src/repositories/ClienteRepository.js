import { DatabaseManager } from '../database/DatabaseManager.js';
import { Cliente } from '../models/Cliente.js';

export class ClienteRepository {
    #db;

    constructor() {
        this.#db = DatabaseManager.getInstance();
    }

    /**
     * Mapeia linha do SQLite para objeto da classe Cliente.
     */
    #mapRowToCliente(row) {
        if (!row) return null;
        return new Cliente({
            id: row.id,
            codigoCliente: row.codigo_cliente,
            nome: row.nome,
            email: row.email,
            senha: row.senha,
            telefone: row.telefone,
            cpf: row.cpf,
            tipoPerfil: row.tipo_perfil || 'CLIENTE',
            dataCadastro: row.data_cadastro
        });
    }

    findByCodigo(codigoCliente) {
        const row = this.#db.get('SELECT * FROM clientes WHERE codigo_cliente = ?', [codigoCliente]);
        return this.#mapRowToCliente(row);
    }

    findByEmail(email) {
        const row = this.#db.get('SELECT * FROM clientes WHERE email = ?', [email.toLowerCase().trim()]);
        return this.#mapRowToCliente(row);
    }

    findById(id) {
        const row = this.#db.get('SELECT * FROM clientes WHERE id = ?', [id]);
        return this.#mapRowToCliente(row);
    }

    findAll() {
        const rows = this.#db.all('SELECT * FROM clientes ORDER BY id DESC');
        return rows.map(r => this.#mapRowToCliente(r));
    }

    create(cliente) {
        const result = this.#db.run(
            `INSERT INTO clientes (codigo_cliente, nome, email, senha, telefone, cpf, tipo_perfil)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                cliente.codigoCliente,
                cliente.nome,
                cliente.email,
                cliente.senha,
                cliente.telefone,
                cliente.cpf,
                cliente.tipoPerfil || 'CLIENTE'
            ]
        );
        cliente.id = result.lastInsertRowid;
        return cliente;
    }

    gerarProximoCodigo() {
        const max = this.#db.get('SELECT MAX(id) as maxId FROM clientes');
        const nextId = (max && max.maxId ? max.maxId : 0) + 1;
        return `CLI-${1000 + nextId}`;
    }
}
