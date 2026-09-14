/**
 * Classe Hospedagem - Gerencia a estadia ativa, check-in e check-out (Requisitos 3.3 e 3.4).
 */
export class Hospedagem {
    #id;
    #codigoHospedagem;
    #reservaId;
    #clienteId;
    #quartoId;
    #dataEntrada;
    #dataPrevisaoSaida;
    #dataSaida;
    #numHospedes;
    #valorUnitario;
    #valorTotal;
    #status;

    constructor({
        id = null,
        codigoHospedagem,
        reservaId = null,
        clienteId,
        quartoId,
        dataEntrada,
        dataPrevisaoSaida,
        dataSaida = null,
        numHospedes,
        valorUnitario,
        valorTotal = null,
        status = 'ATIVA'
    }) {
        this.#id = id;
        this.#codigoHospedagem = codigoHospedagem;
        this.#reservaId = reservaId;
        this.#clienteId = clienteId;
        this.#quartoId = quartoId;
        this.#dataEntrada = dataEntrada;
        this.#dataPrevisaoSaida = dataPrevisaoSaida;
        this.#dataSaida = dataSaida;
        this.#numHospedes = Number(numHospedes);
        this.#valorUnitario = Number(valorUnitario);
        this.#valorTotal = valorTotal !== null ? Number(valorTotal) : null;
        this.#status = status;
    }

    get id() { return this.#id; }
    set id(value) { this.#id = value; }
    get codigoHospedagem() { return this.#codigoHospedagem; }
    get reservaId() { return this.#reservaId; }
    get clienteId() { return this.#clienteId; }
    get quartoId() { return this.#quartoId; }
    get dataEntrada() { return this.#dataEntrada; }
    get dataPrevisaoSaida() { return this.#dataPrevisaoSaida; }
    get dataSaida() { return this.#dataSaida; }
    get numHospedes() { return this.#numHospedes; }
    get valorUnitario() { return this.#valorUnitario; }
    get valorTotal() { return this.#valorTotal; }
    get status() { return this.#status; }

    /**
     * Realiza o check-out, calcula o período e define o valor total a pagar.
     * @param {string|Date} dataCheckOut 
     * @returns {number} Valor total calculado
     */
    realizarCheckOut(dataCheckOut = new Date().toISOString()) {
        this.#dataSaida = dataCheckOut;
        this.#status = 'FINALIZADA';

        const entrada = new Date(this.#dataEntrada);
        const saida = new Date(dataCheckOut);

        const diffTime = Math.abs(saida.getTime() - entrada.getTime());
        // Mínimo de 1 diária se for no mesmo dia
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        
        this.#valorTotal = Number((diffDays * this.#valorUnitario).toFixed(2));
        return this.#valorTotal;
    }

    toJSON() {
        return {
            id: this.#id,
            codigoHospedagem: this.#codigoHospedagem,
            reservaId: this.#reservaId,
            clienteId: this.#clienteId,
            quartoId: this.#quartoId,
            dataEntrada: this.#dataEntrada,
            dataPrevisaoSaida: this.#dataPrevisaoSaida,
            dataSaida: this.#dataSaida,
            numHospedes: this.#numHospedes,
            valorUnitario: this.#valorUnitario,
            valorTotal: this.#valorTotal,
            status: this.#status
        };
    }
}
