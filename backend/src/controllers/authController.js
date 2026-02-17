const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Otp = require('../models/Otp');
const { sendSms } = require('../utils/smsService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user (VERIFY OTP & CREATE)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, phone, password, role, department, jurisdiction, otp } = req.body;

    // Basic validation
    if (!name || !phone || !password || !otp) {
        return res.status(400).json({ message: 'Please add all fields including OTP' });
    }

    try {
        const userExists = await User.findOne({ phone });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Verify OTP
        const otpRecord = await Otp.findOne({ phone, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or Expired OTP' });
        }

        // Create User
        const user = await User.create({
            name,
            phone,
            passwordHash: password, // Pre-save hook handles hashing
            role: role || 'citizen',
            department,
            jurisdiction,
            phoneVerified: true
        });

        // Delete OTP record after successful registration
        await Otp.deleteOne({ _id: otpRecord._id });

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

// @desc    Send OTP for Registration
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    try {
        const userExists = await User.findOne({ phone });
        if (userExists) {
            return res.status(400).json({ message: 'Phone number already registered' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP (Upsert: Update if exists, Insert if new)
        await Otp.findOneAndUpdate(
            { phone },
            { otp, createdAt: Date.now() }, // Update OTP and reset timer
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Send SMS
        await sendSms(phone, otp);

        res.json({ message: 'OTP sent successfully' });

    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
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
    getAuthorities,
    sendOtp
};
