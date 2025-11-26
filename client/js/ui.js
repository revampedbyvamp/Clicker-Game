// UI Management Module
const UI = {
    // Format large numbers
    formatNumber(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return Math.floor(num).toString();
    },

    // Update currency display
    updateCurrency(amount) {
        document.getElementById('currencyAmount').textContent = this.formatNumber(amount);
    },

    // Update production rate
    updateProductionRate(rate) {
        document.getElementById('productionRate').textContent = `+${this.formatNumber(rate)}/sec`;
    },

    // Update click value display
    updateClickValue(value) {
        document.getElementById('clickValue').textContent = `+${this.formatNumber(value)} per click`;
    },

    // Update total clicks
    updateTotalClicks(clicks) {
        document.getElementById('totalClicks').textContent = this.formatNumber(clicks);
    },

    // Update user rank
    updateUserRank(rank) {
        document.getElementById('userRank').textContent = rank ? `#${rank}` : '#-';
    },

    // Render upgrades list
    renderUpgrades(upgrades, currency, onPurchase) {
        const container = document.getElementById('upgradesList');
        container.innerHTML = '';

        const upgradeConfigs = [
            {
                key: 'clickMultiplier',
                name: 'Click Multiplier',
                description: 'Increase click power by 50%',
                icon: '⚡',
            },
            {
                key: 'autoClicker',
                name: 'Auto Clicker',
                description: 'Automatically clicks for you',
                icon: '🤖',
            },
        ];

        upgradeConfigs.forEach(config => {
            const upgrade = upgrades[config.key];
            const canAfford = currency >= upgrade.cost;

            const card = document.createElement('div');
            card.className = `item-card ${!canAfford ? 'disabled' : ''}`;

            card.innerHTML = `
                <div class="item-icon">${config.icon}</div>
                <div class="item-info">
                    <div class="item-name">${config.name} (Lv ${upgrade.level})</div>
                    <div class="item-description">${config.description}</div>
                </div>
                <div class="item-cost">${this.formatNumber(upgrade.cost)}</div>
            `;

            if (canAfford) {
                card.addEventListener('click', () => onPurchase('upgrade', config.key, upgrade.cost));
            }

            container.appendChild(card);
        });
    },

    // Render producers list
    renderProducers(producers, currency, onPurchase) {
        const container = document.getElementById('producersList');
        container.innerHTML = '';

        const producerConfigs = [
            {
                key: 'basic',
                name: 'Basic Producer',
                description: 'Generates 1 crystal/sec',
                icon: '🏭',
            },
            {
                key: 'advanced',
                name: 'Advanced Producer',
                description: 'Generates 10 crystals/sec',
                icon: '🏢',
            },
            {
                key: 'elite',
                name: 'Elite Producer',
                description: 'Generates 100 crystals/sec',
                icon: '🏰',
            },
            {
                key: 'legendary',
                name: 'Legendary Producer',
                description: 'Generates 1000 crystals/sec',
                icon: '🌟',
            },
        ];

        producerConfigs.forEach(config => {
            const producer = producers[config.key];
            const canAfford = currency >= producer.cost;

            const card = document.createElement('div');
            card.className = `item-card ${!canAfford ? 'disabled' : ''}`;

            card.innerHTML = `
                <div class="item-icon">${config.icon}</div>
                <div class="item-info">
                    <div class="item-name">${config.name} (${producer.count})</div>
                    <div class="item-description">${config.description}</div>
                </div>
                <div class="item-cost">${this.formatNumber(producer.cost)}</div>
            `;

            if (canAfford) {
                card.addEventListener('click', () => onPurchase('producer', config.key, producer.cost));
            }

            container.appendChild(card);
        });
    },

    // Render leaderboard
    renderLeaderboard(leaderboard, currentUserId) {
        const weekInfo = document.getElementById('weekInfo');
        const container = document.getElementById('leaderboardList');

        weekInfo.textContent = `Week ${leaderboard.weekIdentifier}`;
        container.innerHTML = '';

        if (!leaderboard.rankings || leaderboard.rankings.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No rankings yet. Start playing to appear on the leaderboard!</p>';
            return;
        }

        leaderboard.rankings.slice(0, 20).forEach((entry, index) => {
            const isCurrentUser = entry.userId === currentUserId;
            const rank = index + 1;

            const entryDiv = document.createElement('div');
            entryDiv.className = `leaderboard-entry ${isCurrentUser ? 'current-user' : ''}`;

            let rankClass = '';
            if (rank === 1) rankClass = 'gold';
            else if (rank === 2) rankClass = 'silver';
            else if (rank === 3) rankClass = 'bronze';

            entryDiv.innerHTML = `
                <div class="rank ${rankClass}">#${rank}</div>
                <div class="player-name">${entry.username}${isCurrentUser ? ' (You)' : ''}</div>
                <div class="player-score">${this.formatNumber(entry.score)}</div>
            `;

            container.appendChild(entryDiv);
        });
    },

    // Render trophies
    renderTrophies(trophies) {
        const container = document.getElementById('trophiesList');
        container.innerHTML = '';

        if (!trophies || trophies.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No trophies yet. Compete in weekly leaderboards to earn trophies!</p>';
            return;
        }

        trophies.forEach(trophy => {
            const card = document.createElement('div');
            card.className = 'trophy-card';

            const trophyImages = {
                gold: 'assets/images/trophy-icons/gold.png',
                silver: 'assets/images/trophy-icons/silver.png',
                bronze: 'assets/images/trophy-icons/bronze.png',
                participation: 'assets/images/trophy-icons/bronze.png', // Reuse bronze for participation
            };

            const placementText = trophy.placement === 1 ? '1st Place' :
                trophy.placement === 2 ? '2nd Place' :
                    trophy.placement === 3 ? '3rd Place' :
                        `${trophy.placement}th Place`;

            card.innerHTML = `
                <div class="trophy-icon">
                    <img src="${trophyImages[trophy.trophyType]}" alt="${trophy.trophyType} trophy">
                </div>
                <div class="trophy-placement">${placementText}</div>
                <div class="trophy-week">${trophy.weekIdentifier}</div>
            `;

            container.appendChild(card);
        });
    },

    // Show offline earnings notification
    showOfflineNotification(amount, time) {
        if (amount <= 0) return;

        const notification = document.getElementById('offlineNotification');
        const amountSpan = document.getElementById('offlineAmount');

        amountSpan.textContent = this.formatNumber(amount);
        notification.style.display = 'flex';

        document.getElementById('closeOfflineNotification').addEventListener('click', () => {
            notification.style.display = 'none';
        }, { once: true });
    },

    // Show error message
    showError(message, containerId = 'authError') {
        const errorDiv = document.getElementById(containerId);
        errorDiv.textContent = message;
        errorDiv.classList.add('show');

        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    },

    // Setup tab switching
    setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                const parent = btn.closest('section');

                // Update buttons
                parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update content
                parent.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                parent.querySelector(`#${tabName}Tab`).classList.add('active');
            });
        });
    },
};
