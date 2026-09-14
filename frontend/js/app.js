import { api } from './api.js';
import { initPWA } from './pwa.js';

// Estado global da aplicação
const state = {
  currentUser: null,
  userMode: 'cliente', // 'cliente' ou 'funcionario'
  activeTab: 'tab-quartos',
  rooms: [],
  reservas: [],
  hospedagensAtivas: [],
  historico: []
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initPWA();
  initAuth();
  initModeSelector();
  initTabs();
  initFilters();
  initModals();
  initForms();
  initPrintButton();

  // Carregamento inicial de dados
  carregarQuartos();
  carregarReservas();
  carregarHospedagensAtivas();
  carregarHistorico();

  // Preenche data de entrada com a data/hora atual no formulário de check-in
  const now = new Date();
  const localIsoString = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const dataEntradaInput = document.getElementById('checkin-data-entrada');
  if (dataEntradaInput) dataEntradaInput.value = localIsoString;

  // Preenche previsão de saída com +2 dias
  const in2Days = new Date(now);
  in2Days.setDate(in2Days.getDate() + 2);
  const dataPrevisaoInput = document.getElementById('checkin-previsao-saida');
  if (dataPrevisaoInput) dataPrevisaoInput.value = in2Days.toISOString().split('T')[0];

  // Preenche datas na modal de reserva
  const reservaEntrada = document.getElementById('reserva-data-entrada');
  const reservaSaida = document.getElementById('reserva-data-saida');
  if (reservaEntrada) reservaEntrada.value = now.toISOString().split('T')[0];
  if (reservaSaida) reservaSaida.value = in2Days.toISOString().split('T')[0];
});

/* ====================================================================
   SELEÇÃO DE MODO (Área do Cliente vs Área do Funcionário)
   ==================================================================== */
function initModeSelector() {
  const btnCliente = document.getElementById('btn-mode-cliente');
  const btnFuncionario = document.getElementById('btn-mode-funcionario');
  const btnHelper = document.getElementById('btn-switch-role-helper');

  if (btnCliente) {
    btnCliente.addEventListener('click', () => setUserMode('cliente'));
  }
  if (btnFuncionario) {
    btnFuncionario.addEventListener('click', () => setUserMode('funcionario'));
  }
  if (btnHelper) {
    btnHelper.addEventListener('click', () => {
      const nextMode = state.userMode === 'cliente' ? 'funcionario' : 'cliente';
      setUserMode(nextMode);
    });
  }

  // Acessos rápidos no modal de identificação
  const btnDemoCliente = document.getElementById('btn-fill-demo-cliente');
  const btnDemoFuncionario = document.getElementById('btn-fill-demo-funcionario');

  if (btnDemoCliente) {
    btnDemoCliente.addEventListener('click', () => {
      document.getElementById('login-email').value = 'cliente@hotelvigilant.com';
      document.getElementById('login-senha').value = '123456';
    });
  }

  if (btnDemoFuncionario) {
    btnDemoFuncionario.addEventListener('click', () => {
      document.getElementById('login-email').value = 'recepcao@hotelvigilant.com';
      document.getElementById('login-senha').value = 'admin123';
    });
  }

  // Aplica o modo salvo ou padrão inicial
  const savedMode = sessionStorage.getItem('vigilant_mode') || 'cliente';
  setUserMode(savedMode);
}

