/**
 * Classe base abstrata/conceitual Pessoa (Demonstração do pilar de Herança em POO).
 */
export class Pessoa {
    #nome;
    #email;
    #telefone;
    #cpf;

    /**
     * @param {string} nome 
     * @param {string} email 
     * @param {string} telefone 
     * @param {string} cpf 
     */
    constructor(nome, email, telefone = '', cpf = '') {
        this.#nome = nome;
        this.#email = email;
        this.#telefone = telefone;
        this.#cpf = cpf;
    }

    get nome() { return this.#nome; }
    set nome(value) {
        if (!value || value.trim().length === 0) throw new Error('Nome é obrigatório.');
        this.#nome = value.trim();
    }

    get email() { return this.#email; }
    set email(value) {
        if (!value || !value.includes('@')) throw new Error('E-mail inválido.');
        this.#email = value.trim().toLowerCase();
    }

    get telefone() { return this.#telefone; }
    set telefone(value) { this.#telefone = value ? value.trim() : ''; }

    get cpf() { return this.#cpf; }
    set cpf(value) { this.#cpf = value ? value.trim() : ''; }

    toJSON() {
        return {
            nome: this.nome,
            email: this.email,
            telefone: this.telefone,
            cpf: this.cpf
        };
    }
}
