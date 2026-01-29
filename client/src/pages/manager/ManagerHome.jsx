import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaProjectDiagram, FaCheckCircle, FaClock, FaList, 
  FaExclamationTriangle, FaUsers, FaArrowRight 
} from 'react-icons/fa';
import api from '../../utils/api';

const ManagerHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0, done: 0, inProgress: 0, todo: 0, overdue: 0, people: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/projects/stats/dashboard');
        setStats(res.data.counts);
        setRecentProjects(res.data.recentActivity);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8 bg-[#0B0E14] min-h-screen font-sans text-white">
      
      {/* 1. WELCOME SECTION */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, Manager.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard-manager/projects')}
          className="bg-[#F25F33] hover:bg-[#d14d26] text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-transform hover:scale-105"
        >
          View All Projects
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse text-gray-500">Loading insights...</div>
      ) : (
        <>
          {/* 2. STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {/* Total */}
            <DashboardCard 
              title="Total Projects" 
              count={stats.total} 
              icon={<FaProjectDiagram />} 
              color="text-blue-400" 
              bg="bg-blue-500/10"
              onClick={() => navigate('/dashboard-manager/projects')}
            />
            {/* Active */}
            <DashboardCard 
              title="In Progress" 
              count={stats.inProgress} 
              icon={<FaClock />} 
              color="text-yellow-400" 
              bg="bg-yellow-500/10"
            />
            {/* Done */}
            <DashboardCard 
              title="Completed" 
              count={stats.done} 
              icon={<FaCheckCircle />} 
              color="text-green-400" 
              bg="bg-green-500/10"
            />
            {/* To Do */}
            <DashboardCard 
              title="To Do" 
              count={stats.todo} 
              icon={<FaList />} 
              color="text-gray-400" 
              bg="bg-gray-500/10"
            />
            {/* 🚨 Overdue (Special Alert Style) */}
            <DashboardCard 
              title="Overdue" 
              count={stats.overdue} 
              icon={<FaExclamationTriangle />} 
              color="text-red-500" 
              bg="bg-red-500/10 border-red-500/30"
            />
            {/* People */}
            <DashboardCard 
              title="Total Staff" 
              count={stats.people} 
              icon={<FaUsers />} 
              color="text-purple-400" 
              bg="bg-purple-500/10"
              onClick={() => navigate('/dashboard-manager/users')}
            />
          </div>

          {/* 3. RECENT ACTIVITY & SHORTCUTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Recent Activity List */}
            <div className="lg:col-span-2 bg-[#151921] border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                Recently Updated
              </h2>
              <div className="space-y-3">
                {recentProjects.length > 0 ? recentProjects.map((proj) => (
                  <div key={proj._id} 
                       onClick={() => navigate(`/dashboard-manager/projects/${proj._id}`)}
                       className="flex justify-between items-center p-4 bg-[#0B0E14] rounded-xl border border-gray-800 hover:border-gray-600 cursor-pointer transition-all">
                    <div>
                      <h3 className="font-bold text-sm">{proj.name}</h3>
                      <p className="text-xs text-gray-500">Updated: {new Date(proj.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${getStatusColor(proj.status)}`}>
                      {proj.status.replace('_', ' ')}
                    </span>
                  </div>
                )) : (
                  <div className="text-gray-500 text-sm italic">No recent activity.</div>
                )}
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="bg-[#151921] border border-gray-800 rounded-2xl p-6">
               <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
               <div className="space-y-3">
                  <button onClick={() => navigate('/dashboard-manager/users')} 
                    className="w-full flex items-center justify-between p-4 bg-[#0B0E14] border border-gray-800 rounded-xl hover:bg-gray-800 transition-all text-left">
                    <span className="text-sm font-bold text-gray-300">Manage Users</span>
                    <FaArrowRight className="text-gray-500 size-3"/>
                  </button>
                  <button onClick={() => navigate('/dashboard-manager/departments')} 
                    className="w-full flex items-center justify-between p-4 bg-[#0B0E14] border border-gray-800 rounded-xl hover:bg-gray-800 transition-all text-left">
                    <span className="text-sm font-bold text-gray-300">View Departments</span>
                    <FaArrowRight className="text-gray-500 size-3"/>
                  </button>
               </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

// --- Helper Components ---

const DashboardCard = ({ title, count, icon, color, bg, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-5 rounded-2xl border border-transparent ${bg} ${onClick ? 'cursor-pointer hover:border-gray-600' : ''} transition-all flex flex-col justify-between h-32`}
  >
    <div className={`text-2xl mb-2 ${color}`}>{icon}</div>
    <div>
      <div className="text-3xl font-bold text-white">{count}</div>
      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{title}</div>
    </div>
  </div>
);

const getStatusColor = (status) => {
  if (status === 'DONE') return 'bg-green-500/10 text-green-400';
  if (status === 'IN_PROGRESS') return 'bg-yellow-500/10 text-yellow-400';
  return 'bg-gray-700 text-gray-300';
};

export default ManagerHome;