function setUserMode(mode) {
  state.userMode = mode;
  sessionStorage.setItem('vigilant_mode', mode);

  const btnCliente = document.getElementById('btn-mode-cliente');
  const btnFuncionario = document.getElementById('btn-mode-funcionario');
  const banner = document.getElementById('role-banner');
  const bannerBadge = document.getElementById('role-banner-badge');
  const bannerText = document.getElementById('role-banner-text');
  const bannerHelper = document.getElementById('btn-switch-role-helper');
  const labelQuartos = document.getElementById('label-nav-quartos');
  const labelReservas = document.getElementById('label-nav-reservas');

  document.body.classList.toggle('mode-cliente', mode === 'cliente');
  document.body.classList.toggle('mode-funcionario', mode === 'funcionario');

  if (btnCliente) btnCliente.classList.toggle('active', mode === 'cliente');
  if (btnFuncionario) {
    btnFuncionario.classList.toggle('active', mode === 'funcionario');
    btnFuncionario.classList.toggle('mode-staff', mode === 'funcionario');
  }

  if (mode === 'cliente') {
    if (banner) {
      banner.className = 'role-banner role-banner-cliente';
    }
    if (bannerBadge) bannerBadge.textContent = 'Área do Cliente';
    if (bannerText) bannerText.textContent = 'Bem-vindo(a) ao Hotel Vigilant! Consulte quartos disponíveis, faça reservas e acompanhe seus agendamentos.';
    if (bannerHelper) {
      bannerHelper.textContent = 'Acessar Área do Funcionário (Recepção) →';
      bannerHelper.className = 'btn btn-outline-primary btn-sm';
    }
    if (labelQuartos) labelQuartos.textContent = 'Quartos Disponíveis';
    if (labelReservas) labelReservas.textContent = 'Minhas Reservas';

    // Se estiver em uma aba restrita ao funcionário, volta para quartos
    if (state.activeTab === 'tab-recepcao' || state.activeTab === 'tab-relatorios') {
      switchTab('tab-quartos');
    }
  } else {
    if (banner) {
      banner.className = 'role-banner role-banner-funcionario';
    }
    if (bannerBadge) bannerBadge.textContent = 'Área do Funcionário (Recepção)';
    if (bannerText) bannerText.textContent = 'Painel da Recepção & Governança • Realize Check-in (Req 3.3), Check-out (Req 3.4), controle ocupações e emita relatórios.';
    if (bannerHelper) {
      bannerHelper.textContent = '← Voltar para Área do Cliente (Hóspede)';
      bannerHelper.className = 'btn btn-outline-primary btn-sm';
    }
    if (labelQuartos) labelQuartos.textContent = 'Gestão de Quartos & Ocupação';
    if (labelReservas) labelReservas.textContent = 'Todas as Reservas';
  }

  renderQuartosTable();
  renderReservasTable();
}

/* ====================================================================
   AUTENTICAÇÃO & USUÁRIO (Requisito 3.1)
   ==================================================================== */
function initAuth() {
  const savedUser = sessionStorage.getItem('vigilant_user');
  if (savedUser) {
    try {
      state.currentUser = JSON.parse(savedUser);
      renderUserSession();
    } catch (e) {
      sessionStorage.removeItem('vigilant_user');
    }
  }

  const toggleLogin = document.getElementById('auth-toggle-login');
  const toggleCadastro = document.getElementById('auth-toggle-cadastro');
  const formLogin = document.getElementById('form-login');
  const formCadastro = document.getElementById('form-cadastro');

  toggleLogin.addEventListener('click', () => {
    formLogin.style.display = 'block';
    formCadastro.style.display = 'none';
    toggleLogin.className = 'btn btn-outline-primary';
    toggleCadastro.className = 'btn btn-secondary';
  });

  toggleCadastro.addEventListener('click', () => {
    formLogin.style.display = 'none';
    formCadastro.style.display = 'block';
    toggleLogin.className = 'btn btn-secondary';
    toggleCadastro.className = 'btn btn-outline-primary';
  });

  // Submit Login
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    try {
      const res = await api.login(email, senha);
      state.currentUser = res.cliente;
      sessionStorage.setItem('vigilant_user', JSON.stringify(res.cliente));
      renderUserSession();
      closeModal('modal-auth');

      // Se for funcionário, ativa automaticamente a área do funcionário
      const isFunc = (res.cliente.tipoPerfil === 'FUNCIONARIO') || (res.cliente.codigoCliente && res.cliente.codigoCliente.startsWith('FUNC'));
      if (isFunc) {
        res.cliente.tipoPerfil = 'FUNCIONARIO';
        setUserMode('funcionario');
        showToast(`Bem-vindo(a) à Recepção, ${res.cliente.nome}!`, 'success');
      } else {
        res.cliente.tipoPerfil = 'CLIENTE';
        setUserMode('cliente');
        showToast(`Bem-vindo(a), ${res.cliente.nome}!`, 'success');
      }

      preencherCodigoClienteCampos();
    } catch (err) {
      alert(`Falha no login: ${err.message}`);
    }
  });

  // Submit Cadastro (Requisito 3.1)
  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();
    const clienteData = {
      nome: document.getElementById('cad-nome').value,
      email: document.getElementById('cad-email').value,
      senha: document.getElementById('cad-senha').value,
      telefone: document.getElementById('cad-telefone').value,
      cpf: document.getElementById('cad-cpf').value
    };

    try {
      const res = await api.cadastrar(clienteData);
      state.currentUser = res.cliente;
      sessionStorage.setItem('vigilant_user', JSON.stringify(res.cliente));
      renderUserSession();
      closeModal('modal-auth');
      setUserMode('cliente');
      showToast(`Cadastro realizado com sucesso! Seu código é: ${res.cliente.codigoCliente}`, 'success');
      preencherCodigoClienteCampos();
    } catch (err) {
      alert(`Erro no cadastro: ${err.message}`);
    }
  });
}

