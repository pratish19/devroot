import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Added for navigation
import { FaProjectDiagram, FaClock, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import api from '../../utils/api';
import UserSidebar from '../../components/UserSidebar';

const UserDashboard = () => {
  const navigate = useNavigate(); // 👈 Added hook
  const [stats, setStats] = useState({ assigned: 0, pending: 0, completed: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const userId = user?.id || user?._id;
        if (!userId) return;

        // 🚀 Hit the smart controller that calculates stats specifically for THIS user
        const res = await api.get(`/users/${userId}`); 
        
        const userStats = res.data.stats;
        const assignedProjects = res.data.projects;

        // Sort by newest first and get top 3
        const sortedProjects = assignedProjects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setRecentProjects(sortedProjects.slice(0, 3));
        
        // Update state with actual calculated numbers
        setStats({
          assigned: userStats.total, 
          pending: userStats.todo + userStats.inProgress,
          completed: userStats.done
        });
      } catch (err) {
        console.error("Dashboard Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserStats();
  }, []);

  if (loading) return <div className="flex h-screen bg-black items-center justify-center text-white"><FaSpinner className="animate-spin text-4xl"/></div>;

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      <UserSidebar />
      
      <main className="flex-1 overflow-y-auto p-8">
        {/* Welcome Section */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, <span className="text-blue-500">{user?.name}</span> 👋</h1>
          <p className="text-gray-400 mt-2">Here is what's happening with your projects today.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={<FaProjectDiagram />} label="Assigned Projects" value={stats.assigned} color="blue" />
          <StatCard icon={<FaClock />} label="Pending" value={stats.pending} color="yellow" />
          <StatCard icon={<FaCheckCircle />} label="Completed" value={stats.completed} color="green" />
        </div>

        {/* Recent Work Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Recent Projects</h2>
          <div className="space-y-4">
            {recentProjects.length === 0 ? (
              <p className="text-gray-500">No projects assigned yet.</p>
            ) : (
              recentProjects.map((project) => (
                <div 
                  key={project._id} 
                  onClick={() => navigate(`/dashboard-user/projects/${project._id}`)} // 👈 Made clickable
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors border border-gray-700/50 cursor-pointer" // 👈 Added cursor-pointer
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center text-lg font-bold uppercase">
                      {project.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{project.name}</h3>
                      <p className="text-sm text-gray-400">{project.department?.name || 'General'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    project.status === 'DONE' ? 'bg-green-500/20 text-green-400' :
                    project.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper Component for Stats
const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  return (
    <div className={`p-6 rounded-2xl border ${colors[color]} flex items-center gap-4`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
};

export default UserDashboard;