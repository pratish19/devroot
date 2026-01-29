import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaSave } from 'react-icons/fa';
import api from '../utils/api';

// Reusable Input
const InputField = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</label>}
    <input 
      type={type}
      value={value || ''} // Handle nulls safely
      onChange={onChange}
      placeholder={placeholder}
      className="bg-[#1C2129] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none transition-colors w-full"
    />
  </div>
);

// Reusable Dropdown
const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</label>}
    <select 
      value={value || ''}
      onChange={onChange}
      className="bg-[#1C2129] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const EditProjectModal = ({ isOpen, onClose, project, onProjectUpdated }) => {
  const [loading, setLoading] = useState(false);
  
  // Initial State structure
  const [formData, setFormData] = useState({
    name: '',
    projectType: 'Simulation 2D',
    subject: 'Physics',
    grade: 'XI',
    gradeGroup: '9-11',
    jiraId: '',
    phaseDetails: {
      scripts: { assignedTo: '', jiraId: '', startDate: '', endDate: '' },
      design: { assignedTo: '', jiraId: '', startDate: '', endDate: '' },
      development: { assignedTo: '', jiraId: '', startDate: '', endDate: '' }
    }
  });

  // Load project data when modal opens
  useEffect(() => {
    if (project && isOpen) {
      // Helper to format date for input (YYYY-MM-DD)
      const fmtDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';
      
      setFormData({
        name: project.name || '',
        projectType: project.projectType || 'Simulation 2D',
        subject: project.subject || 'Physics',
        grade: project.grade || 'XI',
        gradeGroup: project.gradeGroup || '9-11',
        jiraId: project.jiraId || '',
        phaseDetails: {
          scripts: {
            ...project.phaseDetails?.scripts,
            startDate: fmtDate(project.phaseDetails?.scripts?.startDate),
            endDate: fmtDate(project.phaseDetails?.scripts?.endDate),
          },
          design: {
            ...project.phaseDetails?.design,
            startDate: fmtDate(project.phaseDetails?.design?.startDate),
            endDate: fmtDate(project.phaseDetails?.design?.endDate),
          },
          development: {
            ...project.phaseDetails?.development,
            startDate: fmtDate(project.phaseDetails?.development?.startDate),
            endDate: fmtDate(project.phaseDetails?.development?.endDate),
          }
        }
      });
    }
  }, [project, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhaseChange = (phase, field, value) => {
    setFormData(prev => ({
      ...prev,
      phaseDetails: {
        ...prev.phaseDetails,
        [phase]: {
          ...prev.phaseDetails[phase],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Send PUT request to update
      await api.put(`/projects/${project._id}/details`, formData);
      onProjectUpdated(); // Refresh parent list
      onClose();
    } catch (err) {
      alert("Failed to update project: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm font-sans p-4">
      <div className="bg-[#151921] border border-gray-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-800 bg-[#1C2129]">
          <h2 className="text-xl font-bold text-white">Edit Project</h2>
          <div className="flex gap-2">
             <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
               <FaTimes size={18} />
             </button>
          </div>
        </div>

        {/* Scrollable Form Area */}
        <div className="overflow-y-auto p-8 custom-scrollbar">
          <form id="edit-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* 🟢 LEFT COLUMN: Project Metadata (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <InputField label="Name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
              
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Type" value={formData.projectType} onChange={(e) => handleChange('projectType', e.target.value)} options={['Simulation 2D', 'Simulation 3D']} />
                <InputField label="JIRA ID" value={formData.jiraId} onChange={(e) => handleChange('jiraId', e.target.value)} />
              </div>

              <SelectField label="Subject" value={formData.subject} onChange={(e) => handleChange('subject', e.target.value)} options={['Physics', 'Chemistry', 'Math', 'Biology']} />
              
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Grade" value={formData.grade} onChange={(e) => handleChange('grade', e.target.value)} options={['IX', 'X', 'XI', 'XII']} />
                <SelectField label="Group" value={formData.gradeGroup} onChange={(e) => handleChange('gradeGroup', e.target.value)} options={['9-11', '10-12', 'K-8']} />
              </div>
            </div>

            {/* 🟢 RIGHT COLUMN: Phase Details (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Helper for rendering a phase row */}
              {['scripts', 'design', 'development'].map((phase) => (
                <div key={phase} className="bg-[#0B0E14] p-5 rounded-xl border border-gray-800">
                  <h3 className="text-white font-bold mb-4 capitalize border-b border-gray-800 pb-2 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {phase === 'scripts' ? 'Script Dev' : phase}
                  </h3>
                  
                  <div className="grid grid-cols-12 gap-4">
                    {/* Row 1: Assigned To (5 cols) | Start Date (3.5 cols) | End Date (3.5 cols) */}
                    <div className="col-span-5">
                      <InputField 
                        label="Assigned To" 
                        placeholder="Username"
                        value={formData.phaseDetails[phase].assignedTo}
                        onChange={(e) => handlePhaseChange(phase, 'assignedTo', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <InputField 
                        label="Start Date" 
                        type="date"
                        value={formData.phaseDetails[phase].startDate}
                        onChange={(e) => handlePhaseChange(phase, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="col-span-4">
                       <InputField 
                        label="End Date" 
                        type="date"
                        value={formData.phaseDetails[phase].endDate}
                        onChange={(e) => handlePhaseChange(phase, 'endDate', e.target.value)}
                      />
                    </div>

                    {/* Row 2: JIRA ID (Full Width for clarity, or split) */}
                    <div className="col-span-5">
                      <InputField 
                        label="Phase JIRA ID" 
                        placeholder="IG-XXXX"
                        value={formData.phaseDetails[phase].jiraId}
                        onChange={(e) => handlePhaseChange(phase, 'jiraId', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-gray-800 bg-[#1C2129] flex justify-end gap-4">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 rounded bg-gray-700 text-gray-300 font-bold hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="edit-form"
            disabled={loading}
            className="px-8 py-2.5 rounded bg-[#F25F33] text-white font-bold hover:bg-[#d14d26] transition-colors flex items-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin"/> : <FaSave />}
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditProjectModal;