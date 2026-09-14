import { DatabaseManager } from '../database/DatabaseManager.js';
import { Quarto } from '../models/Quarto.js';

export class QuartoRepository {
    #db;

    constructor() {
        this.#db = DatabaseManager.getInstance();
    }

    #mapRowToQuarto(row) {
        if (!row) return null;
        return new Quarto({
            id: row.id,
            codigoQuarto: row.codigo_quarto,
            numero: row.numero,
            nome: row.nome,
            tipo: row.tipo,
            precoUnitario: row.preco_unitario,
            capacidadeMaxima: row.capacidade_maxima,
            status: row.status,
            descricao: row.descricao,
            imagemUrl: row.imagem_url
        });
    }

    findById(id) {
        const row = this.#db.get('SELECT * FROM quartos WHERE id = ?', [id]);
        return this.#mapRowToQuarto(row);
    }

    findByCodigo(codigoQuarto) {
        const row = this.#db.get('SELECT * FROM quartos WHERE codigo_quarto = ?', [codigoQuarto.trim().toUpperCase()]);
        return this.#mapRowToQuarto(row);
    }

    findByNumero(numero) {
        const row = this.#db.get('SELECT * FROM quartos WHERE numero = ?', [String(numero).trim()]);
        return this.#mapRowToQuarto(row);
    }

    /**
     * Busca de quartos disponíveis com filtros opcionais (Requisito 3.2).
     */
    findDisponiveis({ tipo = null, precoMax = null, capacidade = null } = {}) {
        let sql = "SELECT * FROM quartos WHERE status = 'DISPONIVEL'";
        const params = [];

        if (tipo) {
            sql += " AND tipo = ?";
            params.push(tipo);
        }

        if (precoMax) {
            sql += " AND preco_unitario <= ?";
            params.push(Number(precoMax));
        }

        if (capacidade) {
            sql += " AND capacidade_maxima >= ?";
            params.push(Number(capacidade));
        }

        sql += " ORDER BY preco_unitario ASC";

        const rows = this.#db.all(sql, params);
        return rows.map(r => this.#mapRowToQuarto(r));
    }

    findAll() {
        const rows = this.#db.all('SELECT * FROM quartos ORDER BY numero ASC');
        return rows.map(r => this.#mapRowToQuarto(r));
    }

    updateStatus(id, novoStatus) {
        return this.#db.run('UPDATE quartos SET status = ? WHERE id = ?', [novoStatus, id]);
    }
}
