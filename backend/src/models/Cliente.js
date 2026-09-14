import { Pessoa } from './Pessoa.js';

/**
 * Subclasse Cliente derivada de Pessoa (Requisito 3.1 do Projeto).
 */
export class Cliente extends Pessoa {
    #id;
    #codigoCliente;
    #senha;
    #tipoPerfil;
    #dataCadastro;

    /**
     * @param {Object} dados 
     */
    constructor({ id = null, codigoCliente, nome, email, senha, telefone = '', cpf = '', tipoPerfil = 'CLIENTE', dataCadastro = null }) {
        super(nome, email, telefone, cpf);
        this.#id = id;
        this.#codigoCliente = codigoCliente;
        this.#senha = senha;
        this.#tipoPerfil = tipoPerfil || 'CLIENTE';
        this.#dataCadastro = dataCadastro || new Date().toISOString();
    }

    get id() { return this.#id; }
    set id(value) { this.#id = value; }

    get codigoCliente() { return this.#codigoCliente; }
    set codigoCliente(value) { this.#codigoCliente = value; }

    get senha() { return this.#senha; }
    set senha(value) { this.#senha = value; }

    get tipoPerfil() { return this.#tipoPerfil; }
    set tipoPerfil(value) { this.#tipoPerfil = value; }

    get dataCadastro() { return this.#dataCadastro; }

    isFuncionario() {
        return this.#tipoPerfil === 'FUNCIONARIO';
    }

    /**
     * Valida credenciais de login.
     * @param {string} senhaDigitada 
     * @returns {boolean}
     */
    autenticar(senhaDigitada) {
        return this.#senha === senhaDigitada;
    }

    overrideJSON() {
        return {
            id: this.id,
            codigoCliente: this.codigoCliente,
            tipoPerfil: this.tipoPerfil,
            ...super.toJSON(),
            dataCadastro: this.dataCadastro
        };
    }

    toJSON() {
        return this.overrideJSON();
    }
}
