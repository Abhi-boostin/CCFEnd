import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { authService } from '../../services/api';
import { ChefHat, Eye, EyeOff, UserPlus, Phone, Mail, User, Building, GraduationCap, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface FormData {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
}

interface ProfileData {
  user_type: 'student' | 'regular';
  is_tiffin_user: boolean;
  is_mess_user: boolean;
  preferred_delivery_time: string;
  student_profile: {
    institute: string;
    student_id: string;
    hostel: string;
  };
  regular_profile: {
    address: string;
    landmark: string;
  };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { refreshUser } = useAuth();

  // Form states
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });

  const [profileData, setProfileData] = useState<ProfileData>({
    user_type: 'student',
    is_tiffin_user: false,
    is_mess_user: true,
    preferred_delivery_time: '6:00 PM',
    student_profile: {
      institute: '',
      student_id: '',
      hostel: ''
    },
    regular_profile: {
      address: '',
      landmark: ''
    }
  });

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // OTP states
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Profile completion states
  const [profileLoading, setProfileLoading] = useState(false);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirm_password) {
      errors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
    
    return errors;
  };

  const validateProfileForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!profileData.preferred_delivery_time) {
      errors.preferred_delivery_time = 'Preferred delivery time is required';
    }
    
    if (profileData.user_type === 'student') {
      if (!profileData.student_profile.institute) {
        errors.institute = 'Institute is required';
      }
      if (!profileData.student_profile.hostel) {
        errors.hostel = 'Hostel is required';
      }
    } else if (profileData.user_type === 'regular') {
      if (!profileData.regular_profile.address) {
        errors.address = 'Address is required';
      }
    }
    
    return errors;
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return `+${cleaned}`;
    } else if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    return phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    setLoading(true);
    try {
      const submitData = {
        username: formData.username,
        email: formData.email,
        phone: formatPhoneNumber(formData.phone),
        password: formData.password,
        confirm_password: formData.confirm_password
      };
      
      await authService.register(submitData);
      addNotification({
        type: 'success',
        title: 'Registration Successful',
        message: 'Please check your phone for OTP verification.'
      });
      setOtpSent(true);
      setPhoneExists(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || '';
      
      // Check if account already exists
      if (error.response?.status === 400 || 
          errorMessage.toLowerCase().includes('already exists') ||
          errorMessage.toLowerCase().includes('phone') ||
          errorMessage.toLowerCase().includes('username') ||
          errorMessage.toLowerCase().includes('email')) {
        
        setPhoneExists(true);
        setOtpSent(true);
        addNotification({
          type: 'info',
          title: 'Account Exists',
          message: 'An account with this information already exists. Please verify with OTP.'
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Registration Failed',
          message: errorMessage || 'Registration failed. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.phone.trim()) {
      addNotification({
        type: 'error',
        title: 'Phone Required',
        message: 'Please enter your phone number first.'
      });
      return;
    }

    setResendLoading(true);
    try {
      await authService.resendOtp({ phone: formatPhoneNumber(formData.phone) });
      addNotification({
        type: 'success',
        title: 'OTP Sent',
        message: 'A new OTP has been sent to your phone.'
      });
      setOtpSent(true);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Failed to Send OTP',
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to send OTP.'
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp.trim()) {
      addNotification({
        type: 'error',
        title: 'OTP Required',
        message: 'Please enter the OTP.'
      });
      return;
    }

    setOtpLoading(true);
    try {
      await authService.verifyOtp({ 
        phone: formatPhoneNumber(formData.phone), 
        otp: otp.trim() 
      });
      addNotification({
        type: 'success',
        title: 'OTP Verified',
        message: 'Phone number verified successfully! Please login to continue.'
      });
      navigate('/login'); // Redirect to login after OTP verification
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'OTP Verification Failed',
        message: error.response?.data?.detail || error.response?.data?.message || 'Invalid OTP. Please try again.'
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateProfileForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    setProfileLoading(true);
    try {
      const profilePayload: any = {
        user_type: profileData.user_type,
        is_tiffin_user: profileData.is_tiffin_user,
        is_mess_user: profileData.is_mess_user,
        preferred_delivery_time: profileData.preferred_delivery_time
      };

      if (profileData.user_type === 'student') {
        profilePayload.student_profile = profileData.student_profile;
      } else if (profileData.user_type === 'regular') {
        profilePayload.regular_profile = profileData.regular_profile;
      }

      await authService.completeProfile(profilePayload);
      await refreshUser();
      
      addNotification({
        type: 'success',
        title: 'Profile Completed',
        message: 'Your profile has been completed successfully!'
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Profile Completion Failed',
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to complete profile.'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleStudentProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      student_profile: {
        ...prev.student_profile!,
        [field]: value
      }
    }));
  };

  const handleRegularProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      regular_profile: {
        ...prev.regular_profile!,
        [field]: value
      }
    }));
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
          <h2 className="text-3xl font-bold text-gray-900">Join Choolha Chawka</h2>
          <p className="mt-2 text-gray-600">Create your account for delicious meals</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Registration Form */}
          {!otpSent && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 border ${formErrors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors`}
                    placeholder="Choose a username"
                  />
                </div>
                {formErrors.username && <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>}
              </div>

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
                    placeholder="Enter your email"
                  />
                </div>
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
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
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 border ${formErrors.confirm_password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors`}
                    placeholder="Confirm your password"
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
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </button>

              {/* OTP Field - Only visible after Create Account is clicked */}
              {otpSent && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  OTP Verification
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={resendLoading || !formData.phone.trim()}
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {resendLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                      'Resend OTP'
                    )}
                  </button>
                </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {phoneExists 
                      ? 'An account with this phone number already exists. Please verify with OTP.'
                      : 'OTP has been sent to your phone number.'
                    }
                  </p>
                  
                  <button
                    type="button"
                    onClick={handleOtpSubmit}
                    disabled={otpLoading || !otp.trim()}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>
                </div>
                )}
                        </form>
          )}

          {/* Profile Completion Form */}
          {/* This section is removed as profile completion is now handled on login */}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}