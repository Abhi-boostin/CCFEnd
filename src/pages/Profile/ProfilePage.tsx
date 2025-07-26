import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { authService } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  GraduationCap,
  Save,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [profileData, setProfileData] = useState({
    user_type: user?.user_type || 'regular',
    is_tiffin_user: Boolean(user?.is_tiffin_user),
    is_mess_user: Boolean(user?.is_mess_user),
    preferred_delivery_time: user?.preferred_delivery_time || '',
    student_profile: user?.student_profile || {
      institute: '',
      student_id: '',
      hostel: ''
    },
    regular_profile: user?.regular_profile || {
      address: '',
      landmark: ''
    }
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [lunchTime, setLunchTime] = useState('');
  const [dinnerTime, setDinnerTime] = useState('');

  useEffect(() => {
    // If preferred_delivery_time exists, try to parse and prefill lunch/dinner
    if (profileData.preferred_delivery_time) {
      const match = profileData.preferred_delivery_time.match(/Lunch: ([^,]+), Dinner: (.+)/);
      if (match) {
        setLunchTime(match[1]);
        setDinnerTime(match[2]);
      }
    }
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // If tiffin user, combine lunch and dinner times
    let preferred_delivery_time = profileData.preferred_delivery_time;
    if (profileData.is_tiffin_user) {
      preferred_delivery_time = `Lunch: ${lunchTime || '-'}, Dinner: ${dinnerTime || '-'}`;
    } else {
      preferred_delivery_time = '';
    }

    try {
      const profilePayload: any = {
        user_type: profileData.user_type,
        is_tiffin_user: profileData.is_tiffin_user,
        is_mess_user: profileData.is_mess_user,
        preferred_delivery_time,
      };

      // Add user type specific profile data
      if (profileData.user_type === 'student') {
        profilePayload.student_profile = profileData.student_profile;
      } else if (profileData.user_type === 'regular') {
        profilePayload.regular_profile = profileData.regular_profile;
      }

      await authService.completeProfile(profilePayload);
      await refreshUser();
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully'
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.response?.data?.detail || 'Failed to update profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      addNotification({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New passwords do not match'
      });
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword({
        old_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      });
      
      addNotification({
        type: 'success',
        title: 'Password Changed',
        message: 'Your password has been changed successfully'
      });
      
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setShowPasswordForm(false);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Password Change Failed',
        message: error.response?.data?.detail || 'Failed to change password'
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  // Verification status logic
  const otpVerified = user.status !== 'unverified';
  const profileComplete = user.status === 'profile_complete';
  let instruction = '';
  if (!otpVerified) {
    instruction = 'Please verify your OTP to continue.';
  } else if (!profileComplete) {
    instruction = 'Please complete your profile to continue.';
  } else {
    instruction = 'Your account is fully verified!';
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Verification Status */}
        <div className="mb-6">
          <div className="flex items-center space-x-8 p-4 bg-white rounded-xl shadow border border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">OTP Verification:</span>
              {otpVerified ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">Profile Completion:</span>
              {profileComplete ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div className="flex-1 text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${profileComplete ? 'bg-green-100 text-green-800' : (!otpVerified ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800')}`}> 
                <AlertCircle className="w-4 h-4 mr-1" />
                {instruction}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
              <p className="text-gray-600">{user.email}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                user.status === 'profile_complete' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user.status === 'profile_complete' ? 'Profile Complete' : 'Profile Incomplete'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Security
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={user.username}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={user.phone}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User Type
                      </label>
                      <select
                        value={profileData.user_type}
                        onChange={(e) => setProfileData({ ...profileData, user_type: e.target.value as 'student' | 'regular' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="student">Student</option>
                        <option value="regular">Regular User</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Service Preferences */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="service_type"
                          checked={profileData.is_mess_user && !profileData.is_tiffin_user}
                          onChange={() => setProfileData({ ...profileData, is_mess_user: true, is_tiffin_user: false })}
                          className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                        />
                        <span className="ml-2 text-gray-700">Mess Service</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="service_type"
                          checked={profileData.is_tiffin_user && !profileData.is_mess_user}
                          onChange={() => setProfileData({ ...profileData, is_mess_user: false, is_tiffin_user: true })}
                          className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                        />
                        <span className="ml-2 text-gray-700">Tiffin Service</span>
                      </label>
                    </div>
                    {profileData.is_tiffin_user && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lunch Time
                          </label>
                          <input
                            type="time"
                            value={lunchTime}
                            onChange={e => setLunchTime(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dinner Time
                          </label>
                          <input
                            type="time"
                            value={dinnerTime}
                            onChange={e => setDinnerTime(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Type Specific Fields */}
                {profileData.user_type === 'student' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2" />
                      Student Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Institute
                        </label>
                        <input
                          type="text"
                          required
                          value={profileData.student_profile.institute}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            student_profile: { ...profileData.student_profile, institute: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter your institute name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Student ID
                        </label>
                        <input
                          type="text"
                          value={profileData.student_profile.student_id}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            student_profile: { ...profileData.student_profile, student_id: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter your student ID (optional)"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hostel
                        </label>
                        <input
                          type="text"
                          required
                          value={profileData.student_profile.hostel}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            student_profile: { ...profileData.student_profile, hostel: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter your hostel name"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {profileData.user_type === 'regular' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Address Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={profileData.regular_profile.address}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            regular_profile: { ...profileData.regular_profile, address: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter your complete address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Landmark
                        </label>
                        <input
                          type="text"
                          value={profileData.regular_profile.landmark}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            regular_profile: { ...profileData.regular_profile, landmark: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter nearby landmark (optional)"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Password & Security</h3>
                  <p className="text-gray-600 mb-6">Manage your account security settings</p>
                  
                  {!showPasswordForm ? (
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                    >
                      <Lock className="w-5 h-5" />
                      <span>Change Password</span>
                    </button>
                  ) : (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            required
                            value={passwordData.current_password}
                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            required
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            required
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordData({
                              current_password: '',
                              new_password: '',
                              confirm_password: ''
                            });
                          }}
                          className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}