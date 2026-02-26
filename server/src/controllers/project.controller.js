  const Project = require('../models/Project');
  const Activity = require('../models/Activity');
  const User = require('../models/User'); 
  const { createClient } = require('@supabase/supabase-js');

  // Initialize Supabase (We removed BUCKET_NAME from here!)
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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
        
        // ✅ FIX: Use process.env directly
        await supabase.storage.from(process.env.SUPABASE_BUCKET).upload(`${projectPath}/.keep`, Buffer.from(''));
        for (const folder of folders) {
          await supabase.storage.from(process.env.SUPABASE_BUCKET).upload(`${projectPath}/${folder}/.keep`, Buffer.from(''));
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
  // 2. GET ALL PROJECTS (Updated)
  // ==========================================
  exports.getAllProjects = async (req, res) => {
    try {
      const projects = await Project.find()
        .populate('department', 'name')
        .populate('assignedUsers.designers', 'name email _id')
        .populate('assignedUsers.developers', 'name email _id')
        .populate('assignedUsers.testers', 'name email _id')
        .sort({ createdAt: -1 });

      res.json(projects);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  // ==========================================
  // 3. GET SINGLE PROJECT
  // ==========================================
  exports.getProjectById = async (req, res) => {
    try {
      const project = await Project.findById(req.params.id)
        .populate('department', 'name')
        .populate('assignedUsers.designers', 'name email employeeId')
        .populate('assignedUsers.developers', 'name email employeeId')
        .populate('assignedUsers.testers', 'name email employeeId')
        .populate('assignedUsers.scriptWriters', 'name email employeeId'); 

      if (!project) return res.status(404).json({ message: "Project not found" });

      res.json(project);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  // ==========================================
  // 4. UPDATE PROJECT DETAILS
  // ==========================================
  exports.updateProjectDetails = async (req, res) => {
    try {
      const { id } = req.params; 
      const updates = req.body;

      if (!updates.name) return res.status(400).json({ message: "Project Name is required" });

      const project = await Project.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!project) return res.status(404).json({ message: "Project not found" });

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
      const { projectId, phase, status } = req.body;
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const userRole = req.user.role;

      const allowedPhases = ['design', 'development', 'scripts', 'testing'];
      const allowedStatuses = ['TO_DO', 'IN_PROGRESS', 'DONE'];

      if (!allowedPhases.includes(phase)) return res.status(400).json({ message: "Invalid phase" });
      if (!allowedStatuses.includes(status)) return res.status(400).json({ message: "Invalid status" });

      let isAuthorized = (userRole === 'MANAGER') || 
                        (userRole === 'DESIGNER' && phase === 'design') || 
                        (userRole === 'DEVELOPER' && phase === 'development') ||
                        (userRole === 'SCRIPT_WRITER' && phase === 'scripts');

      if (!isAuthorized) return res.status(403).json({ message: "Access Denied" });

      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: "Project not found" });

      project.phases[phase] = status;

      const currentPhases = { ...project.phases, [phase]: status };
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
  // 6. DELETE PROJECT
  // ==========================================
  exports.deleteProject = async (req, res) => {
    try {
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

  exports.uploadProjectFile = async (req, res) => {
    try {
      const { id } = req.params;
      const folder = req.body.folder || 'general'; // 👈 Added fallback just in case
      const file = req.file;

      if (!file) return res.status(400).json({ message: "No file uploaded" });

      // Sanitize filename to prevent weird character bugs
      const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const cloudPath = `projects/${id}/${folder}/${Date.now()}-${cleanFileName}`;
      
      // ✅ FIX: Use process.env directly
      const { error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(cloudPath, file.buffer, { contentType: file.mimetype });

      if (error) {
        console.error("Supabase Storage Error:", error);
        return res.status(400).json({ message: "Supabase rejected the upload", error: error.message });
      }

      // Save to MongoDB
      const newActivity = await Activity.create({
        project: id,
        user: req.user.id,
        action: 'UPLOAD_FILE', 
        details: `Uploaded ${cleanFileName} to ${folder}`,
        meta: { 
          fileName: cleanFileName,
          fileSize: file.size,
          folder: folder, 
          cloudPath: cloudPath
        }
      });

      await newActivity.populate('user', 'name email');
      res.status(201).json(newActivity);
    } catch (err) {
      console.error("Upload Error:", err);
      res.status(500).json({ error: err.message });
    }
  };

  exports.getSecureUrl = async (req, res) => {
    try {
      const { path, download, filename } = req.query; 
      if (!path) return res.status(400).json({ message: "Path is required" });

      let options = { download: download === 'true' ? (filename || true) : false };
      
      // ✅ FIX: Use process.env directly
      let { data, error } = await supabase.storage.from(process.env.SUPABASE_BUCKET).createSignedUrl(path, 3600, options);

      if (error && error.message.includes('Object not found') && path.includes(' ')) {
        const encodedPath = path.split('/').map(encodeURIComponent).join('/');
        const retry = await supabase.storage.from(process.env.SUPABASE_BUCKET).createSignedUrl(encodedPath, 3600, options);
        if (!retry.error) { data = retry.data; error = null; }
      }

      if (error) throw error;
      res.json({ url: data.signedUrl });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  // ✅ UPDATED DELETE FILE FUNCTION (With Permission Check)
  exports.deleteFile = async (req, res) => {
    try {
      const { activityId } = req.params; 
      
      const log = await Activity.findById(activityId);
      if (!log) return res.status(404).json({ message: "File record not found" });

      const isManager = req.user.role === 'MANAGER';
      const isUploader = log.user.toString() === req.user.id;

      if (!isManager && !isUploader) {
        return res.status(403).json({ 
          message: "Permission Denied: You can only delete files you uploaded." 
        });
      }

      // ✅ FIX: Use process.env directly
      if (log.meta && log.meta.cloudPath) {
        await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([log.meta.cloudPath]);
      }
      
      await Activity.findByIdAndDelete(activityId);
      res.json({ message: "File deleted successfully" });
    } catch (err) {
      console.error("Delete Error:", err);
      res.status(500).json({ error: err.message });
    }
  };

  // ==========================================
  // 8. UPLOAD THUMBNAIL
  // ==========================================
  exports.uploadThumbnail = async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;
      if (!file) return res.status(400).json({ message: "No image file uploaded" });

      const project = await Project.findById(id);
      if (!project) return res.status(404).json({ message: "Project not found" });

      const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const fileName = `thumbnails/${id}-${Date.now()}-${cleanFileName}`;
      
      // ✅ FIX: Use process.env directly
      const { error } = await supabase.storage.from(process.env.SUPABASE_BUCKET).upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(fileName);
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
  exports.getDashboardStats = async (req, res) => {
    try {
      const today = new Date();
      const overdueQuery = {
        $or: [
          { deadline: { $lt: today }, status: { $ne: 'DONE' } },
          { 'phaseDetails.scripts.endDate': { $lt: today }, 'phases.scripts': { $ne: 'DONE' } },
          { 'phaseDetails.design.endDate': { $lt: today }, 'phases.design': { $ne: 'DONE' } },
          { 'phaseDetails.development.endDate': { $lt: today }, 'phases.development': { $ne: 'DONE' } }
        ]
      };

      const [total, done, inProgress, todo, overdue, users, recent] = await Promise.all([
        Project.countDocuments(),
        Project.countDocuments({ status: 'DONE' }),
        Project.countDocuments({ status: 'IN_PROGRESS' }),
        Project.countDocuments({ status: 'TO_DO' }),
        Project.countDocuments(overdueQuery),
        User.countDocuments({ role: { $ne: 'ADMIN' } }),
        Project.find().sort({ updatedAt: -1 }).limit(5).select('name status updatedAt')
      ]);

      res.json({
        counts: { total, done, inProgress, todo, overdue, people: users },
        recentActivity: recent
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };