import { api } from './api.js';
import { initPWA } from './pwa.js';

// Estado global da aplicação
const state = {
  currentUser: null,
  route: '/', // '/' ou '/recepcao' ou '/minhas-reservas'
  guestSubtab: 'tab-vitrine',
  staffSubtab: 'tab-staff-checkin',
  rooms: [],
  reservas: [],
  hospedagensAtivas: [],
  historico: []
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
  initPWA();
  initAuth();
  initRouting();
  initTabs();
  initFilters();
  initModals();
  initForms();
  initPrintButton();
  initDemoButtons();

  // Datas padrão para os filtros e formulários
  initDefaultDates();

  // Carregamento inicial de dados
  carregarQuartos();
  carregarReservas();
  carregarHospedagensAtivas();
  carregarHistorico();
});



/* ====================================================================
   ROTEAMENTO E CONTROLE DE ACESSO (RBAC)
   ==================================================================== */
function initRouting() {
  // Trata navegação no clique de links internos
  const brandLink = document.getElementById('brand-home-link');
  if (brandLink) {
    brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('/');
    });
  }

  const footerLink = document.getElementById('link-footer-reception');
  if (footerLink) {
    footerLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.route === '/recepcao') {
        navigateTo('/');
      } else {
        navigateTo('/recepcao');
      }
    });
  }

  const btnBackGuest = document.getElementById('btn-back-to-guest');
  if (btnBackGuest) {
    btnBackGuest.addEventListener('click', () => navigateTo('/'));
  }

  const btnGateBack = document.getElementById('btn-gate-back-guest');
  if (btnGateBack) {
    btnGateBack.addEventListener('click', () => navigateTo('/'));
  }

  const btnGateLogin = document.getElementById('btn-gate-login');
  if (btnGateLogin) {
    btnGateLogin.addEventListener('click', () => {
      openAuthModal('login');
      // Preenche credenciais de funcionário para conveniência
      document.getElementById('login-email').value = 'recepcao@hotelvigilant.com';
      document.getElementById('login-senha').value = 'admin123';
    });
  }

  // Monitora alterações de URL (botões voltar/avançar do navegador)
  window.addEventListener('popstate', () => {
    handleRoute(window.location.pathname);
  });

  // Rota inicial na carga da página
  const initialPath = window.location.pathname || '/';
  handleRoute(initialPath, false);
}

function navigateTo(path, pushState = true) {
  if (pushState) {
    window.history.pushState({}, '', path);
  }
  handleRoute(path);
}

function handleRoute(path) {
  const isReception = path.includes('/recepcao') || path.includes('/admin');
  const isMinhasReservas = path.includes('/minhas-reservas');

  state.route = isReception ? '/recepcao' : (isMinhasReservas ? '/minhas-reservas' : '/');

  const viewGuest = document.getElementById('view-guest');
  const viewReception = document.getElementById('view-reception');
  const navGuest = document.getElementById('nav-container-guest');
  const navStaff = document.getElementById('nav-container-staff');
  const labelFooterReception = document.getElementById('label-footer-reception');

  if (isReception) {
    // Visão da Recepção
    if (viewGuest) viewGuest.classList.remove('active');
    if (viewReception) viewReception.classList.add('active');
    if (navGuest) navGuest.style.display = 'none';

    if (labelFooterReception) {
      labelFooterReception.textContent = '← Voltar para a Área do Hóspede (Vitrine)';
    }

    const isStaff = state.currentUser && (
      state.currentUser.tipoPerfil === 'FUNCIONARIO' || 
      (state.currentUser.codigoCliente && state.currentUser.codigoCliente.startsWith('FUNC'))
    );

    const gate = document.getElementById('reception-gate');
    const dashboard = document.getElementById('reception-dashboard');

    if (isStaff) {
      if (gate) gate.style.display = 'none';
      if (dashboard) dashboard.style.display = 'block';
      if (navStaff) navStaff.style.display = 'block';

      // Atualiza os dados operacionais
      carregarQuartos();
      carregarHospedagensAtivas();
      carregarReservas();
      carregarHistorico();
    } else {
      if (gate) gate.style.display = 'block';
      if (dashboard) dashboard.style.display = 'none';
      if (navStaff) navStaff.style.display = 'none';
    }

  } else {
    // Visão do Hóspede
    if (viewReception) viewReception.classList.remove('active');
    if (viewGuest) viewGuest.classList.add('active');
    if (navGuest) navGuest.style.display = 'block';
    if (navStaff) navStaff.style.display = 'none';

    if (labelFooterReception) {
      labelFooterReception.textContent = 'Acesso Corporativo / Área do Funcionário';
    }

    if (isMinhasReservas) {
      switchGuestSubtab('tab-minhas-reservas');
    } else {
      switchGuestSubtab('tab-vitrine');
    }
  }
}

