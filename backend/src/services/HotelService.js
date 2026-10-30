import { QuartoRepository } from '../repositories/QuartoRepository.js';
import { ClienteRepository } from '../repositories/ClienteRepository.js';
import { ReservaRepository } from '../repositories/ReservaRepository.js';
import { HospedagemRepository } from '../repositories/HospedagemRepository.js';
import { Reserva } from '../models/Reserva.js';
import { Hospedagem } from '../models/Hospedagem.js';

/**
 * HotelService - Centraliza as regras de negócio do hotel:
 * busca de quartos, reservas, check-in e check-out com cálculo de diárias.
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

    // Retorna apenas quartos com status 'DISPONIVEL' (com filtros opcionais)
    buscarQuartosDisponiveis(filtros = {}) {
        const quartos = this.#quartoRepo.findDisponiveis(filtros);
        return quartos.map(q => q.toJSON());
    }

    listarTodosQuartos() {
        const quartos = this.#quartoRepo.findAll();
        return quartos.map(q => q.toJSON());
    }

    /**
     * Efetua a reserva: valida cliente, quarto, capacidade e datas.
     */
    criarReserva({ codigoCliente, codigoQuarto, dataPrevistaEntrada, dataPrevistaSaida, numHospedes }) {
        if (!codigoCliente || !codigoQuarto || !dataPrevistaEntrada || !dataPrevistaSaida) {
            throw new Error('Preencha todos os campos obrigatórios da reserva.');
        }

        // Valida se o cliente existe
        const cliente = this.#clienteRepo.findByCodigo(codigoCliente);
        if (!cliente) {
            throw new Error(`Cliente com código ${codigoCliente} não encontrado.`);
        }

        // Valida se o quarto existe
        const quarto = this.#quartoRepo.findByCodigo(codigoQuarto) || this.#quartoRepo.findByNumero(codigoQuarto);
        if (!quarto) {
            throw new Error(`Quarto com código/número ${codigoQuarto} não encontrado.`);
        }

        // Valida a capacidade do quarto
        if (Number(numHospedes) > quarto.capacidadeMaxima) {
            throw new Error(`O quarto ${quarto.numero} suporta no máximo ${quarto.capacidadeMaxima} hóspede(s).`);
        }

        // Valida coerência de datas
        if (new Date(dataPrevistaSaida) <= new Date(dataPrevistaEntrada)) {
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
     * FLUXO DE CHECK-IN:
     * 1. Valida dados de entrada (cliente, quarto, datas, hóspedes).
     * 2. Confirma disponibilidade do quarto.
     * 3. Ocupa o quarto (muda status para OCUPADO no objeto e no banco).
     * 4. Cria o registro de Hospedagem ATIVA.
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

        // Garante que o quarto esteja realmente livre
        if (!quarto.isDisponivel()) {
            throw new Error(`O quarto ${quarto.numero} não está disponível (Status: ${quarto.status}).`);
        }

        if (Number(numHospedes) > quarto.capacidadeMaxima) {
            throw new Error(`Capacidade excedida: quarto suporta até ${quarto.capacidadeMaxima} hóspedes.`);
        }

        // Se houver reserva prévia vinculada, atualiza seu status
        let reservaId = null;
        if (codigoReserva) {
            const reserva = this.#reservaRepo.findByCodigo(codigoReserva);
            if (reserva) {
                reservaId = reserva.id;
                this.#reservaRepo.updateStatus(reserva.id, 'CHECKIN_REALIZADO');
            }
        }

        // Altera status do quarto para OCUPADO na POO e persiste no banco
        quarto.ocupar();
        this.#quartoRepo.updateStatus(quarto.id, 'OCUPADO');

        const codigoHospedagem = this.#hospedagemRepo.gerarProximoCodigo();

        // Cria a entidade Hospedagem
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
     * FLUXO DE CHECK-OUT:
     * 1. Localiza a hospedagem ativa.
     * 2. Calcula dias hospedados e valor total no método POO realizarCheckOut().
     * 3. Atualiza hospedagem para FINALIZADA no banco.
     * 4. Libera o quarto de volta para DISPONIVEL.
     * 5. Emite o relatório formal de encerramento.
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

        // Método POO calcula os dias e o valor total
        const valorTotal = hospedagem.realizarCheckOut(dataEfetivaSaida);

        // Atualiza a hospedagem no banco SQLite
        this.#hospedagemRepo.finalizarCheckOut(hospedagem.id, dataEfetivaSaida, valorTotal);

        // Libera o quarto para novos hóspedes
        this.#quartoRepo.updateStatus(hospedagem.quartoId, 'DISPONIVEL');

        // Emite o relatório formatado com os 6 itens obrigatórios
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
