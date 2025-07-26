import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { authService } from '../../services/api';
import { ChefHat, Mail, ArrowLeft } from 'lucide-react';

interface FormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  // Form states
  const [formData, setFormData] = useState<FormData>({
    email: ''
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    return errors;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateEmail();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    setLoading(true);
    try {
      await authService.requestPasswordReset({ email: formData.email.trim() });
      addNotification({
        type: 'success',
        title: 'Reset Email Sent',
        message: 'Please check your email for password reset instructions. Click the link in the email to reset your password.'
      });
      setEmailSent(true);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Failed to Send Reset Email',
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to send reset email. Please try again.'
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

  const resetForm = () => {
    setFormData({ email: '' });
    setFormErrors({});
    setEmailSent(false);
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
          <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-gray-600">
            {emailSent 
              ? 'Check your email for reset instructions'
              : 'Enter your email to receive reset instructions'
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!emailSent ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors`}
                    placeholder="Enter your email address"
                  />
                </div>
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Send Reset Email'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Sent Successfully!</h3>
                <p className="text-gray-600 text-sm">
                  We've sent password reset instructions to <strong>{formData.email}</strong>
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Please check your email and click the reset link to continue.
                </p>
              </div>
              <button
                onClick={resetForm}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Send to Different Email
              </button>
            </div>
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