/* ====================================================================
   AUTENTICAÇÃO & USUÁRIO (Requisito 3.1)
   ==================================================================== */
function initAuth() {
  const savedUser = localStorage.getItem('vigilant_user') || sessionStorage.getItem('vigilant_user');
  if (savedUser) {
    try {
      state.currentUser = JSON.parse(savedUser);
    } catch (e) {
      localStorage.removeItem('vigilant_user');
      sessionStorage.removeItem('vigilant_user');
      state.currentUser = null;
    }
  }

  // Renderiza imediatamente o cabeçalho no estado adequado
  renderUserSession();

  const toggleLogin = document.getElementById('auth-toggle-login');
  const toggleCadastro = document.getElementById('auth-toggle-cadastro');
  const formLogin = document.getElementById('form-login');
  const formCadastro = document.getElementById('form-cadastro');

  if (toggleLogin) {
    toggleLogin.addEventListener('click', () => openAuthModal('login'));
  }

  if (toggleCadastro) {
    toggleCadastro.addEventListener('click', () => openAuthModal('cadastro'));
  }

  // Delegated listener para cliques em botões de abertura do modal de autenticação
  document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-open-auth-modal') || e.target.closest('.btn-trigger-auth-modal')) {
      e.preventDefault();
      openAuthModal('login');
    }
    if (e.target.closest('.btn-ir-para-vitrine')) {
      e.preventDefault();
      switchGuestSubtab('tab-vitrine');
    }
  });

  // Submit Login
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const senha = document.getElementById('login-senha').value;

      try {
        const res = await api.login(email, senha);
        state.currentUser = res.cliente;
        localStorage.setItem('vigilant_user', JSON.stringify(res.cliente));
        sessionStorage.setItem('vigilant_user', JSON.stringify(res.cliente));
        renderUserSession();
        closeModal('modal-auth');

        // Redirecionamento inteligente baseado no perfil
        const isFunc = (res.cliente.tipoPerfil === 'FUNCIONARIO') || 
                       (res.cliente.codigoCliente && res.cliente.codigoCliente.startsWith('FUNC'));

        if (isFunc) {
          res.cliente.tipoPerfil = 'FUNCIONARIO';
          navigateTo('/recepcao');
          showToast(`Bem-vindo(a) à Recepção, ${res.cliente.nome}!`, 'success');
        } else {
          res.cliente.tipoPerfil = 'CLIENTE';
          if (state.route === '/recepcao') {
            navigateTo('/minhas-reservas');
          } else {
            handleRoute(state.route);
            carregarReservas();
          }
          showToast(`Bem-vindo(a), ${res.cliente.nome}!`, 'success');
        }

        preencherCodigoClienteCampos();
      } catch (err) {
        alert(`Falha no login: ${err.message}`);
      }
    });
  }

  // Submit Cadastro (Requisito 3.1)
  if (formCadastro) {
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
        res.cliente.tipoPerfil = 'CLIENTE';
        localStorage.setItem('vigilant_user', JSON.stringify(res.cliente));
        sessionStorage.setItem('vigilant_user', JSON.stringify(res.cliente));
        renderUserSession();
        closeModal('modal-auth');
        navigateTo('/');
        carregarReservas();
        showToast(`Cadastro realizado com sucesso! Seu código é: ${res.cliente.codigoCliente}`, 'success');
        preencherCodigoClienteCampos();
      } catch (err) {
        alert(`Erro no cadastro: ${err.message}`);
      }
    });
  }
}

