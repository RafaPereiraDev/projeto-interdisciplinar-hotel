# ROTEIRO DE APRESENTAÇÃO PRÁTICA (AVALIAÇÃO A3 - 60% DA NOTA)

**DISCIPLINA: PROGRAMAÇÃO ORIENTADA A OBJETOS II**  
**PROJETO: HOTEL VIGILANT - SISTEMA WEB & PWA COM SQLITE E POO**  
**TEMPO ESTIMADO:** 5 a 7 minutos  

---

## 🎯 Objetivo da Apresentação
Demonstrar com segurança, fluidez e rigor técnico o atendimento integral a todos os requisitos do edital (**3.1**, **3.2**, **3.3**, **3.4**, **4.1**, **4.2**, **5.1** e **6.2**), evidenciando o ciclo de vida completo da hospedagem e a aplicação prática dos 4 pilares da Programação Orientada a Objetos.

---

## ⏱️ Cronograma Minuto a Minuto

| Tempo | Etapa / Ação | Telas & Funcionalidades | Requisitos Demonstrados |
| :--- | :--- | :--- | :--- |
| **00:00 - 01:00** | Abertura & Arquitetura | Apresentação do tema, camadas de POO e banco SQLite | Requisitos 4.1, 4.2 e 6.2 |
| **01:00 - 02:15** | Área do Cliente: Cadastro & Busca | Cadastro de usuário, código `CLI-XXXX` e filtros de quartos | Requisitos 3.1 e 3.2 |
| **02:15 - 03:30** | Área do Cliente: Reserva | Agendamento, validação de capacidade e código `RES-XXXX` | Requisitos 3.2 e 3.3 |
| **03:30 - 05:00** | Área da Recepção: Check-in | Alternância de perfil, 5 dados obrigatórios e bloqueio de quarto | Requisito 3.3 |
| **05:00 - 06:15** | Check-out & Relatório Oficial | Encerramento da estadia, cálculo de diárias e itens [A]-[F] | Requisito 3.4 |
| **06:15 - 07:00** | Encerramento & Diferenciais | Herança, Encapsulamento `#`, JSDoc e PWA offline | Requisitos 5.1 e 6.2 |

---

## 🎬 Passo a Passo Detalhado da Apresentação

### 1. Abertura e Visão Arquitetural `[00:00 - 01:00]`
* **O que falar:**
  > *"Boa noite professora e colegas. Apresentamos o Sistema de Gestão Hoteleira do Hotel Vigilant. Desenvolvemos uma aplicação estruturada no paradigma orientado a objetos em camadas (Models, Repositories e Services), com banco relacional SQLite nativo e interface Web responsiva PWA. Para tornar a usabilidade real e segura, dividimos a plataforma em duas visões claras: a Área do Cliente (para busca e reserva) e a Área do Funcionário (para recepção, check-in, check-out e relatórios)."*
* **Ação na tela:**
  - Mostrar a tela inicial em `http://localhost:3002`.
  - Apontar o seletor no cabeçalho: `[Área do Cliente]` e `[Área do Funcionário]`.

---

### 2. Área do Cliente: Cadastro (Req 3.1) e Busca com Filtros (Req 3.2) `[01:00 - 02:15]`
* **O que falar:**
  > *"Iniciamos pelo Requisito 3.1. O cliente se cadastra para ter acesso aos recursos. O sistema instancia um objeto da classe `Cliente`, herdeira de `Pessoa`, e gera automaticamente um código único como `CLI-100X`. Em seguida, atendendo ao Requisito 3.2, o cliente consulta as acomodações disponíveis com os dados exigidos: Nome, Tipo, Preço e Código do Quarto para reserva."*
* **Ação na tela:**
  1. Clicar no botão **"Entrar / Cadastrar"** no topo.
  2. Alternar para a aba **"Cadastrar Novo (Req 3.1)"** e fazer um cadastro rápido (ou usar o botão de preenchimento rápido do hóspede).
  3. Mostrar o toast verde de sucesso com o código gerado (ex: `CLI-1001`).
  4. Na tabela de quartos, aplicar um filtro: selecionar Categoria **"Luxo"** ou Preço Máximo **"500"** e clicar em **"Filtrar Quartos"**.
  5. Mostrar os dados na tabela: Código (`Q-201`), Número (`201`), Nome, Tipo e Diária.

---

### 3. Área do Cliente: Criação de Reserva (Req 3.2 / 3.3) `[02:15 - 03:30]`
* **O que falar:**
  > *"Agora efetuamos uma reserva (Requisitos 3.2 e 3.3). O cliente escolhe a acomodação e o sistema valida a capacidade máxima e as datas de permanência, instanciando a entidade `Reserva` e gerando um código único `RES-XXXX`."*
* **Ação na tela:**
  1. Clicar no botão **"Reservar"** do quarto escolhido (ex: `Q-101`).
  2. A modal de reserva abrirá já com o código do quarto preenchido.
  3. Escolher as datas (ex: check-in amanhã, check-out em 3 dias) e definir 1 hóspede.
  4. Clicar em **"Confirmar Reserva"**.
  5. O sistema exibirá o toast com o código (ex: `RES-8041`).
  6. Clicar na aba **"Minhas Reservas"** e mostrar a reserva com status `CONFIRMADA`.

---

