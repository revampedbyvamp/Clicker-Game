const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    weekIdentifier: {
        type: String,
        required: true,
        unique: true // e.g., "2025-W47"
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    },
    rankings: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        username: {
            type: String,
            required: true
        },
        score: {
            type: Number,
            required: true,
            default: 0
        },
        rank: {
            type: Number
        }
    }]
}, {
    timestamps: true
});

// Method to update rankings based on scores
leaderboardSchema.methods.updateRankings = function () {
    // Sort by score descending
    this.rankings.sort((a, b) => b.score - a.score);

    // Assign ranks
    this.rankings.forEach((entry, index) => {
        entry.rank = index + 1;
    });
};

// Static method to get current week identifier
leaderboardSchema.statics.getCurrentWeekIdentifier = function () {
    const now = new Date();
    const year = now.getFullYear();

    // Get week number (ISO 8601)
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (now - firstDayOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
};

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
