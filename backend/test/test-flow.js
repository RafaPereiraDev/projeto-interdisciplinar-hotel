import { DatabaseManager } from '../src/database/DatabaseManager.js';
import { AuthService } from '../src/services/AuthService.js';
import { HotelService } from '../src/services/HotelService.js';

console.log('🧪 Iniciando Teste de Fluxo Completo do Vigilant Hotel (POO II)...');

try {
    const authService = new AuthService();
    const hotelService = new HotelService();

    // 1. REQUISITO 3.1: Cadastro de Cliente
    console.log('\n[1] Testando Requisito 3.1: Cadastro de Usuário');
    const emailTeste = `hospede_${Date.now()}@teste.com`;
    const cadResult = authService.cadastrar({
        nome: 'Lucas Silveira',
        email: emailTeste,
        senha: 'senhaSegura123',
        telefone: '(47) 99111-2233',
        cpf: `001.002.${Math.floor(100 + Math.random() * 900)}-99`
    });
    console.log('✅ Cliente cadastrado com sucesso! Código:', cadResult.cliente.codigoCliente);

    // 2. REQUISITO 3.2: Login
    console.log('\n[2] Testando Requisito 3.2: Login');
    const loginResult = authService.login(emailTeste, 'senhaSegura123');
    console.log('✅ Login efetuado com sucesso para:', loginResult.cliente.nome);

    // 3. REQUISITO 3.2: Busca de Quartos Disponíveis
    console.log('\n[3] Testando Requisito 3.2: Busca de Quartos Disponíveis');
    const quartos = hotelService.buscarQuartosDisponiveis();
    console.log(`✅ Quartos disponíveis encontrados: ${quartos.length}`);
    const quartoAlvo = quartos[0];
    console.log(`   -> Quarto escolhido: ${quartoAlvo.nome} (${quartoAlvo.codigoQuarto}) - Diária: R$ ${quartoAlvo.precoUnitario}`);

    // 4. REQUISITO 3.2 e 3.3: Reserva pelo Código
    console.log('\n[4] Testando Requisito 3.3: Efetuar Reserva');
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 3);

    const numHospedesTeste = quartoAlvo.capacidadeMaxima;

    const reservaResult = hotelService.criarReserva({
        codigoCliente: cadResult.cliente.codigoCliente,
        codigoQuarto: quartoAlvo.codigoQuarto,
        dataPrevistaEntrada: hoje.toISOString().split('T')[0],
        dataPrevistaSaida: amanha.toISOString().split('T')[0],
        numHospedes: numHospedesTeste
    });
    console.log('✅ Reserva efetuada com sucesso! Código de Reserva:', reservaResult.codigoReserva);

    // 5. REQUISITO 3.3: Check-in
    console.log('\n[5] Testando Requisito 3.3: Realizar Check-in com os dados obrigatórios');
    const checkinResult = hotelService.realizarCheckIn({
        codigoCliente: cadResult.cliente.codigoCliente,
        codigoItem: quartoAlvo.codigoQuarto,
        dataEntrada: hoje.toISOString(),
        dataPrevisaoSaida: amanha.toISOString().split('T')[0],
        numHospedes: numHospedesTeste,
        codigoReserva: reservaResult.codigoReserva
    });
    console.log('✅ Check-in realizado! Código Hospedagem:', checkinResult.codigoHospedagem);

    // 6. REQUISITO 3.4: Check-out e Emissão de Relatório
    console.log('\n[6] Testando Requisito 3.4: Realizar Check-out e Emissão do Relatório');
    const dataSaidaEfetiva = new Date(hoje);
    dataSaidaEfetiva.setDate(dataSaidaEfetiva.getDate() + 3); // 3 dias

    const checkoutResult = hotelService.realizarCheckOut({
        codigoHospedagem: checkinResult.codigoHospedagem,
        dataSaida: dataSaidaEfetiva.toISOString()
    });

    const relatorio = checkoutResult.relatorio;
    console.log('✅ Check-out concluído com relatório gerado:');
    console.log(relatorio.comprovanteTexto);

    // Validação estrita dos 6 campos do item 3.4
    if (!relatorio.cliente.nome || !relatorio.cliente.codigo) throw new Error('Falha no item 3.4.a (Nome e código)');
    if (!relatorio.quarto.numero || !relatorio.quarto.tipo || !relatorio.quarto.valorUnitario) throw new Error('Falha no item 3.4.b (Número, tipo, valor unitário)');
    if (!relatorio.dataEntrada) throw new Error('Falha no item 3.4.c (Data de entrada)');
    if (!relatorio.dataSaida) throw new Error('Falha no item 3.4.d (Data de saída)');
    if (!relatorio.numHospedes) throw new Error('Falha no item 3.4.e (Número de hóspedes)');
    if (relatorio.valorTotal <= 0) throw new Error('Falha no item 3.4.f (Valor total)');

    console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO! 100% DE CONFORMIDADE COM OS REQUISITOS!');
} catch (err) {
    console.error('❌ Erro no teste:', err);
    process.exit(1);
}
