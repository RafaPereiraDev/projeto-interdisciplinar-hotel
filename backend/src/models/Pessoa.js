/**
 * Classe base Pessoa - Representa os dados comuns de um ser humano.
 * Demonstra o conceito de HERANÇA em Programação Orientada a Objetos.
 */
export class Pessoa {
    #nome;
    #email;
    #telefone;
    #cpf;

    constructor(nome, email, telefone = '', cpf = '') {
        this.#nome = nome;
        this.#email = email;
        this.#telefone = telefone;
        this.#cpf = cpf;
    }

    // Getters e Setters para encapsulamento dos dados
    get nome() { return this.#nome; }
    set nome(valor) {
        if (!valor || valor.trim().length === 0) throw new Error('Nome é obrigatório.');
        this.#nome = valor.trim();
    }

    get email() { return this.#email; }
    set email(valor) {
        if (!valor || !valor.includes('@')) throw new Error('E-mail inválido.');
        this.#email = valor.trim().toLowerCase();
    }

    get telefone() { return this.#telefone; }
    set telefone(valor) { this.#telefone = valor ? valor.trim() : ''; }

    get cpf() { return this.#cpf; }
    set cpf(valor) { this.#cpf = valor ? valor.trim() : ''; }

    // Retorna os dados em formato de objeto
    toJSON() {
        return {
            nome: this.nome,
            email: this.email,
            telefone: this.telefone,
            cpf: this.cpf
        };
    }
}
