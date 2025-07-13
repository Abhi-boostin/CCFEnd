import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { ChefHat, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const { login, refreshUser, user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: {[key: string]: string} = {};
    if (!formData.username.trim()) errors.username = 'Username or email is required';
    if (!formData.password) errors.password = 'Password is required';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);

    try {
      // 1. Login
      await login(formData.username, formData.password);

      // 2. Fetch profile using AuthContext
      await refreshUser();

      // 3. Use updated user from context
      if (!user || !user.status) {
        addNotification({
          type: 'warning',
          title: 'Account Incomplete',
          message: 'Your account registration is incomplete. Please complete OTP verification or contact support.'
        });
        setLoading(false);
        return;
      }
      if (user.status === 'unverified') {
        addNotification({
          type: 'warning',
          title: 'OTP Not Verified',
          message: 'Please complete OTP verification to activate your account.'
        });
        setLoading(false);
        return;
      }
      if (user.status === 'registration_complete') {
        addNotification({
          type: 'info',
          title: 'Profile Incomplete',
          message: 'Please complete your profile to continue.'
        });
        navigate('/profile');
        setLoading(false);
        return;
      }
      // If profile is complete
      addNotification({
        type: 'success',
        title: 'Login Successful',
        message: 'Welcome back to Choolha Chawka!'
      });
      navigate('/dashboard');
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: error.message || 'Invalid credentials. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your Choolha Chawka account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username or Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${formErrors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors`}
                placeholder="Enter your username or email"
                aria-label="Username or Email"
                aria-invalid={!!formErrors.username}
              />
              {formErrors.username && <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-12 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors`}
                  placeholder="Enter your password"
                  aria-label="Password"
                  aria-invalid={!!formErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <Link 
                to="/forgot-password" 
                className="text-sm text-orange-600 hover:text-orange-700 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.username.trim() || !formData.password}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sign In"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-orange-600 hover:text-orange-700 font-semibold transition-colors">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}