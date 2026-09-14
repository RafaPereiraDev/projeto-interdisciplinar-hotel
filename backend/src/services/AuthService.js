import { ClienteRepository } from '../repositories/ClienteRepository.js';
import { Cliente } from '../models/Cliente.js';

export class AuthService {
    #clienteRepo;

    constructor() {
        this.#clienteRepo = new ClienteRepository();
    }

    /**
     * Cadastro de novo usuário/cliente (Requisito 3.1).
     */
    cadastrar({ nome, email, senha, telefone, cpf, tipoPerfil = 'CLIENTE' }) {
        if (!nome || !email || !senha) {
            throw new Error('Nome, e-mail e senha são obrigatórios.');
        }

        const emailExistente = this.#clienteRepo.findByEmail(email);
        if (emailExistente) {
            throw new Error('Já existe um cliente cadastrado com este e-mail.');
        }

        const codigoCliente = this.#clienteRepo.gerarProximoCodigo();

        const novoCliente = new Cliente({
            codigoCliente,
            nome,
            email,
            senha,
            telefone,
            cpf,
            tipoPerfil: tipoPerfil || 'CLIENTE'
        });

        this.#clienteRepo.create(novoCliente);

        return {
            sucesso: true,
            mensagem: 'Usuário cadastrado com sucesso!',
            cliente: novoCliente.toJSON()
        };
    }

    /**
     * Autenticação de cliente (Requisito 3.2).
     */
    login(email, senha) {
        if (!email || !senha) {
            throw new Error('Informe e-mail e senha.');
        }

        const cliente = this.#clienteRepo.findByEmail(email);
        if (!cliente || !cliente.autenticar(senha)) {
            throw new Error('E-mail ou senha incorretos.');
        }

        return {
            sucesso: true,
            mensagem: 'Login realizado com sucesso!',
            cliente: cliente.toJSON()
        };
    }

    obterClientePorCodigo(codigoCliente) {
        const cliente = this.#clienteRepo.findByCodigo(codigoCliente);
        if (!cliente) {
            throw new Error(`Cliente com código ${codigoCliente} não foi encontrado.`);
        }
        return cliente.toJSON();
    }
}
