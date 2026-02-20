import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await api.post('/auth/login', { email, password });
      
      // 🔍 DEBUG: Log the exact response to see what we got
      console.log("LOGIN RESPONSE:", res);

      // 🛡️ SAFE DATA EXTRACTION
      // Check if data is directly in 'res' (interceptor) or 'res.data' (standard)
      const data = res.data || res; 

      if (!data.token) {
        throw new Error("No token received from server");
      }

      // 1. Save to Local Storage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role); // 👈 Accessing role directly
      localStorage.setItem('user', JSON.stringify(data));

      console.log("✅ Login Success. Role:", data.role);

      // 2. Redirect based on Role
      if (data.role === 'MANAGER' || data.role === 'ADMIN') {
        navigate('/dashboard-manager');
      } else {
        navigate('/dashboard-user');
      }

    } catch (err) {
      console.error("Login Error:", err);
      // Handle different error structures
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMsg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0E14] font-sans">
      <div className="w-full max-w-md p-8 bg-[#151921] rounded-2xl border border-gray-800 shadow-2xl">
        
        <h2 className="text-3xl font-bold text-center text-blue-500 mb-2">DevRoot</h2>
        <p className="text-gray-400 text-center mb-8 text-sm">Sign in to your account</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
            <input 
              type="email" 
              className="w-full bg-[#0B0E14] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              className="w-full bg-[#0B0E14] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition-colors"
              placeholder="•••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-600/20"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;