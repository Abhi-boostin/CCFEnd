import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { leaveService, subscriptionService } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { 
  Calendar, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Send
} from 'lucide-react';

interface Leave {
  id: number;
  subscription: any;
  leave_start_date: string;
  leave_end_date: string;
  reason: string;
  status: string;
  requested_at: string;
  approved_at?: string;
  rejected_at?: string;
  admin_comment?: string;
}

export default function LeavesPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subscription: '',
    leave_start_date: '',
    leave_end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leavesResponse, subscriptionsResponse] = await Promise.all([
        leaveService.getLeaves(),
        subscriptionService.getActiveSubscription()
      ]);
      
      setLeaves(leavesResponse.data);
      setSubscriptions(subscriptionsResponse.data);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load leave data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        subscription: parseInt(formData.subscription)
      };

      await leaveService.createLeave(submitData);
      
      addNotification({
        type: 'success',
        title: 'Leave Request Submitted',
        message: 'Your leave request has been submitted for approval'
      });
      
      setShowForm(false);
      setFormData({
        subscription: '',
        leave_start_date: '',
        leave_end_date: '',
        reason: ''
      });
      
      fetchData();
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: error.response?.data?.detail || 'Failed to submit leave request'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Requests</h1>
            <p className="text-gray-600 mt-2">Manage your meal leave requests</p>
          </div>
          {subscriptions.length > 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Request Leave</span>
            </button>
          )}
        </div>

        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h3>
            <p className="text-gray-600 mb-6">You need an active subscription to request leaves.</p>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Browse Plans
            </button>
          </div>
        ) : leaves.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Leave Requests</h3>
            <p className="text-gray-600 mb-6">You haven't requested any leaves yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Request Leave
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {leaves.map((leave) => (
              <div key={leave.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Leave Request #{leave.id}
                      </h3>
                      <p className="text-gray-600">
                        {leave.subscription?.plan?.name} - {leave.subscription?.subscription_type}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(leave.status)}`}>
                    {getStatusIcon(leave.status)}
                    <span className="capitalize">{leave.status}</span>
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Start Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(leave.leave_start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">End Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(leave.leave_end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Duration</p>
                    <p className="font-semibold text-gray-900">
                      {calculateDays(leave.leave_start_date, leave.leave_end_date)} days
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Reason:</p>
                  <p className="text-gray-900">{leave.reason}</p>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <p>Requested on: {new Date(leave.requested_at).toLocaleDateString()}</p>
                  {leave.approved_at && (
                    <p>Approved on: {new Date(leave.approved_at).toLocaleDateString()}</p>
                  )}
                  {leave.rejected_at && (
                    <p>Rejected on: {new Date(leave.rejected_at).toLocaleDateString()}</p>
                  )}
                </div>

                {leave.admin_comment && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <span className="font-semibold text-blue-900">Admin Comment</span>
                    </div>
                    <p className="text-blue-800">{leave.admin_comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leave Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Request Leave</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subscription
                  </label>
                  <select
                    required
                    value={formData.subscription}
                    onChange={(e) => setFormData({ ...formData, subscription: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select subscription</option>
                    {subscriptions.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.plan?.name} - {sub.subscription_type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.leave_start_date}
                      onChange={(e) => setFormData({ ...formData, leave_start_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.leave_end_date}
                      onChange={(e) => setFormData({ ...formData, leave_end_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Please provide a reason for your leave request"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Request</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}