import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 1. Import this
import { FaPlus, FaSearch, FaEllipsisV, FaTrash, FaPen } from 'react-icons/fa';
import api from '../../utils/api';
import DepartmentModal from '../../components/DepartmentModal';

const DepartmentList = () => {
  const navigate = useNavigate(); // 👈 2. Initialize Hook
  
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const storedData = JSON.parse(localStorage.getItem('user')) || {};
  const userInfo = storedData.user || storedData;
  const userRole = userInfo.role ? userInfo.role.toUpperCase() : '';
  const isManager = userRole === 'MANAGER' || userRole === 'ADMIN';

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department? This cannot be undone.")) {
      try {
        await api.delete(`/departments/${id}`);
        setDepartments(departments.filter(dept => dept._id !== id));
        setOpenMenuId(null);
      } catch (err) {
        alert("Failed to delete department");
        console.error(err);
      }
    }
  };

  const handleEdit = (dept) => {
    setSelectedDept(dept);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCreate = () => {
    setSelectedDept(null);
    setIsModalOpen(true);
  };

  const toggleMenu = (id) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(id);
    }
  };

  return (
    <div className="p-8 bg-[#0B0E14] min-h-screen font-sans" onClick={() => setOpenMenuId(null)}> 
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Departments</h1>
        
        <div className="flex gap-4">
            <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-500 text-sm"/>
                <input type="text" placeholder="Search" className="bg-[#151921] text-gray-300 pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-gray-500 outline-none w-64 transition-colors"/>
            </div>
            
            {isManager && (
              <button onClick={handleCreate} className="bg-[#F25F33] hover:bg-[#d14d26] text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95">
                <FaPlus /> Create
              </button>
            )}
        </div>
      </div>

      <div className="text-gray-400 mb-6 text-sm">All Departments</div>

      {loading ? (
        <div className="text-white animate-pulse">Loading departments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept._id} className="bg-[#151921] border border-gray-800 rounded-xl p-6 shadow-lg hover:border-gray-600 transition-colors group relative">
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{dept.name}</h3>
              </div>

              <div className="text-gray-500 font-mono text-sm mb-6 uppercase tracking-wider border border-gray-700 inline-block px-2 py-0.5 rounded bg-gray-900">
                {dept.key}
              </div>

              <div className="flex justify-between items-center text-white mb-6">
                <span className="font-medium text-gray-400">Total Users</span>
                <span className="text-2xl font-bold">{dept.userCount || 0}</span>
              </div>

              <div className="flex gap-3 mt-4 items-center">
                <button 
                    // ⭐ 3. UPDATE ONCLICK TO NAVIGATE
                    onClick={() => navigate(`/dashboard-manager/departments/${dept._id}`)}
                    className="flex-1 bg-[#0B0E14] border border-gray-700 text-gray-300 py-2 rounded-lg hover:text-white hover:border-gray-500 transition-all font-bold text-sm"
                >
                    View Details
                </button>
                
                {isManager && (
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => toggleMenu(dept._id)}
                        className="w-10 h-10 flex items-center justify-center bg-[#0B0E14] border border-gray-700 text-gray-300 rounded-lg hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-all"
                    >
                        <FaEllipsisV size={14}/>
                    </button>

                    {openMenuId === dept._id && (
                      <div className="absolute right-0 bottom-12 w-32 bg-[#1A1F2B] border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
                        <button 
                          onClick={() => handleEdit(dept)}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-blue-600 hover:text-white flex items-center gap-2"
                        >
                          <FaPen size={10} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(dept._id)}
                          className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-600 hover:text-white border-t border-gray-700 flex items-center gap-2"
                        >
                          <FaTrash size={10} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <DepartmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        departmentToEdit={selectedDept}
        onSuccess={fetchDepartments}
      />
    </div>
  );
};

export default DepartmentList;