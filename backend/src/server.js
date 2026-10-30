import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HotelController } from './controllers/HotelController.js';
import { DatabaseManager } from './database/DatabaseManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializa a conexão com o banco SQLite e garante a criação das tabelas
DatabaseManager.getInstance();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Servir os arquivos estáticos do frontend
const frontendDir = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(frontendDir));

// Instancia o controlador que conecta as rotas aos serviços do hotel
const controller = new HotelController();

// 1. Rotas de Cliente e Login
app.post('/api/auth/cadastro', controller.cadastrarCliente);
app.post('/api/auth/login', controller.login);
app.get('/api/clientes/:codigo', controller.obterCliente);

// 2. Rotas de Quartos
app.get('/api/quartos/disponiveis', controller.buscarQuartosDisponiveis);
app.get('/api/quartos', controller.listarTodosQuartos);

// 3. Rotas de Reserva
app.post('/api/reservas', controller.criarReserva);
app.get('/api/reservas', controller.listarReservas);
app.get('/api/reservas/:codigo', controller.consultarReserva);

// 4. Rotas de Check-in e Check-out
app.post('/api/hospedagens/checkin', controller.realizarCheckIn);
app.get('/api/hospedagens/ativas', controller.listarHospedagensAtivas);
app.get('/api/hospedagens/historico', controller.listarHistoricoHospedagens);
app.post('/api/hospedagens/checkout', controller.realizarCheckOut);
app.get('/api/hospedagens/:id/relatorio', controller.obterRelatorioCheckOut);

// Redireciona qualquer outra rota para o frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🏨 Servidor do Hotel rodando em http://localhost:${PORT}`);
    console.log(`📁 Banco de Dados SQLite conectado com sucesso.`);
});
