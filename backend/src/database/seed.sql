-- ====================================================================
-- SCRIPT DE POPULAÇÃO INICIAL (SEED) - HOTEL VIGILANT
-- ====================================================================

-- 1. ACOMODAÇÕES DIVERSIFICADAS (Requisito 3.2)
INSERT OR REPLACE INTO quartos (id, codigo_quarto, numero, nome, tipo, preco_unitario, capacidade_maxima, status, descricao, imagem_url) VALUES
(1, 'Q-101', '101', 'Standard Executivo Single', 'Standard', 190.00, 1, 'DISPONIVEL', 'Acomodação funcional com cama box de solteiro, bancada ergonômica para trabalho, Wi-Fi de alta velocidade e ar-condicionado silencioso.', '/images/rooms/standard-single.jpg'),
(2, 'Q-102', '102', 'Standard Conforto Casal', 'Standard', 260.00, 2, 'DISPONIVEL', 'Ideal para casais, equipada com cama queen size, smart TV 4K com streaming, frigobar abastecido e isolamento acústico.', '/images/rooms/standard-double.jpg'),
(3, 'Q-201', '201', 'Luxo Superior Vista Cidade', 'Luxo', 390.00, 3, 'DISPONIVEL', 'Amplo espaço com varanda privativa e vista panorâmica para a cidade. Inclui cafeteira Nespresso de cortesia e roupões de banho.', '/images/rooms/luxo-city.jpg'),
(4, 'Q-202', '202', 'Luxo Família Premium', 'Luxo', 480.00, 4, 'DISPONIVEL', 'Dois ambientes integrados perfeitos para estadias familiares. Banheiro com pia dupla, banheira de imersão e berço sob demanda.', '/images/rooms/luxo-family.jpg'),
(5, 'Q-301', '301', 'Suíte Master Vigilant Imperial', 'Suíte', 750.00, 3, 'DISPONIVEL', 'Sofisticação e conforto de alto padrão. Cama super king, banheira de hidromassagem com vista, sala de estar privativa e menu de travesseiros.', '/images/rooms/suite-master.jpg'),
(6, 'Q-401', '401', 'Cobertura Presidencial Vigilant', 'Presidencial', 1200.00, 4, 'DISPONIVEL', 'Experiência exclusiva no último andar com terraço panorâmico, jacuzzi aquecida, adega climatizada e atendimento prioritário.', '/images/rooms/presidential.jpg');

-- 2. USUÁRIOS E PERFIS FICTÍCIOS DE TESTE (Requisito 3.1)
INSERT OR REPLACE INTO clientes (id, codigo_cliente, nome, email, senha, telefone, cpf, tipo_perfil, data_cadastro) VALUES
(1, 'CLI-1001', 'Hóspede Demonstração', 'cliente@hotelvigilant.com', '123456', '(47) 90000-0001', '000.000.000-01', 'CLIENTE', CURRENT_TIMESTAMP),
(2, 'CLI-1002', 'Marina Souza', 'marina.souza@email.com', '123456', '(47) 90000-0002', '000.000.000-02', 'CLIENTE', CURRENT_TIMESTAMP),
(3, 'FUNC-101', 'Recepção / Atendente', 'recepcao@hotelvigilant.com', 'admin123', '(47) 90000-0003', '000.000.000-03', 'FUNCIONARIO', CURRENT_TIMESTAMP);

-- 3. RESERVAS PRÉ-AGENDADAS PARA DEMONSTRAÇÃO IMEDIATA (Requisito 3.2 e 3.3)
INSERT OR REPLACE INTO reservas (id, codigo_reserva, cliente_id, quarto_id, data_prevista_entrada, data_prevista_saida, num_hospedes, status, data_criacao) VALUES
(1, 'RES-8041', 1, 1, DATE('now', '+1 day'), DATE('now', '+4 days'), 1, 'CONFIRMADA', CURRENT_TIMESTAMP),
(2, 'RES-8042', 2, 3, DATE('now', '+2 days'), DATE('now', '+5 days'), 2, 'CONFIRMADA', CURRENT_TIMESTAMP);
