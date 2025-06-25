const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true
    },
    referenceMonth: {
        type: Date,
        required: true
    },
    responsiblePerson: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    completedActivities: {
        type: [String],
        required: true
    },
    criticalExpenses: {
        type: [String],
        required: true
    },
    plannedVsAchieved: {
        type: String,
        required: true
    },
    problems: {
        type: [String],
        required: true
    },
    attachments: [{
        filename: String,
        path: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
});

reportSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Report', reportSchema); 