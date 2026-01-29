import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Login = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Send credentials to backend
      const res = await api.post('/auth/login', { email, password });
      
      console.log("🔥 LOGIN SUCCESS! Data:", res.data);

      // 2. ⭐ UNIFIED FIX: Save as 'user'
      // We save the WHOLE object { token: "...", user: { role: "...", ... } }
      localStorage.setItem('user', JSON.stringify(res.data)); 

      // 3. Navigate based on Role
      // Access role correctly from the nested object
      const role = res.data.user.role;
      
      if (role === 'MANAGER' || role === 'ADMIN') {
        navigate('/dashboard-manager');
      } else {
        navigate('/dashboard-user');
      }

    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-96 bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-blue-500">DevRoot</h1>
        <p className="text-gray-400 text-center text-sm mb-6">Sign in to your account</p>

        {error && (
          <div className="bg-red-500/20 text-red-200 text-sm p-3 rounded mb-4 text-center border border-red-500/50">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Email</label>
            <input 
              type="email" 
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="name@devroot.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded font-bold transition-all"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;