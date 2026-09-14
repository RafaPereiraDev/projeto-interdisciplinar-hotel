import { QuartoRepository } from '../repositories/QuartoRepository.js';
import { ClienteRepository } from '../repositories/ClienteRepository.js';
import { ReservaRepository } from '../repositories/ReservaRepository.js';
import { HospedagemRepository } from '../repositories/HospedagemRepository.js';
import { Reserva } from '../models/Reserva.js';
import { Hospedagem } from '../models/Hospedagem.js';

/**
 * Serviço central de regras de negócio do Vigilant Hotel.
 * Implementa integralmente os Requisitos 3.2, 3.3 e 3.4 do projeto acadêmico de POO.
 */
export class HotelService {
    #quartoRepo;
    #clienteRepo;
    #reservaRepo;
    #hospedagemRepo;

    constructor() {
        this.#quartoRepo = new QuartoRepository();
        this.#clienteRepo = new ClienteRepository();
        this.#reservaRepo = new ReservaRepository();
        this.#hospedagemRepo = new HospedagemRepository();
    }

    /**
     * Requisito 3.2: Busca por quartos disponíveis.
     * Retorna nome, tipo, preço e código para reserva.
     */
    buscarQuartosDisponiveis(filtros = {}) {
        const quartos = this.#quartoRepo.findDisponiveis(filtros);
        return quartos.map(q => q.toJSON());
    }

    listarTodosQuartos() {
        const quartos = this.#quartoRepo.findAll();
        return quartos.map(q => q.toJSON());
    }

    /**
     * Requisito 3.2 e 3.3: Efetuar reserva de quarto.
     */
    criarReserva({ codigoCliente, codigoQuarto, dataPrevistaEntrada, dataPrevistaSaida, numHospedes }) {
        if (!codigoCliente || !codigoQuarto || !dataPrevistaEntrada || !dataPrevistaSaida) {
            throw new Error('Todos os campos da reserva são obrigatórios.');
        }

        const cliente = this.#clienteRepo.findByCodigo(codigoCliente);
        if (!cliente) {
            throw new Error(`Cliente com código ${codigoCliente} não encontrado.`);
        }

        const quarto = this.#quartoRepo.findByCodigo(codigoQuarto) || this.#quartoRepo.findByNumero(codigoQuarto);
        if (!quarto) {
            throw new Error(`Quarto com código/número ${codigoQuarto} não encontrado.`);
        }

        if (Number(numHospedes) > quarto.capacidadeMaxima) {
            throw new Error(`O quarto ${quarto.numero} suporta no máximo ${quarto.capacidadeMaxima} hóspedes.`);
        }

        const entrada = new Date(dataPrevistaEntrada);
        const saida = new Date(dataPrevistaSaida);
        if (saida <= entrada) {
            throw new Error('A data de saída prevista deve ser posterior à data de entrada.');
        }

        const codigoReserva = this.#reservaRepo.gerarProximoCodigo();

        const novaReserva = new Reserva({
            codigoReserva,
            clienteId: cliente.id,
            quartoId: quarto.id,
            dataPrevistaEntrada,
            dataPrevistaSaida,
            numHospedes: Number(numHospedes),
            status: 'CONFIRMADA'
        });

        this.#reservaRepo.create(novaReserva);

        return {
            sucesso: true,
            mensagem: 'Reserva confirmada com sucesso!',
            codigoReserva: novaReserva.codigoReserva,
            reserva: novaReserva.toJSON(),
            quarto: quarto.toJSON(),
            cliente: cliente.toJSON()
        };
    }

    buscarReservaPorCodigo(codigoReserva) {
        const reserva = this.#reservaRepo.findByCodigo(codigoReserva);
        if (!reserva) {
            throw new Error(`Reserva ${codigoReserva} não encontrada.`);
        }
        const cliente = this.#clienteRepo.findById(reserva.clienteId);
        const quarto = this.#quartoRepo.findById(reserva.quartoId);
        return {
            reserva: reserva.toJSON(),
            cliente: cliente ? cliente.toJSON() : null,
            quarto: quarto ? quarto.toJSON() : null
        };
    }

    listarReservas(codigoCliente = null) {
        let clienteId = null;
        if (codigoCliente) {
            const cliente = this.#clienteRepo.findByCodigo(codigoCliente);
            if (cliente) clienteId = cliente.id;
        }
        return this.#reservaRepo.findAllComDetalhes(clienteId);
    }

