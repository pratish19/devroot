const Project = require('../models/Project');
const Activity = require('../models/Activity');
const User = require('../models/User'); // Ensure User is imported
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const BUCKET_NAME = process.env.SUPABASE_BUCKET;

// ==========================================
// 1. CREATE PROJECT
// ==========================================
exports.createProject = async (req, res) => {
  try {
    const { 
      name, description, department, deadline, jiraId,
      projectType, subject, grade, gradeGroup,
      phaseDetails 
    } = req.body;

    if (!name) return res.status(400).json({ message: "Project name is required" });

    const project = new Project({
      name,
      description,
      department: department || null, 
      deadline,
      createdBy: req.user.id,
      jiraId, projectType, subject, grade, gradeGroup,
      phaseDetails: phaseDetails || {}
    });

    await project.save();

    // Auto-Create Folders
    try {
      const projectPath = `projects/${project._id}`;
      const folders = ['scripts', 'designs/raw', 'designs/assets', 'designs/spine', 'development/builds'];
      await supabase.storage.from(BUCKET_NAME).upload(`${projectPath}/.keep`, Buffer.from(''));
      for (const folder of folders) {
        await supabase.storage.from(BUCKET_NAME).upload(`${projectPath}/${folder}/.keep`, Buffer.from(''));
      }
    } catch (storageErr) {
      console.error("⚠️ Folder Creation Warning:", storageErr.message);
    }

    await Activity.create({
      project: project._id,
      user: req.user.id,
      action: 'CREATE',
      details: `Created project: ${name}`,
      meta: { phase: 'overview' }
    });

    res.status(201).json(project);
  } catch (err) {
    console.error("Create Project Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 2. GET ALL PROJECTS
// ==========================================
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('department', 'name') 
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 3. GET SINGLE PROJECT (Standardized to :id)
// ==========================================
exports.getProjectById = async (req, res) => {
  try {
    // Matches router.get('/:id')
    const project = await Project.findById(req.params.id)
      .populate('department', 'name')
      .populate('assignedUsers.designers', 'name email')
      .populate('assignedUsers.developers', 'name email')
      .populate('assignedUsers.testers', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// ==========================================
// 4. UPDATE PROJECT DETAILS (Standardized to :id)
// ==========================================
exports.updateProjectDetails = async (req, res) => {
  try {
    // ⭐ FIXED: Matches router.put('/:id/details')
    const { id } = req.params; 
    const updates = req.body;

    if (!updates.name) return res.status(400).json({ message: "Project Name is required" });

    const project = await Project.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Log Activity
    await Activity.create({
      project: id,
      user: req.user.id,
      action: 'UPDATE', 
      details: `Updated details for: ${project.name}`,
      meta: { phase: 'overview' }
    });

    res.json(project);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 5. UPDATE PHASE & STATUS
// ==========================================
exports.updatePhase = async (req, res) => {
  try {
    // Note: This uses req.body, so it stays as projectId
    const { projectId, phase, status } = req.body;
    
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userRole = req.user.role;

    const allowedPhases = ['design', 'development', 'scripts', 'testing'];
    const allowedStatuses = ['TO_DO', 'IN_PROGRESS', 'DONE'];

    if (!allowedPhases.includes(phase)) return res.status(400).json({ message: "Invalid phase" });
    if (!allowedStatuses.includes(status)) return res.status(400).json({ message: "Invalid status" });

    // Permissions logic...
    let isAuthorized = (userRole === 'MANAGER') || 
                       (userRole === 'DESIGNER' && phase === 'design') || 
                       (userRole === 'DEVELOPER' && phase === 'development');

    if (!isAuthorized) return res.status(403).json({ message: "Access Denied" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.phases[phase] = status;

    // Auto-Calculate Global Status
    const currentPhases = { ...project.phases, [phase]: status }; // Safe merge
    const relevantStatuses = [currentPhases.design, currentPhases.development, currentPhases.scripts];
    
    const allDone = relevantStatuses.every(s => s === 'DONE');
    const allToDo = relevantStatuses.every(s => s === 'TO_DO');

    if (allDone) project.status = 'DONE';
    else if (allToDo) project.status = 'TO_DO';
    else project.status = 'IN_PROGRESS';

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 6. DELETE PROJECT (Standardized to :id)
// ==========================================
exports.deleteProject = async (req, res) => {
  try {
    // ⭐ FIXED: Matches router.delete('/:id')
    const { id } = req.params;
    
    const project = await Project.findByIdAndDelete(id);
    
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 7. FILE & ASSET MANAGEMENT
// ==========================================

exports.getSecureUrl = async (req, res) => {
  try {
    const { path, download, filename } = req.query; 
    if (!path) return res.status(400).json({ message: "Path is required" });

    let options = { download: download === 'true' ? (filename || true) : false };
    let { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(path, 3600, options);

    if (error && error.message.includes('Object not found') && path.includes(' ')) {
      const encodedPath = path.split('/').map(encodeURIComponent).join('/');
      const retry = await supabase.storage.from(BUCKET_NAME).createSignedUrl(encodedPath, 3600, options);
      if (!retry.error) { data = retry.data; error = null; }
    }

    if (error) throw error;
    res.json({ url: data.signedUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { activityId } = req.params;
    const log = await Activity.findById(activityId);
    if (!log) return res.status(404).json({ message: "File record not found" });

    if (log.meta && log.meta.cloudPath) {
      await supabase.storage.from(BUCKET_NAME).remove([log.meta.cloudPath]);
    }
    await Activity.findByIdAndDelete(activityId);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 8. UPLOAD THUMBNAIL (Standardized to :id)
// ==========================================
exports.uploadThumbnail = async (req, res) => {
  try {
    // ⭐ FIXED: Matches router.post('/:id/thumbnail')
    const { id } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No image file uploaded" });

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const fileName = `thumbnails/${id}-${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    project.thumbnailUrl = publicUrl;
    await project.save();

    res.json({ message: "Thumbnail updated", url: publicUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 9. DASHBOARD STATS
// ==========================================
// @desc    Get Dashboard Stats (Smart Phase-Based Overdue)
// @route   GET /api/projects/stats/dashboard
// @access  Private (Manager)
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();

    // 🧠 SMART OVERDUE LOGIC
    // A project is overdue if:
    // 1. The MAIN deadline passed AND it's not done.
    // 2. OR... The SCRIPT deadline passed AND script is not done.
    // 3. OR... The DESIGN deadline passed AND design is not done.
    // 4. OR... The DEV deadline passed AND dev is not done.
    
    const overdueQuery = {
      $or: [
        // A. Global Project Deadline
        { 
          deadline: { $lt: today }, 
          status: { $ne: 'DONE' } 
        },
        
        // B. Script Phase Overdue
        { 
          'phaseDetails.scripts.endDate': { $lt: today }, 
          'phases.scripts': { $ne: 'DONE' } 
        },

        // C. Design Phase Overdue
        { 
          'phaseDetails.design.endDate': { $lt: today }, 
          'phases.design': { $ne: 'DONE' } 
        },

        // D. Development Phase Overdue
        { 
          'phaseDetails.development.endDate': { $lt: today }, 
          'phases.development': { $ne: 'DONE' } 
        }
      ]
    };

    // Run all counts in parallel
    const [
      totalProjects,
      doneProjects,
      inProgressProjects,
      todoProjects,
      overdueProjects, // Now uses the smart query
      totalUsers,
      recentProjects
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: 'DONE' }),
      Project.countDocuments({ status: 'IN_PROGRESS' }),
      Project.countDocuments({ status: 'TO_DO' }),
      Project.countDocuments(overdueQuery), // 👈 APPLYING NEW LOGIC HERE
      User.countDocuments({ role: { $ne: 'ADMIN' } }),
      Project.find().sort({ updatedAt: -1 }).limit(5).select('name status updatedAt')
    ]);

    res.json({
      counts: {
        total: totalProjects,
        done: doneProjects,
        inProgress: inProgressProjects,
        todo: todoProjects,
        overdue: overdueProjects,
        people: totalUsers
      },
      recentActivity: recentProjects
    });

  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ error: err.message });
  }
};