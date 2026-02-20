const express = require('express');
const router = express.Router();

// ⭐ UPDATED IMPORTS: Must match auth.controller.js exactly
const { registerUser, loginUser } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// User Info Route
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;