function renderUserSession() {
  const container = document.getElementById('user-session-container');
  if (state.currentUser) {
    const isFunc = (state.currentUser.tipoPerfil === 'FUNCIONARIO') || (state.currentUser.codigoCliente && state.currentUser.codigoCliente.startsWith('FUNC'));
    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="text-align: right; line-height: 1.2;">
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 0.35rem; justify-content: flex-end;">
            <span>${state.currentUser.nome}</span>
            <span class="badge" style="font-size: 0.65rem; padding: 0.1rem 0.35rem; background: ${isFunc ? '#fef3c7' : '#dbeafe'}; color: ${isFunc ? '#b45309' : '#1d4ed8'}; border: 1px solid ${isFunc ? '#fcd34d' : '#bfdbfe'};">
              ${isFunc ? 'Recepção' : 'Hóspede'}
            </span>
          </div>
          <div style="font-size: 0.74rem; color: var(--primary); font-family: var(--font-mono); font-weight: 600;">Cód: ${state.currentUser.codigoCliente}</div>
        </div>
        <button id="btn-logout" class="btn btn-secondary btn-sm">Sair</button>
      </div>
    `;
    document.getElementById('btn-logout').addEventListener('click', () => {
      state.currentUser = null;
      sessionStorage.removeItem('vigilant_user');
      renderUserSession();
      setUserMode('cliente');
      showToast('Sessão encerrada.', 'info');
    });
  } else {
    container.innerHTML = `
      <button id="btn-open-auth-modal" class="btn btn-primary btn-sm">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Entrar / Cadastrar (Req 3.1)
      </button>
    `;
    document.getElementById('btn-open-auth-modal').addEventListener('click', () => openModal('modal-auth'));
  }
}

function preencherCodigoClienteCampos() {
  if (!state.currentUser) return;
  const campoCheckin = document.getElementById('checkin-codigo-cliente');
  const campoReserva = document.getElementById('reserva-codigo-cliente');
  if (campoCheckin) campoCheckin.value = state.currentUser.codigoCliente;
  if (campoReserva) campoReserva.value = state.currentUser.codigoCliente;
}

/* ====================================================================
   NAVEGAÇÃO DE ABAS
   ==================================================================== */
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      switchTab(targetId);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  const activeBtn = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
  const activeContent = document.getElementById(tabId);

  if (activeBtn) activeBtn.classList.add('active');
  if (activeContent) activeContent.classList.add('active');
  state.activeTab = tabId;

  // Atualiza dados conforme a aba
  if (tabId === 'tab-quartos') carregarQuartos();
  if (tabId === 'tab-reservas') carregarReservas();
  if (tabId === 'tab-recepcao') carregarHospedagensAtivas();
  if (tabId === 'tab-relatorios') carregarHistorico();
}

/* ====================================================================
   FILTROS E BUSCA DE QUARTOS (Requisito 3.2)
   ==================================================================== */
function initFilters() {
  document.getElementById('btn-filtrar-quartos').addEventListener('click', () => {
    const tipo = document.getElementById('filter-tipo').value;
    const precoMax = document.getElementById('filter-preco').value;
    const capacidade = document.getElementById('filter-capacidade').value;
    carregarQuartos({ tipo, precoMax, capacidade });
  });

  document.getElementById('btn-limpar-filtros').addEventListener('click', () => {
    document.getElementById('filter-tipo').value = '';
    document.getElementById('filter-preco').value = '';
    document.getElementById('filter-capacidade').value = '';
    carregarQuartos();
  });
}

async function carregarQuartos(filtros = {}) {
  const tbody = document.getElementById('table-quartos-body');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Buscando quartos...</td></tr>';

  try {
    const quartos = await api.buscarQuartosDisponiveis(filtros);
    state.rooms = quartos;
    renderQuartosTable();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="color: var(--danger); text-align: center;">Falha ao carregar quartos: ${err.message}</td></tr>`;
  }
}

