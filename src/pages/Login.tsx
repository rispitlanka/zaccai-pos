import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Navigate } from 'react-router-dom';
import { ShoppingCart, Lock, User, Eye, EyeOff } from 'lucide-react';
import POSImage from '../assets/POS.jpeg';

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { error } = useNotification();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(formData.username, formData.password);
    } catch (err: any) {
      error('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: Image Section */}
      <div className="lg:w-3/5 w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 relative min-h-screen">
        <img
          src={POSImage}
          alt="POS Illustration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Optionally, add a semi-transparent overlay for better contrast with the login form */}
        {/* <div className="absolute inset-0 bg-white bg-opacity-10" /> */}
      </div>
      {/* Right: Login Section */}
      <div className="lg:w-2/5 w-full flex items-center justify-center bg-white">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-600 p-3 rounded-full">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back to<br />Retail Snaps
            </h2>
            <p className="text-gray-600">Sign in to your RetailSnaps Pos - zaccai ❤️</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your username or email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Accounts:</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>Admin:</strong> admin / password</div>
                <div><strong>Cashier:</strong> cashier / password</div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;