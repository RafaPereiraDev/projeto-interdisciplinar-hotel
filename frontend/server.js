import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.FRONTEND_PORT || 3000;

// Servir arquivos estáticos do frontend e pasta pública (PWA/ícones)
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// SPA Fallback: todas as rotas direcionam para o index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`💻 Vigilant Hotel Frontend rodando em http://localhost:${PORT}`);
});
