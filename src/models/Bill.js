const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['alimentacao', 'moradia', 'transporte', 'lazer', 'outros']
    },
    paid: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Bill', billSchema); 