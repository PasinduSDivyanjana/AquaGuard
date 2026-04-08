import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Droplet, ArrowRight, Lock, Mail, User, Shield } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'public'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await register(formData.name, formData.email, formData.password, formData.role);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center bg-dark-bg relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-aqua/10 rounded-full blur-[100px] -z-10" />
      
      <div className="w-full max-w-md p-8 glass rounded-2xl relative z-10 transition-transform duration-500 hover:scale-[1.01]">
        <div className="text-center mb-8">
          <Droplet className="h-10 w-10 text-aqua mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-100">Create Account</h2>
          <p className="text-gray-400 mt-2">Join AquaGuard Monitoring System</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
             <div className="relative">
               <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
               <input
                 type="text"
                 name="name"
                 value={formData.name}
                 onChange={handleChange}
                 required
                 className="w-full pl-12 pr-4 py-3 bg-dark-bg/50 border border-dark-border rounded-xl text-gray-200 focus:outline-none focus:border-aqua/50 focus:ring-1 focus:ring-aqua/50 transition-all placeholder-gray-600"
                 placeholder="Jane Doe"
               />
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 bg-dark-bg/50 border border-dark-border rounded-xl text-gray-200 focus:outline-none focus:border-aqua/50 focus:ring-1 focus:ring-aqua/50 transition-all placeholder-gray-600"
                placeholder="jane@aquaguard.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 bg-dark-bg/50 border border-dark-border rounded-xl text-gray-200 focus:outline-none focus:border-aqua/50 focus:ring-1 focus:ring-aqua/50 transition-all placeholder-gray-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-dark-bg/50 border border-dark-border rounded-xl text-gray-200 focus:outline-none focus:border-aqua/50 focus:ring-1 focus:ring-aqua/50 transition-all appearance-none"
              >
                <option value="public">Public (View Only)</option>
                <option value="officer">Officer (Manage Wells & Alerts)</option>
                <option value="admin">Admin (Full Control)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-6 glass-button rounded-xl font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating...' : 'Create Account'}</span>
            {!loading && <ArrowRight className="h-5 w-5" />}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-aqua hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
