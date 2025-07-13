import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { subscriptionService, feedbackService, paymentService } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { 
  Calendar, 
  Star, 
  CreditCard, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  Package,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface DashboardStats {
  activeSubscription: any;
  feedbackStats: any;
  recentPayments: any[];
  upcomingRenewals: any[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [activeSubResponse, feedbackStatsResponse, paymentsResponse] = await Promise.all([
        subscriptionService.getActiveSubscription(),
        feedbackService.getMyStats(),
        paymentService.getPayments()
      ]);

      setStats({
        activeSubscription: activeSubResponse.data[0] || null,
        feedbackStats: feedbackStatsResponse.data,
        recentPayments: paymentsResponse.data.slice(0, 5),
        upcomingRenewals: []
      });
    } catch (error: any) {
      // Only show notification for real errors, not empty states
      const msg = error?.response?.data?.message;
      const knownEmptyStates = [
        'No active subscription found',
        'No feedback stats found',
        'No payments found',
        'No recent payments found'
      ];
      if (!msg || !knownEmptyStates.includes(msg)) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load dashboard data'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const quickStats = [
    {
      title: 'Active Subscription',
      value: stats?.activeSubscription ? 'Active' : 'None',
      icon: Package,
      color: stats?.activeSubscription ? 'text-green-600' : 'text-orange-600',
      bgColor: stats?.activeSubscription ? 'bg-green-100' : 'bg-orange-100'
    },
    {
      title: 'Days Remaining',
      value: stats?.activeSubscription?.days_remaining || '0',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Feedback',
      value: stats?.feedbackStats?.total_feedback || '0',
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'This Month Payments',
      value: `₹${stats?.recentPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0}`,
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
          <p className="text-gray-600 mt-2">Here's an overview of your account activity</p>
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
          {/* Active Subscription */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Subscription</h2>
              
              {stats?.activeSubscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-900">
                          {stats.activeSubscription.plan?.name}
                        </h3>
                        <p className="text-sm text-green-700">
                          Type: {stats.activeSubscription.subscription_type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-900">
                        ₹{stats.activeSubscription.total_paid}
                      </p>
                      <p className="text-sm text-green-700">
                        Expires: {new Date(stats.activeSubscription.adjusted_end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-semibold">
                        {new Date(stats.activeSubscription.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Leave Days Used</p>
                      <p className="font-semibold">{stats.activeSubscription.leave_days}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
                  <p className="text-gray-600 mb-4">You don't have any active meal subscriptions.</p>
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors">
                    Browse Plans
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            {/* Recent Payments */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h2>
              
              {stats?.recentPayments && stats.recentPayments.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentPayments.map((payment: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">₹{payment.amount}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        payment.status === 'SUCCESS' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent payments</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-700">Submit Feedback</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Request Leave</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">View Payments</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}