const express = require('express');
const router = express.Router();
const { uploadFile, uploadMiddleware } = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');

// POST /api/uploads
// 1. Protect (Check Token)
// 2. Middleware (Handle File Stream)
// 3. Controller (Logic)
router.post('/', protect, uploadMiddleware, uploadFile);

module.exports = router;