    /**
     * Requisito 3.3: Realização do Check-in.
     * Dados obrigatórios:
     * - Código do cliente
     * - Código do item (quarto)
     * - Data de entrada
     * - Data de previsão de saída
     * - Número de hóspedes
     * (Opcional: código de reserva existente)
     */
    realizarCheckIn({ codigoCliente, codigoItem, dataEntrada, dataPrevisaoSaida, numHospedes, codigoReserva = null }) {
        if (!codigoCliente || !codigoItem || !dataEntrada || !dataPrevisaoSaida || !numHospedes) {
            throw new Error('Preencha todos os campos obrigatórios do check-in.');
        }

        const cliente = this.#clienteRepo.findByCodigo(codigoCliente);
        if (!cliente) {
            throw new Error(`Cliente com código '${codigoCliente}' não cadastrado.`);
        }

        const quarto = this.#quartoRepo.findByCodigo(codigoItem) || this.#quartoRepo.findByNumero(codigoItem);
        if (!quarto) {
            throw new Error(`Quarto com código/número '${codigoItem}' não encontrado.`);
        }

        if (!quarto.isDisponivel()) {
            throw new Error(`O quarto ${quarto.numero} não está disponível no momento (Status atual: ${quarto.status}).`);
        }

        if (Number(numHospedes) > quarto.capacidadeMaxima) {
            throw new Error(`Capacidade máxima excedida. O quarto comporta até ${quarto.capacidadeMaxima} pessoas.`);
        }

        let reservaId = null;
        if (codigoReserva) {
            const reserva = this.#reservaRepo.findByCodigo(codigoReserva);
            if (reserva) {
                reservaId = reserva.id;
                this.#reservaRepo.updateStatus(reserva.id, 'CHECKIN_REALIZADO');
            }
        }

        // Bloqueia o quarto no hotel
        quarto.ocupar();
        this.#quartoRepo.updateStatus(quarto.id, 'OCUPADO');

        const codigoHospedagem = this.#hospedagemRepo.gerarProximoCodigo();

        const novaHospedagem = new Hospedagem({
            codigoHospedagem,
            reservaId,
            clienteId: cliente.id,
            quartoId: quarto.id,
            dataEntrada,
            dataPrevisaoSaida,
            numHospedes: Number(numHospedes),
            valorUnitario: quarto.precoUnitario,
            status: 'ATIVA'
        });

        this.#hospedagemRepo.create(novaHospedagem);

        return {
            sucesso: true,
            mensagem: `Check-in realizado com sucesso no quarto ${quarto.numero}!`,
            codigoHospedagem: novaHospedagem.codigoHospedagem,
            hospedagem: novaHospedagem.toJSON(),
            quarto: quarto.toJSON(),
            cliente: cliente.toJSON()
        };
    }

    listarHospedagensAtivas() {
        return this.#hospedagemRepo.findAtivas();
    }

    listarHistoricoHospedagens() {
        return this.#hospedagemRepo.findAllHistorico();
    }

    /**
     * Requisito 3.4: Realização do Check-out e Emissão do Relatório.
     * Retorna o relatório formatado contendo:
     * a. Nome e código do cliente
     * b. Número do quarto, tipo e valor unitário
     * c. Data de entrada
     * d. Data de saída
     * e. Número de hóspedes
     * f. Valor total
     */
    realizarCheckOut({ id, codigoHospedagem, dataSaida = null }) {
        let hospedagem = null;
        if (id) {
            hospedagem = this.#hospedagemRepo.findById(id);
        } else if (codigoHospedagem) {
            hospedagem = this.#hospedagemRepo.findByCodigo(codigoHospedagem);
        }

        if (!hospedagem) {
            throw new Error('Hospedagem não encontrada para check-out.');
        }

        if (hospedagem.status === 'FINALIZADA') {
            throw new Error('Esta hospedagem já foi finalizada anteriormente.');
        }

        const dataEfetivaSaida = dataSaida || new Date().toISOString();

        // Cálculo POO de diárias e encerramento
        const valorTotal = hospedagem.realizarCheckOut(dataEfetivaSaida);

        // Atualiza no banco SQLite
        this.#hospedagemRepo.finalizarCheckOut(hospedagem.id, dataEfetivaSaida, valorTotal);

        // Libera o quarto para novas reservas e check-ins
        this.#quartoRepo.updateStatus(hospedagem.quartoId, 'DISPONIVEL');

        // Gera o relatório oficial 3.4
        const relatorio = this.#hospedagemRepo.obterRelatorioCheckOut(hospedagem.id);

        return {
            sucesso: true,
            mensagem: 'Check-out finalizado com sucesso!',
            relatorio: relatorio.toJSON()
        };
    }

    obterRelatorioPorId(hospedagemId) {
        const relatorio = this.#hospedagemRepo.obterRelatorioCheckOut(hospedagemId);
        if (!relatorio) {
            throw new Error('Relatório de check-out não encontrado.');
        }
        return relatorio.toJSON();
    }
}
