import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaUserMinus } from 'react-icons/fa'; // 👈 New Icons
import api from '../../utils/api';

const DepartmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [department, setDepartment] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/departments/${id}`);
        setDepartment(res.data.department);
        setUsers(res.data.users || []); 
      } catch (err) {
        console.error("Failed to load details", err);
        setError('Failed to load department details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id]);

  // ⭐ NEW: Handle Unassigning User
  const handleRemoveUser = async (userId) => {
    // Clear warning to the manager
    if (window.confirm("Remove this user from the department? \n\n(Note: The user account will NOT be deleted. They will just be unassigned.)")) {
      try {
        await api.put('/departments/remove-user', { userId });
        
        // Remove from UI instantly
        setUsers(users.filter(user => user._id !== userId));
      } catch (err) {
        alert("Failed to remove user");
        console.error(err);
      }
    }
  };

  if (loading) return <div className="p-8 text-white animate-pulse">Loading details...</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;
  if (!department) return <div className="p-8 text-white">Department not found.</div>;

  return (
    <div className="p-8 bg-[#0B0E14] min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
            <FaArrowLeft />
          </button>
          <h1 className="text-3xl font-bold text-white">{department?.name || 'Unnamed Dept'}</h1>
        </div>
        
        {/* ⭐ REMOVED "CREATE" BUTTON, JUST SEARCH NOW */}
        <div className="flex gap-4">
             <input type="text" placeholder="Search users..." className="bg-[#151921] text-gray-300 px-4 py-2 rounded-lg border border-gray-700 outline-none w-64"/>
        </div>
      </div>

      {/* USERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user._id} className="bg-[#151921] border border-gray-800 rounded-xl p-6 shadow-lg flex flex-col relative group hover:border-gray-600 transition-colors">
              
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-xl font-bold text-white">{user.name}</h3>
                <span className="text-gray-500 text-xs font-mono">{user.employeeId || 'ID-###'}</span>
              </div>
              
              <p className="text-gray-400 text-sm mb-1">{user.role || 'Employee'}</p>
              <p className="text-white font-bold text-sm mb-6 opacity-50">{department.name}</p>

              <div className="mt-auto flex gap-3">
                <button className="flex-1 bg-[#0B0E14] border border-gray-700 text-gray-300 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors">
                    View Details
                </button>
                
                {/* ⭐ NEW: UNASSIGN BUTTON (Trash Icon) */}
                <button 
                  onClick={() => handleRemoveUser(user._id)}
                  title="Remove from Department"
                  className="w-8 flex items-center justify-center border border-gray-700 rounded-lg text-gray-500 hover:text-red-400 hover:border-red-500 hover:bg-red-500/10 transition-all"
                >
                    <FaTrash size={12} />
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-3 text-gray-500 italic p-4 border border-gray-800 rounded-lg bg-[#151921]/50">
            No users found in the {department.name} department.
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentDetails;