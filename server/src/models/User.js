const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  eemployeeId: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true // Forces "tx0930" to become "TX0930" automatically
  },
  role: { 
    type: String, 
    enum: ['ADMIN', 'MANAGER', 'DESIGNER', 'DEVELOPER', 'TESTER'], 
    default: 'DEVELOPER' 
  },
  department: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department' 
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// 🔒 SECURITY: Hash password before saving
// ⭐ FIX: Removed 'next' parameter. Async functions just return automatically.
UserSchema.pre('save', async function() {
  // Only hash if the password was modified (or is new)
  if (!this.isModified('password')) {
    return; // Just return, no next() needed
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // No next() call needed here either
});

// 🔑 METHOD: Verify password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);