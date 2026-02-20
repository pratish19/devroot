import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBuilding, FaSpinner, FaArrowLeft, FaUserCircle, FaEnvelope, FaIdBadge } from 'react-icons/fa';
import api from '../../utils/api';
import UserSidebar from '../../components/UserSidebar';

const UserDepartmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentDetails();
  }, [id]);

  const fetchDepartmentDetails = async () => {
    try {
      // Assuming your backend populates the 'users' array inside the department
      const res = await api.get(`/departments/${id}`);
      setDepartment(res.data);
    } catch (err) {
      console.error("Failed to load department details", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !department) return (
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
        
        {/* HEADER WITH BACK BUTTON */}
        <header className="mb-8 border-b border-gray-800 pb-6">
          <button 
            onClick={() => navigate('/dashboard-user/departments')}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-bold mb-4"
          >
            <FaArrowLeft /> Back to Directory
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#1c1c1e] border border-gray-800 rounded-xl text-blue-500">
              <FaBuilding className="text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1">{department.name}</h1>
              <p className="text-sm text-gray-400">
                Managed by: <span className="text-gray-200 font-medium">{department.manager?.name || 'Unassigned'}</span>
              </p>
            </div>
          </div>
        </header>

        {/* EMPLOYEES SECTION */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Team Members</h2>
          <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full font-bold">
            {department.users?.length || 0} Members
          </span>
        </div>

        {/* EMPLOYEES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {!department.users || department.users.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500 bg-[#0f0f11] rounded-2xl border border-dashed border-gray-800">
              <p>No employees have been assigned to this department yet.</p>
            </div>
          ) : (
            department.users.map((member) => (
              <div 
                key={member._id}
                className="bg-[#0b0c10] border border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-gray-600 transition-colors"
              >
                {/* Avatar */}
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-700 mb-4 shadow-lg">
                  <FaUserCircle className="text-4xl text-gray-500" />
                </div>
                
                {/* Name & Role */}
                <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                <span className="bg-blue-600/10 text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider border border-blue-500/20 mb-4">
                  {member.role?.replace('_', ' ') || 'Employee'}
                </span>

                {/* Details */}
                <div className="w-full space-y-2 mt-2 pt-4 border-t border-gray-800/50">
                  <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
                    <FaEnvelope className="text-gray-600" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
                    <FaIdBadge className="text-gray-600" />
                    <span className="font-mono bg-black/50 px-1.5 py-0.5 rounded">{member.employeeId || 'N/A'}</span>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
};

export default UserDepartmentDetails;