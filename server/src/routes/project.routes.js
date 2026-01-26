const express = require('express');
const router = express.Router();
const { createProject, updatePhase, getAllProjects } = require('../controllers/project.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { getProjectActivity } = require('../controllers/activity.controller');

// Create (Manager Only)
router.post('/', protect, authorize('MANAGER'), createProject);

// Update Phase (Protected by Internal Matrix Logic)
router.patch('/phase', protect, updatePhase);

// Read
router.get('/', protect, getAllProjects);
router.get('/:projectId/activity', protect, getProjectActivity);

module.exports = router;