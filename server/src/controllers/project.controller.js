const Project = require('../models/Project');

// 🧠 HELPER: The Logic Brain
const calculateStatus = (phases) => {
  const values = Object.values(phases);
  if (values.every(v => v === 'DONE')) return 'DONE';
  if (values.every(v => v === 'TO_DO')) return 'TO_DO';
  return 'IN_PROGRESS';
};

// 1. Create Project
exports.createProject = async (req, res) => {
  try {
    const { name, description, department, assignedUsers } = req.body;

    const project = new Project({
      name,
      description,
      department,
      assignedUsers, 
      createdBy: req.user.id,
      status: 'TO_DO' // Default start
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Update Phase (With Logic)
exports.updatePhase = async (req, res) => {
  try {
    const { projectId, phase, status } = req.body;
    const userRole = req.user.role;

    // VALIDATION
    const allowedPhases = ['design', 'development', 'scripts', 'testing'];
    const allowedStatuses = ['TO_DO', 'IN_PROGRESS', 'DONE'];

    if (!allowedPhases.includes(phase)) return res.status(400).json({ message: "Invalid phase" });
    if (!allowedStatuses.includes(status)) return res.status(400).json({ message: "Invalid status" });

    // PERMISSION MATRIX
    let isAuthorized = false;
    if (userRole === 'MANAGER') isAuthorized = true;
    else if (userRole === 'DESIGNER' && phase === 'design') isAuthorized = true;
    else if (userRole === 'DEVELOPER' && phase === 'development') isAuthorized = true;

    if (!isAuthorized) {
      return res.status(403).json({ message: `Access Denied: ${userRole} cannot update ${phase}` });
    }

    // UPDATE LOGIC
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // 1. Update the phase
    project.phases[phase] = status;

    // 2. Recalculate Global Status Manually
    // We convert the Mongoose object to a plain JS object to read values safely
    const phaseValues = {
        design: project.phases.design,
        development: project.phases.development,
        scripts: project.phases.scripts,
        testing: project.phases.testing
    };
    // Force the update of the current phase in our temp object
    phaseValues[phase] = status; 
    
    project.status = calculateStatus(phaseValues);

    await project.save();
    res.json(project);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Get Projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('department', 'name')
      .populate('assignedUsers.designers', 'name')
      .populate('assignedUsers.developers', 'name');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};