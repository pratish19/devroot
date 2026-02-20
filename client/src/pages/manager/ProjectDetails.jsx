import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import ProjectSidebar from '../../components/ProjectSidebar';
import { FaPen, FaSpinner, FaChevronDown } from 'react-icons/fa';
// ⭐ IMPORT THE EDIT MODAL
import EditProjectModal from '../../components/EditProjectModal';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingPhase, setUpdatingPhase] = useState(null); 
  
  // ⭐ STATE FOR EDIT MODAL
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const currentPhase = 'overview';

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const res = await api.get(`/projects/${id}`); // Ensure we fetch specific ID to get populated data
      setProject(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderSelect = (phase, subfolder = null) => {
    if (phase === 'overview') return;
    navigate(`/dashboard-manager/projects/${id}/${phase}/${subfolder || ''}`);
  };

  const handleStatusChange = async (e, phaseKey) => {
    e.stopPropagation(); 
    const newStatus = e.target.value;

    if (updatingPhase) return;
    setUpdatingPhase(phaseKey);

    try {
      const updatedPhases = { ...project.phases, [phaseKey]: newStatus };
      const values = Object.values(updatedPhases);
      
      let newGlobalStatus = 'IN_PROGRESS';
      if (values.every(s => s === 'DONE')) newGlobalStatus = 'DONE';
      else if (values.every(s => s === 'TO_DO')) newGlobalStatus = 'TO_DO';

      setProject(prev => ({
        ...prev,
        status: newGlobalStatus,
        phases: updatedPhases
      }));

      await api.patch('/projects/phase', {
        projectId: id,
        phase: phaseKey,
        status: newStatus
      });

    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status.");
      fetchProjectData(); 
    } finally {
      setUpdatingPhase(null);
    }
  };

  // ⭐ HELPER TO FORMAT DATES
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  // ⭐ HELPER TO GET ASSIGNED NAME FROM ARRAYS
  const getAssignedUser = (phaseKey) => {
    if (!project.assignedUsers) return 'Unassigned';
    
    let users = [];
    if (phaseKey === 'scripts') users = project.assignedUsers.scriptWriters;
    else if (phaseKey === 'design') users = project.assignedUsers.designers;
    else if (phaseKey === 'development') users = project.assignedUsers.developers;

    // Check if we have a user and return name
    if (users && users.length > 0) {
      return users[0].name || users[0].email || 'Unassigned';
    }
    return 'Unassigned';
  };

  if (loading || !project) return <div className="bg-black h-screen text-white p-10 flex items-center justify-center">Loading Mission Control...</div>;

  return (
    <div className="flex h-screen bg-black text-gray-100 overflow-hidden font-sans">
      
      <ProjectSidebar projectId={id} activePhase={currentPhase} onSelectFolder={handleFolderSelect} />

      <div className="flex-1 flex flex-col overflow-auto">
        <header className="px-8 py-4 border-b border-gray-800 flex items-center gap-2 text-sm text-gray-500">
          <span className="hover:text-white cursor-pointer" onClick={() => navigate('/dashboard-manager')}>DevRoot</span>
          <span>/</span>
          <span className="text-white font-bold">{project.name}</span>
          <span>/</span>
          <span className="text-white">Overview</span>
        </header>

        <div className="p-8 space-y-8">
          
          {/* Top Project Info Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-lg">
            <div className="flex flex-col space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
                  <p className="text-sm text-gray-400">{project.projectType || 'Simulation 2D'}</p>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                    project.status === 'DONE' ? 'bg-green-500 text-black' : 
                    project.status === 'TO_DO' ? 'bg-gray-700 text-gray-300' :
                    'bg-blue-600 text-white'
                  }`}>
                    {project.status?.replace('_', ' ')}
                  </span>
                  
                  {/* ⭐ CLICKING THIS NOW OPENS THE EDIT MODAL */}
                  <span 
                    onClick={() => setIsEditOpen(true)}
                    className="text-blue-400 text-sm font-mono cursor-pointer hover:underline flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {project.jiraId || 'Add JIRA ID'} <FaPen className="text-[10px]"/>
                  </span>
                </div>
              </div>
              <hr className="border-gray-800" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                <div>
                  <label className="block text-gray-500 text-[10px] uppercase tracking-widest mb-2">Subject</label>
                  <div className="text-gray-200 font-medium text-lg">{project.subject || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px] uppercase tracking-widest mb-2">Grade Group</label>
                  <div className="text-gray-200 font-medium text-lg">{project.gradeGroup || 'N/A'}</div>
                </div>
                <div className="md:col-span-3">
                    <label className="block text-gray-500 text-[10px] uppercase tracking-widest mb-2">Description</label>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-4xl">
                      {project.description || "No description provided for this mission."}
                    </p>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM CARDS: Phase Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['scripts', 'design', 'development'].map((phaseKey) => {
              // 1. Safely extract details for this specific phase
              const details = project.phaseDetails?.[phaseKey] || {};
              // 2. Get the assigned Name from the populated Arrays
              const assignedName = getAssignedUser(phaseKey);

              return (
                <div 
                  key={phaseKey}
                  onClick={() => handleFolderSelect(phaseKey)} 
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 cursor-pointer transition-all group relative overflow-visible"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-white capitalize group-hover:text-blue-400 transition-colors">
                      {phaseKey === 'scripts' ? 'Script Dev' : phaseKey}
                    </h3>

                    {/* Dropdown Menu */}
                    <div className="relative z-20" onClick={(e) => e.stopPropagation()}>
                      {updatingPhase === phaseKey && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-30 rounded">
                          <FaSpinner className="animate-spin text-white"/>
                        </div>
                      )}
                      
                      <div className="relative">
                        <select
                          value={project.phases[phaseKey]}
                          onChange={(e) => handleStatusChange(e, phaseKey)}
                          className={`appearance-none cursor-pointer pl-3 pr-8 py-1 rounded text-[10px] uppercase font-bold tracking-wider border outline-none transition-all ${
                            project.phases[phaseKey] === 'DONE' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                            project.phases[phaseKey] === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            'bg-gray-800 text-gray-500 border-gray-700'
                          }`}
                        >
                          <option value="TO_DO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                        <FaChevronDown className={`absolute right-2 top-1.5 text-[8px] pointer-events-none ${
                           project.phases[phaseKey] === 'DONE' ? 'text-green-400' : 
                           project.phases[phaseKey] === 'IN_PROGRESS' ? 'text-blue-400' : 
                           'text-gray-500'
                        }`} />
                      </div>
                    </div>

                  </div>
                  
                  <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Assigned</span>
                        <span className={`font-medium ${assignedName === 'Unassigned' ? 'text-gray-600 italic' : 'text-gray-300'}`}>
                          {assignedName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">JIRA ID</span>
                        <span className="text-blue-500/80 font-mono">
                          {details.jiraId || '---'}
                        </span>
                      </div>
                      
                      {/* ⭐ FIXED DYNAMIC DATES HERE */}
                      <div className="flex justify-between text-[11px] text-gray-600 mt-4 border-t border-gray-800 pt-4">
                        <span>Start: {formatDate(details.startDate)}</span>
                        <span>End: {formatDate(details.endDate)}</span>
                      </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ⭐ MOUNT THE EDIT MODAL */}
      <EditProjectModal 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        project={project} 
        onProjectUpdated={fetchProjectData} // 👈 THIS REFRESHES THE PAGE ON SAVE
      />

    </div>
  );
};

export default ProjectDetails;