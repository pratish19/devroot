const express = require('express');
const router = express.Router();
const { 
  createDepartment, 
  getAllDepartments, 
  updateDepartment, 
  deleteDepartment,
  getDepartmentById,
  removeUserFromDepartment
} = require('../controllers/department.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// 🔒 SECURITY CHAIN:
// 1. protect -> Decodes token, adds user to request
// 2. authorize('MANAGER') -> Checks if role is allowed
router.post('/', protect, authorize('MANAGER'), createDepartment);

// Everyone (even developers) can view departments
router.get('/', protect, getAllDepartments);
router.put('/remove-user', protect, authorize('MANAGER'), removeUserFromDepartment);
router.get('/:id', protect, getDepartmentById);
router.put('/:id', protect, authorize('MANAGER'), updateDepartment);

router.delete('/:id', protect, authorize('MANAGER'), deleteDepartment);

module.exports = router;