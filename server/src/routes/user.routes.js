const express = require('express');
const router = express.Router();

// 1. Import ALL the controller functions
const { 
  getAllUsers, 
  createUser, 
  deleteUser, 
  updateUser,
  getUserById 
} = require('../controllers/user.controller');

// 2. Import Middlewares
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// ==========================================
// 🛡️ GLOBAL AUTHENTICATION (Applies to ALL routes below)
// ==========================================
// This guarantees that `req.user` is created before hitting ANY controller
router.use(protect);

// ==========================================
// 🔓 OPEN ROUTES (Requires Login Only)
// ==========================================
// Any authenticated user can hit this (Controller handles the logic of "is this my ID?")
router.get('/:id', getUserById);


// ==========================================
// 🔒 MANAGER / ADMIN ONLY ROUTES
// ==========================================
// Everything below this line will now require Manager or Admin roles
router.use(authorize('MANAGER', 'ADMIN'));

// Routes
router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;