import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaCalendarAlt } from 'react-icons/fa';
import api from '../utils/api';

// --- STYLED COMPONENTS ---

const InputField = ({ label, value, onChange, placeholder, type = "text", className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="bg-[#1a1d24] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</label>
    <select 
      value={value}
      onChange={onChange}
      className="bg-[#1a1d24] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer transition-all"
      style={{ 
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
        backgroundPosition: `right 0.75rem center`, 
        backgroundRepeat: `no-repeat`, 
        backgroundSize: `1.25em 1.25em`, 
        paddingRight: '2.5rem' 
      }}
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

// --- MAIN COMPONENT ---

const EditProjectModal = ({ isOpen, onClose, project, onProjectUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    projectType: '',
    subject: '',
    grade: '',
    jiraId: '',
    gradeGroup: '',
    // Assignments (IDs)
    assignedScriptWriter: '',
    assignedDesigner: '',
    assignedDeveloper: '',
    // Phase Details (Dates + JIRA)
    phaseDetails: {
      scripts: { jiraId: '', startDate: '', endDate: '' },
      design: { jiraId: '', startDate: '', endDate: '' },
      development: { jiraId: '', startDate: '', endDate: '' }
    }
  });

  // Fetch Users & Pre-fill Data
  useEffect(() => {
    if (isOpen && project) {
      api.get('/users')
        .then(res => setUsers(res.data))
        .catch(err => console.error("Failed to fetch users", err));

      const getAssignedId = (list) => {
        if (!list || list.length === 0) return '';
        const user = list[0];
        return user._id || user; 
      };

      const formatDate = (dateStr) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';

      setFormData({
        name: project.name || '',
        projectType: project.projectType || 'Simulation 2D',
        subject: project.subject || 'Physics',
        grade: project.grade || 'XI',
        jiraId: project.jiraId || '',
        gradeGroup: project.gradeGroup || '9-11',
        
        assignedScriptWriter: getAssignedId(project.assignedUsers?.scriptWriters),
        assignedDesigner: getAssignedId(project.assignedUsers?.designers),
        assignedDeveloper: getAssignedId(project.assignedUsers?.developers),
        
        phaseDetails: {
          scripts: { 
            jiraId: project.phaseDetails?.scripts?.jiraId || '',
            startDate: formatDate(project.phaseDetails?.scripts?.startDate),
            endDate: formatDate(project.phaseDetails?.scripts?.endDate),
          },
          design: { 
            jiraId: project.phaseDetails?.design?.jiraId || '',
            startDate: formatDate(project.phaseDetails?.design?.startDate),
            endDate: formatDate(project.phaseDetails?.design?.endDate),
          },
          development: { 
            jiraId: project.phaseDetails?.development?.jiraId || '',
            startDate: formatDate(project.phaseDetails?.development?.startDate),
            endDate: formatDate(project.phaseDetails?.development?.endDate),
          }
        }
      });
    }
  }, [isOpen, project]);

  // Filter Users
  const formatOptions = (list, defaultLabel) => [
    { value: '', label: defaultLabel },
    ...list.map(u => ({ value: u._id, label: `${u.name} (${u.employeeId || 'No ID'})` }))
  ];
  
  const designers = users.filter(u => u.role === 'DESIGNER');
  const developers = users.filter(u => u.role === 'DEVELOPER');
  const scriptWriters = users.filter(u => u.role === 'MANAGER' || u.role === 'SCRIPT_WRITER');

  // Handlers
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhaseChange = (phase, field, value) => {
    setFormData(prev => ({
      ...prev,
      phaseDetails: {
        ...prev.phaseDetails,
        [phase]: { ...prev.phaseDetails[phase], [field]: value }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        assignedUsers: {
          designers: formData.assignedDesigner ? [formData.assignedDesigner] : [],
          developers: formData.assignedDeveloper ? [formData.assignedDeveloper] : [],
          scriptWriters: formData.assignedScriptWriter ? [formData.assignedScriptWriter] : [],
        }
      };
      // Important: Ensure you preserve existing phaseDetails structure in backend or merge here
      await api.put(`/projects/${project._id}/details`, payload);
      onProjectUpdated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111318] border border-gray-800 rounded-xl w-full max-w-5xl shadow-2xl relative animate-fadeIn flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-800 bg-[#111318] sticky top-0 z-10 rounded-t-xl">
          <h2 className="text-xl font-bold text-white">Edit Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-12 gap-8">
            
            {/* 🟢 LEFT COLUMN: Project Info (4 cols) */}
            <div className="col-span-12 md:col-span-4 space-y-6">
              <InputField 
                label="Name" 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <SelectField 
                  label="Type" 
                  value={formData.projectType} 
                  onChange={(e) => handleChange('projectType', e.target.value)}
                  options={[{value:'Simulation 2D', label:'Simulation 2D'}, {value:'Simulation 3D', label:'Simulation 3D'}]}
                />
                <InputField 
                  label="Jira ID" 
                  value={formData.jiraId} 
                  onChange={(e) => handleChange('jiraId', e.target.value)} 
                />
              </div>

              <SelectField 
                label="Subject" 
                value={formData.subject} 
                onChange={(e) => handleChange('subject', e.target.value)}
                options={[{value:'Physics', label:'Physics'}, {value:'Chemistry', label:'Chemistry'}, {value:'Math', label:'Math'}]}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <SelectField 
                  label="Grade" 
                  value={formData.grade} 
                  onChange={(e) => handleChange('grade', e.target.value)}
                  options={[{value:'XI', label:'XI'}, {value:'XII', label:'XII'}]}
                />
                <SelectField 
                  label="Group" 
                  value={formData.gradeGroup} 
                  onChange={(e) => handleChange('gradeGroup', e.target.value)}
                  options={[{value:'9-11', label:'9-11'}, {value:'10-12', label:'10-12'}]}
                />
              </div>
            </div>

            {/* 🟢 RIGHT COLUMN: Phase Cards (8 cols) */}
            <div className="col-span-12 md:col-span-8 space-y-5">
              
              {/* CARD: Script Dev */}
              <div className="bg-[#0b0c10] border border-gray-800 rounded-xl p-5">
                <h3 className="text-blue-400 text-sm font-bold uppercase mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Script Dev
                </h3>
                <div className="grid grid-cols-12 gap-4 mb-4">
                  <div className="col-span-6">
                    <SelectField 
                      label="Assigned To"
                      value={formData.assignedScriptWriter}
                      onChange={(e) => handleChange('assignedScriptWriter', e.target.value)}
                      options={formatOptions(scriptWriters, "Select User")}
                    />
                  </div>
                  <div className="col-span-3">
                    <InputField type="date" label="Start Date" value={formData.phaseDetails.scripts.startDate} onChange={(e) => handlePhaseChange('scripts', 'startDate', e.target.value)} />
                  </div>
                  <div className="col-span-3">
                    <InputField type="date" label="End Date" value={formData.phaseDetails.scripts.endDate} onChange={(e) => handlePhaseChange('scripts', 'endDate', e.target.value)} />
                  </div>
                </div>
                <InputField label="Phase Jira ID" placeholder="IG-XXXX" value={formData.phaseDetails.scripts.jiraId} onChange={(e) => handlePhaseChange('scripts', 'jiraId', e.target.value)} />
              </div>

              {/* CARD: Design */}
              <div className="bg-[#0b0c10] border border-gray-800 rounded-xl p-5">
                <h3 className="text-blue-400 text-sm font-bold uppercase mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Design
                </h3>
                <div className="grid grid-cols-12 gap-4 mb-4">
                  <div className="col-span-6">
                    <SelectField 
                      label="Assigned To"
                      value={formData.assignedDesigner}
                      onChange={(e) => handleChange('assignedDesigner', e.target.value)}
                      options={formatOptions(designers, "Select User")}
                    />
                  </div>
                  <div className="col-span-3">
                    <InputField type="date" label="Start Date" value={formData.phaseDetails.design.startDate} onChange={(e) => handlePhaseChange('design', 'startDate', e.target.value)} />
                  </div>
                  <div className="col-span-3">
                    <InputField type="date" label="End Date" value={formData.phaseDetails.design.endDate} onChange={(e) => handlePhaseChange('design', 'endDate', e.target.value)} />
                  </div>
                </div>
                <InputField label="Phase Jira ID" placeholder="IG-XXXX" value={formData.phaseDetails.design.jiraId} onChange={(e) => handlePhaseChange('design', 'jiraId', e.target.value)} />
              </div>

               {/* CARD: Development */}
               <div className="bg-[#0b0c10] border border-gray-800 rounded-xl p-5">
                <h3 className="text-blue-400 text-sm font-bold uppercase mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Development
                </h3>
                <div className="grid grid-cols-12 gap-4 mb-4">
                  <div className="col-span-6">
                    <SelectField 
                      label="Assigned To"
                      value={formData.assignedDeveloper}
                      onChange={(e) => handleChange('assignedDeveloper', e.target.value)}
                      options={formatOptions(developers, "Select User")}
                    />
                  </div>
                  <div className="col-span-3">
                    <InputField type="date" label="Start Date" value={formData.phaseDetails.development.startDate} onChange={(e) => handlePhaseChange('development', 'startDate', e.target.value)} />
                  </div>
                  <div className="col-span-3">
                    <InputField type="date" label="End Date" value={formData.phaseDetails.development.endDate} onChange={(e) => handlePhaseChange('development', 'endDate', e.target.value)} />
                  </div>
                </div>
                <InputField label="Phase Jira ID" placeholder="IG-XXXX" value={formData.phaseDetails.development.jiraId} onChange={(e) => handlePhaseChange('development', 'jiraId', e.target.value)} />
              </div>

            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-8 py-5 border-t border-gray-800 bg-[#111318] rounded-b-xl sticky bottom-0 z-10">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-gray-800 text-gray-300 font-bold hover:bg-gray-700 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-[#F25F33] text-white font-bold hover:bg-[#d14d26] transition-colors flex items-center gap-2 text-sm shadow-lg shadow-orange-900/20"
          >
            {loading && <FaSpinner className="animate-spin"/>}
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditProjectModal;