import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { adminFeedbackService, ownerLeaveService } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

interface DashboardStats {
  totalFeedback: number;
  pendingFeedback: number;
  urgentComplaints: number;
  pendingLeaves: number;
  recentActivity: any[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardResponse, pendingLeavesResponse, recentActivityResponse] = await Promise.all([
        adminFeedbackService.getDashboardStats(),
        ownerLeaveService.getPendingLeaves(),
        adminFeedbackService.getRecentActivity()
      ]);

      setStats({
        totalFeedback: dashboardResponse.data.total_feedback || 0,
        pendingFeedback: dashboardResponse.data.pending_feedback || 0,
        urgentComplaints: dashboardResponse.data.urgent_complaints || 0,
        pendingLeaves: pendingLeavesResponse.data.length || 0,
        recentActivity: recentActivityResponse.data || []
      });
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load dashboard data'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const quickStats = [
    {
      title: 'Total Feedback',
      value: stats?.totalFeedback || 0,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Pending Reviews',
      value: stats?.pendingFeedback || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Urgent Complaints',
      value: stats?.urgentComplaints || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Pending Leaves',
      value: stats?.pendingLeaves || 0,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.username}! Here's your mess overview</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.subject}</p>
                        <p className="text-sm text-gray-600">
                          {activity.user?.username} • {activity.feedback_type?.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activity.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        activity.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.priority}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Review Feedback</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">Approve Leaves</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-gray-700">Urgent Complaints</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">View Analytics</span>
                </button>
              </div>
            </div>

            {/* Priority Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority Summary</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Urgent</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{stats?.urgentComplaints || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">High</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">0</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Medium</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">0</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Low</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}