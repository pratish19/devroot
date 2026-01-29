const express = require('express');
const router = express.Router();

// Middleware
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Controllers
const { 
  createProject, 
  getAllProjects, 
  getProjectById, // 👈 ADDED (Was missing)
  getSecureUrl,
  deleteFile, 
  updatePhase, 
  uploadThumbnail, 
  updateProjectDetails, 
  deleteProject,
  getDashboardStats
} = require('../controllers/project.controller');

const { getProjectActivity } = require('../controllers/activity.controller');
const { uploadMiddleware } = require('../controllers/upload.controller'); 

// ==========================================
// 1. STATIC & SPECIFIC ROUTES (Priority High)
// ==========================================

// 📊 Dashboard Stats (MUST be before /:id)
router.get('/stats/dashboard', protect, getDashboardStats);

// 📂 Files & Utils
router.get('/files/url', protect, getSecureUrl);
router.delete('/files/:activityId', protect, authorize('MANAGER'), deleteFile);

// 🔄 Phase Updates
router.patch('/phase', protect, updatePhase);

// ==========================================
// 2. ROOT ROUTES (The Main List)
// ==========================================
router.route('/')
  .get(protect, getAllProjects)
  .post(protect, authorize('MANAGER'), createProject);

// ==========================================
// 3. DYNAMIC ROUTES (/:id) - Priority Low
// ==========================================
// ⚠️ These must come LAST because they capture everything else as an ID

router.route('/:id')
  .get(protect, getProjectById)
  .delete(protect, authorize('MANAGER'), deleteProject);

// Project Specific Details
router.put('/:id/details', protect, authorize('MANAGER'), updateProjectDetails);

// Thumbnail Upload
router.post('/:id/thumbnail', protect, authorize('MANAGER'), uploadMiddleware, uploadThumbnail);

// Activity Log
router.get('/:id/activity', protect, getProjectActivity);

module.exports = router;