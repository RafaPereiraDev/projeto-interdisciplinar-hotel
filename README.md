# Hotel Vigilant • Sistema de Gestão Hoteleira (Web & PWA)

Sistema completo de gestão e reservas hoteleiras desenvolvido com **Programação Orientada a Objetos (POO)**, persistência em banco relacional **SQLite**, arquitetura em camadas e interface moderna **Web & PWA (Progressive Web App)** instalável e responsiva.

---

## 🏛️ Visão Geral e Arquitetura

O sistema implementa integralmente os requisitos fundamentais de hotelaria divididos em duas visões especializadas:

### 👤 Área do Cliente (Hóspede)
- **Busca e Disponibilidade de Quartos (Requisito 3.2):** Filtro por categoria (*Standard, Luxo, Suíte, Presidencial*), faixa de preço máximo de diária e capacidade de hóspedes.
- **Agendamento de Reservas (Requisitos 3.2 e 3.3):** Seleção de acomodação por código de item (`Q-XXX`), datas de entrada/saída e geração do código de reserva (`RES-XXXX`).
- **Minhas Reservas:** Consulta de agendamentos pelo código ou painel personalizado do cliente autenticado.

### 🔑 Área do Funcionário (Recepção & Governança)
- **Realização de Check-in (Requisito 3.3):** Registro de entrada exigindo os 5 dados obrigatórios:
  1. Código do Cliente (`CLI-XXXX`)
  2. Código do Quarto / Item (`Q-XXX`)
  3. Data e hora de Entrada
  4. Data prevista de Saída
  5. Número de Hóspedes
  *(com vínculo opcional de código de reserva existente)*
- **Bloqueio Automático de Ocupação:** Ao confirmar o check-in, o quarto tem seu status alterado para `OCUPADO`.
- **Hóspedes Ativos & Check-out (Requisito 3.4):** Encerramento da estadia com cálculo exato de diárias e liberação automática do quarto para `DISPONIVEL`.
- **Emissão do Relatório Oficial de Check-out (Requisito 3.4):** Comprovante formal contendo detalhadamente os itens de **A** a **F**:
  - **a.** Nome e código do cliente
  - **b.** Número do quarto, tipo e valor unitário (diária)
  - **c.** Data de entrada
  - **d.** Data de saída
  - **e.** Número de hóspedes
  - **f.** Valor total a pagar
  - Suporte nativo para impressão direta ou salvamento em PDF (`@media print`).

---

## ⚙️ Tecnologias Utilizadas

- **Backend:** Node.js (ES Modules), Express.
- **Banco de Dados:** SQLite nativo (`node:sqlite`) com integridade referencial ativa (`PRAGMA foreign_keys = ON;`).
- **Arquitetura POO:**
  - Classes de modelo com atributos privados (`#encapsulamento`), getters e setters.
  - Herança: `Cliente` estende a classe base `Pessoa`.
  - Padrão **Singleton** no `DatabaseManager`.
  - Padrão **Repository** (`ClienteRepository`, `QuartoRepository`, `ReservaRepository`, `HospedagemRepository`).
  - Camada de **Services** com regras de negócio e cálculo de diárias (`HotelService`, `AuthService`).
- **Frontend:** HTML5 semântico, Vanilla JavaScript moderno (módulos ES6) e CSS puro com design system profissional, responsivo e sem dependências externas pesadas.
- **PWA (Progressive Web App):** Manifesto `manifest.json` e Service Worker com estratégia de cache para instalação desktop e mobile.

---

## 🔒 Segurança e Privacidade (Boas Práticas)

Este repositório foi construído seguindo diretrizes rigorosas de segurança para projetos públicos:
- ✅ **Nenhum dado pessoal real:** Não contém CPFs, telefones, endereços ou nomes reais de alunos ou professores.
- ✅ **Isolamento de rede:** Não expõe IPs de redes locais, portas restritas ou credenciais de infraestrutura privada.
- ✅ **Arquivo `.gitignore` configurado:** Ignora `node_modules`, variáveis de ambiente `.env`, logs e instâncias do banco SQLite geradas dinamicamente em tempo de execução.
- ✅ **Seed de dados demonstrativos:** O banco é inicializado automaticamente na primeira execução com dados fictícios seguros.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior.

### 1. Clonar o repositório
```bash
git clone https://github.com/RafaPereiraDev/hotel-vigilant-system.git
cd hotel-vigilant-system
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Iniciar o servidor
```bash
npm start
```

O sistema estará disponível em:  
👉 **http://localhost:3002**

*(Caso deseje executar em outra porta, configure a variável de ambiente `PORT=XXXX`).*

---

## 🧪 Execução dos Testes Automatizados

O projeto inclui uma suíte automatizada de testes de fluxo para validar ponta a ponta todas as operações de POO e banco de dados:

```bash
npm test
```

Os testes cobrem:
1. Cadastro de cliente e validação de código único (Req 3.1)
2. Autenticação e login (Req 3.1)
3. Busca filtrada e disponibilidade de quartos (Req 3.2)
4. Criação de reserva (Req 3.2 / 3.3)
5. Execução do check-in com dados obrigatórios e bloqueio de quarto (Req 3.3)
6. Check-out, cálculo de diárias e validação dos itens [A] ao [F] do comprovante oficial (Req 3.4)

---

## 🔑 Contas de Demonstração Rápida

Para facilitar a avaliação, o sistema conta com botões de preenchimento rápido na janela de identificação:

| Perfil | E-mail de Acesso | Senha | Finalidade |
| :--- | :--- | :--- | :--- |
| **Hóspede (Cliente)** | `cliente@hotelvigilant.com` | `123456` | Busca de quartos, reservas e visualização de estadias |
| **Recepção (Funcionário)** | `recepcao@hotelvigilant.com` | `admin123` | Check-in, Check-out, governança e relatórios oficiais |

---

## 📄 Licença

Projeto acadêmico desenvolvido para a disciplina de Programação Orientada a Objetos II. Licença ISC.
