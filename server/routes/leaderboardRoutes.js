const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
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

// Get current week's leaderboard
router.get('/current', authenticateToken, async (req, res) => {
    try {
        const weekId = Leaderboard.getCurrentWeekIdentifier();
        let leaderboard = await Leaderboard.findOne({
            weekIdentifier: weekId,
            status: 'active'
        }).populate('rankings.userId', 'username');

        // Create new leaderboard if it doesn't exist
        if (!leaderboard) {
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay()); // Start on Sunday
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);

            leaderboard = new Leaderboard({
                weekIdentifier: weekId,
                startDate: startOfWeek,
                endDate: endOfWeek,
                status: 'active',
                rankings: []
            });
            await leaderboard.save();
        }

        res.json({ leaderboard });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get leaderboard history
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const leaderboards = await Leaderboard.find({ status: 'completed' })
            .sort({ endDate: -1 })
            .limit(limit)
            .populate('rankings.userId', 'username');

        res.json({ leaderboards });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's leaderboard history
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;

        const leaderboards = await Leaderboard.find({
            'rankings.userId': userId
        }).sort({ endDate: -1 });

        // Extract user's rankings from each leaderboard
        const userRankings = leaderboards.map(lb => {
            const userRanking = lb.rankings.find(r => r.userId.toString() === userId);
            return {
                weekIdentifier: lb.weekIdentifier,
                startDate: lb.startDate,
                endDate: lb.endDate,
                rank: userRanking?.rank,
                score: userRanking?.score,
                status: lb.status
            };
        });

        res.json({ rankings: userRankings });
    } catch (error) {
        console.error('Get user rankings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
