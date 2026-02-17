const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeImage, extractEntities, ocrImage } = require('../controllers/aiController');

const path = require('path');

// Multer setup for image uploads (Keep extensions for YOLO)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage });

router.post('/analyze-image', upload.single('image'), analyzeImage);
router.post('/extract-entities', extractEntities);
router.post('/ocr', upload.single('image'), ocrImage);

module.exports = router;
