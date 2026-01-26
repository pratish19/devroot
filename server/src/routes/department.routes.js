const express = require('express');
const router = express.Router();
const { createDepartment, getAllDepartments } = require('../controllers/department.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// 🔒 SECURITY CHAIN:
// 1. protect -> Decodes token, adds user to request
// 2. authorize('MANAGER') -> Checks if role is allowed
router.post('/', protect, authorize('MANAGER'), createDepartment);

// Everyone (even developers) can view departments
router.get('/', protect, getAllDepartments);

module.exports = router;