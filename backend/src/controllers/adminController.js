const Grievance = require('../models/Grievance');
const User = require('../models/User');

// @desc    Get Analytics Data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAnalytics = async (req, res) => {
    try {
        const totalGrievances = await Grievance.countDocuments();
        const pendingGrievances = await Grievance.countDocuments({ status: { $in: ['Registered', 'Assigned', 'In Progress'] } });
        const resolvedGrievances = await Grievance.countDocuments({ status: { $in: ['Resolved', 'Closed'] } });

        // SLA Breached (Mock logic for now, or real if slaDeadline exists)
        // Assuming slaDeadline field exists, else we simulate
        const escalatedGrievances = await Grievance.countDocuments({ status: 'Escalated' });

        // Category Distribution
        const categoryStats = await Grievance.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // Status Distribution
        const statusStats = await Grievance.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Urgency Distribution
        const urgencyStats = await Grievance.aggregate([
            { $group: { _id: "$urgency", count: { $sum: 1 } } }
        ]);

        // Zone/Jurisdiction Distribution
        const zoneStats = await Grievance.aggregate([
            { $group: { _id: "$jurisdiction", count: { $sum: 1 } } }
        ]);

        res.json({
            total: totalGrievances,
            pending: pendingGrievances,
            resolved: resolvedGrievances,
            escalated: escalatedGrievances,
            byCategory: categoryStats,
            byStatus: statusStats,
            byUrgency: urgencyStats,
            byZone: zoneStats
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching analytics' });
    }
};

module.exports = {
    getAnalytics
};