function openAuthModal(tab = 'login') {
  const toggleLogin = document.getElementById('auth-toggle-login');
  const toggleCadastro = document.getElementById('auth-toggle-cadastro');
  const formLogin = document.getElementById('form-login');
  const formCadastro = document.getElementById('form-cadastro');

  if (tab === 'cadastro') {
    if (formLogin) formLogin.style.display = 'none';
    if (formCadastro) formCadastro.style.display = 'block';
    if (toggleLogin) toggleLogin.className = 'btn btn-secondary';
    if (toggleCadastro) toggleCadastro.className = 'btn btn-primary';
  } else {
    if (formLogin) formLogin.style.display = 'block';
    if (formCadastro) formCadastro.style.display = 'none';
    if (toggleLogin) toggleLogin.className = 'btn btn-primary';
    if (toggleCadastro) toggleCadastro.className = 'btn btn-secondary';
  }

  openModal('modal-auth');
}

function initDemoButtons() {
  const btnDemoCliente = document.getElementById('btn-fill-demo-cliente');
  const btnDemoFuncionario = document.getElementById('btn-fill-demo-funcionario');

  if (btnDemoCliente) {
    btnDemoCliente.addEventListener('click', () => {
      openAuthModal('login');
      document.getElementById('login-email').value = 'cliente@hotelvigilant.com';
      document.getElementById('login-senha').value = '123456';
    });
  }

  if (btnDemoFuncionario) {
    btnDemoFuncionario.addEventListener('click', () => {
      openAuthModal('login');
      document.getElementById('login-email').value = 'recepcao@hotelvigilant.com';
      document.getElementById('login-senha').value = 'admin123';
    });
  }
}

