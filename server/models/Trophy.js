const mongoose = require('mongoose');

const trophySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weekIdentifier: {
        type: String,
        required: true
    },
    placement: {
        type: Number,
        required: true,
        min: 1
    },
    trophyType: {
        type: String,
        enum: ['gold', 'silver', 'bronze', 'participation'],
        required: true
    },
    weekStartDate: {
        type: Date,
        required: true
    },
    awardDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Static method to determine trophy type based on placement
trophySchema.statics.getTrophyType = function (placement) {
    if (placement === 1) return 'gold';
    if (placement === 2) return 'silver';
    if (placement === 3) return 'bronze';
    if (placement <= 10) return 'participation';
    return null; // No trophy for placements beyond top 10
};

module.exports = mongoose.model('Trophy', trophySchema);
