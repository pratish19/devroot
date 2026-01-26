const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['MANAGER', 'DESIGNER', 'DEVELOPER', 'TESTER'], 
    default: 'DEVELOPER' 
  },
  // 🔗 THE LINK IS NOW REAL
  department: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department' 
    // removed required: true temporarily to avoid crashing existing manager
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);