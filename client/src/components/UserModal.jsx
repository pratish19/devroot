import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import api from '../utils/api';

const UserModal = ({ isOpen, onClose, onSuccess, userToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DEVELOPER',
    department: '',
    employeeId: ''
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Departments
  useEffect(() => {
    if (isOpen) {
      api.get('/departments')
        .then(res => setDepartments(res.data))
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  // 2. ⭐ Detect "Edit Mode" vs "Create Mode"
  useEffect(() => {
    if (userToEdit) {
      // EDIT MODE: Pre-fill data
      setFormData({
        name: userToEdit.name || '',
        email: userToEdit.email || '',
        password: '', // Leave blank to keep existing
        role: userToEdit.role || 'DEVELOPER',
        department: userToEdit.department?._id || userToEdit.department || '',
        employeeId: userToEdit.employeeId || ''
      });
    } else {
      // CREATE MODE: Reset
      setFormData({ name: '', email: '', password: '', role: 'DEVELOPER', department: '', employeeId: '' });
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (userToEdit) {
        // ⭐ UPDATE EXISTING
        await api.put(`/users/${userToEdit._id}`, formData);
      } else {
        // ⭐ CREATE NEW
        await api.post('/users', formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#151921] w-full max-w-md rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">
            {userToEdit ? 'Edit User' : 'Create New User'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
            <input required type="text" className="w-full bg-[#0B0E14] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-blue-500"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Employee ID</label>
                <input type="text" placeholder="e.g. TX0123" className="w-full bg-[#0B0E14] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-blue-500"
                  value={formData.employeeId} onChange={(e) => setFormData({...formData, employeeId: e.target.value})} />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                <select className="w-full bg-[#0B0E14] border border-gray-700 rounded-lg p-3 text-white outline-none"
                  value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="DEVELOPER">Developer</option>
                  <option value="DESIGNER">Designer</option>
                  <option value="TESTER">Tester</option>
                  <option value="MANAGER">Manager</option>
                </select>
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
            <input required type="email" className="w-full bg-[#0B0E14] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-blue-500"
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          {!userToEdit && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
              <input required type="password" className="w-full bg-[#0B0E14] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-blue-500"
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
            <select className="w-full bg-[#0B0E14] border border-gray-700 rounded-lg p-3 text-white outline-none"
              value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
              <option value="">No Department</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <button disabled={loading} className="w-full bg-[#F25F33] hover:bg-[#d14d26] text-white font-bold py-3 rounded-lg transition-all mt-4">
            {loading ? 'Processing...' : (userToEdit ? 'Save Changes' : 'Create User')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserModal;