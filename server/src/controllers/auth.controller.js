const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate Token Helper
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  console.log("📝 Register Request:", req.body);

  try {
    const { name, email, password, role, department } = req.body;

    // Check existing user
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Create User (Pass plain password, Model handles hashing)
    user = new User({ 
      name, 
      email, 
      password, 
      role, 
      department 
    });
    
    await user.save();
    console.log("✅ User Saved to DB");

    // Create Token
    const token = generateToken(user._id, user.role);

    res.status(201).json({ token, user: { id: user._id, name, email, role } });
  } catch (err) {
    console.error("❌ Register Error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  console.log("🔑 Login Request:", req.body.email);

  try {
    const { email, password } = req.body;
    
    // Check User
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ USE MODEL METHOD
    // This compares the plain text password with the hashed one in DB
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Create Token
    const token = generateToken(user._id, user.role);

    res.json({ 
        token, 
        _id: user._id,
        name: user.name, 
        email: user.email, 
        role: user.role,
        department: user.department 
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ error: err.message });
  }
};