### 4. Área do Funcionário: Realização de Check-in (Req 3.3) `[03:30 - 05:00]`
* **O que falar:**
  > *"Agora simulamos a chegada do cliente ao hotel no balcão da recepção. Mudamos para a Área do Funcionário. Atendendo rigorosamente ao Requisito 3.3, a recepção realiza o check-in informando os 5 dados obrigatórios: código do cliente, código do quarto, data de entrada, previsão de saída e quantidade de hóspedes. Ao confirmar, o método `quarto.ocupar()` altera o status do quarto para OCUPADO e bloqueia novas entradas."*
* **Ação na tela:**
  1. Clicar no alternador **"Área do Funcionário"** no topo (ou banner).
  2. As abas restritas de recepção surgirão. Clicar na aba **"Recepção (Check-in / Out)"**.
  3. Preencher (ou puxar da reserva) os 5 dados obrigatórios:
     - Código do Cliente: `CLI-1001`
     - Código do Quarto: `Q-101`
     - Data de Entrada: *Data e hora atual*
     - Previsão de Saída: *+3 dias*
     - Número de Hóspedes: `1`
  4. Clicar em **"Confirmar Check-in & Bloquear Quarto"**.
  5. Mostrar que o quarto agora aparece com status **● OCUPADO** na aba de quartos e na tabela de **Hóspedes Ativos** à direita.

---

### 5. Check-out e Comprovante Oficial [A] a [F] (Req 3.4) `[05:00 - 06:15]`
* **O que falar:**
  > *"No final da estadia, executamos o Requisito 3.4: o Check-out. O método `hospedagem.realizarCheckOut()` calcula as diárias consumidas, libera o quarto de volta para DISPONÍVEL e instancia a classe `RelatorioCheckOut`, gerando o relatório formal obrigatório contendo os 6 itens de A a F do edital."*
* **Ação na tela:**
  1. Na tabela de **Hóspedes Ativos**, clicar no botão **"Check-out"**.
  2. A modal do **Relatório Oficial** abrirá na tela.
  3. Ler e apontar cada item na tela:
     - **Item a:** Nome e Código do Cliente (`Hóspede Demonstração - CLI-1001`)
     - **Item b:** Quarto, Tipo e Valor Unitário (`Nº 101 • Standard • R$ 190.00`)
     - **Item c:** Data de Entrada formatada
     - **Item d:** Data de Saída formatada
     - **Item e:** Número de Hóspedes
     - **Item f:** Valor Total a Pagar calculado
  4. Clicar no botão **"Imprimir / Salvar PDF"** para demonstrar o layout de impressão formal (`@media print`).
  5. Fechar a modal e mostrar na aba de quartos que o quarto `Q-101` voltou automaticamente para **● DISPONÍVEL**.

---

### 6. Encerramento Técnico & Pilares de POO `[06:15 - 07:00]`
* **O que falar:**
  > *"Para concluir, atendendo aos requisitos 4.1, 4.2, 5.1 e 6.2: todo o código utiliza encapsulamento com campos privados ECMAScript (`#`), herança com `Cliente extends Pessoa`, polimorfismo na sobrescrita de métodos, padrão Singleton no banco SQLite e comentários completos no padrão JSDoc equivalente ao Javadoc. A aplicação também é instalável via PWA e conta com suíte de testes de console automatizados executáveis via `npm test`."*

---

## ❓ Perguntas Frequentes da Banca / Professora (Respostas Prontas)

### 1. "Por que usaram JavaScript/Node.js em vez de Java?"
> *"Conforme previsto na cláusula 6.2 do edital, linguagens além de Java e C++ são permitidas desde que contenham documentação detalhada das fases. Escolhemos Node.js moderno (ES2022+) porque ele possui orientação a objetos nativa com campos privados `#`, permitindo integrar uma interface Web/PWA instalável e responsiva com um banco SQLite relacional embutido de alta performance."*

### 2. "Onde está a Herança no código de vocês?"
> *"Está na classe `Cliente` (`backend/src/models/Cliente.js`), que herda diretamente de `Pessoa` (`backend/src/models/Pessoa.js`) via `extends`. Os atributos `nome`, `email`, `telefone` e `cpf` são herdados e inicializados via `super()`, enquanto `Cliente` acrescenta `codigoCliente`, `senha` e `tipoPerfil`."*

### 3. "Como vocês garantiram o Encapsulamento?"
> *"Todos os atributos internos das classes foram declarados com cerquilha (`#`), tornando-os estritamente privados em nível de engine. O acesso externo ocorre apenas por getters e setters validados, e as regras de negócio críticas (como cálculo de valor e mudança de status) só podem ser disparadas por métodos de negócio como `ocupar()`, `liberar()` e `realizarCheckOut()`."*

### 4. "Onde está o banco relacional e como o Singleton atua?"
> *"Utilizamos o SQLite nativo (`node:sqlite`). A classe `DatabaseManager` implementa o padrão Singleton (`getInstance()`), garantindo que apenas uma conexão atômica com `PRAGMA foreign_keys = ON;` exista, evitando conflitos de concorrência."*

### 5. "Como é feito o cálculo do valor total no Check-out?"
> *"O método `calcularDiarias()` na entidade `Hospedagem` calcula a diferença em milissegundos entre entrada e saída, convertendo em dias e aplicando a regra de cobrança mínima de 1 diária. Em seguida, multiplica pelo valor unitário fixado no momento do check-in, garantindo integridade mesmo se a tabela de preços do hotel mudar depois."*
