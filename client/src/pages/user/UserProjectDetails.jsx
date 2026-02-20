import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSpinner, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import api from '../../utils/api';
// ✅ IMPORT SHARED SIDEBAR
import ProjectSidebar from '../../components/ProjectSidebar'; 

const UserProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ STATE FOR STATUS UPDATING
  const [updatingPhase, setUpdatingPhase] = useState(null);

  // Get current user to check permissions
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = currentUser.id || currentUser._id;

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      console.error("Failed to fetch project", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getAssignedUser = (phaseKey) => {
    if (!project.assignedUsers) return 'Unassigned';
    
    let users = [];
    if (phaseKey === 'scripts') users = project.assignedUsers.scriptWriters;
    else if (phaseKey === 'design') users = project.assignedUsers.designers;
    else if (phaseKey === 'development') users = project.assignedUsers.developers;

    if (users && users.length > 0) {
      return users[0].name || 'Unassigned';
    }
    return 'Unassigned';
  };

  const isAssignedToMe = (phaseKey) => {
    if (!project.assignedUsers) return false;
    let users = [];
    if (phaseKey === 'scripts') users = project.assignedUsers.scriptWriters;
    else if (phaseKey === 'design') users = project.assignedUsers.designers;
    else if (phaseKey === 'development') users = project.assignedUsers.developers;
    
    return users.some(u => (u._id || u) === currentUserId);
  };

  // ✅ LOGIC: Handle Status Change (User Permission)
  const handleStatusChange = async (e, phaseKey) => {
    e.stopPropagation();
    const newStatus = e.target.value;

    if (updatingPhase) return;
    setUpdatingPhase(phaseKey);

    try {
      // 1. Optimistic UI Update
      const updatedPhases = { ...project.phases, [phaseKey]: newStatus };
      setProject(prev => ({
        ...prev,
        phases: updatedPhases
      }));

      // 2. API Call
      await api.patch('/projects/phase', {
        projectId: id,
        phase: phaseKey,
        status: newStatus
      });

    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status.");
      fetchProjectData(); // Revert on failure
    } finally {
      setUpdatingPhase(null);
    }
  };

  const handleFolderSelect = (phase, subfolder = null) => {
    if (phase === 'overview') {
       navigate(`/dashboard-user/projects/${id}`);
    } else {
       navigate(`/dashboard-user/projects/${id}/${phase}/${subfolder || ''}`);
    }
  };

  if (loading || !project) return <div className="flex h-screen bg-black items-center justify-center text-white"><FaSpinner className="animate-spin text-4xl"/></div>;

  return (
    <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden">
      
      {/* 1. ✅ PROJECT SIDEBAR (Universal) */}
      <ProjectSidebar 
        projectId={id} 
        activePhase="overview" 
        onSelectFolder={handleFolderSelect}
        onBack={() => navigate('/dashboard-user/projects')} // Logic to go back
        userRole="USER"
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col overflow-auto">
        
        {/* Header Breadcrumbs */}
        <header className="px-8 py-5 border-b border-gray-800 flex items-center gap-2 text-sm text-gray-500 bg-[#0b0c10]">
          <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/dashboard-user')}>DevRoot</span>
          <span>/</span>
          <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/dashboard-user/projects')}>My Projects</span>
          <span>/</span>
          <span className="text-white font-bold">{project.name}</span>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* 🟦 HERO CARD */}
          <div className="bg-[#0f1115] border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="flex flex-col space-y-6 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">{project.name}</h1>
                  <p className="text-sm text-gray-400 font-medium">{project.projectType || 'Simulation 2D'}</p>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider shadow-lg ${
                    project.status === 'DONE' ? 'bg-green-500 text-black' : 
                    project.status === 'TO_DO' ? 'bg-gray-700 text-gray-300' :
                    'bg-blue-600 text-white'
                  }`}>
                    {project.status?.replace('_', ' ')}
                  </span>
                  <span className="text-gray-500 text-xs font-mono border border-gray-800 px-2 py-1 rounded bg-black/20">
                    {project.jiraId || 'NO ID'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm pt-6 border-t border-gray-800/50">
                <div>
                  <label className="block text-gray-500 text-[10px] uppercase tracking-widest mb-1 font-bold">Subject</label>
                  <div className="text-gray-200 font-medium text-lg">{project.subject || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px] uppercase tracking-widest mb-1 font-bold">Grade Group</label>
                  <div className="text-gray-200 font-medium text-lg">{project.gradeGroup || 'N/A'}</div>
                </div>
                <div className="md:col-span-3">
                    <label className="block text-gray-500 text-[10px] uppercase tracking-widest mb-2 font-bold">Description</label>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {project.description || "No description provided for this mission."}
                    </p>
                </div>
              </div>
            </div>
          </div>

          {/* 🟨 PHASE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['scripts', 'design', 'development'].map((phaseKey) => {
              const details = project.phaseDetails?.[phaseKey] || {};
              const assignedName = getAssignedUser(phaseKey);
              const isMine = isAssignedToMe(phaseKey);

              return (
                <div 
                  key={phaseKey}
                  onClick={() => handleFolderSelect(phaseKey)} 
                  className={`relative rounded-xl p-6 cursor-pointer transition-all group overflow-hidden border ${
                    isMine 
                      ? 'bg-[#13161c] border-blue-500/50 shadow-lg shadow-blue-900/10' 
                      : 'bg-[#0b0c10] border-gray-800 hover:border-gray-600'
                  }`}
                >
                  {isMine && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
                      Assigned to You
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-6 mt-1">
                    <h3 className={`text-xl font-bold capitalize transition-colors ${
                      isMine ? 'text-blue-100' : 'text-white group-hover:text-blue-400'
                    }`}>
                      {phaseKey === 'scripts' ? 'Script Dev' : phaseKey}
                    </h3>

                    {/* STATUS CONTROL */}
                    <div className="relative z-20" onClick={(e) => e.stopPropagation()}>
                       {updatingPhase === phaseKey && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-30 rounded">
                            <FaSpinner className="animate-spin text-white"/>
                          </div>
                        )}

                        {/* ✅ IF MINE: Show Dropdown */}
                        {isMine ? (
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
                        ) : (
                          // 🔒 IF NOT MINE: Read Only Pill
                          <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${
                            project.phases[phaseKey] === 'DONE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                            project.phases[phaseKey] === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-gray-800 text-gray-500 border-gray-700'
                          }`}>
                            {project.phases[phaseKey]?.replace('_', ' ') || 'TO DO'}
                          </span>
                        )}
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
                        <span className="text-blue-500/80 font-mono text-xs">
                          {details.jiraId || '---'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-[11px] text-gray-600 mt-4 border-t border-gray-800 pt-4">
                        <span>Start: {formatDate(details.startDate)}</span>
                        <span>End: {formatDate(details.endDate)}</span>
                      </div>
                  </div>
                  
                  {/* Hover Arrow (Only if not editing status) */}
                  {!updatingPhase && (
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                        <FaChevronRight className="text-blue-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProjectDetails;