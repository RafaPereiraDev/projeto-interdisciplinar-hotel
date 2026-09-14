/**
 * Classe RelatorioCheckOut (Requisito 3.4 do Projeto).
 * Emite o relatório formatado de encerramento da hospedagem com os 6 itens obrigatórios:
 * a. Nome e código do cliente
 * b. Número do quarto, tipo e valor unitário
 * c. Data de entrada
 * d. Data de saída
 * e. Número de hóspedes
 * f. Valor total
 */
export class RelatorioCheckOut {
    #codigoCliente;
    #nomeCliente;
    #numeroQuarto;
    #tipoQuarto;
    #valorUnitario;
    #dataEntrada;
    #dataSaida;
    #numHospedes;
    #valorTotal;
    #codigoHospedagem;

    constructor({
        codigoHospedagem,
        codigoCliente,
        nomeCliente,
        numeroQuarto,
        tipoQuarto,
        valorUnitario,
        dataEntrada,
        dataSaida,
        numHospedes,
        valorTotal
    }) {
        this.#codigoHospedagem = codigoHospedagem;
        this.#codigoCliente = codigoCliente;
        this.#nomeCliente = nomeCliente;
        this.#numeroQuarto = numeroQuarto;
        this.#tipoQuarto = tipoQuarto;
        this.#valorUnitario = Number(valorUnitario);
        this.#dataEntrada = dataEntrada;
        this.#dataSaida = dataSaida;
        this.#numHospedes = Number(numHospedes);
        this.#valorTotal = Number(valorTotal);
    }

    get codigoHospedagem() { return this.#codigoHospedagem; }
    get codigoCliente() { return this.#codigoCliente; }
    get nomeCliente() { return this.#nomeCliente; }
    get numeroQuarto() { return this.#numeroQuarto; }
    get tipoQuarto() { return this.#tipoQuarto; }
    get valorUnitario() { return this.#valorUnitario; }
    get dataEntrada() { return this.#dataEntrada; }
    get dataSaida() { return this.#dataSaida; }
    get numHospedes() { return this.#numHospedes; }
    get valorTotal() { return this.#valorTotal; }

    /**
     * Formata o relatório em texto para impressão ou console.
     * @returns {string}
     */
    gerarTextoComprovante() {
        return `
=====================================================
         VIGILANT GRAND HOTEL & RESIDENCES           
             RELATÓRIO OFICIAL DE CHECK-OUT          
=====================================================
Código de Hospedagem: ${this.#codigoHospedagem}

[A] DADOS DO CLIENTE
  - Nome: ${this.#nomeCliente}
  - Código: ${this.#codigoCliente}

[B] DADOS DA ACOMODAÇÃO
  - Quarto Nº: ${this.#numeroQuarto}
  - Tipo / Categoria: ${this.#tipoQuarto}
  - Valor Unitário (Diária): R$ ${this.#valorUnitario.toFixed(2)}

[C] DATA DE ENTRADA: ${new Date(this.#dataEntrada).toLocaleString('pt-BR')}
[D] DATA DE SAÍDA:   ${new Date(this.#dataSaida).toLocaleString('pt-BR')}
[E] NÚMERO DE HÓSPEDES: ${this.#numHospedes}

-----------------------------------------------------
[F] VALOR TOTAL A PAGAR: R$ ${this.#valorTotal.toFixed(2)}
=====================================================
Agradecemos a sua preferência no Vigilant Hotel!
`;
    }

    toJSON() {
        return {
            codigoHospedagem: this.#codigoHospedagem,
            cliente: {
                codigo: this.#codigoCliente,
                nome: this.#nomeCliente
            },
            quarto: {
                numero: this.#numeroQuarto,
                tipo: this.#tipoQuarto,
                valorUnitario: this.#valorUnitario
            },
            dataEntrada: this.#dataEntrada,
            dataSaida: this.#dataSaida,
            numHospedes: this.#numHospedes,
            valorTotal: this.#valorTotal,
            comprovanteTexto: this.gerarTextoComprovante()
        };
    }
}
