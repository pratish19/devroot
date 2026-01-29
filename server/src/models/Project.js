const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: false }, // Made optional for now to match UI
  
  // ⭐ NEW METADATA FIELDS (from design)
  jiraId: { type: String, default: '' }, // Main Project JIRA
  projectType: { type: String, default: 'Simulation 2D' }, 
  subject: { type: String, default: 'Physics' },
  grade: { type: String, default: 'XI' },
  gradeGroup: { type: String, default: '9-11' },
  thumbnailUrl: { type: String, default: '' },

  // ⭐ NEW PHASE DETAILS (from design right column)
  // Stores assignments and specific JIRA IDs per phase
  phaseDetails: {
    scripts: {
        assignedTo: { type: String, default: '' }, 
        jiraId: { type: String, default: '' },
        startDate: { type: Date }, // New
        endDate: { type: Date }    // New
    },
    design: {
        assignedTo: { type: String, default: '' },
        jiraId: { type: String, default: '' },
        startDate: { type: Date }, // New
        endDate: { type: Date }    // New
    },
    development: {
        assignedTo: { type: String, default: '' },
        jiraId: { type: String, default: '' },
        startDate: { type: Date }, // New
        endDate: { type: Date }    // New
    }
  },
  // Keep existing tracking fields
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

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deadline: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);