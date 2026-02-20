import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaFolder, FaSpinner } from 'react-icons/fa';
import api from '../../utils/api';
import UserSidebar from '../../components/UserSidebar';

const UserProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, IN_PROGRESS, DONE, TO_DO
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      const userId = String(user.id || user._id);
      const userDept = user.department?._id || user.department;

      // 🧠 LOGIC: Filter projects assigned to ME or my DEPARTMENT
      const myProjects = res.data.filter(p => {
        const projectDept = p.department?._id || p.department;
        const isDeptMatch = projectDept && userDept && String(projectDept) === String(userDept);

        const checkList = (list) => (list || []).some(u => String(u._id || u) === userId);
        const isAssigned = checkList(p.assignedUsers?.designers) || 
                           checkList(p.assignedUsers?.developers) || 
                           checkList(p.assignedUsers?.testers) ||
                           checkList(p.assignedUsers?.scriptWriters);

        return isAssigned || isDeptMatch;
      });

      setProjects(myProjects);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filter & Search Logic
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.jiraId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filter === 'ALL' ? true : p.status === filter;

    return matchesSearch && matchesStatus;
  });

  // 🎨 Helper: Get Color Theme based on Status
  const getTheme = (status) => {
    switch(status) {
      case 'DONE': 
        return { folder: 'text-[#86efac]', pillText: 'text-green-700' }; // Green
      case 'IN_PROGRESS': 
        return { folder: 'text-[#60a5fa]', pillText: 'text-blue-700' }; // Blue
      default: 
        return { folder: 'text-gray-500', pillText: 'text-gray-700' }; // Grey
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'IN_PROGRESS') return 'In Progress';
    if (status === 'TO_DO') return 'To Do';
    return 'Done';
  };

  if (loading) return (
    <div className="flex h-screen bg-black text-white items-center justify-center">
      <UserSidebar />
      <div className="flex-1 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      <UserSidebar />
      
      <main className="flex-1 flex flex-col overflow-auto p-8">
        
        {/* HEADER & CONTROLS */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white">Projects</h1>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative group">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1c1c1e] border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none w-64 transition-all"
              />
            </div>

            {/* Filter Button */}
            <button 
              onClick={() => {
                const states = ['ALL', 'TO_DO', 'IN_PROGRESS', 'DONE'];
                const next = states[(states.indexOf(filter) + 1) % states.length];
                setFilter(next);
              }}
              className="p-2.5 bg-[#1c1c1e] border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-all active:scale-95"
              title={`Current Filter: ${filter.replace('_', ' ')}`}
            >
              <FaFilter />
            </button>
          </div>
        </header>

        {/* PROJECTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500 bg-[#0f0f11] rounded-2xl border border-dashed border-gray-800">
              <p>No projects found matching your criteria.</p>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const theme = getTheme(project.status);
              
              return (
                <div 
                  key={project._id}
                  onClick={() => navigate(`/dashboard-user/projects/${project._id}`)} 
                  className="group bg-[#0b0c10] border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition-all cursor-pointer flex gap-6 items-start relative shadow-lg hover:shadow-blue-900/10"
                >
                  {/* LEFT: Folder Icon + Status Pill */}
                  <div className="flex flex-col items-start gap-3 min-w-[80px]">
                    <FaFolder className={`text-[5rem] leading-none ${theme.folder} drop-shadow-lg transition-colors`} />
                    
                    <span className={`bg-white px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide shadow-md ${theme.pillText}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>

                  {/* RIGHT: Details Area */}
                  <div className="flex-1 flex flex-col gap-1.5 pt-1">
                    <h3 className="text-xl font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                      {project.name}
                    </h3>
                    
                    <div className="text-sm text-gray-400 font-medium">
                      {project.projectType || 'Standard Project'}
                    </div>

                    <div className="text-sm text-gray-400 font-medium">
                      Grade-{project.grade || 'N/A'}
                    </div>

                    <div className="text-sm text-gray-400 font-medium">
                      {project.subject || 'General'}
                    </div>

                    <div className="text-sm text-blue-500 font-bold font-mono mt-1">
                      {project.jiraId || 'NO-ID'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProjects;