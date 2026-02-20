const User = require('../models/User');
const Project = require('../models/Project'); // 👈 Import Project Model

// @desc    Get All Users
// @route   GET /api/users
// @access  Private (Manager)
exports.getAllUsers = async (req, res) => {
  try {
    // ✅ ADD 'employeeId' to the select list
    const users = await User.find().select('name email role employeeId');
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
// @desc    Get Single User with Phase-Based Project Stats
// @route   GET /api/users/:id
// @access  Private (Manager OR the User themselves)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // 🛡️ SAFETY NET & SECURITY CHECK
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized. Please log in." });
    }
    if (req.user.role !== 'MANAGER' && req.user.id !== id) {
      return res.status(403).json({ message: "Access denied. You can only view your own profile." });
    }

    // 1. Fetch User
    const user = await User.findById(id).select('-password').populate('department','name');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. ⭐ SMART QUERY: Check both Assigned Arrays AND Phase Metadata
    const projects = await Project.find({
      $or: [
        { 'assignedUsers.designers': id },
        { 'assignedUsers.developers': id },
        { 'assignedUsers.testers': id },
        { 'phaseDetails.scripts.assignedTo': id }, 
        { 'phaseDetails.design.assignedTo': id },
        { 'phaseDetails.development.assignedTo': id },
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

    // Return the combined object
    res.json({ user, projects, stats });

  } catch (err) {
    console.error("Get User Details Error:", err);
    res.status(500).json({ error: err.message });
  }
};