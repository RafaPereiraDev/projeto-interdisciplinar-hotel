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
     * Requisito 3.2: Busca por quartos disponíveis e filtros de acomodação.
     * Retorna os dados essenciais para o cliente: nome, tipo, preço da diária e código para reserva.
     *
     * @param {Object} [filtros={}] - Critérios de filtro opcionais.
     * @param {string} [filtros.tipo] - Categoria do quarto (Ex: 'Standard', 'Luxo', 'Suíte', 'Presidencial').
     * @param {number|string} [filtros.precoMax] - Teto máximo do valor unitário da diária em Reais (R$).
     * @param {number|string} [filtros.capacidade] - Quantidade mínima de hóspedes suportada.
     * @returns {Array<Object>} Lista de quartos disponíveis serializados em JSON.
     *
     * @example
     * const disponiveis = hotelService.buscarQuartosDisponiveis({ tipo: 'Luxo', precoMax: 400 });
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
     * Requisito 3.2 e 3.3: Efetuar reserva de quarto vinculando cliente e acomodação.
     * Valida a capacidade máxima do quarto, coerência de datas e gera um código único no formato `RES-XXXX`.
     *
     * @param {Object} params - Dados da solicitação de reserva.
     * @param {string} params.codigoCliente - Código do cliente cadastrado (Ex: 'CLI-1001').
     * @param {string} params.codigoQuarto - Código ou número da acomodação (Ex: 'Q-101' ou '101').
     * @param {string} params.dataPrevistaEntrada - Data de início pretendida no formato YYYY-MM-DD.
     * @param {string} params.dataPrevistaSaida - Data de término pretendida no formato YYYY-MM-DD.
     * @param {number|string} params.numHospedes - Quantidade de ocupantes da reserva.
     * @returns {{ sucesso: boolean, mensagem: string, codigoReserva: string, reserva: Object, quarto: Object, cliente: Object }} Confirmação e dados consolidados da reserva.
     * @throws {Error} Lança exceção se cliente ou quarto não existirem, se as datas forem incoerentes ou a capacidade for ultrapassada.
     *
     * @example
     * const reserva = hotelService.criarReserva({
     *   codigoCliente: 'CLI-1001',
     *   codigoQuarto: 'Q-101',
     *   dataPrevistaEntrada: '2026-09-20',
     *   dataPrevistaSaida: '2026-09-25',
     *   numHospedes: 1
     * });
     * console.log(reserva.codigoReserva); // 'RES-8041'
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
     * Requisito 3.3: Realização do Check-in (Entrada de Hóspede).
     * Exige os 5 dados obrigatórios do edital:
     * 1. Código do cliente
     * 2. Código do item (quarto)
     * 3. Data e hora de entrada
     * 4. Data de previsão de saída
     * 5. Número de hóspedes
     * (Opcional: código de reserva prévia para vinculação).
     * Altera o status do quarto para 'OCUPADO' e cria a entidade Hospedagem com código `HOSP-XXXX`.
     *
     * @param {Object} params - Parâmetros obrigatórios de entrada.
     * @param {string} params.codigoCliente - Código do cliente hóspede (Ex: 'CLI-1001').
     * @param {string} params.codigoItem - Código ou número da acomodação (Ex: 'Q-101' ou '101').
     * @param {string} params.dataEntrada - Data e hora de check-in (ISO 8601).
     * @param {string} params.dataPrevisaoSaida - Data prevista para encerramento (YYYY-MM-DD).
     * @param {number|string} params.numHospedes - Quantidade de pessoas que ocuparão o quarto.
     * @param {string} [params.codigoReserva=null] - Código de reserva prévia vinculada (Ex: 'RES-8041').
     * @returns {{ sucesso: boolean, mensagem: string, codigoHospedagem: string, hospedagem: Object, quarto: Object, cliente: Object }} Confirmação de ocupação.
     * @throws {Error} Lança exceção se campos obrigatórios faltarem, quarto não estiver disponível ou capacidade excedida.
     *
     * @example
     * const checkin = hotelService.realizarCheckIn({
     *   codigoCliente: 'CLI-1001',
     *   codigoItem: 'Q-101',
     *   dataEntrada: '2026-09-14T14:00:00.000Z',
     *   dataPrevisaoSaida: '2026-09-17',
     *   numHospedes: 1,
     *   codigoReserva: 'RES-8041'
     * });
     * console.log(checkin.codigoHospedagem); // 'HOSP-1001'
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
     * Requisito 3.4: Realização do Check-out (Encerramento de Estadia) e Emissão do Relatório Oficial.
     * Calcula o total de diárias consumidas (mínimo de 1), encerra a hospedagem, libera o quarto para 'DISPONIVEL'
     * e formata o comprovante formal com os 6 itens obrigatórios do edital:
     * - [a] Nome e código do cliente
     * - [b] Número do quarto, tipo e valor unitário (diária)
     * - [c] Data de entrada
     * - [d] Data de saída
     * - [e] Número de hóspedes
     * - [f] Valor total a pagar
     *
     * @param {Object} params - Identificadores da estadia.
     * @param {number} [params.id] - Identificador primário numérico da hospedagem.
     * @param {string} [params.codigoHospedagem] - Código da estadia (Ex: 'HOSP-1001').
     * @param {string} [params.dataSaida=null] - Data e hora de encerramento efetivo (padrão: agora).
     * @returns {{ sucesso: boolean, mensagem: string, relatorio: Object }} Comprovante consolidado para visualização e impressão.
     * @throws {Error} Lança exceção se a hospedagem não existir ou já tiver sido finalizada.
     *
     * @example
     * const checkout = hotelService.realizarCheckOut({ codigoHospedagem: 'HOSP-1001' });
     * console.log(checkout.relatorio.valorTotal); // Ex: 570.00
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
