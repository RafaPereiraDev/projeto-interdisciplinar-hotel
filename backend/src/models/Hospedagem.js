/**
 * Classe Hospedagem - Controla a estadia do cliente no hotel (Check-in e Check-out).
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
    set id(valor) { this.#id = valor; }
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
     * Faz o Check-out: registra a data de saída, calcula os dias hospedados
     * e multiplica pelo valor da diária para obter o valor total.
     */
    realizarCheckOut(dataCheckOut = new Date().toISOString()) {
        this.#dataSaida = dataCheckOut;
        this.#status = 'FINALIZADA';

        // Converte as datas para calcular a diferença de tempo
        const entrada = new Date(this.#dataEntrada);
        const saida = new Date(dataCheckOut);
        const diferencaMs = Math.abs(saida.getTime() - entrada.getTime());

        // Converte milissegundos em dias (mínimo de 1 diária)
        const diasHospedados = Math.max(1, Math.ceil(diferencaMs / (1000 * 60 * 60 * 24)));

        // Calcula o valor total da estadia
        this.#valorTotal = Number((diasHospedados * this.#valorUnitario).toFixed(2));
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
