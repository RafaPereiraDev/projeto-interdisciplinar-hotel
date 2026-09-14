import { DatabaseManager } from '../database/DatabaseManager.js';
import { Hospedagem } from '../models/Hospedagem.js';
import { RelatorioCheckOut } from '../models/RelatorioCheckOut.js';

export class HospedagemRepository {
    #db;

    constructor() {
        this.#db = DatabaseManager.getInstance();
    }

    #mapRowToHospedagem(row) {
        if (!row) return null;
        return new Hospedagem({
            id: row.id,
            codigoHospedagem: row.codigo_hospedagem,
            reservaId: row.reserva_id,
            clienteId: row.cliente_id,
            quartoId: row.quarto_id,
            dataEntrada: row.data_entrada,
            dataPrevisaoSaida: row.data_previsao_saida,
            dataSaida: row.data_saida,
            numHospedes: row.num_hospedes,
            valorUnitario: row.valor_unitario,
            valorTotal: row.valor_total,
            status: row.status
        });
    }

    findById(id) {
        const row = this.#db.get('SELECT * FROM hospedagens WHERE id = ?', [id]);
        return this.#mapRowToHospedagem(row);
    }

    findByCodigo(codigo) {
        const row = this.#db.get('SELECT * FROM hospedagens WHERE codigo_hospedagem = ?', [codigo.trim().toUpperCase()]);
        return this.#mapRowToHospedagem(row);
    }

    findAtivaPorQuarto(quartoId) {
        const row = this.#db.get("SELECT * FROM hospedagens WHERE quarto_id = ? AND status = 'ATIVA'", [quartoId]);
        return this.#mapRowToHospedagem(row);
    }

    findAtivas() {
        const sql = `
            SELECT h.*, 
                   c.codigo_cliente, c.nome as cliente_nome,
                   q.codigo_quarto, q.numero as quarto_numero, q.nome as quarto_nome, q.tipo as quarto_tipo
            FROM hospedagens h
            JOIN clientes c ON h.cliente_id = c.id
            JOIN quartos q ON h.quarto_id = q.id
            WHERE h.status = 'ATIVA'
            ORDER BY h.data_entrada DESC
        `;
        return this.#db.all(sql);
    }

    findAllHistorico() {
        const sql = `
            SELECT h.*, 
                   c.codigo_cliente, c.nome as cliente_nome,
                   q.codigo_quarto, q.numero as quarto_numero, q.nome as quarto_nome, q.tipo as quarto_tipo
            FROM hospedagens h
            JOIN clientes c ON h.cliente_id = c.id
            JOIN quartos q ON h.quarto_id = q.id
            ORDER BY h.id DESC
        `;
        return this.#db.all(sql);
    }

    create(hospedagem) {
        const result = this.#db.run(
            `INSERT INTO hospedagens (codigo_hospedagem, reserva_id, cliente_id, quarto_id, data_entrada, data_previsao_saida, num_hospedes, valor_unitario, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                hospedagem.codigoHospedagem,
                hospedagem.reservaId,
                hospedagem.clienteId,
                hospedagem.quartoId,
                hospedagem.dataEntrada,
                hospedagem.dataPrevisaoSaida,
                hospedagem.numHospedes,
                hospedagem.valorUnitario,
                hospedagem.status
            ]
        );
        hospedagem.id = result.lastInsertRowid;
        return hospedagem;
    }

    finalizarCheckOut(id, dataSaida, valorTotal) {
        return this.#db.run(
            "UPDATE hospedagens SET status = 'FINALIZADA', data_saida = ?, valor_total = ? WHERE id = ?",
            [dataSaida, valorTotal, id]
        );
    }

    /**
     * Monta o objeto RelatorioCheckOut atendendo com rigor ao Requisito 3.4.
     * a. Nome e código do cliente
     * b. Número do quarto, tipo e valor unitário
     * c. Data de entrada
     * d. Data de saída
     * e. Número de hóspedes
     * f. Valor total
     */
    obterRelatorioCheckOut(hospedagemId) {
        const sql = `
            SELECT 
                h.codigo_hospedagem,
                h.data_entrada,
                h.data_saida,
                h.num_hospedes,
                h.valor_unitario,
                h.valor_total,
                c.codigo_cliente,
                c.nome AS cliente_nome,
                q.numero AS quarto_numero,
                q.tipo AS quarto_tipo
            FROM hospedagens h
            JOIN clientes c ON h.cliente_id = c.id
            JOIN quartos q ON h.quarto_id = q.id
            WHERE h.id = ?
        `;
        const row = this.#db.get(sql, [hospedagemId]);
        if (!row) return null;

        return new RelatorioCheckOut({
            codigoHospedagem: row.codigo_hospedagem,
            codigoCliente: row.codigo_cliente,
            nomeCliente: row.cliente_nome,
            numeroQuarto: row.quarto_numero,
            tipoQuarto: row.quarto_tipo,
            valorUnitario: row.valor_unitario,
            dataEntrada: row.data_entrada,
            dataSaida: row.data_saida,
            numHospedes: row.num_hospedes,
            valorTotal: row.valor_total
        });
    }

    gerarProximoCodigo() {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `HOSP-${randomNum}`;
    }
}
