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
  user_type: 'student' | 'regular' | 'mess_owner';
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
  mess_owner_profile: {
    mess_name: string;
    business_address: string;
    business_phone: string;
    business_email: string;
    gst_number: string;
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
    },
    mess_owner_profile: {
      mess_name: '',
      business_address: '',
      business_phone: '',
      business_email: '',
      gst_number: ''
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
  const [showProfileForm, setShowProfileForm] = useState(false);
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
    } else if (profileData.user_type === 'mess_owner') {
      if (!profileData.mess_owner_profile.mess_name) {
        errors.mess_name = 'Mess name is required';
      }
      if (!profileData.mess_owner_profile.business_address) {
        errors.business_address = 'Business address is required';
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
        message: 'Phone number verified successfully!'
      });
      
      setShowProfileForm(true);
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
      } else if (profileData.user_type === 'mess_owner') {
        profilePayload.mess_owner_profile = profileData.mess_owner_profile;
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

  const handleMessOwnerProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      mess_owner_profile: {
        ...prev.mess_owner_profile!,
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
          {!showProfileForm && (
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

              {/* OTP Field */}
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
                      disabled={!otpSent}
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
                    ) : otpSent ? (
                      'Resend OTP'
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </div>
                {otpSent && (
                  <p className="text-sm text-gray-600 mt-2">
                    {phoneExists 
                      ? 'An account with this phone number already exists. Please verify with OTP.'
                      : 'OTP has been sent to your phone number.'
                    }
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                
                {otpSent && (
                  <button
                    type="button"
                    onClick={handleOtpSubmit}
                    disabled={otpLoading || !otp.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>
                )}
              </div>
                        </form>
          )}

          {/* Profile Completion Form */}
          {showProfileForm && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Complete Your Profile</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Please provide additional information to complete your account setup.
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label htmlFor="user_type" className="block text-sm font-medium text-gray-700 mb-2">
                    User Type
                  </label>
                  <div className="relative">
                    <select
                      id="user_type"
                      name="user_type"
                      value={profileData.user_type}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    >
                      <option value="student">Student</option>
                      <option value="regular">Regular User</option>
                      <option value="mess_owner">Mess Owner</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_tiffin_user"
                      checked={profileData.is_tiffin_user}
                      onChange={handleProfileChange}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Tiffin Service</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_mess_user"
                      checked={profileData.is_mess_user}
                      onChange={handleProfileChange}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Mess Service</span>
                  </label>
                </div>

                <div>
                  <label htmlFor="preferred_delivery_time" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Delivery Time
                  </label>
                  <input
                    id="preferred_delivery_time"
                    name="preferred_delivery_time"
                    type="time"
                    value={profileData.preferred_delivery_time}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Student Profile Fields */}
                {profileData.user_type === 'student' && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Student Information
                    </h4>
                    <div>
                      <label htmlFor="institute" className="block text-sm font-medium text-gray-700 mb-2">
                        Institute/College
                      </label>
                                             <input
                         id="institute"
                         type="text"
                         value={profileData.student_profile.institute}
                         onChange={(e) => handleStudentProfileChange('institute', e.target.value)}
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                         placeholder="Enter your institute name"
                         required
                       />
                     </div>
                     <div>
                       <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-2">
                         Student ID (Optional)
                       </label>
                       <input
                         id="student_id"
                         type="text"
                         value={profileData.student_profile.student_id}
                         onChange={(e) => handleStudentProfileChange('student_id', e.target.value)}
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                         placeholder="Enter your student ID"
                       />
                     </div>
                     <div>
                       <label htmlFor="hostel" className="block text-sm font-medium text-gray-700 mb-2">
                         Hostel
                       </label>
                       <input
                         id="hostel"
                         type="text"
                         value={profileData.student_profile.hostel}
                         onChange={(e) => handleStudentProfileChange('hostel', e.target.value)}
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                         placeholder="Enter your hostel name"
                         required
                       />
                    </div>
                  </div>
                )}

                {/* Regular User Profile Fields */}
                {profileData.user_type === 'regular' && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Home className="w-4 h-4 mr-2" />
                      Address Information
                    </h4>
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                                             <textarea
                         id="address"
                         value={profileData.regular_profile.address}
                         onChange={(e) => handleRegularProfileChange('address', e.target.value)}
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                         placeholder="Enter your complete address"
                         rows={3}
                         required
                       />
                     </div>
                     <div>
                       <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-2">
                         Landmark (Optional)
                       </label>
                       <input
                         id="landmark"
                         type="text"
                         value={profileData.regular_profile.landmark}
                         onChange={(e) => handleRegularProfileChange('landmark', e.target.value)}
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                         placeholder="Enter nearby landmark"
                       />
                    </div>
                  </div>
                )}

                {/* Mess Owner Profile Fields */}
                {profileData.user_type === 'mess_owner' && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Building className="w-4 h-4 mr-2" />
                      Business Information
                    </h4>
                    <div>
                      <label htmlFor="mess_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Mess Name
                      </label>
                                             <input
                         id="mess_name"
                         type="text"
                         value={profileData.mess_owner_profile.mess_name}
                         onChange={(e) => handleMessOwnerProfileChange('mess_name', e.target.value)}
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                         placeholder="Enter your mess name"
                         required
                       />
                     </div>
                     <div>
                       <label htmlFor="business_address" className="block text-sm font-medium text-gray-700 mb-2">
                         Business Address
                       </label>
                       <textarea
                         id="business_address"
                         value={profileData.mess_owner_profile.business_address}
                         onChange={(e) => handleMessOwnerProfileChange('business_address', e.target.value)}
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                         placeholder="Enter your business address"
                         rows={3}
                         required
                       />
                     </div>
                     <div>
                       <label htmlFor="business_phone" className="block text-sm font-medium text-gray-700 mb-2">
                         Business Phone (Optional)
                       </label>
                       <input
                         id="business_phone"
                         type="tel"
                         value={profileData.mess_owner_profile.business_phone}
                         onChange={(e) => handleMessOwnerProfileChange('business_phone', e.target.value)}
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                         placeholder="Enter business phone number"
                       />
                     </div>
                     <div>
                       <label htmlFor="business_email" className="block text-sm font-medium text-gray-700 mb-2">
                         Business Email (Optional)
                       </label>
                       <input
                         id="business_email"
                         type="email"
                         value={profileData.mess_owner_profile.business_email}
                         onChange={(e) => handleMessOwnerProfileChange('business_email', e.target.value)}
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                         placeholder="Enter business email"
                       />
                     </div>
                     <div>
                       <label htmlFor="gst_number" className="block text-sm font-medium text-gray-700 mb-2">
                         GST Number (Optional)
                       </label>
                       <input
                         id="gst_number"
                         type="text"
                         value={profileData.mess_owner_profile.gst_number}
                         onChange={(e) => handleMessOwnerProfileChange('gst_number', e.target.value)}
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                         placeholder="Enter GST number"
                       />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {profileLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Complete Profile'
                  )}
                </button>
              </form>
            </div>
          )}

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