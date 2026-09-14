import { DatabaseManager } from '../database/DatabaseManager.js';
import { Reserva } from '../models/Reserva.js';

export class ReservaRepository {
    #db;

    constructor() {
        this.#db = DatabaseManager.getInstance();
    }

    #mapRowToReserva(row) {
        if (!row) return null;
        return new Reserva({
            id: row.id,
            codigoReserva: row.codigo_reserva,
            clienteId: row.cliente_id,
            quartoId: row.quarto_id,
            dataPrevistaEntrada: row.data_prevista_entrada,
            dataPrevistaSaida: row.data_prevista_saida,
            numHospedes: row.num_hospedes,
            status: row.status,
            dataCriacao: row.data_criacao
        });
    }

    findById(id) {
        const row = this.#db.get('SELECT * FROM reservas WHERE id = ?', [id]);
        return this.#mapRowToReserva(row);
    }

    findByCodigo(codigoReserva) {
        const row = this.#db.get('SELECT * FROM reservas WHERE codigo_reserva = ?', [codigoReserva.trim().toUpperCase()]);
        return this.#mapRowToReserva(row);
    }

    findAllComDetalhes(clienteId = null) {
        let sql = `
            SELECT r.*, 
                   c.codigo_cliente, c.nome as cliente_nome, c.email as cliente_email,
                   q.codigo_quarto, q.numero as quarto_numero, q.nome as quarto_nome, q.tipo as quarto_tipo, q.preco_unitario
            FROM reservas r
            JOIN clientes c ON r.cliente_id = c.id
            JOIN quartos q ON r.quarto_id = q.id
        `;
        const params = [];
        if (clienteId) {
            sql += ' WHERE r.cliente_id = ?';
            params.push(clienteId);
        }
        sql += ' ORDER BY r.id DESC';
        return this.#db.all(sql, params);
    }

    create(reserva) {
        const result = this.#db.run(
            `INSERT INTO reservas (codigo_reserva, cliente_id, quarto_id, data_prevista_entrada, data_prevista_saida, num_hospedes, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                reserva.codigoReserva,
                reserva.clienteId,
                reserva.quartoId,
                reserva.dataPrevistaEntrada,
                reserva.dataPrevistaSaida,
                reserva.numHospedes,
                reserva.status
            ]
        );
        reserva.id = result.lastInsertRowid;
        return reserva;
    }

    updateStatus(id, status) {
        return this.#db.run('UPDATE reservas SET status = ? WHERE id = ?', [status, id]);
    }

    gerarProximoCodigo() {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `RES-${randomNum}`;
    }
}
