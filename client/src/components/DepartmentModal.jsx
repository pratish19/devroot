import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaSave } from 'react-icons/fa';
import api from '../utils/api';

const DepartmentModal = ({ isOpen, onClose, departmentToEdit, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', key: '' });

  // Reset or Load Data
  useEffect(() => {
    if (departmentToEdit) {
      setFormData({ name: departmentToEdit.name, key: departmentToEdit.key });
    } else {
      setFormData({ name: '', key: '' });
    }
  }, [departmentToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (departmentToEdit) {
        // Update existing
        await api.put(`/departments/${departmentToEdit._id}`, formData);
      } else {
        // Create new
        await api.post('/departments', formData);
      }
      onSuccess(); // Refresh the list
      onClose();
   } catch (err) {
      // ⭐ UPDATED ERROR HANDLING
      const serverError = err.response?.data?.error || err.response?.data?.message;
      alert("Error: " + (serverError || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#0B0E14] border border-gray-800 rounded-xl w-full max-w-md shadow-2xl p-6 relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <FaTimes />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">
          {departmentToEdit ? 'Edit Department' : 'Create Department'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-500 text-xs font-bold uppercase mb-1">Name</label>
            <input 
              required
              className="w-full bg-[#151921] border border-gray-700 rounded p-2.5 text-white focus:border-blue-500 outline-none transition-colors"
              placeholder="e.g. Interactive"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-bold uppercase mb-1">Key (Short Code)</label>
            <input 
              required
              maxLength="6"
              className="w-full bg-[#151921] border border-gray-700 rounded p-2.5 text-white focus:border-blue-500 outline-none uppercase font-mono"
              placeholder="e.g. IGE"
              value={formData.key}
              onChange={e => setFormData({...formData, key: e.target.value.toUpperCase()})}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-400 hover:text-white font-bold transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 rounded bg-[#F25F33] text-white font-bold hover:bg-[#d14d26] transition-colors flex items-center gap-2"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;