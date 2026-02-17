const express = require('express');
const router = express.Router();
const {
    submitGrievance,
    getMyGrievances,
    getAllGrievances,
    updateGrievance,
    submitFeedback,
    predictCategory
} = require('../controllers/grievanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.post('/predict-category', protect, predictCategory);
router.post('/', protect, upload.single('file'), submitGrievance);
router.get('/my', protect, getMyGrievances);
router.get('/', protect, authorize('admin', 'authority'), getAllGrievances);
router.put('/:id', protect, authorize('admin', 'authority'), updateGrievance);
router.post('/:id/feedback', protect, submitFeedback);

module.exports = router;
