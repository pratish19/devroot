const User = require('../models/User');
const Project = require('../models/Project'); // 👈 Import Project Model

// @desc    Get All Users
// @route   GET /api/users
// @access  Private (Manager)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('department', 'name key')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Create User
// @route   POST /api/users
// @access  Private (Manager)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, employeeId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password, 
      role: role || 'DEVELOPER',
      department: department || null,
      employeeId: employeeId || ''
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    });
  } catch (err) {
    console.error("Create User Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Update User
// @route   PUT /api/users/:id
// @access  Private (Manager)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, department, employeeId } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role, department: department || null, employeeId },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Update User Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Delete User
// @route   DELETE /api/users/:id
// @access  Private (Manager)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get Single User with Phase-Based Project Stats
// @route   GET /api/users/:id
// @access  Private (Manager)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch User
    const user = await User.findById(id).select('-password').populate('department');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. ⭐ SMART QUERY: Check both Assigned Arrays AND Phase Metadata
    // We check if the User ID is in the arrays OR if their ID/Name is in the 'assignedTo' strings
    const projects = await Project.find({
      $or: [
        // A. Standard Arrays (The most reliable check)
        { 'assignedUsers.designers': id },
        { 'assignedUsers.developers': id },
        { 'assignedUsers.testers': id },

        // B. Phase Specific Strings (For Script, Design, Dev leads)
        { 'phaseDetails.scripts.assignedTo': id }, 
        { 'phaseDetails.design.assignedTo': id },
        { 'phaseDetails.development.assignedTo': id },
        
        // C. Fallback: Check against User Name (in case you store "Alice" instead of ID)
        { 'phaseDetails.scripts.assignedTo': user.name },
        { 'phaseDetails.design.assignedTo': user.name },
        { 'phaseDetails.development.assignedTo': user.name }
      ]
    });

    // 3. Calculate Stats
    const stats = {
      total: projects.length,
      done: projects.filter(p => p.status === 'DONE').length,
      inProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
      todo: projects.filter(p => p.status === 'TO_DO').length
    };

    res.json({ user, projects, stats });

  } catch (err) {
    console.error("Get User Details Error:", err);
    res.status(500).json({ error: err.message });
  }
};