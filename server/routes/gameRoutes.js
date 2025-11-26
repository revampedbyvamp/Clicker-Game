const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const GameState = require('../models/GameState');
const Leaderboard = require('../models/Leaderboard');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.username = decoded.username;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Get game state
router.get('/state', authenticateToken, async (req, res) => {
    try {
        let gameState = await GameState.findOne({ userId: req.userId });

        if (!gameState) {
            // Create new game state if it doesn't exist
            gameState = new GameState({ userId: req.userId });
            await gameState.save();
        }

        // Calculate offline progress
        const now = Date.now();
        const lastLogin = gameState.lastLoginTime.getTime();
        const offlineTime = Math.min((now - lastLogin) / 1000, 86400); // Cap at 24 hours

        const productionPerSecond = gameState.getTotalProduction();
        const offlineEarnings = Math.floor(productionPerSecond * offlineTime);

        if (offlineEarnings > 0) {
            gameState.currency += offlineEarnings;
            gameState.lastLoginTime = now;
            await gameState.save();
        }

        res.json({
            gameState,
            offlineEarnings,
            offlineTime: Math.floor(offlineTime)
        });
    } catch (error) {
        console.error('Get state error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Save game state
router.post('/save', authenticateToken, async (req, res) => {
    try {
        const { currency, totalClicks, clickValue, upgrades, producers } = req.body;

        const gameState = await GameState.findOneAndUpdate(
            { userId: req.userId },
            {
                currency,
                totalClicks,
                clickValue,
                upgrades,
                producers,
                lastSaveTime: Date.now()
            },
            { new: true, upsert: true }
        );

        // Update leaderboard
        const weekId = Leaderboard.getCurrentWeekIdentifier();
        let leaderboard = await Leaderboard.findOne({ weekIdentifier: weekId, status: 'active' });

        if (leaderboard) {
            const userIndex = leaderboard.rankings.findIndex(r => r.userId.toString() === req.userId);

            if (userIndex >= 0) {
                leaderboard.rankings[userIndex].score = currency;
            } else {
                leaderboard.rankings.push({
                    userId: req.userId,
                    username: req.username,
                    score: currency
                });
            }

            leaderboard.updateRankings();
            await leaderboard.save();
        }

        res.json({ message: 'Game saved successfully', gameState });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Record click
router.post('/click', authenticateToken, async (req, res) => {
    try {
        const { clickValue } = req.body;

        const gameState = await GameState.findOneAndUpdate(
            { userId: req.userId },
            {
                $inc: {
                    totalClicks: 1,
                    currency: clickValue
                }
            },
            { new: true }
        );

        res.json({ currency: gameState.currency, totalClicks: gameState.totalClicks });
    } catch (error) {
        console.error('Click error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Purchase upgrade or producer
router.post('/purchase', authenticateToken, async (req, res) => {
    try {
        const { type, item, cost } = req.body;

        const gameState = await GameState.findOne({ userId: req.userId });

        if (!gameState) {
            return res.status(404).json({ error: 'Game state not found' });
        }

        // Check if user has enough currency
        if (gameState.currency < cost) {
            return res.status(400).json({ error: 'Insufficient currency' });
        }

        // Deduct cost
        gameState.currency -= cost;

        // Update the purchased item
        if (type === 'upgrade') {
            if (gameState.upgrades[item]) {
                gameState.upgrades[item].level += 1;
                gameState.upgrades[item].cost = Math.floor(gameState.upgrades[item].cost * 1.15);

                // Update click value for click multiplier
                if (item === 'clickMultiplier') {
                    gameState.clickValue = Math.floor(gameState.clickValue * 1.5);
                }
            }
        } else if (type === 'producer') {
            if (gameState.producers[item]) {
                gameState.producers[item].count += 1;
                gameState.producers[item].cost = Math.floor(gameState.producers[item].cost * 1.15);
            }
        }

        await gameState.save();

        res.json({ message: 'Purchase successful', gameState });
    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
