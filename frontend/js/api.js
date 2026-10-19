// Cliente HTTP para consumo da API REST do Vigilant Hotel
const API_BASE = (typeof window !== 'undefined' && window.location.port !== '3002' && window.location.hostname === 'localhost')
    ? 'http://localhost:3002/api'
    : '/api';

export const api = {
    async request(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, config);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.erro || `Erro HTTP ${response.status}`);
            }
            return data;
        } catch (error) {
            console.error(`Falha na requisição [${endpoint}]:`, error);
            throw error;
        }
    },

    // 3.1: Cadastro e Autenticação
    cadastrar(clienteData) {
        return this.request('/auth/cadastro', {
            method: 'POST',
            body: JSON.stringify(clienteData),
        });
    },

    login(email, senha) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha }),
        });
    },

    // 3.2: Quartos
    buscarQuartosDisponiveis(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/quartos/disponiveis${query ? `?${query}` : ''}`);
    },

    listarTodosQuartos() {
        return this.request('/quartos');
    },

    // 3.2 e 3.3: Reservas
    criarReserva(reservaData) {
        return this.request('/reservas', {
            method: 'POST',
            body: JSON.stringify(reservaData),
        });
    },

    listarReservas(codigoCliente = '') {
        const query = codigoCliente ? `?codigoCliente=${encodeURIComponent(codigoCliente)}` : '';
        return this.request(`/reservas${query}`);
    },

    consultarReserva(codigoReserva) {
        return this.request(`/reservas/${encodeURIComponent(codigoReserva)}`);
    },

    // 3.3: Check-in
    realizarCheckIn(checkinData) {
        return this.request('/hospedagens/checkin', {
            method: 'POST',
            body: JSON.stringify(checkinData),
        });
    },

    listarHospedagensAtivas() {
        return this.request('/hospedagens/ativas');
    },

    listarHistoricoHospedagens() {
        return this.request('/hospedagens/historico');
    },

    // 3.4: Check-out
    realizarCheckOut(checkoutData) {
        return this.request('/hospedagens/checkout', {
            method: 'POST',
            body: JSON.stringify(checkoutData),
        });
    },

    obterRelatorioCheckOut(hospedagemId) {
        return this.request(`/hospedagens/${hospedagemId}/relatorio`);
    }
};
