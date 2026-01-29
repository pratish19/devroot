const Project = require('../models/Project');
const Activity = require('../models/Activity');
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// --- 🔌 SUPABASE CONFIG ---
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const BUCKET_NAME = process.env.SUPABASE_BUCKET;

// --- 🔧 UTILITIES ---

const getPhaseFromPath = (uploadPath) => {
  const rootFolder = uploadPath.split("/")[0]; 
  switch (rootFolder) {
    case "designs": return "design";
    case "scripts": return "scripts";
    case "development": return "development";
    case "testing": return "testing";
    default: return null;
  }
};

const canUploadToFolder = (role, uploadPath) => {
  const root = uploadPath.split("/")[0];
  if (role === 'MANAGER') return true; 
  if (role === 'DESIGNER' && root === 'designs') return true;
  if (role === 'DEVELOPER' && root === 'development') return true;
  return false;
};

// --- 💾 MULTER CONFIG (MEMORY) ---
// We store file in RAM temporarily so we can pass it to Supabase
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|docx|txt|mp4/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) return cb(null, true);
  cb(new Error('Error: File type not allowed!'));
};

const upload = multer({ 
  storage, 
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB Limit
  fileFilter
});

// --- 🎮 CONTROLLER ---

exports.uploadFile = async (req, res) => {
  try {
    const { projectId, folderPath } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    // 1. Permission Check
    if (!canUploadToFolder(req.user.role, folderPath)) {
      return res.status(403).json({ message: "Access Denied for this folder" });
    }

    // 2. Project Check
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // 3. ☁️ UPLOAD TO SUPABASE
    // Path: projectId/folderPath/timestamp-filename
    // Example: 65b2ed.../designs/assets/17000123-logo.png
    const fileName = `${Date.now()}-${file.originalname}`;
    const supabasePath = `${projectId}/${folderPath}/${fileName}`;

    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(supabasePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) throw error;

    // 4. Status Automation (Your "Brain" Logic)
    const phase = getPhaseFromPath(folderPath);
    if (phase && project.phases[phase] === 'TO_DO') {
      project.phases[phase] = 'IN_PROGRESS';
      
      const values = Object.values({
        design: project.phases.design,
        development: project.phases.development,
        scripts: project.phases.scripts,
        testing: project.phases.testing
      });
      
      if (values.every(v => v === 'DONE')) project.status = 'DONE';
      else if (values.every(v => v === 'TO_DO')) project.status = 'TO_DO';
      else project.status = 'IN_PROGRESS';
      
      await project.save();
    }

    // 5. Activity Log (Now with Cloud Path)
    await Activity.create({
      project: projectId,
      user: req.user.id,
      action: 'UPLOAD',
      details: `Uploaded ${file.originalname}`,
      meta: {
        fileName: fileName,
        folderPath: folderPath, // Logical path
        cloudPath: data.path,   // Supabase physical path
        phase: phase
      }
    });

    res.status(201).json({ 
      message: "Uploaded to Cloud", 
      path: data.path,
      projectStatus: project.status
    });

  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.uploadMiddleware = upload.single('file');