function renderQuartosTable() {
  const tbody = document.getElementById('table-quartos-body');
  if (!tbody || !state.rooms) return;

  if (state.rooms.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Nenhum quarto disponível encontrado.</td></tr>';
    atualizarIndicadores();
    return;
  }

  const isFuncionario = state.userMode === 'funcionario';

  tbody.innerHTML = state.rooms.map(quarto => `
    <tr>
      <td><span class="badge badge-code">${quarto.codigoQuarto}</span></td>
      <td><strong>${quarto.numero}</strong></td>
      <td>${quarto.nome}</td>
      <td>${quarto.tipo}</td>
      <td>${quarto.capacidadeMaxima} pessoa(s)</td>
      <td><strong>R$ ${Number(quarto.precoUnitario).toFixed(2)}</strong></td>
      <td><span class="badge badge-${quarto.status.toLowerCase()}">${quarto.status}</span></td>
      <td style="text-align: right;">
        <div style="display: inline-flex; gap: 0.35rem;">
          <button class="btn btn-primary btn-sm btn-reservar-card" data-code="${quarto.codigoQuarto}">
            Reservar
          </button>
          ${isFuncionario ? `
            <button class="btn btn-secondary btn-sm btn-checkin-card" data-code="${quarto.codigoQuarto}" title="Iniciar Check-in Imediato para este quarto">
              Check-in
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');

  atualizarIndicadores();

  // Listeners dos botões da tabela
  tbody.querySelectorAll('.btn-reservar-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const cod = btn.getAttribute('data-code');
      abrirModalReservaComQuarto(cod);
    });
  });

  if (isFuncionario) {
    tbody.querySelectorAll('.btn-checkin-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const cod = btn.getAttribute('data-code');
        switchTab('tab-recepcao');
        document.getElementById('checkin-codigo-item').value = cod;
        preencherCodigoClienteCampos();
      });
    });
  }
}

/* ====================================================================
   RESERVAS (Requisito 3.2 e 3.3)
   ==================================================================== */
function abrirModalReservaComQuarto(codigoQuarto) {
  document.getElementById('reserva-codigo-quarto').value = codigoQuarto;
  preencherCodigoClienteCampos();
  openModal('modal-reserva');
}

async function carregarReservas() {
  const tbody = document.getElementById('table-reservas-body');
  if (!tbody) return;
  try {
    const reservas = await api.listarReservas();
    state.reservas = reservas;
    renderReservasTable();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" style="color: var(--danger); text-align: center;">Falha ao carregar reservas: ${err.message}</td></tr>`;
  }
}

