import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaBriefcase, FaCheckCircle, FaClock, FaList } from 'react-icons/fa';
import api from '../../utils/api';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, done: 0, inProgress: 0, todo: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setUser(res.data.user);
        setProjects(res.data.projects || []);
        setStats(res.data.stats || { total: 0, done: 0, inProgress: 0, todo: 0 });
      } catch (err) {
        console.error("Failed to load user details", err);
        setError('Failed to load user data.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  if (loading) return <div className="p-8 text-white animate-pulse">Loading profile...</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;
  if (!user) return <div className="p-8 text-white">User not found</div>;

  return (
    <div className="p-8 bg-[#0B0E14] min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
          <FaArrowLeft />
        </button>
        <div>
           <h1 className="text-3xl font-bold text-white">{user?.name || 'Unknown User'}</h1>
           <div className="flex gap-3 text-sm text-gray-400 mt-1">
              <span className="flex items-center gap-1"><FaBriefcase /> {user?.role || 'N/A'}</span>
              <span className="flex items-center gap-1"><FaEnvelope /> {user?.email || 'No Email'}</span>
              {user?.employeeId && <span className="font-mono bg-gray-800 px-2 rounded text-xs py-0.5">{user.employeeId}</span>}
           </div>
        </div>
      </div>

      {/* 📊 STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Projects" count={stats?.total || 0} icon={<FaBriefcase />} color="bg-blue-500" />
        <StatCard label="Completed" count={stats?.done || 0} icon={<FaCheckCircle />} color="bg-green-500" />
        <StatCard label="In Progress" count={stats?.inProgress || 0} icon={<FaClock />} color="bg-yellow-500" />
        <StatCard label="To Do" count={stats?.todo || 0} icon={<FaList />} color="bg-gray-500" />
      </div>

      {/* PROJECT LIST */}
      <h2 className="text-xl font-bold text-white mb-6 border-l-4 border-[#F25F33] pl-3">Assigned Projects</h2>
      
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
             <div key={proj._id} className="bg-[#151921] border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all cursor-pointer"
                  onClick={() => navigate(`/dashboard-manager/projects/${proj._id}`)}>
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-white">{proj.name}</h3>
                   <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase 
                      ${proj.status === 'DONE' ? 'bg-green-500/20 text-green-400' : 
                        proj.status === 'IN_PROGRESS' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-300'}`}>
                      {proj.status?.replace('_', ' ') || 'STATUS'}
                   </span>
                </div>
                <p className="text-gray-500 text-xs mb-4 line-clamp-2">{proj.description}</p>
                <div className="text-xs text-gray-400 font-mono">
                   Deadline: {proj.deadline ? new Date(proj.deadline).toLocaleDateString() : 'N/A'}
                </div>
             </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 italic p-6 border border-gray-800 rounded-xl bg-[#151921]/50 text-center">
           No projects assigned to {user.name} yet.
        </div>
      )}
    </div>
  );
};

// Sub-component for Cards
const StatCard = ({ label, count, icon, color }) => (
  <div className="bg-[#151921] border border-gray-800 p-5 rounded-xl flex items-center gap-4">
     <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl shadow-lg ${color}`}>
        {icon}
     </div>
     <div>
        <div className="text-2xl font-bold text-white">{count}</div>
        <div className="text-gray-400 text-xs uppercase tracking-wider">{label}</div>
     </div>
  </div>
);

export default UserDetails;