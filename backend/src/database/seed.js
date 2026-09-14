import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseManager } from './DatabaseManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script de inicialização e população de dados mockados (Seed).
 * Pode ser executado a qualquer momento com: npm run seed
 */
export function runSeed() {
    console.log('🌱 Inicializando população de dados de demonstração (Seed)...');
    const db = DatabaseManager.getInstance();
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf-8');

    // Desativa foreign keys temporariamente para inserção em lote sem bloqueio de cascata
    db.exec('PRAGMA foreign_keys = OFF;');
    db.exec(seedSql);
    db.exec('PRAGMA foreign_keys = ON;');

    console.log('✅ Banco de dados populado com sucesso!');
    console.log('🏨 Quartos cadastrados: 6 acomodações (Standard, Luxo, Suíte, Presidencial)');
    console.log('👤 Clientes demo: cliente@hotelvigilant.com (senha: 123456) e marina.souza@email.com');
    console.log('🔑 Funcionário demo: recepcao@hotelvigilant.com (senha: admin123)');
    console.log('📅 Reservas criadas: RES-8041 e RES-8042');
}

// Execução direta via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runSeed();
}
