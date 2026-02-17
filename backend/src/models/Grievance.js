const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
    grievanceId: { type: String, unique: true },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    photoUrl: { type: String },
    category: { type: String, default: 'Unclassified' }, // ML Populated
    subType: { type: String }, // ML Populated
    urgency: { type: String, default: 'Normal' }, // ML Populated
    jurisdiction: { type: String, required: true }, // Added for Routing (Area/Zone)
    area: { type: String, required: true }, // Added for Street/Specific Location
    currentDepartment: { type: String },
    currentAuthority: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['Registered', 'Assigned', 'Action Taken', 'Resolved', 'Escalated', 'Closed'],
        default: 'Registered'
    },
    statusHistory: [{
        status: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        remarks: String
    }],
    atrHistory: [{
        actionTaken: String,
        authorityId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        proofUrl: String
    }],
    slaDeadline: { type: Date },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Generate Grievance ID
grievanceSchema.pre('save', async function () {
    if (!this.grievanceId) {
        this.grievanceId = 'TN-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
    // Set SLA 21 days
    if (!this.slaDeadline) {
        const date = new Date();
        date.setDate(date.getDate() + 21);
        this.slaDeadline = date;
    }
});

module.exports = mongoose.model('Grievance', grievanceSchema);
