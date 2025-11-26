const mongoose = require('mongoose');

const gameStateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    currency: {
        type: Number,
        default: 0,
        min: 0
    },
    totalClicks: {
        type: Number,
        default: 0,
        min: 0
    },
    clickValue: {
        type: Number,
        default: 1,
        min: 1
    },
    upgrades: {
        clickMultiplier: {
            level: { type: Number, default: 0 },
            cost: { type: Number, default: 10 }
        },
        autoClicker: {
            level: { type: Number, default: 0 },
            cost: { type: Number, default: 100 }
        }
    },
    producers: {
        basic: {
            count: { type: Number, default: 0 },
            cost: { type: Number, default: 500 },
            production: { type: Number, default: 1 }
        },
        advanced: {
            count: { type: Number, default: 0 },
            cost: { type: Number, default: 5000 },
            production: { type: Number, default: 10 }
        },
        elite: {
            count: { type: Number, default: 0 },
            cost: { type: Number, default: 50000 },
            production: { type: Number, default: 100 }
        },
        legendary: {
            count: { type: Number, default: 0 },
            cost: { type: Number, default: 500000 },
            production: { type: Number, default: 1000 }
        }
    },
    lastSaveTime: {
        type: Date,
        default: Date.now
    },
    lastLoginTime: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate total production per second
gameStateSchema.methods.getTotalProduction = function () {
    const producers = this.producers;
    return (
        producers.basic.count * producers.basic.production +
        producers.advanced.count * producers.advanced.production +
        producers.elite.count * producers.elite.production +
        producers.legendary.count * producers.legendary.production +
        (this.upgrades.autoClicker.level * this.clickValue) // Auto-clickers
    );
};

module.exports = mongoose.model('GameState', gameStateSchema);
