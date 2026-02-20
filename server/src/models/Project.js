const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  
  // Basic Info
  projectType: { 
    type: String, 
    enum: ['Simulation 2D', 'Simulation 3D', 'Interactive Video'],
    default: 'Simulation 2D'
  },
  subject: { type: String, default: 'Physics' },
  grade: { type: String, default: 'XI' },
  gradeGroup: { type: String, default: '9-11' },
  jiraId: { type: String }, // Global JIRA ID

  // Status
  status: { 
    type: String, 
    enum: ['TO_DO', 'IN_PROGRESS', 'DONE'], 
    default: 'TO_DO' 
  },
  
  // Department Link
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  
  // ✅ THE CRITICAL FIX: Defined Arrays for Populate
  assignedUsers: {
    designers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    developers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    testers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    scriptWriters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // This was likely missing!
  },

  // ✅ Phase Details (Dates & JIRA)
  phaseDetails: {
    scripts: {
      jiraId: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      status: { type: String, default: 'TO_DO' }
    },
    design: {
      jiraId: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      status: { type: String, default: 'TO_DO' }
    },
    development: {
      jiraId: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      status: { type: String, default: 'TO_DO' }
    }
  },

  // Legacy Phases Support (Keep this for backward compatibility if needed)
  phases: {
    scripts: { type: String, default: 'TO_DO' },
    design: { type: String, default: 'TO_DO' },
    development: { type: String, default: 'TO_DO' },
    testing: { type: String, default: 'TO_DO' }
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);