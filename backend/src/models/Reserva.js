/**
 * Classe Reserva - Representa o agendamento prévio de um quarto por um cliente.
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
    set id(valor) { this.#id = valor; }
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

    // Marca que o hóspede já chegou e fez o check-in desta reserva
    marcarCheckIn() {
        this.#status = 'CHECKIN_REALIZADO';
    }

    cancelar() {
        this.#status = 'CANCELADA';
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
