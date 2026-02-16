const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String },
    action: { type: String, required: true },
    grievanceId: { type: String },
    details: { type: Object },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