function renderUserSession() {
  const container = document.getElementById('user-session-container');
  if (!container) return;

  if (state.currentUser) {
    const isFunc = (state.currentUser.tipoPerfil === 'FUNCIONARIO') || 
                   (state.currentUser.codigoCliente && state.currentUser.codigoCliente.startsWith('FUNC'));
    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="text-align: right; line-height: 1.25;">
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 0.35rem; justify-content: flex-end;">
            <span>Olá, <strong>${state.currentUser.nome.split(' ')[0]}</strong></span>
            <span class="badge badge-code" style="font-size: 0.7rem; padding: 0.1rem 0.4rem;">[${state.currentUser.codigoCliente}]</span>
            ${isFunc ? '<span class="badge" style="font-size: 0.65rem; padding: 0.1rem 0.35rem; background: #fef3c7; color: #b45309; border: 1px solid #fcd34d;">Recepção</span>' : ''}
          </div>
        </div>
        <button id="btn-logout" class="btn btn-secondary btn-sm" title="Encerrar sessão atual">Sair</button>
      </div>
    `;

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        state.currentUser = null;
        localStorage.removeItem('vigilant_user');
        sessionStorage.removeItem('vigilant_user');
        renderUserSession();
        if (state.route === '/recepcao') {
          handleRoute('/recepcao');
        } else {
          carregarReservas();
        }
        showToast('Sessão finalizada com sucesso.', 'info');
      });
    }
  } else {
    container.innerHTML = `
      <button id="btn-open-auth-modal" class="btn btn-primary btn-sm" title="Fazer login ou cadastrar nova conta">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Entrar / Cadastrar</span>
      </button>
    `;

    const btnOpen = document.getElementById('btn-open-auth-modal');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => openAuthModal('login'));
    }
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
   NAVEGAÇÃO DE ABAS INTERNAS (HÓSPEDE E RECEPÇÃO)
   ==================================================================== */
function initTabs() {
  // Abas do Hóspede
  document.querySelectorAll('[data-guest-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-guest-tab');
      switchGuestSubtab(target);
    });
  });

  // Abas da Recepção
  document.querySelectorAll('[data-staff-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-staff-tab');
      switchStaffSubtab(target);
    });
  });
}

function switchGuestSubtab(tabId) {
  state.guestSubtab = tabId;
  document.querySelectorAll('[data-guest-tab]').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.guest-subtab').forEach(c => c.classList.remove('active'));

  const activeBtn = document.querySelector(`[data-guest-tab="${tabId}"]`);
  const activeContent = document.getElementById(tabId);

  if (activeBtn) activeBtn.classList.add('active');
  if (activeContent) activeContent.classList.add('active');

  if (tabId === 'tab-vitrine') carregarQuartos();
  if (tabId === 'tab-minhas-reservas') carregarReservas();
}

function switchStaffSubtab(tabId) {
  state.staffSubtab = tabId;
  document.querySelectorAll('[data-staff-tab]').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.staff-subtab').forEach(c => c.classList.remove('active'));

  const activeBtn = document.querySelector(`[data-staff-tab="${tabId}"]`);
  const activeContent = document.getElementById(tabId);

  if (activeBtn) activeBtn.classList.add('active');
  if (activeContent) activeContent.classList.add('active');

  if (tabId === 'tab-staff-checkin' || tabId === 'tab-staff-quartos') carregarQuartos();
  if (tabId === 'tab-staff-checkout') carregarHospedagensAtivas();
  if (tabId === 'tab-staff-reservas') carregarReservas();
  if (tabId === 'tab-staff-relatorios') carregarHistorico();
}

/* ====================================================================
   FILTROS E BUSCA DE QUARTOS (VITRINE DO HÓSPEDE)
   ==================================================================== */
function initFilters() {
  const btnFiltrar = document.getElementById('btn-filtrar-quartos');
  if (btnFiltrar) {
    btnFiltrar.addEventListener('click', () => {
      const tipo = document.getElementById('filter-tipo').value;
      const precoMax = document.getElementById('filter-preco').value;
      const capacidade = document.getElementById('filter-capacidade').value;
      carregarQuartos({ tipo, precoMax, capacidade });
    });
  }

  const btnLimpar = document.getElementById('btn-limpar-filtros');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      document.getElementById('filter-tipo').value = '';
      document.getElementById('filter-preco').value = '';
      document.getElementById('filter-capacidade').value = '';
      initDefaultDates();
      carregarQuartos();
    });
  }
}

function initDefaultDates() {
  const now = new Date();
  const in2Days = new Date(now);
  in2Days.setDate(in2Days.getDate() + 2);

  const strToday = now.toISOString().split('T')[0];
  const strIn2Days = in2Days.toISOString().split('T')[0];

  const filterEntrada = document.getElementById('filter-data-entrada');
  const filterSaida = document.getElementById('filter-data-saida');
  if (filterEntrada && !filterEntrada.value) filterEntrada.value = strToday;
  if (filterSaida && !filterSaida.value) filterSaida.value = strIn2Days;

  // Preenche data de entrada no formulário de check-in
  const localIsoString = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const dataEntradaInput = document.getElementById('checkin-data-entrada');
  if (dataEntradaInput && !dataEntradaInput.value) dataEntradaInput.value = localIsoString;

  const dataPrevisaoInput = document.getElementById('checkin-previsao-saida');
  if (dataPrevisaoInput && !dataPrevisaoInput.value) dataPrevisaoInput.value = strIn2Days;

  // Preenche datas na modal de reserva
  const reservaEntrada = document.getElementById('reserva-data-entrada');
  const reservaSaida = document.getElementById('reserva-data-saida');
  if (reservaEntrada && !reservaEntrada.value) reservaEntrada.value = strToday;
  if (reservaSaida && !reservaSaida.value) reservaSaida.value = strIn2Days;
}

async function carregarQuartos(filtros = {}) {
  const gridVitrine = document.getElementById('rooms-showcase-grid');
  const tbodyTable = document.getElementById('table-quartos-body');
  const countBadge = document.getElementById('showcase-count-badge');

  if (gridVitrine) {
    gridVitrine.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">Buscando acomodações disponíveis...</div>';
  }
  if (tbodyTable) {
    tbodyTable.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Buscando quartos...</td></tr>';
  }

  try {
    const quartos = await api.buscarQuartosDisponiveis(filtros);
    state.rooms = quartos;

    renderQuartosVitrine();
    renderQuartosTable();

    if (countBadge) {
      countBadge.textContent = `${quartos.length} acomodações disponíveis`;
    }
  } catch (err) {
    if (gridVitrine) {
      gridVitrine.innerHTML = `<div style="grid-column: 1/-1; color: var(--danger); text-align: center;">Falha ao carregar quartos: ${err.message}</div>`;
    }
    if (tbodyTable) {
      tbodyTable.innerHTML = `<tr><td colspan="8" style="color: var(--danger); text-align: center;">Falha ao carregar quartos: ${err.message}</td></tr>`;
    }
  }
}

/* ====================================================================
   APRESENTAÇÃO DOS QUARTOS (VITRINE DO HÓSPEDE EM CARDS)
   ==================================================================== */
function getComodidadesPorTipo(tipo) {
  const t = (tipo || '').toLowerCase();
  if (t.includes('presidencial')) {
    return [
      { icon: '📶', label: 'Wi-Fi Dedicado 1Gbps' },
      { icon: '🛁', label: 'Banheira Hidromassagem' },
      { icon: '📺', label: 'Smart TV 75" 4K' },
      { icon: '🍸', label: 'Bar Privativo' },
      { icon: '🛏️', label: 'Cama Super King' },
      { icon: '🛎️', label: 'Serviço de Mordomo' }
    ];
  }
  if (t.includes('suíte') || t.includes('suite')) {
    return [
      { icon: '📶', label: 'Wi-Fi Ultra' },
      { icon: '❄️', label: 'Ar Split Climatizado' },
      { icon: '🛁', label: 'Banheira de Imersão' },
      { icon: '📺', label: 'Smart TV 65"' },
      { icon: '🛋️', label: 'Sala de Estar Integrada' },
      { icon: '☕', label: 'Cafeteira Nespresso' }
    ];
  }
  if (t.includes('luxo')) {
    return [
      { icon: '📶', label: 'Wi-Fi 5G' },
      { icon: '❄️', label: 'Ar-condicionado Split' },
      { icon: '📺', label: 'Smart TV 55" 4K' },
      { icon: '🛏️', label: 'Cama King Size' },
      { icon: '☕', label: 'Frigobar Completo' },
      { icon: '🔒', label: 'Cofre Digital' }
    ];
  }
  // Standard
  return [
    { icon: '📶', label: 'Wi-Fi Grátis' },
    { icon: '❄️', label: 'Ar-condicionado' },
    { icon: '📺', label: 'Smart TV' },
    { icon: '☕', label: 'Frigobar' },
    { icon: '🚿', label: 'Ducha com Aquecimento' }
  ];
}

function renderQuartosVitrine() {
  const container = document.getElementById('rooms-showcase-grid');
  if (!container || !state.rooms) return;

  if (state.rooms.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-muted);">
        <p style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">Nenhuma acomodação encontrada com esses critérios.</p>
        <p style="font-size: 0.88rem;">Tente ajustar as datas ou o preço máximo nos filtros acima.</p>
      </div>
    `;
    atualizarIndicadores();
    return;
  }

  container.innerHTML = state.rooms.map(quarto => {
    const comodidades = getComodidadesPorTipo(quarto.tipo);
    const tipoClass = (quarto.tipo || 'standard').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    return `
      <div class="room-card" data-room-id="${quarto.codigoQuarto}">
        <div class="room-card-banner ${tipoClass}">
          <span class="room-card-type-tag">${quarto.tipo}</span>
          <span class="room-card-number-badge">Nº ${quarto.numero}</span>
        </div>

        <div class="room-card-body">
          <div class="room-card-title-box">
            <h4 class="room-card-title">${quarto.nome}</h4>
            <span class="badge badge-code" style="font-size: 0.72rem;">${quarto.codigoQuarto}</span>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--text-secondary); font-weight: 600;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Acomoda confortavelmente até <strong>${quarto.capacidadeMaxima} hóspedes</strong></span>
          </div>

          <div class="room-card-amenities">
            ${comodidades.map(c => `
              <span class="amenity-pill">
                <span>${c.icon}</span>
                <span>${c.label}</span>
              </span>
            `).join('')}
          </div>
        </div>

        <div class="room-card-footer">
          <div class="room-card-price">
            <span class="period">Diária a partir de</span>
            <span class="amount">R$ ${Number(quarto.precoUnitario).toFixed(2)}</span>
          </div>

          <button class="btn btn-primary btn-sm btn-reservar-vitrine" data-code="${quarto.codigoQuarto}" data-nome="${quarto.nome}">
            Reservar Quarto
          </button>
        </div>
      </div>
    `;
  }).join('');

  atualizarIndicadores();

  // Listeners dos botões de reserva da vitrine
  container.querySelectorAll('.btn-reservar-vitrine').forEach(btn => {
    btn.addEventListener('click', () => {
      const cod = btn.getAttribute('data-code');
      abrirModalReservaComQuarto(cod);
    });
  });
}

