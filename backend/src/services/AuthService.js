import { ClienteRepository } from '../repositories/ClienteRepository.js';
import { Cliente } from '../models/Cliente.js';

export class AuthService {
    #clienteRepo;

    constructor() {
        this.#clienteRepo = new ClienteRepository();
    }

    /**
     * Cadastro de novo usuário/cliente no sistema (Requisito 3.1).
     * Cria uma nova entidade Cliente herdada de Pessoa, gerando código único `CLI-XXXX`.
     *
     * @param {Object} params - Dados de cadastro do cliente.
     * @param {string} params.nome - Nome completo do cliente/hóspede.
     * @param {string} params.email - Endereço eletrônico único do cliente.
     * @param {string} params.senha - Senha para autenticação no sistema.
     * @param {string} [params.telefone=''] - Número de telefone para contato.
     * @param {string} [params.cpf=''] - CPF do cliente para identificação.
     * @param {'CLIENTE'|'FUNCIONARIO'} [params.tipoPerfil='CLIENTE'] - Perfil de acesso ao sistema.
     * @returns {{ sucesso: boolean, mensagem: string, cliente: Object }} Confirmação e dados públicos do cliente criado.
     * @throws {Error} Lança exceção se dados obrigatórios estiverem ausentes ou e-mail já existir.
     *
     * @example
     * const resultado = authService.cadastrar({
     *   nome: 'Marina Souza',
     *   email: 'marina@email.com',
     *   senha: 'senhaSegura123',
     *   telefone: '(47) 99999-8888',
     *   cpf: '000.000.000-00'
     * });
     * console.log(resultado.cliente.codigoCliente); // 'CLI-1002'
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
     * Autenticação de credenciais de usuário (Requisito 3.1 e 3.2).
     * Localiza o registro por e-mail e valida a senha encapsulada.
     *
     * @param {string} email - E-mail cadastrado no sistema.
     * @param {string} senha - Senha em texto para comparação segura.
     * @returns {{ sucesso: boolean, mensagem: string, cliente: Object }} Objeto de sessão contendo dados públicos.
     * @throws {Error} Lança exceção se os parâmetros forem vazios ou credenciais inválidas.
     *
     * @example
     * const sessao = authService.login('cliente@hotelvigilant.com', '123456');
     * console.log(sessao.cliente.nome); // 'Hóspede Demonstração'
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
