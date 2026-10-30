import { Pessoa } from './Pessoa.js';

/**
 * Subclasse Cliente - Herda de Pessoa (Pilar de Herança).
 * Acrescenta atributos específicos do hotel: código, senha e perfil de acesso.
 */
export class Cliente extends Pessoa {
    #id;
    #codigoCliente;
    #senha;
    #tipoPerfil;
    #dataCadastro;

    constructor({ id = null, codigoCliente, nome, email, senha, telefone = '', cpf = '', tipoPerfil = 'CLIENTE', dataCadastro = null }) {
        // super() chama o construtor da classe pai (Pessoa)
        super(nome, email, telefone, cpf);
        this.#id = id;
        this.#codigoCliente = codigoCliente;
        this.#senha = senha;
        this.#tipoPerfil = tipoPerfil || 'CLIENTE';
        this.#dataCadastro = dataCadastro || new Date().toISOString();
    }

    get id() { return this.#id; }
    set id(valor) { this.#id = valor; }

    get codigoCliente() { return this.#codigoCliente; }
    set codigoCliente(valor) { this.#codigoCliente = valor; }

    get senha() { return this.#senha; }
    set senha(valor) { this.#senha = valor; }

    get tipoPerfil() { return this.#tipoPerfil; }
    set tipoPerfil(valor) { this.#tipoPerfil = valor; }

    get dataCadastro() { return this.#dataCadastro; }

    isFuncionario() {
        return this.#tipoPerfil === 'FUNCIONARIO';
    }

    // Valida se a senha digitada confere
    autenticar(senhaDigitada) {
        return this.#senha === senhaDigitada;
    }

    toJSON() {
        return {
            id: this.id,
            codigoCliente: this.codigoCliente,
            tipoPerfil: this.tipoPerfil,
            ...super.toJSON(), // Herda propriedades do toJSON de Pessoa
            dataCadastro: this.dataCadastro
        };
    }
}
