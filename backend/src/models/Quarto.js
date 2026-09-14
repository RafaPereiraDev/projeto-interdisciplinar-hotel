/**
 * Classe Quarto - Representa uma acomodação do Vigilant Hotel (Requisito 3.2).
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
    set id(value) { this.#id = value; }
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
        const permitidos = ['DISPONIVEL', 'OCUPADO', 'RESERVADO', 'MANUTENCAO'];
        if (!permitidos.includes(novoStatus)) {
            throw new Error(`Status inválido: ${novoStatus}`);
        }
        this.#status = novoStatus;
    }

    isDisponivel() {
        return this.#status === 'DISPONIVEL';
    }

    ocupar() {
        if (!this.isDisponivel()) {
            throw new Error(`O quarto ${this.#numero} não está disponível para ocupação.`);
        }
        this.#status = 'OCUPADO';
    }

    liberar() {
        this.#status = 'DISPONIVEL';
    }

    /**
     * Calcula o valor de diárias para este quarto.
     * @param {number} dias 
     * @returns {number}
     */
    calcularTotalDiarias(dias) {
        const qtdDias = Math.max(1, Math.ceil(dias));
        return Number((qtdDias * this.#precoUnitario).toFixed(2));
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
