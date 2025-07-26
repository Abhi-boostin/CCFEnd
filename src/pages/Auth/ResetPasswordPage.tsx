import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { authService } from '../../services/api';
import { ChefHat, Eye, EyeOff, Lock, ArrowLeft, CheckCircle } from 'lucide-react';

interface FormData {
  new_password: string;
  confirm_password: string;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
  const { addNotification } = useNotification();

  // Form states
  const [formData, setFormData] = useState<FormData>({
    new_password: '',
    confirm_password: ''
  });

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [success, setSuccess] = useState(false);

  const validatePassword = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.new_password) {
      errors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
      errors.new_password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirm_password) {
      errors.confirm_password = 'Please confirm your password';
    } else if (formData.new_password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
    
    return errors;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validatePassword();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    if (!uidb64 || !token) {
      addNotification({
        type: 'error',
        title: 'Invalid Reset Link',
        message: 'The password reset link is invalid or has expired.'
      });
      return;
    }
    
    setLoading(true);
    try {
      await authService.setNewPasswordWithToken({
        uidb64,
        token,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      });
      setSuccess(true);
      addNotification({
        type: 'success',
        title: 'Password Reset Successful',
        message: 'Your password has been reset successfully! Please login with your new password.'
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Password Reset Failed',
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to reset password. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
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
          <h2 className="text-3xl font-bold text-gray-900">Set New Password</h2>
          <p className="mt-2 text-gray-600">Create a new password for your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {success ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Reset Successful!</h3>
                <p className="text-gray-600 text-sm">
                  You will be redirected to the login page shortly.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="new_password"
                    name="new_password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.new_password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-3 border ${formErrors.new_password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formErrors.new_password && <p className="text-red-500 text-xs mt-1">{formErrors.new_password}</p>}
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-3 border ${formErrors.confirm_password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formErrors.confirm_password && <p className="text-red-500 text-xs mt-1">{formErrors.confirm_password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 