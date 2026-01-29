import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaPen, FaTrash, FaFolder } from 'react-icons/fa';
import api from '../../utils/api';

// Import both Modals
import CreateProjectModal from '../../components/CreateProjectModal';
import EditProjectModal from '../../components/EditProjectModal';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // State for Edit Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle Delete
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Don't navigate to details
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await api.delete(`/projects/${id}`);
        setProjects(prev => prev.filter(p => p._id !== id));
      } catch (err) {
        alert("Failed to delete project");
      }
    }
  };

  // Handle Edit Click
  const handleEditClick = (e, project) => {
    e.stopPropagation(); // Stop navigation to details page
    setSelectedProject(project); // Set the specific project to edit
    setIsEditOpen(true); // Open the modal
  };

  return (
    <div className="p-8 bg-[#0B0E14] min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-white">Active Projects</h1>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95"
        >
          <FaPlus /> New Project
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-gray-500 flex items-center gap-2">
           <span className="animate-pulse">Scanning missions...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div 
              key={project._id}
              onClick={() => navigate(`/dashboard-manager/projects/${project._id}`)}
              className="bg-[#151921] rounded-2xl p-6 border border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer group shadow-xl"
            >
              {/* Top Section: Folder + Info */}
              <div className="flex gap-6 mb-8">
                {/* Blue Folder Icon */}
                <div className="relative">
                   <div className="w-24 h-20 bg-blue-400 rounded-lg shadow-inner flex items-center justify-center relative">
                      <div className="absolute -top-2 left-0 w-10 h-3 bg-blue-300 rounded-t-sm"></div>
                      <FaFolder className="text-white/40 text-4xl" />
                   </div>
                   {/* Status Badge Overlapping Folder */}
                   <span className="absolute bottom-0 left-0 bg-white text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm whitespace-nowrap translate-y-2">
                     {project.status === 'IN_PROGRESS' ? 'In Progress' : project.status.replace('_', ' ')}
                   </span>
                </div>

                {/* Metadata List */}
                <div className="flex-1 space-y-1">
                  <h3 className="text-white font-bold text-xl mb-2 group-hover:text-blue-400 transition-colors truncate">
                    {project.name}
                  </h3>
                  <div className="text-gray-400 text-sm space-y-1">
                    <p>{project.projectType || 'Simulation 2D'}</p>
                    <p>Grade-{project.grade || 'XI'}</p>
                    <p>{project.subject || 'Physics'}</p>
                    <p className="font-mono text-blue-400/80 uppercase tracking-tighter text-xs">
                        {project.jiraId || 'NO-JIRA-ID'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Action Buttons */}
              <div className="flex gap-4">
                <button 
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1C2129] border border-gray-700 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  onClick={(e) => handleEditClick(e, project)}
                >
                  <FaPen size={12} /> Edit Project
                </button>
                <button 
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1C2129] border border-gray-700 text-white py-2 rounded-lg hover:bg-red-900/20 hover:border-red-500/50 hover:text-red-400 transition-all text-sm font-medium"
                  onClick={(e) => handleDelete(e, project._id)}
                >
                  <FaTrash size={12} /> Delete Project
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <CreateProjectModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)}
        onProjectCreated={fetchProjects}
      />

      {/* EDIT MODAL */}
      <EditProjectModal 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        project={selectedProject} // Pass the selected project data
        onProjectUpdated={fetchProjects} // Refresh list after save
      />

    </div>
  );
};

export default ProjectList;