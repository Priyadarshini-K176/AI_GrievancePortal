const express = require('express');
const router = express.Router();
// Reuse auth controller or create specific admin controller for user management?
// Let's create a simple admin controller logic inline for now or separate if complex.
// Requirement: Create authority accounts.
const { registerUser, getAuthorities } = require('../controllers/authController');
const { getAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route to create Authority
router.post('/create-authority', protect, authorize('admin'), registerUser);
// Route to get all authorities
router.get('/authorities', protect, authorize('admin'), getAuthorities);

// Analytics Route
router.get('/analytics', protect, authorize('admin'), getAnalytics);

// Test Route
router.get('/test', (req, res) => res.send('Admin Routes Working'));

module.exports = router;