function renderReservasTable() {
  const tbody = document.getElementById('table-reservas-body');
  if (!tbody || !state.reservas) return;

  const isFuncionario = state.userMode === 'funcionario';
  
  // Em modo cliente, se o cliente estiver logado, destaca suas reservas
  let reservasParaExibir = state.reservas;
  if (!isFuncionario && state.currentUser && state.currentUser.codigoCliente) {
    const minhas = state.reservas.filter(r => r.codigo_cliente === state.currentUser.codigoCliente);
    if (minhas.length > 0) {
      reservasParaExibir = minhas;
    }
  }

  if (reservasParaExibir.length === 0) {
    const msg = !isFuncionario && state.currentUser 
      ? 'Você ainda não possui reservas ativas registradas. Escolha um quarto e faça sua reserva!' 
      : 'Nenhuma reserva encontrada.';
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">${msg}</td></tr>`;
    atualizarIndicadores();
    return;
  }

  tbody.innerHTML = reservasParaExibir.map(r => `
    <tr>
      <td><span class="badge badge-code">${r.codigo_reserva}</span></td>
      <td><span class="badge badge-code">${r.codigo_cliente}</span></td>
      <td><strong>${r.cliente_nome}</strong></td>
      <td>${r.quarto_nome} (Nº ${r.quarto_numero})</td>
      <td>${r.data_prevista_entrada}</td>
      <td>${r.data_prevista_saida}</td>
      <td>${r.num_hospedes}</td>
      <td><span class="badge badge-${r.status === 'CONFIRMADA' ? 'confirmada' : 'disponivel'}">${r.status}</span></td>
      <td style="text-align: right;">
        ${r.status === 'CONFIRMADA' ? (
          isFuncionario ? `
            <button class="btn btn-outline-primary btn-sm btn-checkin-reserva" 
                    data-reserva="${r.codigo_reserva}" 
                    data-cliente="${r.codigo_cliente}" 
                    data-quarto="${r.codigo_quarto}"
                    data-saida="${r.data_prevista_saida}"
                    data-hospedes="${r.num_hospedes}"
                    title="Realizar Check-in desta reserva na recepção">
              Check-in
            </button>
          ` : `
            <span class="badge badge-confirmada" style="font-size: 0.72rem;">Check-in no balcão</span>
          `
        ) : '<span style="color: var(--text-muted); font-size: 0.8rem;">Concluída</span>'}
      </td>
    </tr>
  `).join('');

  atualizarIndicadores();

  if (isFuncionario) {
    tbody.querySelectorAll('.btn-checkin-reserva').forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab('tab-recepcao');
        document.getElementById('checkin-codigo-cliente').value = btn.getAttribute('data-cliente');
        document.getElementById('checkin-codigo-item').value = btn.getAttribute('data-quarto');
        document.getElementById('checkin-codigo-reserva').value = btn.getAttribute('data-reserva');
        document.getElementById('checkin-previsao-saida').value = btn.getAttribute('data-saida');
        document.getElementById('checkin-num-hospedes').value = btn.getAttribute('data-hospedes');
      });
    });
  }
}

/* ====================================================================
   CHECK-IN E HOSPEDAGENS ATIVAS (Requisito 3.3)
   ==================================================================== */
