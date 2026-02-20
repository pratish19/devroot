import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 IMPORT ADDED
import { FaSearch, FaBuilding, FaSpinner, FaUserTie } from 'react-icons/fa';
import api from '../../utils/api';
import UserSidebar from '../../components/UserSidebar';

const UserDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate(); // 👈 HOOK ADDED

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const myDeptId = currentUser?.department?._id || currentUser?.department;

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to load departments", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dept.description && dept.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return (
    <div className="flex h-screen bg-black text-white items-center justify-center font-sans">
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
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Departments</h1>
            <p className="text-sm text-gray-500">Company directory and team structure.</p>
          </div>

          <div className="relative group">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search departments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1c1c1e] border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none w-64 md:w-80 transition-all shadow-inner"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500 bg-[#0f0f11] rounded-2xl border border-dashed border-gray-800">
              <p>No departments found matching "{searchQuery}".</p>
            </div>
          ) : (
            filteredDepartments.map((dept) => {
              const isMyDept = String(dept._id) === String(myDeptId);

              return (
                <div 
                  key={dept._id}
                  onClick={() => navigate(`/dashboard-user/departments/${dept._id}`)} // 👈 NAVIGATION ADDED
                  className={`relative group bg-[#0b0c10] rounded-2xl p-6 transition-all border cursor-pointer ${
                    isMyDept 
                      ? 'border-blue-500/50 shadow-lg shadow-blue-900/10 bg-[#11141d]' 
                      : 'border-gray-800 hover:border-gray-500' // 👈 ADDED HOVER EFFECT
                  }`}
                >
                  {isMyDept && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                      Your Team
                    </div>
                  )}

                  <div className="flex items-start gap-5 mb-4">
                    <div className={`p-4 rounded-xl flex-shrink-0 ${
                      isMyDept ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700 group-hover:text-white'
                    } transition-colors`}>
                      <FaBuilding className="text-2xl" />
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className={`text-xl font-bold truncate transition-colors ${
                        isMyDept ? 'text-blue-100' : 'text-white group-hover:text-blue-400'
                      }`}>
                        {dept.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 line-clamp-3 mb-6 min-h-[60px]">
                    {dept.description || "No description provided for this department."}
                  </p>

                  <div className="pt-4 border-t border-gray-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                      <FaUserTie size={12} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">Manager</p>
                      <p className="text-sm text-gray-200 font-medium truncate">
                        {dept.manager?.name || 'Unassigned'}
                      </p>
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

export default UserDepartments;