// Registro do Service Worker e Gerenciamento da Instalação do PWA
let deferredPrompt = null;

export function initPWA() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((reg) => console.log('🛡️ Service Worker Vigilant registrado com sucesso!', reg.scope))
                .catch((err) => console.warn('⚠️ Falha ao registrar Service Worker:', err));
        });
    }

    const installBtn = document.getElementById('btn-pwa-install');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installBtn) {
            installBtn.style.display = 'inline-flex';
        }
    });

    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`PWA escolha do usuário: ${outcome}`);
            deferredPrompt = null;
            installBtn.style.display = 'none';
        });
    }

    // Monitoramento Online / Offline
    window.addEventListener('offline', () => {
        showToast('Modo Offline ativado. Usando dados armazenados em cache.', 'warning');
    });

    window.addEventListener('online', () => {
        showToast('Conexão restabelecida!', 'success');
    });
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
