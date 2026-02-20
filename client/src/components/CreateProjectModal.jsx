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
  const [users, setUsers] = useState([]); // Store all users

  // Complex State Structure
  const [formData, setFormData] = useState({
    name: 'Motional EMF',
    projectType: 'Simulation 2D',
    subject: 'Physics',
    grade: 'XI',
    jiraId: '',
    gradeGroup: '9-11',
    department: '', 
    // We store the selected User IDs here temporarily for the form
    assignedScriptWriter: '',
    assignedDesigner: '',
    assignedDeveloper: '',
    // Phase details for extra info like JIRA IDs
    phaseDetails: {
      scripts: { jiraId: '' },
      design: { jiraId: '' },
      development: { jiraId: '' }
    }
  });

  // Fetch data on mount
  useEffect(() => {
    if (isOpen) {
      // 1. Fetch Departments
      api.get('/departments').then(res => {
        setDepartments(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, department: res.data[0]._id }));
        }
      }).catch(err => console.error("Failed to fetch deps", err));

      // 2. Fetch Users (for Dropdowns)
      api.get('/users').then(res => {
        setUsers(res.data);
      }).catch(err => console.error("Failed to fetch users", err));
    }
  }, [isOpen]);

  // Filter Users by Role
  const designers = users.filter(u => u.role === 'DESIGNER');
  const developers = users.filter(u => u.role === 'DEVELOPER');
  // Assuming Managers or specific role handle scripts, adjust 'MANAGER' if needed
  const scriptWriters = users.filter(u => u.role === 'MANAGER' || u.role === 'SCRIPT_WRITER'); 

  // Handlers
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhaseJiraChange = (phase, value) => {
    setFormData(prev => ({
      ...prev,
      phaseDetails: {
        ...prev.phaseDetails,
        [phase]: { ...prev.phaseDetails[phase], jiraId: value }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Construct Payload to match Backend Schema
      // We map the selected single user ID into the arrays required by the backend
      const payload = {
        ...formData,
        assignedUsers: {
          designers: formData.assignedDesigner ? [formData.assignedDesigner] : [],
          developers: formData.assignedDeveloper ? [formData.assignedDeveloper] : [],
          // You can map script writers to one of these or a new field if backend supports it
          // For now, let's assume script writers might just be tracked in phaseDetails or ignored if schema doesn't support
        },
        // We also update the 'assignedTo' string in phaseDetails for display consistency if needed
        phaseDetails: {
          scripts: { 
            jiraId: formData.phaseDetails.scripts.jiraId,
            assignedTo: users.find(u => u._id === formData.assignedScriptWriter)?.name || ''
          },
          design: { 
            jiraId: formData.phaseDetails.design.jiraId,
            assignedTo: users.find(u => u._id === formData.assignedDesigner)?.name || ''
          },
          development: { 
            jiraId: formData.phaseDetails.development.jiraId,
            assignedTo: users.find(u => u._id === formData.assignedDeveloper)?.name || ''
          }
        }
      };

      await api.post('/projects', payload);
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
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-400 text-sm">Assigned to:</label>
                    <select 
                      value={formData.assignedScriptWriter}
                      onChange={(e) => handleChange('assignedScriptWriter', e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                    >
                      <option value="">-- Select Script Writer --</option>
                      {scriptWriters.map(u => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.employeeId || "No ID"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <InputField 
                    label="JIRA ID:" placeholder="JIRA ID"
                    value={formData.phaseDetails.scripts.jiraId}
                    onChange={(e) => handlePhaseJiraChange('scripts', e.target.value)}
                  />
                </div>
              </div>

               {/* Design Section */}
               <div>
                <h3 className="text-white font-bold mb-3 border-b border-gray-700 pb-1">Design</h3>
                <div className="space-y-3 pl-2">
                   <div className="flex flex-col gap-1">
                    <label className="text-gray-400 text-sm">Assigned to:</label>
                    <select 
                      value={formData.assignedDesigner}
                      onChange={(e) => handleChange('assignedDesigner', e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                    >
                      <option value="">-- Select Designer --</option>
                      {designers.map(u => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.employeeId || "No ID"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <InputField 
                    label="JIRA ID:" placeholder="JIRA ID"
                    value={formData.phaseDetails.design.jiraId}
                    onChange={(e) => handlePhaseJiraChange('design', e.target.value)}
                  />
                </div>
              </div>

               {/* Development Section */}
               <div>
                <h3 className="text-white font-bold mb-3 border-b border-gray-700 pb-1">Development</h3>
                <div className="space-y-3 pl-2">
                   <div className="flex flex-col gap-1">
                    <label className="text-gray-400 text-sm">Assigned to:</label>
                    <select 
                      value={formData.assignedDeveloper}
                      onChange={(e) => handleChange('assignedDeveloper', e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                    >
                      <option value="">-- Select Developer --</option>
                      {developers.map(u => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.employeeId || "No ID"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <InputField 
                    label="JIRA ID:" placeholder="JIRA ID"
                    value={formData.phaseDetails.development.jiraId}
                    onChange={(e) => handlePhaseJiraChange('development', e.target.value)}
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