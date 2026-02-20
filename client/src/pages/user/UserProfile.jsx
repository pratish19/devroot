import { useEffect, useState } from 'react';
import { FaUserCircle, FaEnvelope, FaIdBadge, FaBuilding, FaUserShield, FaSpinner } from 'react-icons/fa';
import api from '../../utils/api';
import UserSidebar from '../../components/UserSidebar';

const UserProfile = () => {
  // 1. Get initial data from localStorage so the UI doesn't flash empty
  const storedUser = JSON.parse(localStorage.getItem('user')) || {};
  
  // 2. Set up state to hold the fresh data
  const [user, setUser] = useState(storedUser);
  const [loading, setLoading] = useState(true);

  // 3. Fetch fresh data from the database on component mount
  useEffect(() => {
    const fetchFreshProfile = async () => {
      try {
        const userId = storedUser.id || storedUser._id;
        if (!userId) return;

        // Fetch the user by ID (Assuming this endpoint exists and populates department)
        const res = await api.get(`/users/${userId}`);
        
        // Update the component state with fresh DB data
        // ✅ New Code
setUser(res.data.user);
        
        // (Optional) Update localStorage so other parts of the app get the new info
        const updatedStorage = { ...storedUser, ...res.data };
        localStorage.setItem('user', JSON.stringify(updatedStorage));
      } catch (err) {
        console.error("Failed to fetch fresh user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFreshProfile();
  }, []);

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      
      <UserSidebar />

      <main className="flex-1 flex flex-col overflow-auto p-8">
        
        <header className="mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">My Profile</h1>
          <p className="text-sm text-gray-500">View your official DevRoot credentials and assignments.</p>
        </header>

        <div className="max-w-3xl">
          <div className="bg-[#0f1115] border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full pointer-events-none"></div>

            {loading && (
               <div className="absolute top-4 right-4 text-blue-500">
                 <FaSpinner className="animate-spin" />
               </div>
            )}

            <div className="flex items-center gap-6 mb-8 relative z-10">
              <div className="w-24 h-24 bg-[#13161c] rounded-full flex items-center justify-center border border-gray-700 shadow-lg">
                <FaUserCircle className="text-6xl text-gray-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{user.name || 'Unknown User'}</h2>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600/10 text-blue-400 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                    {user.role?.replace('_', ' ') || 'USER'}
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-gray-800/50 mb-8 relative z-10" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#13161c] rounded-xl border border-gray-800 text-gray-400">
                  <FaEnvelope size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Email Address</p>
                  <p className="text-gray-200 font-medium">{user.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#13161c] rounded-xl border border-gray-800 text-gray-400">
                  <FaIdBadge size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Employee ID</p>
                  <p className="text-blue-400 font-mono text-sm bg-blue-900/10 border border-blue-500/20 px-2 py-0.5 rounded inline-block">
                    {user.employeeId || 'NOT-ASSIGNED'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#13161c] rounded-xl border border-gray-800 text-gray-400">
                  <FaBuilding size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Department</p>
                  <p className="text-gray-200 font-medium capitalize">
                    {/* ✅ Handles both populated object OR gracefully falls back */}
                    {user.department?.name || (typeof user.department === 'string' ? 'Loading Dept...' : 'Unassigned')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#13161c] rounded-xl border border-gray-800 text-green-500/80">
                  <FaUserShield size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Account Status</p>
                  <p className="text-green-400 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    Active Workspace
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default UserProfile;