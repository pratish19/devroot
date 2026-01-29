import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  FaChartPie, 
  FaProjectDiagram, 
  FaUsers, 
  FaBuilding, 
  FaUserCircle, 
  FaSignOutAlt 
} from 'react-icons/fa';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ⭐ ROOT FIX: Read from 'user'
    const storedData = localStorage.getItem('user');

    if (!storedData) {
      navigate('/auth/login');
    } else {
      try {
        const parsedData = JSON.parse(storedData);
        // Handle nested structure: parsedData is { token: "...", user: {...} }
        // We want the inner .user object
        const userData = parsedData.user || parsedData;
        
        if (!userData) throw new Error("No user data found");
        
        setUser(userData);
      } catch (err) {
        console.error("Auth Data Error:", err);
        localStorage.clear();
        navigate('/auth/login');
      }
    }
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) return null;

  // 3. Define Menus
  const managerLinks = [
    { name: 'Dashboard', path: '/dashboard-manager', icon: <FaChartPie /> },
    { name: 'Projects', path: '/dashboard-manager/projects', icon: <FaProjectDiagram /> },
    { name: 'Users', path: '/dashboard-manager/users', icon: <FaUsers /> },
    { name: 'Departments', path: '/dashboard-manager/departments', icon: <FaBuilding /> },
  ];

  const userLinks = [
    { name: 'My Dashboard', path: '/dashboard-user', icon: <FaChartPie /> },
    { name: 'My Projects', path: '/dashboard-user/projects', icon: <FaProjectDiagram /> },
    { name: 'Profile', path: '/dashboard-user/profile', icon: <FaUserCircle /> },
  ];

  const role = user.role ? user.role.toUpperCase() : 'USER';
  const links = (role === 'MANAGER' || role === 'ADMIN') ? managerLinks : userLinks;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">DR</div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">DevRoot</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{user.role}</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button 
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="text-sm font-medium">{link.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-sm font-bold">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto bg-gray-900 relative">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default Layout;