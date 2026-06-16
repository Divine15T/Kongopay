// Script commun pour KongoPay

// Configuration de l'API
const API_URL = 'http://localhost:3000';

// Fonction utilitaire pour faire des appels API
async function apiCall(endpoint, method, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response;
}

// ==================== PAGE INSCRIPTION ====================

// Gestion de la copie pour les boutons avec data-target
document.querySelectorAll('.copy-key-btn[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const textToCopy = document.getElementById(targetId).innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Copié dans le presse-papier');
        });
    });
});

// Gestion du bouton "Copier la clé" spécifique
const copyKeyBtn = document.getElementById('copyKeyBtn');
if (copyKeyBtn) {
    copyKeyBtn.addEventListener('click', () => {
        const keyText = document.getElementById('key-display').innerText;
        navigator.clipboard.writeText(keyText).then(() => {
            alert('Clé copiée dans le presse-papier');
        });
    });
}

// Gestion de l'inscription
if (document.getElementById('submitBtn')) {
    const submitBtn = document.getElementById('submitBtn');
    const regForm = document.getElementById('registration-form');
    const successState = document.getElementById('success-state');
    const pinDisplay = document.getElementById('pin-display');
    const keyDisplay = document.getElementById('key-display');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const bottomNav = document.getElementById('bottom-nav');

    submitBtn.addEventListener('click', async () => {
        const phone = document.getElementById('phone').value;
        const nom = document.getElementById('fullname').value;
        const identity = document.getElementById('identity').value;

        if (!phone || !nom || !identity) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        try {
            const response = await apiCall('/register', 'POST', { phone, nom, identity });
            const data = await response.json();

            if (response.ok) {
                pinDisplay.textContent = data.pin;
                keyDisplay.textContent = data.secret_key;
                localStorage.setItem('user_id', data.user_id);
                localStorage.setItem('wallet_id', data.wallet_id);
                localStorage.setItem('user_name', nom);
                
                regForm.classList.add('hidden');
                successState.classList.remove('hidden');
                if (bottomNav) bottomNav.classList.add('hidden');
            } else {
                alert('Erreur : ' + data.error);
            }
        } catch (error) {
            alert('Impossible de contacter le serveur');
        }
    });

    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }
}

// Gestion du bouton retour (pour les deux écrans)
const backBtn = document.getElementById('backBtn');
const regFormPage = document.getElementById('registration-form');
const successStatePage = document.getElementById('success-state');
const bottomNavPage = document.getElementById('bottom-nav');

if (backBtn) {
    backBtn.addEventListener('click', () => {
        if (successStatePage && !successStatePage.classList.contains('hidden')) {
            successStatePage.classList.add('hidden');
            if (regFormPage) regFormPage.classList.remove('hidden');
            if (bottomNavPage) bottomNavPage.classList.remove('hidden');
        } else {
            if (history.length > 1) {
                history.back();
            }
        }
    });
}

// Navigation depuis la page d'inscription (barre du bas)
if (document.getElementById('navHome')) {
    document.getElementById('navHome').addEventListener('click', () => window.location.href = 'dashboard.html');
    document.getElementById('navProfile').addEventListener('click', () => window.location.href = 'index.html');
    document.getElementById('navScan').addEventListener('click', () => window.location.href = 'send.html');
}

// ==================== PAGE DASHBOARD ====================

async function loadDashboard() {
    const walletId = localStorage.getItem('wallet_id');
    const userName = localStorage.getItem('user_name');
    
    if (!walletId) {
        window.location.href = 'index.html';
        return;
    }

    // Afficher le nom
    if (userName) {
        document.getElementById('userName').innerText = userName;
    }

    try {
        const response = await apiCall('/balance', 'POST', { wallet_id: walletId });
        const data = await response.json();
        if (response.ok) {
            document.getElementById('balanceAmount').innerText = data.balance + ' FCFA';
            document.getElementById('monthlyIncome').innerText = '+ ' + data.monthly_income + ' FCFA';
            document.getElementById('savingsAmount').innerText = data.savings + ' FCFA';
        }
    } catch (error) {
        console.error('Erreur chargement dashboard');
    }

    try {
        const response = await apiCall('/transactions', 'POST', { wallet_id: walletId });
        const data = await response.json();
        if (response.ok && data.transactions) {
            displayTransactions(data.transactions);
        }
    } catch (error) {
        console.error('Erreur chargement transactions');
    }
}

