# DOCUMENTAÇÃO TÉCNICA E DE PROGRAMAÇÃO ORIENTADA A OBJETOS (POO)

**DISCIPLINA: PROGRAMAÇÃO ORIENTADA A OBJETOS II**  
**PROJETO: HOTEL VIGILANT (SISTEMA WEB & PWA COM SQLITE)**  

---

## 1. Visão Geral do Sistema

O **Vigilant Hotel** é uma aplicação completa de gestão hoteleira estruturada no **Paradigma Orientado a Objetos (POO)**, com persistência em banco relacional **SQLite**, arquitetura em camadas e interface **Web & PWA (Progressive Web App)** instalável e responsiva.

O sistema atende integralmente a todas as exigências do documento oficial do Projeto Interdisciplinar, provendo o fluxo completo de:
1. **Cadastro e Autenticação de Usuários** (Requisito 3.1)
2. **Busca e Disponibilidade de Quartos** (Requisito 3.2)
3. **Gestão de Reservas e Realização de Check-in** (Requisito 3.3)
4. **Encerramento de Estadia (Check-out) e Emissão do Relatório Oficial** (Requisito 3.4)

---

## 2. Fases de Implementação (Requisito 6.2)

Em conformidade com a cláusula **6.2** do edital (*"Caso o trabalho seja implementado em outra linguagem de programação diferente de JAVA e C++, o mesmo deve conter documentação detalhada extra sobre as fases de implementação"*), detalham-se a seguir as etapas executadas:

### Fase 1: Levantamento, Modelagem Conceitual e Banco SQLite
- Definição das entidades do domínio hoteleiro: Clientes, Quartos, Reservas e Hospedagens.
- Elaboração do script DDL em SQLite com integridade referencial ativa (`PRAGMA foreign_keys = ON;`), índices estratégicos de busca e população inicial de acomodações de alto padrão.

### Fase 2: Arquitetura Orientada a Objetos e Modelos de Domínio
- Implementação das classes de domínio no diretório `backend/src/models/`, com rígido encapsulamento utilizando atributos privados ECMAScript (`#propriedade`), getters, setters e métodos de negócio.
- Aplicação do pilar de **Herança**: A classe `Cliente` herda diretamente da classe base `Pessoa`.
- Aplicação de **Polimorfismo e Sobrescrita**: Especialização de métodos de conversão e autenticação.

### Fase 3: Camada de Acesso a Dados (Data Access Objects / Repositories)
- Aplicação do padrão de projeto criacional **Singleton** na classe `DatabaseManager`, centralizando a conexão e execução atômica no SQLite.
- Criação de classes Repositories dedicadas (`ClienteRepository`, `QuartoRepository`, `ReservaRepository`, `HospedagemRepository`) isolando as instruções SQL das regras de negócio.

### Fase 4: Camada de Serviços de Negócio (Services)
- Implementação de `HotelService` e `AuthService`:
  - Cálculo de diárias e tolerâncias.
  - Validações de capacidade máxima de hóspedes por acomodação.
  - Bloqueio e liberação automática do status do quarto (`DISPONIVEL` $\leftrightarrow$ `OCUPADO`).
  - Formatação e emissão do objeto `RelatorioCheckOut` contendo com precisão os 6 itens obrigatórios do item 3.4.

### Fase 5: API REST e Camada de Apresentação Web & PWA
- Exposição de endpoints HTTP via Express estruturados em `HotelController`.
- Desenvolvimento da interface do usuário (SPA) com tema visual *Dark Luxury Hospitality*, paleta bronze/dourada `#C5A059`, cartões translúcidos com *glassmorphism* e tipografia moderna.
- Configuração de **PWA (Progressive Web App)**: Manifesto oficial `manifest.json` e Service Worker `sw.js` para instalação no desktop/dispositivos móveis e cache estático offline.
- Suporte a impressão direta (`@media print`) para emissão física ou salvamento em PDF do comprovante de check-out.

---

## 3. Estrutura das Classes do Domínio (POO)

### 3.1. Diagrama Textual de Relacionamento de Classes

