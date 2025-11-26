// Main Game Logic
class Game {
    constructor() {
        this.state = {
            currency: 0,
            totalClicks: 0,
            clickValue: 1,
            upgrades: {
                clickMultiplier: { level: 0, cost: 10 },
                autoClicker: { level: 0, cost: 100 },
            },
            producers: {
                basic: { count: 0, cost: 500, production: 1 },
                advanced: { count: 0, cost: 5000, production: 10 },
                elite: { count: 0, cost: 50000, production: 100 },
                legendary: { count: 0, cost: 500000, production: 1000 },
            },
        };
        this.lastUpdate = Date.now();
        this.saveInterval = null;
        this.leaderboard = null;
        this.trophies = [];
        this.userId = localStorage.getItem('userId');
        this.username = localStorage.getItem('username');
        this.init();
    }

    async init() {
        if (!authToken) {
            this.showAuthModal();
            return;
        }
        try {
            await authAPI.verify();
            await this.loadGameState();
            this.showGame();
            this.setupEventListeners();
            this.startGameLoop();
            this.startAutoSave();
            await this.loadLeaderboard();
            await this.loadTrophies();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showAuthModal();
        }
    }

    showAuthModal() {
        document.getElementById('authModal').style.display = 'flex';
        document.getElementById('gameContainer').style.display = 'none';
    }

    showGame() {
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
        document.getElementById('username').textContent = this.username;
    }

    async loadGameState() {
        try {
            const response = await gameAPI.getState();
            const serverState = response.gameState;
            this.state.currency = serverState.currency;
            this.state.totalClicks = serverState.totalClicks;
            this.state.clickValue = serverState.clickValue;
            this.state.upgrades = serverState.upgrades;
            this.state.producers = serverState.producers;
            if (response.offlineEarnings > 0) {
                UI.showOfflineNotification(response.offlineEarnings, response.offlineTime);
            }
            this.updateUI();
        } catch (error) {
            console.error('Load state error:', error);
        }
    }

    async saveGameState() {
        try {
            await gameAPI.saveState(this.state);
        } catch (error) {
            console.error('Save state error:', error);
        }
    }

    async loadLeaderboard() {
        try {
            const response = await leaderboardAPI.getCurrent();
            this.leaderboard = response.leaderboard;
            UI.renderLeaderboard(this.leaderboard, this.userId);
            const userEntry = this.leaderboard.rankings.find(r => r.userId === this.userId);
            UI.updateUserRank(userEntry?.rank);
        } catch (error) {
            console.error('Load leaderboard error:', error);
        }
    }

    async loadTrophies() {
        try {
            const response = await trophyAPI.getUserTrophies(this.userId);
            this.trophies = response.trophies;
            UI.renderTrophies(this.trophies);
        } catch (error) {
            console.error('Load trophies error:', error);
        }
    }

    setupEventListeners() {
        const clickButton = document.getElementById('clickButton');
        clickButton.addEventListener('click', e => this.handleClick(e));
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.saveGameState();
            authAPI.logout();
            location.reload();
        });
        UI.setupTabs();
        this.renderShop();
    }

    handleClick(e) {
        this.state.currency += this.state.clickValue;
        this.state.totalClicks++;
        const rect = e.target.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        particleSystem.createClickParticles(x, y, this.state.clickValue);
        audioSystem.playClick();
        UI.updateCurrency(this.state.currency);
        UI.updateTotalClicks(this.state.totalClicks);
        this.renderShop();
        clearTimeout(this.clickSaveTimeout);
        this.clickSaveTimeout = setTimeout(() => {
            this.saveGameState();
        }, 2000);
        UI.renderProducers(this.state.producers, this.state.currency, (type, item, cost) =>
            this.handlePurchase(type, item, cost)
        );
    }

    async handlePurchase(type, item, cost) {
        // Sync latest state before purchase
        try { await this.saveGameState(); } catch (e) { console.error('Pre‑purchase sync failed', e); }
        if (this.state.currency < cost) {
            UI.showError('Not enough currency');
            return;
        }
        try {
            const response = await gameAPI.purchase(type, item, cost);
            this.state = {
                ...this.state,
                currency: response.gameState.currency,
                clickValue: response.gameState.clickValue,
                upgrades: response.gameState.upgrades,
                producers: response.gameState.producers,
            };
            audioSystem.playPurchase();
            this.updateUI();
            this.renderShop();
        } catch (error) {
            console.error('Purchase error:', error);
            UI.showError(error.message);
        }
    }

    renderShop() {
        UI.renderUpgrades(this.state.upgrades, this.state.currency, (type, item, cost) =>
            this.handlePurchase(type, item, cost)
        );
        UI.renderProducers(this.state.producers, this.state.currency, (type, item, cost) =>
            this.handlePurchase(type, item, cost)
        );
    }

    calculateProductionRate() {
        const p = this.state.producers;
        return (
            p.basic.count * p.basic.production +
            p.advanced.count * p.advanced.production +
            p.elite.count * p.elite.production +
            p.legendary.count * p.legendary.production +
            (this.state.upgrades.autoClicker.level * this.state.clickValue)
        );
    }

    startGameLoop() {
        const loop = () => {
            const now = Date.now();
            const delta = (now - this.lastUpdate) / 1000;
            this.lastUpdate = now;
            const prodRate = this.calculateProductionRate();
            const prod = prodRate * delta;
            if (prod > 0) {
                this.state.currency += prod;
                UI.updateCurrency(this.state.currency);
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    startAutoSave() {
        this.saveInterval = setInterval(() => {
            this.saveGameState();
            this.loadLeaderboard();
        }, 30000);
    }

    updateUI() {
        UI.updateCurrency(this.state.currency);
        UI.updateProductionRate(this.calculateProductionRate());
        UI.updateClickValue(this.state.clickValue);
        UI.updateTotalClicks(this.state.totalClicks);
    }
}

// Authentication Event Listeners
document.getElementById('showRegister').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
});

document.getElementById('showLogin').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
});

document.getElementById('loginBtn').addEventListener('click', async () => {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    try {
        await authAPI.login(username, password);
        location.reload();
    } catch (error) {
        UI.showError(error.message);
    }
});

document.getElementById('registerBtn').addEventListener('click', async () => {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    try {
        await authAPI.register(username, password);
        location.reload();
    } catch (error) {
        UI.showError(error.message);
    }
});

// Allow Enter key to submit forms
document.getElementById('loginPassword').addEventListener('keypress', e => {
    if (e.key === 'Enter') document.getElementById('loginBtn').click();
});

document.getElementById('registerPassword').addEventListener('keypress', e => {
    if (e.key === 'Enter') document.getElementById('registerBtn').click();
});

// Initialize game
const game = new Game();