async function carregarHospedagensAtivas() {
  const tbody = document.getElementById('table-ativas-body');
  try {
    const ativas = await api.listarHospedagensAtivas();
    state.hospedagensAtivas = ativas;

    if (ativas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Nenhuma hospedagem em andamento no momento.</td></tr>';
      return;
    }

    tbody.innerHTML = ativas.map(h => `
      <tr>
        <td><span class="badge badge-code">${h.codigo_hospedagem}</span></td>
        <td><strong>${h.cliente_nome}</strong> <span style="color: var(--text-muted);">(${h.codigo_cliente})</span></td>
        <td><strong>Nº ${h.quarto_numero}</strong> • ${h.quarto_tipo}</td>
        <td>${new Date(h.data_entrada).toLocaleString('pt-BR')}</td>
        <td style="text-align: right;">
          <button class="btn btn-danger btn-sm btn-fazer-checkout" data-id="${h.id}" data-codigo="${h.codigo_hospedagem}">
            Check-out
          </button>
        </td>
      </tr>
    `).join('');

    atualizarIndicadores();

    document.querySelectorAll('.btn-fazer-checkout').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const codigo = btn.getAttribute('data-codigo');
        if (confirm(`Deseja finalizar a hospedagem ${codigo} e emitir o relatório de check-out?`)) {
          await executarCheckOut(id, codigo);
        }
      });
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="color: var(--danger);">Erro ao carregar hospedagens ativas: ${err.message}</td></tr>`;
  }
}

/* ====================================================================
   CHECK-OUT E RELATÓRIO OFICIAL 3.4 (Requisito 3.4)
   ==================================================================== */
async function executarCheckOut(id, codigoHospedagem) {
  try {
    const res = await api.realizarCheckOut({ id, codigoHospedagem });
    showToast('Check-out realizado com sucesso!', 'success');
    
    // Atualiza listagens
    carregarHospedagensAtivas();
    carregarQuartos();
    carregarHistorico();

    // Exibe o relatório formatado do Requisito 3.4
    exibirRelatorioModal(res.relatorio);
  } catch (err) {
    alert(`Erro ao realizar check-out: ${err.message}`);
  }
}

function exibirRelatorioModal(relatorio) {
  document.getElementById('receipt-codigo-hospedagem').textContent = `CÓDIGO DE ESTADIA: ${relatorio.codigoHospedagem}`;
  
  // Item A: Nome e código do cliente
  document.getElementById('receipt-cliente-nome').textContent = relatorio.cliente.nome;
  document.getElementById('receipt-cliente-codigo').textContent = `Código: ${relatorio.cliente.codigo}`;

  // Item B: Número do quarto, tipo e valor unitário
  document.getElementById('receipt-quarto-numero').textContent = `Quarto Nº ${relatorio.quarto.numero}`;
  document.getElementById('receipt-quarto-tipo').textContent = relatorio.quarto.tipo;
  document.getElementById('receipt-valor-unitario').textContent = `R$ ${Number(relatorio.quarto.valorUnitario).toFixed(2)}`;

  // Item C: Data de entrada
  document.getElementById('receipt-data-entrada').textContent = new Date(relatorio.dataEntrada).toLocaleString('pt-BR');

  // Item D: Data de saída
  document.getElementById('receipt-data-saida').textContent = new Date(relatorio.dataSaida).toLocaleString('pt-BR');

  // Item E: Número de hóspedes
  document.getElementById('receipt-num-hospedes').textContent = `${relatorio.numHospedes} pessoa(s)`;

  // Cálculo de diárias
  const dEntrada = new Date(relatorio.dataEntrada);
  const dSaida = new Date(relatorio.dataSaida);
  const diffDays = Math.max(1, Math.ceil(Math.abs(dSaida - dEntrada) / (1000 * 60 * 60 * 24)));
  document.getElementById('receipt-diarias-calc').textContent = `${diffDays} diária(s)`;

  // Item F: Valor total
  document.getElementById('receipt-valor-total').textContent = `R$ ${Number(relatorio.valorTotal).toFixed(2)}`;

  openModal('modal-relatorio');
}

async function carregarHistorico() {
  const tbody = document.getElementById('table-historico-body');
  try {
    const historico = await api.listarHistoricoHospedagens();
    state.historico = historico;

    const finalizadas = historico.filter(h => h.status === 'FINALIZADA');

    if (finalizadas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Nenhum relatório emitido até o momento.</td></tr>';
      return;
    }

    tbody.innerHTML = finalizadas.map(h => `
      <tr>
        <td><span class="badge badge-code">${h.codigo_hospedagem}</span></td>
        <td><strong>${h.cliente_nome}</strong> <span style="color: var(--text-muted);">(${h.codigo_cliente})</span></td>
        <td><strong>Nº ${h.quarto_numero}</strong> • ${h.quarto_tipo}</td>
        <td>${new Date(h.data_entrada).toLocaleString('pt-BR')}</td>
        <td>${new Date(h.data_saida).toLocaleString('pt-BR')}</td>
        <td><strong style="color: var(--primary);">R$ ${Number(h.valor_total).toFixed(2)}</strong></td>
        <td style="text-align: right;">
          <button class="btn btn-outline-primary btn-sm btn-ver-relatorio" data-id="${h.id}">
            Ver Relatório
          </button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.btn-ver-relatorio').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          const relatorio = await api.obterRelatorioCheckOut(id);
          exibirRelatorioModal(relatorio);
        } catch (err) {
          alert('Erro ao carregar relatório: ' + err.message);
        }
      });
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color: var(--danger);">Falha ao carregar histórico: ${err.message}</td></tr>`;
  }
}

/* ====================================================================
   INICIALIZAÇÃO DE FORMULÁRIOS & MODAIS
   ==================================================================== */
