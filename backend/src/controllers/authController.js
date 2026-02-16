const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, phone, password, role, department, jurisdiction } = req.body;

    // Basic validation
    if (!name || !phone || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        const userExists = await User.findOne({ phone });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Simulating Phone Verification immediately for now
        const user = await User.create({
            name,
            phone,
            passwordHash: password,
            // Wait, models/User.js handles hashing in pre-save. I should pass plain password if I map it to passwordHash, 
            // but the model expects passwordHash to be set effectively. 
            // Actually, my model has `passwordHash` field and pre-save hooks on it?
            // Let's check model again. 
            // Model: `passwordHash: { type: String, required: true }`.
            // pre('save'): `if (!this.isModified('passwordHash'))`.
            // So if I pass `password` it won't be saved to `passwordHash`.
            // I should just pass `passwordHash: password` and let pre-save hash it?
            // "this.passwordHash = await bcrypt.hash(this.passwordHash, salt);"
            // Yes.
            role: role || 'citizen',
            department,
            jurisdiction,
            phoneVerified: true // Auto-verify for MVP
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                department: user.department,
                jurisdiction: user.jurisdiction,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { phone, password } = req.body;

    try {
        const user = await User.findOne({ phone });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                department: user.department,
                jurisdiction: user.jurisdiction,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all authorities
// @route   GET /api/admin/authorities
// @access  Private (Admin)
const getAuthorities = async (req, res) => {
    try {
        const authorities = await User.find({ role: 'authority' }).select('-passwordHash');
        res.json(authorities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAuthorities
};
