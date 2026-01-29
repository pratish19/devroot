import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import api from '../utils/api';

// Helper Component for consistently styled inputs
const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="flex flex-col gap-1">
    <label className="text-gray-400 text-sm">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
    />
  </div>
);

// Helper Component for consistently styled dropdowns
const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1">
    <label className="text-gray-400 text-sm">{label}</label>
    <select 
      value={value}
      onChange={onChange}
      className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: '2.5rem' }}
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Complex State Structure to match the design
  const [formData, setFormData] = useState({
    name: 'Motional EMF',
    projectType: 'Simulation 2D',
    subject: 'Physics',
    grade: 'XI',
    jiraId: '',
    gradeGroup: '9-11',
    department: '', // Hidden but needed for backend
    phaseDetails: {
    scripts: { assignedTo: '', jiraId: '' },
    design: { assignedTo: '', jiraId: '' },
    development: { assignedTo: '', jiraId: '' }
    }
  });

  // Fetch departments silently to satisfy backend requirement
  useEffect(() => {
    if (isOpen) {
      api.get('/departments').then(res => {
        setDepartments(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, department: res.data[0]._id }));
        }
      }).catch(err => console.error("Failed to fetch deps", err));
    }
  }, [isOpen]);


  // Handlers for simple fields
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handler for nested phase fields (e.g., scripts.assignedTo)
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
      await api.post('/projects', formData);
      onProjectCreated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm font-sans">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden relative animate-fadeIn font-sans">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white">
          <FaTimes size={20} />
        </button>

        <h2 className="text-center text-2xl font-bold text-white mt-8 mb-8">Create New Project</h2>

        <form onSubmit={handleSubmit} className="px-10 pb-10">
          <div className="grid grid-cols-2 gap-12">
            
            {/* 🟢 LEFT COLUMN: Basic Info */}
            <div className="space-y-5">
              <InputField 
                label="Name" 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
              />
              
              <SelectField 
                label="Type" 
                value={formData.projectType} 
                onChange={(e) => handleChange('projectType', e.target.value)}
                options={['Simulation 2D', 'Simulation 3D', 'Interactive Video']}
              />

              <SelectField 
                label="Subject" 
                value={formData.subject} 
                onChange={(e) => handleChange('subject', e.target.value)}
                options={['Physics', 'Chemistry', 'Biology', 'Math']}
              />
              
              <SelectField 
                label="Grade" 
                value={formData.grade} 
                onChange={(e) => handleChange('grade', e.target.value)}
                options={['IX', 'X', 'XI', 'XII']}
              />
              
              <InputField 
                label="JIRA ID" 
                placeholder="Global Project ID"
                value={formData.jiraId} 
                onChange={(e) => handleChange('jiraId', e.target.value)} 
              />

              <SelectField 
                label="Grade Group" 
                value={formData.gradeGroup} 
                onChange={(e) => handleChange('gradeGroup', e.target.value)}
                options={['9-11', '10-12', 'K-8']}
              />
            </div>

            {/* 🟢 RIGHT COLUMN: Phase Details */}
            <div className="space-y-8">
              
              {/* Script Section */}
              <div>
                <h3 className="text-white font-bold mb-3 border-b border-gray-700 pb-1">Script</h3>
                <div className="space-y-3 pl-2">
                  <InputField 
                    label="Assigned to:" placeholder="Enter Name"
                    value={formData.phaseDetails.scripts.assignedTo}
                    onChange={(e) => handlePhaseChange('scripts', 'assignedTo', e.target.value)}
                  />
                  <InputField 
                    label="JIRA ID:" placeholder="JIRA ID"
                    value={formData.phaseDetails.scripts.jiraId}
                    onChange={(e) => handlePhaseChange('scripts', 'jiraId', e.target.value)}
                  />
                </div>
              </div>

               {/* Design Section */}
               <div>
                <h3 className="text-white font-bold mb-3 border-b border-gray-700 pb-1">Design</h3>
                <div className="space-y-3 pl-2">
                  <InputField 
                    label="Assigned to:" placeholder="Enter Name"
                    value={formData.phaseDetails.design.assignedTo}
                    onChange={(e) => handlePhaseChange('design', 'assignedTo', e.target.value)}
                  />
                  <InputField 
                    label="JIRA ID:" placeholder="JIRA ID"
                    value={formData.phaseDetails.design.jiraId}
                    onChange={(e) => handlePhaseChange('design', 'jiraId', e.target.value)}
                  />
                </div>
              </div>

               {/* Development Section */}
               <div>
                <h3 className="text-white font-bold mb-3 border-b border-gray-700 pb-1">Development</h3>
                <div className="space-y-3 pl-2">
                  <InputField 
                    label="Assigned to:" placeholder="Enter Name"
                    value={formData.phaseDetails.development.assignedTo}
                    onChange={(e) => handlePhaseChange('development', 'assignedTo', e.target.value)}
                  />
                  <InputField 
                    label="JIRA ID:" placeholder="JIRA ID"
                    value={formData.phaseDetails.development.jiraId}
                    onChange={(e) => handlePhaseChange('development', 'jiraId', e.target.value)}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* 🟢 FOOTER: Buttons */}
          <div className="flex justify-center gap-4 mt-12">
            <button 
              type="button" 
              onClick={onClose}
              className="px-8 py-2.5 rounded bg-gray-700 text-gray-300 font-bold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-2.5 rounded bg-[#F25F33] text-white font-bold hover:bg-[#d14d26] transition-colors flex items-center gap-2"
            >
              {loading && <FaSpinner className="animate-spin"/>}
              + Create
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;