const express = require('express');
const router = express.Router();
// 1. Import ALL the controller functions
const { 
  getAllUsers, 
  createUser, 
  deleteUser, 
  updateUser,
  getUserById // 👈 Make sure this is imported!
} = require('../controllers/user.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Security Middleware
router.use(protect);
router.use(authorize('MANAGER', 'ADMIN'));

// Routes
router.get('/', getAllUsers);
router.post('/', createUser);

// ⭐ THIS IS THE CRITICAL MISSING LINK
router.get('/:id', getUserById); 

router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;