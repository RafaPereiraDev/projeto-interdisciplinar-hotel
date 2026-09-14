import { AuthService } from '../services/AuthService.js';
import { HotelService } from '../services/HotelService.js';

export class HotelController {
    #authService;
    #hotelService;

    constructor() {
        this.#authService = new AuthService();
        this.#hotelService = new HotelService();
    }

    // --- REQUISITO 3.1: CADASTRO E AUTENTICAÇÃO ---
    cadastrarCliente = (req, res) => {
        try {
            const { nome, email, senha, telefone, cpf } = req.body;
            const resultado = this.#authService.cadastrar({ nome, email, senha, telefone, cpf });
            return res.status(201).json(resultado);
        } catch (error) {
            return res.status(400).json({ sucesso: false, erro: error.message });
        }
    };

    login = (req, res) => {
        try {
            const { email, senha } = req.body;
            const resultado = this.#authService.login(email, senha);
            return res.status(200).json(resultado);
        } catch (error) {
            return res.status(401).json({ sucesso: false, erro: error.message });
        }
    };

    obterCliente = (req, res) => {
        try {
            const { codigo } = req.params;
            const cliente = this.#authService.obterClientePorCodigo(codigo);
            return res.status(200).json(cliente);
        } catch (error) {
            return res.status(404).json({ sucesso: false, erro: error.message });
        }
    };

    // --- REQUISITO 3.2: BUSCA DE QUARTOS DISPONÍVEIS ---
    buscarQuartosDisponiveis = (req, res) => {
        try {
            const { tipo, precoMax, capacidade } = req.query;
            const quartos = this.#hotelService.buscarQuartosDisponiveis({ tipo, precoMax, capacidade });
            return res.status(200).json(quartos);
        } catch (error) {
            return res.status(500).json({ sucesso: false, erro: error.message });
        }
    };

    listarTodosQuartos = (req, res) => {
        try {
            const quartos = this.#hotelService.listarTodosQuartos();
            return res.status(200).json(quartos);
        } catch (error) {
            return res.status(500).json({ sucesso: false, erro: error.message });
        }
    };

    // --- REQUISITO 3.2 E 3.3: RESERVAS ---
    criarReserva = (req, res) => {
        try {
            const { codigoCliente, codigoQuarto, dataPrevistaEntrada, dataPrevistaSaida, numHospedes } = req.body;
            const resultado = this.#hotelService.criarReserva({
                codigoCliente,
                codigoQuarto,
                dataPrevistaEntrada,
                dataPrevistaSaida,
                numHospedes
            });
            return res.status(201).json(resultado);
        } catch (error) {
            return res.status(400).json({ sucesso: false, erro: error.message });
        }
    };

    consultarReserva = (req, res) => {
        try {
            const { codigo } = req.params;
            const resultado = this.#hotelService.buscarReservaPorCodigo(codigo);
            return res.status(200).json(resultado);
        } catch (error) {
            return res.status(404).json({ sucesso: false, erro: error.message });
        }
    };

    listarReservas = (req, res) => {
        try {
            const { codigoCliente } = req.query;
            const reservas = this.#hotelService.listarReservas(codigoCliente);
            return res.status(200).json(reservas);
        } catch (error) {
            return res.status(500).json({ sucesso: false, erro: error.message });
        }
    };

    // --- REQUISITO 3.3: CHECK-IN ---
    realizarCheckIn = (req, res) => {
        try {
            const { codigoCliente, codigoItem, dataEntrada, dataPrevisaoSaida, numHospedes, codigoReserva } = req.body;
            const resultado = this.#hotelService.realizarCheckIn({
                codigoCliente,
                codigoItem,
                dataEntrada,
                dataPrevisaoSaida,
                numHospedes,
                codigoReserva
            });
            return res.status(201).json(resultado);
        } catch (error) {
            return res.status(400).json({ sucesso: false, erro: error.message });
        }
    };

    listarHospedagensAtivas = (req, res) => {
        try {
            const ativas = this.#hotelService.listarHospedagensAtivas();
            return res.status(200).json(ativas);
        } catch (error) {
            return res.status(500).json({ sucesso: false, erro: error.message });
        }
    };

    listarHistoricoHospedagens = (req, res) => {
        try {
            const historico = this.#hotelService.listarHistoricoHospedagens();
            return res.status(200).json(historico);
        } catch (error) {
            return res.status(500).json({ sucesso: false, erro: error.message });
        }
    };

    // --- REQUISITO 3.4: CHECK-OUT E RELATÓRIO ---
    realizarCheckOut = (req, res) => {
        try {
            const { id, codigoHospedagem, dataSaida } = req.body;
            const resultado = this.#hotelService.realizarCheckOut({ id, codigoHospedagem, dataSaida });
            return res.status(200).json(resultado);
        } catch (error) {
            return res.status(400).json({ sucesso: false, erro: error.message });
        }
    };

    obterRelatorioCheckOut = (req, res) => {
        try {
            const { id } = req.params;
            const relatorio = this.#hotelService.obterRelatorioPorId(id);
            return res.status(200).json(relatorio);
        } catch (error) {
            return res.status(404).json({ sucesso: false, erro: error.message });
        }
    };
}
