const Grievance = require('../models/Grievance');
const User = require('../models/User');
const { classifyGrievance, predictUrgency } = require('../utils/aiService');

// @desc    Submit a grievance
// @route   POST /api/grievances
// @access  Private (Citizen)
const submitGrievance = async (req, res) => {
    try {
        console.log('Submit Grievance User:', req.user); // DEBUG LOG
        const { text, category, urgency, location, jurisdiction } = req.body; // Added jurisdiction

        // AI/ML Classification (Mock)
        const detectedCategory = (category === 'General' || !category) ? classifyGrievance(text) : category;
        const detectedUrgency = (urgency === 'Normal' || !urgency) ? predictUrgency(text) : urgency;

        // SMART ROUTING: Find Authority matching Dept + Jurisdiction
        const assignedAuthority = await User.findOne({
            role: 'authority',
            department: detectedCategory,
            jurisdiction: jurisdiction
        });

        const grievance = await Grievance.create({
            citizenId: req.user._id,
            text,
            category: detectedCategory,
            urgency: detectedUrgency,
            photoUrl: req.file ? `/uploads/${req.file.filename}` : null,
            jurisdiction: jurisdiction || 'General', // Fallback
            currentDepartment: detectedCategory,
            currentAuthority: assignedAuthority ? assignedAuthority._id : null,
            status: assignedAuthority ? 'Assigned' : 'Registered'
        });

        res.status(201).json(grievance);
    } catch (error) {
        console.error('Submit Grievance Error:', error); // DEBUG LOG
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my grievances
// @route   GET /api/grievances/my
// @access  Private (Citizen)
const getMyGrievances = async (req, res) => {
    try {
        const grievances = await Grievance.find({ citizenId: req.user._id }).sort({ createdAt: -1 });
        res.json(grievances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all grievances (Admin/Authority filters)
// @route   GET /api/grievances
// @access  Private (Admin/Authority)
const getAllGrievances = async (req, res) => {
    try {
        let query = {};

        // If Authority, filter by their Department AND Jurisdiction
        if (req.user.role === 'authority') {
            if (req.user.department) {
                query.currentDepartment = req.user.department;
            }
            if (req.user.jurisdiction) {
                query.jurisdiction = req.user.jurisdiction;
            }
        }

        // AUTO-ESCALATION CHECK (Only when Admin views, for efficiency)
        if (req.user.role === 'admin') {
            const overdueGrievances = await Grievance.find({
                slaDeadline: { $lt: new Date() },
                status: { $nin: ['Resolved', 'Closed', 'Escalated'] }
            });

            if (overdueGrievances.length > 0) {
                const bulkOps = overdueGrievances.map(g => ({
                    updateOne: {
                        filter: { _id: g._id },
                        update: {
                            status: 'Escalated',
                            $push: {
                                statusHistory: {
                                    status: 'Escalated',
                                    updatedBy: req.user._id, // System/Admin triggered
                                    remarks: 'Auto-escalated due to SLA breach'
                                }
                            }
                        }
                    }
                }));
                await Grievance.bulkWrite(bulkOps);
                console.log(`Auto-escalated ${overdueGrievances.length} grievances.`);
            }
        }

        const grievances = await Grievance.find(query).populate('citizenId', 'name phone').sort({ createdAt: -1 });
        res.json(grievances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update status / Assign / Transfer
// @route   PUT /api/grievances/:id
// @access  Private (Authority/Admin)
const updateGrievance = async (req, res) => {
    try {
        const { status, remarks, department } = req.body;
        const grievance = await Grievance.findById(req.params.id);

        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        // Logic for Department Transfer
        if (department) {
            grievance.currentDepartment = department;
            grievance.status = 'Assigned'; // Re-assign
            // Log transfer
            grievance.statusHistory.push({
                status: 'Transferred',
                updatedBy: req.user._id,
                remarks: `Transferred to ${department}`,
            });
        }

        // Logic for Status Update
        if (status) {
            grievance.status = status;
            grievance.statusHistory.push({
                status,
                updatedBy: req.user._id,
                remarks,
            });
        }

        await grievance.save();
        res.json(grievance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit Feedback
// @route   POST /api/grievances/:id/feedback
// @access  Private (Citizen)
const submitFeedback = async (req, res) => {
    try {
        const { rating, feedback } = req.body;
        const grievance = await Grievance.findById(req.params.id);

        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        if (grievance.citizenId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (grievance.status !== 'Resolved') {
            return res.status(400).json({ message: 'Can only rate resolved grievances' });
        }

        grievance.rating = rating;
        grievance.feedback = feedback;
        grievance.status = 'Closed'; // Auto-close after feedback
        grievance.statusHistory.push({
            status: 'Closed',
            updatedBy: req.user._id,
            remarks: `Citizen Feedback: ${rating} Stars - ${feedback}`
        });

        await grievance.save();
        res.json(grievance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitGrievance,
    getMyGrievances,
    getAllGrievances,
    updateGrievance,
    submitFeedback
};
