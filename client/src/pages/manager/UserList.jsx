import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 1. IMPORT THIS
import { FaPlus, FaSearch, FaTrash, FaPen, FaEllipsisV } from 'react-icons/fa';
import api from '../../utils/api';
import UserModal from '../../components/UserModal';


const UserList = () => {
  const navigate = useNavigate(); // 👈 2. INITIALIZE HOOK (Critical!)

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Menu State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user permanently?")) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
        setOpenMenuId(null);
      } catch (err) {
        alert("Failed to delete user");
      }
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const toggleMenu = (id) => {
    if (openMenuId === id) setOpenMenuId(null);
    else setOpenMenuId(id);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#0B0E14] min-h-screen font-sans" onClick={() => setOpenMenuId(null)}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Users Management</h1>
        
        <div className="flex gap-4">
            <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-500 text-sm"/>
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="bg-[#151921] text-gray-300 pl-10 pr-4 py-2 rounded-lg border border-gray-700 outline-none w-64 focus:border-blue-500 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <button 
              onClick={handleCreate}
              className="bg-[#F25F33] hover:bg-[#d14d26] text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
            >
              <FaPlus /> Create
            </button>
        </div>
      </div>

      <div className="text-gray-400 mb-6 text-sm">Total Users: {users.length}</div>

      {loading ? (
        <div className="text-white animate-pulse">Loading users...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user._id} className="bg-[#151921] border border-gray-800 rounded-xl p-6 shadow-lg flex flex-col relative group hover:border-gray-600 transition-colors">
              
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-xl font-bold text-white truncate w-4/5">{user.name}</h3>
                <span className="text-gray-500 text-xs font-mono">{user.employeeId || 'ID-###'}</span>
              </div>
              
              <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider text-[10px]">{user.role}</p>
              
              <div className="mb-6">
                 {user.department ? (
                    <span className="text-white font-bold text-sm bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
                        {user.department.name}
                    </span>
                 ) : (
                    <span className="text-gray-600 text-sm italic">No Department</span>
                 )}
              </div>

              <div className="mt-auto flex gap-3">
                <button 
                    // ⭐ 3. THIS IS THE FIX: Ensure navigate is called correctly
                    onClick={() => navigate(`/dashboard-manager/users/${user._id}`)}
                    className="flex-1 bg-[#0B0E14] border border-gray-700 text-gray-300 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer"
                >
                    View Details
                </button>
                
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => toggleMenu(user._id)}
                        className="w-8 h-full flex items-center justify-center border border-gray-700 rounded-lg text-gray-500 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-all cursor-pointer"
                    >
                        <FaEllipsisV size={12} />
                    </button>

                    {openMenuId === user._id && (
                      <div className="absolute right-0 bottom-10 w-32 bg-[#1A1F2B] border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="w-full text-left px-4 py-3 text-xs text-gray-300 hover:bg-blue-600 hover:text-white flex items-center gap-2"
                        >
                          <FaPen size={10} /> Edit Details
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)}
                          className="w-full text-left px-4 py-3 text-xs text-red-400 hover:bg-red-600 hover:text-white border-t border-gray-700 flex items-center gap-2"
                        >
                          <FaTrash size={10} /> Delete User
                        </button>
                      </div>
                    )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchUsers}
        userToEdit={selectedUser}
      />
    </div>
  );
};

export default UserList;