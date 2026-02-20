const express = require('express');
const router = express.Router();
const { uploadMiddleware } = require('../controllers/upload.controller');
// We don't need 'uploadFile' here anymore because project.controller handles it.

// ❌ OLD BROKEN LINE (likely causing the crash):
// router.post('/', uploadMiddleware, uploadFile); 

// ✅ CORRECT USAGE:
// If this file is only used for generic uploads, defined it properly.
// However, based on our new architecture, uploads happen in project.routes.js.
// So, this file might be redundant.

// IF YOU MUST KEEP THIS FILE to prevent other crashes:
router.post('/', uploadMiddleware, (req, res) => {
    res.json({ message: "Upload middleware working, but use project routes for logic." });
});

module.exports = router;