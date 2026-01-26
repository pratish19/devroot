const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  
  assignedUsers: {
    designers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    developers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    testers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },

  phases: {
    design: { type: String, enum: ['TO_DO', 'IN_PROGRESS', 'DONE'], default: 'TO_DO' },
    development: { type: String, enum: ['TO_DO', 'IN_PROGRESS', 'DONE'], default: 'TO_DO' },
    scripts: { type: String, enum: ['TO_DO', 'IN_PROGRESS', 'DONE'], default: 'TO_DO' },
    testing: { type: String, enum: ['TO_DO', 'IN_PROGRESS', 'DONE'], default: 'TO_DO' }
  },

  status: { 
    type: String, 
    enum: ['TO_DO', 'IN_PROGRESS', 'DONE'], 
    default: 'TO_DO' 
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// ❌ NO PRE-SAVE HOOK HERE. WE REMOVED IT.

module.exports = mongoose.model('Project', ProjectSchema);