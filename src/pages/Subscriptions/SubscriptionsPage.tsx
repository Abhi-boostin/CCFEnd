import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { subscriptionService } from '../../services/api';
import { paymentService } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { 
  Package, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  CreditCard,
  RefreshCw
} from 'lucide-react';

interface Subscription {
  id: number;
  plan: any;
  breakfast_included: boolean;
  total_paid: number;
  subscription_type: string;
  start_date: string;
  adjusted_end_date: string;
  leave_days: number;
  status: string;
  days_remaining: string;
  created_at: string;
}

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await subscriptionService.getSubscriptions();
      setSubscriptions(response.data);
    } catch (error: any) {
      console.error('Failed to fetch subscriptions:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load subscriptions'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscription = async (id: number) => {
    try {
      await subscriptionService.deleteSubscription(id);
      addNotification({
        type: 'success',
        title: 'Subscription Deleted',
        message: 'The pending subscription has been deleted.'
      });
      fetchSubscriptions();
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: error.response?.data?.detail || 'Failed to delete subscription.'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'EXPIRED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      case 'PENDING_PAYMENT':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Subscriptions</h1>
          <p className="text-gray-600 mt-2">Manage your meal subscriptions and view history</p>
        </div>

        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Subscriptions Found</h3>
            <p className="text-gray-600 mb-6">You haven't subscribed to any meal plans yet.</p>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Browse Plans
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(subscription.status)}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {subscription.plan?.name || 'Meal Plan'}
                        </h3>
                        <p className="text-gray-600">
                          {subscription.subscription_type} Service
                          {subscription.breakfast_included && ' • Breakfast Included'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CreditCard className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Total Paid</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">₹{subscription.total_paid}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Start Date</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(subscription.start_date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">End Date</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(subscription.adjusted_end_date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <RefreshCw className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Days Remaining</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{subscription.days_remaining}</p>
                    </div>
                  </div>

                  {subscription.leave_days > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-blue-800">
                        <strong>Leave Days Used:</strong> {subscription.leave_days} days
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {subscription.status === 'ACTIVE' && (
                      <>
                        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          Request Leave
                        </button>
                        <button className="border border-red-300 text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors">
                          Cancel Subscription
                        </button>
                      </>
                    )}
                    
                    {subscription.status === 'EXPIRED' && (
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Renew Subscription
                      </button>
                    )}
                    
                    {subscription.status === 'PENDING_PAYMENT' && (
                      <button
                        className="border border-red-300 text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors"
                        onClick={() => handleDeleteSubscription(subscription.id)}
                      >
                        Delete Subscription
                      </button>
                    )}
                    <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}