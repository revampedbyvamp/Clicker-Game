require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const trophyRoutes = require('./routes/trophyRoutes');

// Import models
const Leaderboard = require('./models/Leaderboard');
const Trophy = require('./models/Trophy');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/trophies', trophyRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Weekly leaderboard reset and trophy awarding (runs every Monday at 00:00)
cron.schedule('0 0 * * 1', async () => {
    console.log('Running weekly leaderboard reset...');

    try {
        // Find the current active leaderboard
        const activeLeaderboard = await Leaderboard.findOne({ status: 'active' });

        if (activeLeaderboard) {
            // Mark as completed
            activeLeaderboard.status = 'completed';
            await activeLeaderboard.save();

            // Award trophies to top 10 players
            const topPlayers = activeLeaderboard.rankings.slice(0, 10);

            for (let i = 0; i < topPlayers.length; i++) {
                const player = topPlayers[i];
                const trophyType = Trophy.getTrophyType(i + 1);

                if (trophyType) {
                    const trophy = new Trophy({
                        userId: player.userId,
                        weekIdentifier: activeLeaderboard.weekIdentifier,
                        placement: i + 1,
                        trophyType,
                        weekStartDate: activeLeaderboard.startDate
                    });

                    await trophy.save();
                }
            }

            console.log(`Awarded ${topPlayers.length} trophies for week ${activeLeaderboard.weekIdentifier}`);
        }

        // Create new leaderboard for the new week
        const weekId = Leaderboard.getCurrentWeekIdentifier();
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        const newLeaderboard = new Leaderboard({
            weekIdentifier: weekId,
            startDate: startOfWeek,
            endDate: endOfWeek,
            status: 'active',
            rankings: []
        });

        await newLeaderboard.save();
        console.log(`Created new leaderboard for week ${weekId}`);

    } catch (error) {
        console.error('Error during weekly reset:', error);
    }
});

// Serve index.html for any other requests (Client-side routing support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');

        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        console.error('Please ensure MONGODB_URI is set correctly in your environment variables.');
        console.error('If using MongoDB Atlas, ensure your IP is whitelisted (0.0.0.0/0 for Render).');
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

module.exports = app;
