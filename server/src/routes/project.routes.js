const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { uploadMiddleware } = require('../controllers/upload.controller'); 

const { 
  createProject, getAllProjects, getProjectById, getSecureUrl,
  deleteFile, updatePhase, uploadThumbnail, updateProjectDetails, 
  deleteProject, getDashboardStats, uploadProjectFile 
} = require('../controllers/project.controller');
const { getProjectActivity } = require('../controllers/activity.controller');

// --- ROUTES ---
router.get('/stats/dashboard', protect, getDashboardStats);
router.get('/files/url', protect, getSecureUrl);

// 🚨 THE FIX: Removed authorize('MANAGER') so normal users can delete their own files
router.delete('/files/:activityId', protect, deleteFile); 

router.patch('/phase', protect, updatePhase);

router.route('/')
  .get(protect, getAllProjects)
  .post(protect, authorize('MANAGER'), createProject);

// ✅ UPLOAD ROUTE
router.post('/:id/files', protect, uploadMiddleware, uploadProjectFile);

// Dynamic ID Routes
router.route('/:id')
  .get(protect, getProjectById)
  .delete(protect, authorize('MANAGER'), deleteProject);

router.put('/:id/details', protect, authorize('MANAGER'), updateProjectDetails);
router.post('/:id/thumbnail', protect, authorize('MANAGER'), uploadMiddleware, uploadThumbnail);
router.get('/:id/activity', protect, getProjectActivity);

module.exports = router;