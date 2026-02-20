const express = require('express');
const router = express.Router();

// Middleware Imports
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
// ✅ Import the middleware from the file above
const { uploadMiddleware } = require('../controllers/upload.controller'); 

// Controller Imports
const { 
  createProject, 
  getAllProjects, 
  getProjectById, 
  getSecureUrl,
  deleteFile, 
  updatePhase, 
  uploadThumbnail, 
  updateProjectDetails, 
  deleteProject,
  getDashboardStats,
  uploadProjectFile 
} = require('../controllers/project.controller');

const { getProjectActivity } = require('../controllers/activity.controller');

// --- ROUTES ---

// Dashboard Stats
router.get('/stats/dashboard', protect, getDashboardStats);

// Files & Utils
router.get('/files/url', protect, getSecureUrl);
router.delete('/files/:activityId', protect, authorize('MANAGER'), deleteFile);

// Phase Updates
router.patch('/phase', protect, updatePhase);

// Root Routes
router.route('/')
  .get(protect, getAllProjects)
  .post(protect, authorize('MANAGER'), createProject);

// ✅ UPLOAD ROUTE (Must be before the /:id route)
router.post('/:id/files', protect, uploadMiddleware, uploadProjectFile);

// Dynamic ID Routes
router.route('/:id')
  .get(protect, getProjectById)
  .delete(protect, authorize('MANAGER'), deleteProject);

router.put('/:id/details', protect, authorize('MANAGER'), updateProjectDetails);
router.post('/:id/thumbnail', protect, authorize('MANAGER'), uploadMiddleware, uploadThumbnail);
router.get('/:id/activity', protect, getProjectActivity);

module.exports = router;