function displayTransactions(transactions) {
    const container = document.getElementById('transactionsList');
    if (!container) return;

    if (transactions.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-8">Aucune transaction</p>';
        return;
    }

    container.innerHTML = '';
    transactions.slice(0, 5).forEach(tx => {
        const isPositive = tx.type === 'reçu';
        const amount = (isPositive ? '+' : '-') + Math.abs(tx.amount) + ' FCFA';
        const statusClass = tx.status === 'success' ? 'success' : (tx.status === 'pending' ? 'pending' : 'failed');
        const statusText = tx.status === 'success' ? 'Succès' : (tx.status === 'pending' ? 'En cours' : 'Échec');
        
        let iconName = 'receipt';
        if (tx.category === 'transfert') iconName = 'swap_horiz';
        else if (tx.category === 'paiement') iconName = 'payments';
        else if (tx.category === 'achat') iconName = 'shopping_bag';
        else if (tx.category === 'recharge') iconName = 'add_card';
        else if (tx.category === 'retrait') iconName = 'money_off';

        container.innerHTML += `
            <div class="transaction-card">
                <div class="transaction-left">
                    <div class="transaction-icon">
                        <span class="material-symbols-outlined">${iconName}</span>
                    </div>
                    <div>
                        <p class="transaction-title">${tx.description}</p>
                        <p class="transaction-date">${tx.date}</p>
                    </div>
                </div>
                <div class="transaction-right">
                    <p class="transaction-amount ${isPositive ? 'positive' : 'negative'}">${amount}</p>
                    <div class="transaction-status">
                        <span class="status-dot ${statusClass}"></span>
                        <span class="status-text">${statusText}</span>
                    </div>
                </div>
            </div>
        `;
    });
}

// Navigation depuis le dashboard
if (document.getElementById('sendBtn')) {
    document.getElementById('sendBtn').addEventListener('click', () => window.location.href = 'send.html');
    document.getElementById('scanBtn').addEventListener('click', () => window.location.href = 'send.html');
    document.getElementById('rechargeBtn').addEventListener('click', () => alert('Rechargement bientôt disponible'));
    document.getElementById('navHome').addEventListener('click', () => window.location.href = 'dashboard.html');
    document.getElementById('navScan').addEventListener('click', () => window.location.href = 'send.html');
    document.getElementById('navProfile').addEventListener('click', () => window.location.href = 'index.html');
    document.getElementById('viewAllBtn')?.addEventListener('click', () => alert('Toutes les transactions bientôt disponibles'));
}

// Chargement du dashboard
if (document.getElementById('balanceAmount')) {
    loadDashboard();
    const hour = new Date().getHours();
    const greetingEl = document.getElementById('greetingLabel');
    if (greetingEl) {
        greetingEl.textContent = hour >= 18 ? 'Bonsoir,' : 'Bonjour,';
    }
}

// ==================== PAGE ENVOI (SEND) ====================

// ==================== QR CODE SCANNER ====================

let html5QrCode = null;
let scanActive = false;

async function startQRScanner() {
    const qrContainer = document.getElementById('qr-reader');
    const statusSpan = document.getElementById('qr-status');
    
    if (!qrContainer) return;
    
    // Nettoyer l'ancien scanner s'il existe
    if (html5QrCode && scanActive) {
        try {
            await html5QrCode.stop();
        } catch (e) {}
    }
    
    html5QrCode = new Html5Qrcode("qr-reader");
    
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };
    
    try {
        scanActive = true;
        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
                // QR code scanné avec succès
                if (statusSpan) statusSpan.textContent = "QR détecté !";
                document.getElementById('recipient').value = decodedText;
                if (statusSpan) {
                    setTimeout(() => {
                        statusSpan.textContent = "Aligner le code QR";
                    }, 2000);
                }
                // Optionnel : arrêter le scanner après scan
                if (html5QrCode && scanActive) {
                    html5QrCode.stop().then(() => {
                        scanActive = false;
                    }).catch(() => {});
                }
            },
            (error) => {
                // Erreur de scan (ignorer, c'est normal)
                // console.log("Scan error:", error);
            }
        );
        if (statusSpan) statusSpan.textContent = "Aligner le code QR";
    } catch (err) {
        console.error("Erreur caméra:", err);
        if (statusSpan) statusSpan.textContent = "Caméra non accessible";
    }
}

// Démarrer le scanner au chargement de la page send.html
if (document.getElementById('qr-reader')) {
    startQRScanner();
}


if (document.getElementById('sendMoneyBtn')) {
    const sendBtn = document.getElementById('sendMoneyBtn');
    const recipientInput = document.getElementById('recipient');
    const amountInput = document.getElementById('amount');
    const successOverlay = document.getElementById('successOverlay');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');

    async function sendMoney() {
        const to_phone = recipientInput.value.trim();
        const amount = parseInt(amountInput.value);

        if (!to_phone || !amount || amount <= 0) {
            alert('Veuillez remplir le numéro du destinataire et un montant valide');
            return;
        }

        const from_wallet_id = localStorage.getItem('wallet_id');
        if (!from_wallet_id) {
            alert('Session expirée, veuillez vous reconnecter');
            window.location.href = 'index.html';
            return;
        }

        // Récupérer l'ID du portefeuille du destinataire à partir de son téléphone
        try {
            const walletResponse = await apiCall('/wallet/by-phone', 'POST', { phone: to_phone });
            const walletData = await walletResponse.json();

            if (!walletResponse.ok) {
                alert('Destinataire introuvable');
                return;
            }

            const to_wallet_id = walletData.wallet_id;

            // Envoyer le transfert
            const transferResponse = await apiCall('/transfert', 'POST', {
                from_portefeuille_id: from_wallet_id,
                to_portefeuille_id: to_wallet_id,
                amount: amount
            });

            const transferData = await transferResponse.json();

            if (transferResponse.ok) {
                // Animation de succès
                document.body.classList.add('vibrate-effect');
                setTimeout(() => {
                    document.body.classList.remove('vibrate-effect');
                    if (successOverlay) successOverlay.classList.remove('hidden');
                }, 400);
            } else {
                alert('Erreur: ' + transferData.error);
            }
        } catch (error) {
            alert('Erreur de connexion au serveur');
        }
    }

    sendBtn.addEventListener('click', sendMoney);

    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => {
            if (successOverlay) successOverlay.classList.add('hidden');
            // Rediriger vers le dashboard
            window.location.href = 'dashboard.html';
        });
    }
}