/* ====================================================================
   TABELA DETALHADA DE QUARTOS (ÁREA DA RECEPÇÃO)
   ==================================================================== */
function renderQuartosTable() {
  const tbody = document.getElementById('table-quartos-body');
  if (!tbody || !state.rooms) return;

  if (state.rooms.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Nenhum quarto disponível encontrado.</td></tr>';
    atualizarIndicadores();
    return;
  }

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
          <button class="btn btn-primary btn-sm btn-checkin-table" data-code="${quarto.codigoQuarto}" title="Iniciar Check-in Imediato para este quarto">
            Check-in Imediato
          </button>
          <button class="btn btn-secondary btn-sm btn-reservar-table" data-code="${quarto.codigoQuarto}">
            Reservar
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  atualizarIndicadores();

  tbody.querySelectorAll('.btn-checkin-table').forEach(btn => {
    btn.addEventListener('click', () => {
      const cod = btn.getAttribute('data-code');
      switchStaffSubtab('tab-staff-checkin');
      document.getElementById('checkin-codigo-item').value = cod;
      preencherCodigoClienteCampos();
    });
  });

  tbody.querySelectorAll('.btn-reservar-table').forEach(btn => {
    btn.addEventListener('click', () => {
      const cod = btn.getAttribute('data-code');
      abrirModalReservaComQuarto(cod);
    });
  });
}