function initForms() {
  // Formulário de Check-in (Requisito 3.3)
  const formCheckin = document.getElementById('form-checkin');
  formCheckin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dados = {
      codigoCliente: document.getElementById('checkin-codigo-cliente').value.trim(),
      codigoItem: document.getElementById('checkin-codigo-item').value.trim(),
      dataEntrada: document.getElementById('checkin-data-entrada').value,
      dataPrevisaoSaida: document.getElementById('checkin-previsao-saida').value,
      numHospedes: document.getElementById('checkin-num-hospedes').value,
      codigoReserva: document.getElementById('checkin-codigo-reserva').value.trim() || null
    };

    try {
      const res = await api.realizarCheckIn(dados);
      showToast(res.mensagem, 'success');
      formCheckin.reset();
      preencherCodigoClienteCampos();
      carregarHospedagensAtivas();
      carregarQuartos();
      carregarReservas();
    } catch (err) {
      alert(`Falha no check-in: ${err.message}`);
    }
  });

  // Formulário de Reserva (Requisito 3.2 e 3.3)
  const formReserva = document.getElementById('form-reserva');
  formReserva.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dados = {
      codigoCliente: document.getElementById('reserva-codigo-cliente').value.trim(),
      codigoQuarto: document.getElementById('reserva-codigo-quarto').value.trim(),
      dataPrevistaEntrada: document.getElementById('reserva-data-entrada').value,
      dataPrevistaSaida: document.getElementById('reserva-data-saida').value,
      numHospedes: document.getElementById('reserva-num-hospedes').value
    };

    try {
      const res = await api.criarReserva(dados);
      showToast(`Reserva confirmada! Código: ${res.codigoReserva}`, 'success');
      formReserva.reset();
      closeModal('modal-reserva');
      carregarReservas();
      switchTab('tab-reservas');
    } catch (err) {
      alert(`Erro na reserva: ${err.message}`);
    }
  });

  // Botão Nova Reserva
  const btnAbrirReserva = document.getElementById('btn-abrir-modal-reserva');
  if (btnAbrirReserva) {
    btnAbrirReserva.addEventListener('click', () => {
      preencherCodigoClienteCampos();
      openModal('modal-reserva');
    });
  }

  // Busca de reserva por código
  const btnConsultar = document.getElementById('btn-consultar-reserva');
  if (btnConsultar) {
    btnConsultar.addEventListener('click', async () => {
      const cod = document.getElementById('input-busca-reserva').value.trim();
      if (!cod) return alert('Digite o código da reserva.');
      try {
        const res = await api.consultarReserva(cod);
        alert(`Reserva Encontrada!\nCódigo: ${res.reserva.codigoReserva}\nCliente: ${res.cliente ? res.cliente.nome : 'N/A'}\nQuarto: ${res.quarto ? res.quarto.nome : 'N/A'}\nStatus: ${res.reserva.status}`);
      } catch (err) {
        alert('Reserva não encontrada: ' + err.message);
      }
    });
  }
}

function initModals() {
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      closeModal(modalId);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function initPrintButton() {
  const btn = document.getElementById('btn-imprimir-relatorio');
  if (btn) {
    btn.addEventListener('click', () => {
      window.print();
    });
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `app-toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function atualizarIndicadores() {
  const statTotal = document.getElementById('stat-total-quartos');
  const statDisp = document.getElementById('stat-disponiveis');
  const statOcup = document.getElementById('stat-ocupados');
  const statRes = document.getElementById('stat-reservas');

  if (statTotal && state.rooms) {
    statTotal.textContent = state.rooms.length;
  }
  if (statDisp && state.rooms) {
    const disp = state.rooms.filter(r => r.status === 'DISPONIVEL').length;
    statDisp.textContent = disp;
  }
  if (statOcup && state.hospedagensAtivas) {
    statOcup.textContent = state.hospedagensAtivas.length;
  }
  if (statRes && state.reservas) {
    const confirmadas = state.reservas.filter(r => r.status === 'CONFIRMADA').length;
    statRes.textContent = confirmadas;
  }
}