// Navigation depuis la page send
if (document.getElementById('navHome')) {
    document.getElementById('navHome')?.addEventListener('click', () => window.location.href = 'dashboard.html');
    document.getElementById('navScan')?.addEventListener('click', () => window.location.href = 'send.html');
    document.getElementById('navProfile')?.addEventListener('click', () => window.location.href = 'index.html');
}







// ==================== PAGE ADMIN (BANQUE CENTRALE) ====================

if (document.querySelector('.admin-header')) {
    let allTransactions = [];

    // Chargement des transactions depuis l'API
    async function loadAdminTransactions() {
        const container = document.getElementById('adminTransactionsList');
        if (!container) return;
        
        container.innerHTML = '<div class="transaction-card">Chargement...</div>';
        
        try {
            const response = await apiCall('/admin/transactions', 'GET');
            const data = await response.json();
            
            if (response.ok && data.transactions) {
                allTransactions = data.transactions;
                displayAdminTransactions(allTransactions);
                updateFraudAlert(allTransactions);
            } else {
                container.innerHTML = '<div class="transaction-card">Aucune transaction trouvée</div>';
            }
        } catch (error) {
            console.error('Erreur:', error);
            container.innerHTML = '<div class="transaction-card">Erreur de chargement</div>';
        }
    }

    function updateFraudAlert(transactions) {
        const suspectCount = transactions.filter(t => t.amount > 1000000).length;
        const fraudCountSpan = document.getElementById('fraudCount');
        if (fraudCountSpan) {
            fraudCountSpan.innerHTML = `${suspectCount} transaction(s) suspecte(s) détectée(s)`;
        }
    }

    // Recherche
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allTransactions.filter(t => 
                t.from_phone?.toLowerCase().includes(term) || 
                t.to_phone?.toLowerCase().includes(term) ||
                t.id?.toLowerCase().includes(term)
            );
            displayAdminTransactions(filtered);
        });
    }

    // Bouton voir les fraudes
    document.getElementById('viewFraudBtn')?.addEventListener('click', () => {
        const suspectTx = allTransactions.filter(t => t.amount > 1000000);
        displayAdminTransactions(suspectTx);
    });

    // Chargement au démarrage
    loadAdminTransactions();
}
function displayAdminTransactions(transactions) {
    const container = document.getElementById('adminTransactionsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (transactions.length === 0) {
        container.innerHTML = '<div class="transaction-card">Aucune transaction</div>';
        return;
    }
    
    transactions.slice(0, 20).forEach(tx => {
        const isSuspect = tx.amount > 1000000;
        const isHighValue = tx.amount > 500000 && tx.amount <= 1000000;
        const amount = tx.amount.toLocaleString() + ' FCFA';
        
        container.innerHTML += `
            <div class="transaction-card ${isSuspect ? 'suspect' : ''}">
                <div class="transaction-header">
                    <span class="transaction-amount ${isSuspect ? 'negative' : 'positive'}">${amount}</span>
                    ${isSuspect ? '<span class="suspect-badge">SUSPECT</span>' : (isHighValue ? '<span class="high-value-badge">VALEUR ELEVEE</span>' : '')}
                </div>
                <div class="transaction-details">
                    <div><span>ID:</span> <strong>${tx.id?.substring(0, 8)}...</strong></div>
                    <div><span>Expediteur:</span> <strong>${tx.from_phone || 'Inconnu'}</strong></div>
                    <div><span>Destinataire:</span> <strong>${tx.to_phone || 'Inconnu'}</strong></div>
                    <div><span>Statut:</span> <strong>${tx.status === 'success' ? 'Succes' : 'Echec'}</strong></div>
                </div>
                <div class="action-buttons">
                    <button class="block-btn-admin" data-tx-id="${tx.id}">
                        BLoquer
                    </button>
                    <button class="details-btn-admin">
                        Details
                    </button>
                </div>
            </div>
        `;
    });
    
    document.querySelectorAll('.block-btn-admin').forEach(btn => {
        btn.addEventListener('click', async () => {
            alert('Transaction bloquee (simulation)');
        });
    });
}
document.getElementById('navAdmin')?.addEventListener('click', () => {
    window.location.href = 'admin.html';
});

document.getElementById('navLogout')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});
