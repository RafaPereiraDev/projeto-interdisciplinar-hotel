/**
 * Classe Reserva - Representa a reserva efetuada pelo cliente (Requisitos 3.2 e 3.3).
 */
export class Reserva {
    #id;
    #codigoReserva;
    #clienteId;
    #quartoId;
    #dataPrevistaEntrada;
    #dataPrevistaSaida;
    #numHospedes;
    #status;
    #dataCriacao;

    constructor({
        id = null,
        codigoReserva,
        clienteId,
        quartoId,
        dataPrevistaEntrada,
        dataPrevistaSaida,
        numHospedes,
        status = 'CONFIRMADA',
        dataCriacao = null
    }) {
        this.#id = id;
        this.#codigoReserva = codigoReserva;
        this.#clienteId = clienteId;
        this.#quartoId = quartoId;
        this.#dataPrevistaEntrada = dataPrevistaEntrada;
        this.#dataPrevistaSaida = dataPrevistaSaida;
        this.#numHospedes = Number(numHospedes);
        this.#status = status;
        this.#dataCriacao = dataCriacao || new Date().toISOString();
    }

    get id() { return this.#id; }
    set id(value) { this.#id = value; }
    get codigoReserva() { return this.#codigoReserva; }
    get clienteId() { return this.#clienteId; }
    get quartoId() { return this.#quartoId; }
    get dataPrevistaEntrada() { return this.#dataPrevistaEntrada; }
    get dataPrevistaSaida() { return this.#dataPrevistaSaida; }
    get numHospedes() { return this.#numHospedes; }
    get status() { return this.#status; }
    get dataCriacao() { return this.#dataCriacao; }

    set status(novoStatus) {
        this.#status = novoStatus;
    }

    cancelar() {
        this.#status = 'CANCELADA';
    }

    marcarCheckIn() {
        this.#status = 'CHECKIN_REALIZADO';
    }

    toJSON() {
        return {
            id: this.#id,
            codigoReserva: this.#codigoReserva,
            clienteId: this.#clienteId,
            quartoId: this.#quartoId,
            dataPrevistaEntrada: this.#dataPrevistaEntrada,
            dataPrevistaSaida: this.#dataPrevistaSaida,
            numHospedes: this.#numHospedes,
            status: this.#status,
            dataCriacao: this.#dataCriacao
        };
    }
}