/* ====================================================================
   RESERVAS (Requisito 3.2 e 3.3)
   ==================================================================== */
function abrirModalReservaComQuarto(codigoQuarto) {
  document.getElementById('reserva-codigo-quarto').value = codigoQuarto;

  // Se o cliente definiu datas nos filtros da vitrine, aproveita-as na reserva
  const filterEntrada = document.getElementById('filter-data-entrada');
  const filterSaida = document.getElementById('filter-data-saida');
  if (filterEntrada && filterEntrada.value) {
    document.getElementById('reserva-data-entrada').value = filterEntrada.value;
  }
  if (filterSaida && filterSaida.value) {
    document.getElementById('reserva-data-saida').value = filterSaida.value;
  }

  preencherCodigoClienteCampos();
  openModal('modal-reserva');
}

async function carregarReservas() {
  const unauthCard = document.getElementById('reservas-unauth-card');
  const emptyCard = document.getElementById('reservas-empty-card');
  const authContent = document.getElementById('reservas-auth-content');
  const tbodyGuest = document.getElementById('table-reservas-body');
  const tbodyStaff = document.getElementById('table-reservas-staff-body');

  // 1. Visão da Recepção (Gestão de todas as reservas do hotel)
  if (state.route === '/recepcao') {
    try {
      const todasReservas = await api.listarReservas();
      state.reservas = todasReservas;
      renderReservasStaffTable(todasReservas);
    } catch (err) {
      if (tbodyStaff) {
        tbodyStaff.innerHTML = `<tr><td colspan="9" style="color: var(--danger); text-align: center;">Erro ao carregar reservas: ${err.message}</td></tr>`;
      }
    }
    return;
  }

  // 2. Visão do Hóspede (Minhas Reservas)
  // Se o usuário NÃO estiver logado:
  if (!state.currentUser) {
    if (unauthCard) unauthCard.style.display = 'block';
    if (emptyCard) emptyCard.style.display = 'none';
    if (authContent) authContent.style.display = 'none';
    if (tbodyGuest) tbodyGuest.innerHTML = '';
    atualizarIndicadores();
    return;
  }

  // Se o usuário ESTIVER logado:
  if (unauthCard) unauthCard.style.display = 'none';

  try {
    // Consulta à API filtrando estritamente pelo código do cliente autenticado
    const minhasReservas = await api.listarReservas(state.currentUser.codigoCliente);
    // Filtragem de garantia estrita no client-side
    const reservasCliente = (minhasReservas || []).filter(
      r => r.codigo_cliente === state.currentUser.codigoCliente
    );

    if (reservasCliente.length === 0) {
      if (emptyCard) emptyCard.style.display = 'block';
      if (authContent) authContent.style.display = 'none';
    } else {
      if (emptyCard) emptyCard.style.display = 'none';
      if (authContent) authContent.style.display = 'block';
      renderReservasGuestTable(reservasCliente);
    }
  } catch (err) {
    if (authContent) authContent.style.display = 'block';
    if (tbodyGuest) {
      tbodyGuest.innerHTML = `<tr><td colspan="9" style="color: var(--danger); text-align: center;">Falha ao carregar suas reservas: ${err.message}</td></tr>`;
    }
  }

  atualizarIndicadores();
}