```
       +-------------------------+
       |         Pessoa          |
       +-------------------------+
       | - #nome: string         |
       | - #email: string        |
       | - #telefone: string     |
       | - #cpf: string          |
       +-------------------------+
                    ^
                    | (Herança)
       +-------------------------+
       |         Cliente         |
       +-------------------------+
       | - #id: number           |
       | - #codigoCliente: string|
       | - #senha: string        |
       | - #dataCadastro: string |
       +-------------------------+
       | + autenticar(): boolean |
       +-------------------------+
                    | 1
                    |
                    | realiza
                    v *
       +-------------------------+          +-------------------------+
       |         Reserva         | *      1 |         Quarto          |
       +-------------------------+--------->+-------------------------+
       | - #id: number           |          | - #id: number           |
       | - #codigoReserva: string|          | - #codigoQuarto: string |
       | - #clienteId: number    |          | - #numero: string       |
       | - #quartoId: number     |          | - #nome: string         |
       | - #dataPrevEntrada: Date|          | - #tipo: string         |
       | - #dataPrevSaida: Date  |          | - #precoUnitario: number|
       | - #numHospedes: number  |          | - #capacidadeMax: number|
       | - #status: string       |          | - #status: string       |
       +-------------------------+          +-------------------------+
                    |                       | + isDisponivel(): bool  |
                    | origina (opcional)    | + ocupar(): void        |
                    v                       | + liberar(): void       |
       +-------------------------+          | + calcularTotalDiarias()|
       |       Hospedagem        |          +-------------------------+
       +-------------------------+
       | - #id: number           |
       | - #codigoHosped: string |
       | - #reservaId: number    |
       | - #clienteId: number    |
       | - #quartoId: number     |
       | - #dataEntrada: Date    |
       | - #dataPrevisaoSaida    |
       | - #dataSaida: Date      |
       | - #numHospedes: number  |
       | - #valorUnitario: number|
       | - #valorTotal: number   |
       | - #status: string       |
       +-------------------------+
       | + realizarCheckOut()    |
       +-------------------------+
                    |
                    | gera
                    v
       +------------------------------------+
       |         RelatorioCheckOut          |
       +------------------------------------+
       | [A] Nome e Código do Cliente       |
       | [B] Nº do Quarto, Tipo e Valor Un. |
       | [C] Data de Entrada                |
       | [D] Data de Saída                  |
       | [E] Número de Hóspedes             |
       | [F] Valor Total Calculado          |
       +------------------------------------+
       | + gerarTextoComprovante(): string  |
       +------------------------------------+
```

---

## 4. Matriz de Conformidade com os Requisitos do Projeto

| Item do Edital | Requisito Descrito | Implementação no Código |
| :--- | :--- | :--- |
| **3.1** | Cadastro de usuário para ter acesso às opções da aplicação. | `Cliente.js`, `ClienteRepository.create()`, `AuthService.cadastrar()`, endpoint `POST /api/auth/cadastro`. Geração automática de `CLI-100X`. |
| **3.2** | Login e busca de quartos com **nome, tipo, preço e código para reserva**. | `Quarto.js`, `QuartoRepository.findDisponiveis()`, endpoint `GET /api/quartos/disponiveis`. A interface exibe nome, categoria, diária (R$) e código `Q-XXX`. |
| **3.3** | Efetuar reserva por código e realizar check-in com: código do cliente, código do quarto, data de entrada, previsão de saída e nº de hóspedes. | `Reserva.js`, `Hospedagem.js`, `HotelService.realizarCheckIn()`, endpoint `POST /api/hospedagens/checkin`. O quarto é automaticamente atualizado para `OCUPADO`. |
| **3.4** | Check-out com emissão de relatório contendo: <br>a. Nome e código do cliente<br>b. Número do quarto, tipo e valor unitário<br>c. Data de entrada<br>d. Data de saída<br>e. Número de hóspedes<br>f. Valor total | `RelatorioCheckOut.js`, `HospedagemRepository.obterRelatorioCheckOut()`, endpoint `POST /api/hospedagens/checkout`. Modal e impressão de comprovante com os itens [A] ao [F]. |
| **4.1** | Base de dados relacional. | **SQLite** (`backend/src/database/vigilant.db`) com constraints de chave estrangeira (`PRAGMA foreign_keys = ON;`). |
| **4.2** | Paradigma Orientado a Objetos (POO). | Modelagem em classes, encapsulamento (`#atributos`), herança (`Cliente extends Pessoa`), polimorfismo, Singleton e Repository Pattern. |

---

## 5. Como Executar e Testar a Aplicação

### 5.1. Pré-requisitos
- Node.js instalado (v18 ou superior).

### 5.2. Inicialização do Servidor
No terminal, na pasta raiz do projeto, execute:

```bash
npm start
```

O servidor iniciará em:  
👉 **http://localhost:3002**

### 5.3. Execução dos Testes Automatizados de Fluxo
Para rodar a suíte de testes que valida ponta a ponta todos os requisitos do edital:

```bash
npm test
```

### 5.4. Instalação do PWA
Ao abrir **http://localhost:3002** no Google Chrome, Microsoft Edge ou no smartphone:
1. Clique no botão **"Instalar App"** no topo da página (ou no ícone de instalação na barra de navegação do navegador).
2. O Vigilant Hotel será instalado como um aplicativo autônomo (*standalone*), com ícone próprio e funcionamento otimizado com cache offline.
