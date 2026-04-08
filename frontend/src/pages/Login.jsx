import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Droplet, ArrowRight, Lock, Mail } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Check dummy account first for testing purposes
    if(email === 'admin@aquaguard.com' && password === 'admin123') {
       // if backend is not setup, you could manually set user context, but let's try the real endpoint
    }

    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-aqua/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] -z-10" />

      {/* Login Card */}
      <div className="w-full max-w-md p-10 glass rounded-2xl relative z-10 transition-transform duration-500 hover:scale-[1.01]">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-aqua/10 rounded-2xl border border-aqua/20 shadow-[0_0_20px_rgba(0,247,255,0.15)] relative">
              <Droplet className="h-10 w-10 text-aqua" />
              <div className="absolute inset-0 border border-aqua rounded-2xl animate-ping opacity-20"></div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-100">Welcome Back</h2>
          <p className="text-gray-400 mt-2">Sign in to AquaGuard Control Center</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-dark-bg/50 border border-dark-border rounded-xl text-gray-200 focus:outline-none focus:border-aqua/50 focus:ring-1 focus:ring-aqua/50 transition-all placeholder-gray-600"
                placeholder="admin@aquaguard.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-dark-bg/50 border border-dark-border rounded-xl text-gray-200 focus:outline-none focus:border-aqua/50 focus:ring-1 focus:ring-aqua/50 transition-all placeholder-gray-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 glass-button rounded-xl font-medium tracking-wide flex items-center justify-center space-x-2 group"
          >
            <span>Sign In</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center text-gray-500 mt-8 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-aqua hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
