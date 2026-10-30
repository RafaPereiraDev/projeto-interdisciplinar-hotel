/**
 * Classe Quarto - Representa uma acomodação do hotel.
 * Contém o número, tipo, preço da diária e métodos para ocupar ou liberar o quarto.
 */
export class Quarto {
    #id;
    #codigoQuarto;
    #numero;
    #nome;
    #tipo;
    #precoUnitario;
    #capacidadeMaxima;
    #status;
    #descricao;
    #imagemUrl;

    constructor({
        id = null,
        codigoQuarto,
        numero,
        nome,
        tipo,
        precoUnitario,
        capacidadeMaxima,
        status = 'DISPONIVEL',
        descricao = '',
        imagemUrl = ''
    }) {
        this.#id = id;
        this.#codigoQuarto = codigoQuarto;
        this.#numero = numero;
        this.#nome = nome;
        this.#tipo = tipo;
        this.#precoUnitario = Number(precoUnitario);
        this.#capacidadeMaxima = Number(capacidadeMaxima);
        this.#status = status;
        this.#descricao = descricao;
        this.#imagemUrl = imagemUrl;
    }

    get id() { return this.#id; }
    set id(valor) { this.#id = valor; }
    get codigoQuarto() { return this.#codigoQuarto; }
    get numero() { return this.#numero; }
    get nome() { return this.#nome; }
    get tipo() { return this.#tipo; }
    get precoUnitario() { return this.#precoUnitario; }
    get capacidadeMaxima() { return this.#capacidadeMaxima; }
    get status() { return this.#status; }
    get descricao() { return this.#descricao; }
    get imagemUrl() { return this.#imagemUrl; }

    set status(novoStatus) {
        this.#status = novoStatus;
    }

    // Verifica se o quarto pode receber hóspedes
    isDisponivel() {
        return this.#status === 'DISPONIVEL';
    }

    // Altera o status para OCUPADO no Check-in
    ocupar() {
        if (!this.isDisponivel()) {
            throw new Error(`O quarto ${this.#numero} não está disponível no momento.`);
        }
        this.#status = 'OCUPADO';
    }

    // Altera o status de volta para DISPONIVEL no Check-out
    liberar() {
        this.#status = 'DISPONIVEL';
    }

    toJSON() {
        return {
            id: this.#id,
            codigoQuarto: this.#codigoQuarto,
            numero: this.#numero,
            nome: this.#nome,
            tipo: this.#tipo,
            precoUnitario: this.#precoUnitario,
            capacidadeMaxima: this.#capacidadeMaxima,
            status: this.#status,
            descricao: this.#descricao,
            imagemUrl: this.#imagemUrl
        };
    }
}
