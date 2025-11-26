const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Trophy = require('../models/Trophy');
const User = require('../models/User');

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

// Get user's trophies
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;

        const trophies = await Trophy.find({ userId })
            .sort({ awardDate: -1 });

        res.json({ trophies });
    } catch (error) {
        console.error('Get trophies error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Award trophies (called by cron job)
router.post('/award', async (req, res) => {
    try {
        const { weekIdentifier, rankings, weekStartDate } = req.body;

        // Validate request (should include a secret key for security)
        const secretKey = req.headers['x-cron-secret'];
        if (secretKey !== process.env.CRON_SECRET) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const trophiesAwarded = [];

        // Award trophies to top 10 players
        for (let i = 0; i < Math.min(rankings.length, 10); i++) {
            const ranking = rankings[i];
            const trophyType = Trophy.getTrophyType(i + 1);

            if (trophyType) {
                const trophy = new Trophy({
                    userId: ranking.userId,
                    weekIdentifier,
                    placement: i + 1,
                    trophyType,
                    weekStartDate
                });

                await trophy.save();

                // Add trophy to user's collection
                await User.findByIdAndUpdate(
                    ranking.userId,
                    { $push: { trophies: trophy._id } }
                );

                trophiesAwarded.push(trophy);
            }
        }

        res.json({
            message: 'Trophies awarded successfully',
            count: trophiesAwarded.length,
            trophies: trophiesAwarded
        });
    } catch (error) {
        console.error('Award trophies error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