function renderReservasGuestTable(reservas) {
  const tbodyGuest = document.getElementById('table-reservas-body');
  if (!tbodyGuest) return;

  tbodyGuest.innerHTML = reservas.map(r => `
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
        <span class="badge badge-confirmada" style="font-size: 0.72rem;">Agendada</span>
      </td>
    </tr>
  `).join('');
}

function renderReservasStaffTable(reservas) {
  const tbodyStaff = document.getElementById('table-reservas-staff-body');
  if (!tbodyStaff) return;

  if (reservas.length === 0) {
    tbodyStaff.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">Nenhuma reserva encontrada no sistema.</td></tr>';
    return;
  }

  tbodyStaff.innerHTML = reservas.map(r => `
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
        ${r.status === 'CONFIRMADA' ? `
          <button class="btn btn-outline-primary btn-sm btn-staff-checkin-reserva" 
                  data-reserva="${r.codigo_reserva}" 
                  data-cliente="${r.codigo_cliente}" 
                  data-quarto="${r.codigo_quarto}"
                  data-saida="${r.data_prevista_saida}"
                  data-hospedes="${r.num_hospedes}">
            Check-in no Balcão
          </button>
        ` : '<span style="color: var(--text-muted); font-size: 0.8rem;">Efetivada</span>'}
      </td>
    </tr>
  `).join('');

  tbodyStaff.querySelectorAll('.btn-staff-checkin-reserva').forEach(btn => {
    btn.addEventListener('click', () => {
      switchStaffSubtab('tab-staff-checkin');
      document.getElementById('checkin-codigo-cliente').value = btn.getAttribute('data-cliente');
      document.getElementById('checkin-codigo-item').value = btn.getAttribute('data-quarto');
      document.getElementById('checkin-codigo-reserva').value = btn.getAttribute('data-reserva');
      document.getElementById('checkin-previsao-saida').value = btn.getAttribute('data-saida');
      document.getElementById('checkin-num-hospedes').value = btn.getAttribute('data-hospedes');
    });
  });
}

/* ====================================================================
   CHECK-IN E HOSPEDAGENS ATIVAS (Requisito 3.3)
   ==================================================================== */
async function carregarHospedagensAtivas() {
  const tbody = document.getElementById('table-ativas-body');
  if (!tbody) return;

  try {
    const ativas = await api.listarHospedagensAtivas();
    state.hospedagensAtivas = ativas;

    if (ativas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Nenhuma hospedagem em andamento no momento.</td></tr>';
      atualizarIndicadores();
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

    tbody.querySelectorAll('.btn-fazer-checkout').forEach(btn => {
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
  if (!tbody) return;

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

    tbody.querySelectorAll('.btn-ver-relatorio').forEach(btn => {
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
  if (formCheckin) {
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
        initDefaultDates();
        preencherCodigoClienteCampos();
        carregarHospedagensAtivas();
        carregarQuartos();
        carregarReservas();
      } catch (err) {
        alert(`Falha no check-in: ${err.message}`);
      }
    });
  }

  // Formulário de Reserva (Requisito 3.2 e 3.3)
  const formReserva = document.getElementById('form-reserva');
  if (formReserva) {
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
        navigateTo('/minhas-reservas');
      } catch (err) {
        alert(`Erro na reserva: ${err.message}`);
      }
    });
  }

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
        alert(`Reserva Localizada!\nCódigo: ${res.reserva.codigoReserva}\nCliente: ${res.cliente ? res.cliente.nome : 'N/A'}\nQuarto: ${res.quarto ? res.quarto.nome : 'N/A'}\nStatus: ${res.reserva.status}`);
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
