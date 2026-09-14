import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HotelController } from './controllers/HotelController.js';
import { DatabaseManager } from './database/DatabaseManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Garante a inicialização do banco SQLite e das sementes
DatabaseManager.getInstance();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend e PWA
const frontendDir = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(frontendDir));
app.use(express.static(path.join(frontendDir, 'public')));

// Rotas da API REST
const controller = new HotelController();

// Requisito 3.1: Cadastro e Autenticação
app.post('/api/auth/cadastro', controller.cadastrarCliente);
app.post('/api/auth/login', controller.login);
app.get('/api/clientes/:codigo', controller.obterCliente);

// Requisito 3.2: Quartos e Busca de Disponibilidade
app.get('/api/quartos/disponiveis', controller.buscarQuartosDisponiveis);
app.get('/api/quartos', controller.listarTodosQuartos);

// Requisito 3.2 e 3.3: Reservas
app.post('/api/reservas', controller.criarReserva);
app.get('/api/reservas', controller.listarReservas);
app.get('/api/reservas/:codigo', controller.consultarReserva);

// Requisito 3.3: Check-in
app.post('/api/hospedagens/checkin', controller.realizarCheckIn);
app.get('/api/hospedagens/ativas', controller.listarHospedagensAtivas);
app.get('/api/hospedagens/historico', controller.listarHistoricoHospedagens);

// Requisito 3.4: Check-out e Relatório
app.post('/api/hospedagens/checkout', controller.realizarCheckOut);
app.get('/api/hospedagens/:id/relatorio', controller.obterRelatorioCheckOut);

// Fallback para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
});

const server = app.listen(PORT, () => {
    console.log(`🏨 Vigilant Hotel Server rodando com sucesso em http://localhost:${PORT}`);
    console.log(`📁 Banco de Dados SQLite ativo e conectado.`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`⚠️ A porta ${PORT} já está em uso por outro processo. Encerre o processo anterior ou use outra porta.`);
    } else {
        console.error('Erro no servidor:', err);
    }
});
