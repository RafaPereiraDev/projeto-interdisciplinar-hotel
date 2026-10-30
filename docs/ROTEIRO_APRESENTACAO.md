# ROTEIRO DE APRESENTAÇÃO EM VÍDEO (SISTEMA DE HOTEL)

**PROJETO:** Sistema de Gestão Hoteleira (Check-in e Check-out)  
**TEMPO TOTAL SUGERIDO:** 3 a 5 minutos  
**DIVISÃO:** 3 Integrantes

---

## 👥 DIVISÃO DAS FALAS E TELAS

### 🎤 INTEGRANTE 1: Abertura, Tecnologias e Estrutura de Banco/Entidades
* **Tempo estimado:** 1 min a 1 min e 20s
* **O que falar:**
  > "Olá professora e colegas. O nosso projeto é um sistema de hotel focado no ciclo essencial de Check-in e Check-out.
  > Como tecnologias, utilizamos JavaScript com Node.js no backend pelo suporte nativo a Orientação a Objetos e classes com encapsulamento estrito, além do banco relacional SQLite nativo sem bibliotecas externas pesadas.
  > Nossa arquitetura é baseada em 4 entidades centrais bem explícitas: Cliente (que herda de Pessoa), Quarto, Reserva e Hospedagem.
  > No banco de dados relacional, temos 4 tabelas correspondentes ligadas por chaves estrangeiras: `clientes`, `quartos`, `reservas` e `hospedagens`. A conexão é centralizada em um gerenciador único simples."
* **O que mostrar na tela:**
  1. Abrir rapidamente o arquivo [`backend/src/models/Pessoa.js`](file:///c:/Users/Estudos%20Rafael/Desktop/Projetos/Unifebe/Prog2SistemaWebHotel/backend/src/models/Pessoa.js) e [`Cliente.js`](file:///c:/Users/Estudos%20Rafael/Desktop/Projetos/Unifebe/Prog2SistemaWebHotel/backend/src/models/Cliente.js) destacando a Herança (`extends`).
  2. Abrir [`backend/src/database/DatabaseManager.js`](file:///c:/Users/Estudos%20Rafael/Desktop/Projetos/Unifebe/Prog2SistemaWebHotel/backend/src/database/DatabaseManager.js) mostrando a criação simples das 4 tabelas e a ativação de `PRAGMA foreign_keys = ON;`.

---

### 🎤 INTEGRANTE 2: Demonstração e Explicação do Fluxo de Check-in
* **Tempo estimado:** 1 min e 30s
* **O que falar:**
  > "Agora vamos ver o fluxo de Check-in.
  > No código, dentro do método `realizarCheckIn` no serviço do hotel, nós recebemos os dados obrigatórios: código do cliente, código do quarto, data de entrada, previsão de saída e quantidade de hóspedes.
  > O sistema verifica se o quarto está com status 'DISPONIVEL' e respeita a capacidade máxima. Em seguida, chama o método `quarto.ocupar()`, atualizando o status do quarto para 'OCUPADO' no banco de dados para evitar duplicidade, e insere um registro na tabela `hospedagens` com status 'ATIVA'.
  > Vamos ver isso funcionando na prática."
* **O que mostrar na tela:**
  1. Mostrar o trecho do método `realizarCheckIn` em [`backend/src/services/HotelService.js`](file:///c:/Users/Estudos%20Rafael/Desktop/Projetos/Unifebe/Prog2SistemaWebHotel/backend/src/services/HotelService.js) destacando a validação e o `quarto.ocupar()`.
  2. Executar o fluxo (seja na interface web em `http://localhost:3002` ou rodando `npm test` no terminal), mostrando a mensagem de confirmação do quarto sendo ocupado e a geração do código `HOSP-XXXX`.

---

### 🎤 INTEGRANTE 3: Demonstração do Check-out, Encerramento e Persistência no Banco
* **Tempo estimado:** 1 min e 30s
* **O que falar:**
  > "Para finalizar a estadia, temos o fluxo de Check-out.
  > No método `realizarCheckOut`, o sistema resgata a hospedagem ativa, calcula a diferença em dias entre a data de entrada e a saída efetiva (com a regra de no mínimo 1 diária) e multiplica pelo valor unitário da diária fixado no check-in.
  > Na sequência, o status da hospedagem é atualizado para 'FINALIZADA' e gravamos a data de saída e o valor total no banco SQLite. Imediatamente o quarto é liberado com `quarto.liberar()`, voltando seu status para 'DISPONIVEL'.
  > Por fim, a classe `RelatorioCheckOut` consolida e emite o comprovante oficial com todos os itens obrigatórios: dados do cliente, do quarto, período e o total a pagar."
* **O que mostrar na tela:**
  1. Mostrar o método `realizarCheckOut` em [`backend/src/models/Hospedagem.js`](file:///c:/Users/Estudos%20Rafael/Desktop/Projetos/Unifebe/Prog2SistemaWebHotel/backend/src/models/Hospedagem.js) e em [`backend/src/services/HotelService.js`](file:///c:/Users/Estudos%20Rafael/Desktop/Projetos/Unifebe/Prog2SistemaWebHotel/backend/src/services/HotelService.js).
  2. Demonstrar o relatório impresso na tela ou no console contendo os itens (a) Cliente, (b) Quarto, (c) Entrada, (d) Saída, (e) Hóspedes e (f) Valor Total.
  3. Mostrar que o quarto voltou para o status `DISPONIVEL` no sistema.
