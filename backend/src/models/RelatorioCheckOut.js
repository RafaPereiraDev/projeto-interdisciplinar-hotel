/**
 * Classe RelatorioCheckOut - Monta o comprovante final do Check-out (Requisito 3.4).
 * Reúne os dados de Cliente, Quarto e Hospedagem para exibir na tela ou no terminal.
 */
export class RelatorioCheckOut {
    #codigoHospedagem;
    #codigoCliente;
    #nomeCliente;
    #numeroQuarto;
    #tipoQuarto;
    #valorUnitario;
    #dataEntrada;
    #dataSaida;
    #numHospedes;
    #valorTotal;

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

    // Gera o resumo em texto simples para exibir no console/terminal
    gerarTextoComprovante() {
        return `
=====================================================
             RELATÓRIO DE CHECK-OUT                  
=====================================================
Código da Hospedagem: ${this.#codigoHospedagem}
a) Cliente: ${this.#nomeCliente} (${this.#codigoCliente})
b) Quarto: Nº ${this.#numeroQuarto} - Tipo: ${this.#tipoQuarto} - Diária: R$ ${this.#valorUnitario.toFixed(2)}
c) Data de Entrada: ${new Date(this.#dataEntrada).toLocaleString('pt-BR')}
d) Data de Saída:   ${new Date(this.#dataSaida).toLocaleString('pt-BR')}
e) Nº de Hóspedes:  ${this.#numHospedes}
f) VALOR TOTAL:     R$ ${this.#valorTotal.toFixed(2)}
=====================================================`;
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
