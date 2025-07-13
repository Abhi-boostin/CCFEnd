import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { notificationService } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  Calendar
} from 'lucide-react';

interface NotificationLog {
  id: number;
  notification_type: string;
  channel: string;
  recipient_email?: string;
  recipient_phone?: string;
  subject?: string;
  status: string;
  error_message?: string;
  sent_at: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getLogs();
      setNotifications(response.data);
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load notifications'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await notificationService.getStats();
      setStats(response.data);
    } catch (error: any) {
      console.error('Failed to fetch notification stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'sms':
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.status === filter;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">View your notification history and delivery status</p>
        </div>

        {/* Summary Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Sent Successfully</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.sent || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Failed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.failed || 0}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending || 0}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Filter by status:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Notifications</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications Found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You haven't received any notifications yet." 
                : `No ${filter} notifications found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div key={notification.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getChannelIcon(notification.channel)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {notification.subject || notification.notification_type}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(notification.status)}`}>
                          {getStatusIcon(notification.status)}
                          <span className="capitalize">{notification.status}</span>
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>Type:</strong> {notification.notification_type}</p>
                          <p><strong>Channel:</strong> {notification.channel.toUpperCase()}</p>
                        </div>
                        <div>
                          <p><strong>Sent:</strong> {new Date(notification.sent_at).toLocaleDateString()}</p>
                          <p><strong>Time:</strong> {new Date(notification.sent_at).toLocaleTimeString()}</p>
                        </div>
                      </div>

                      {notification.recipient_email && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Email:</strong> {notification.recipient_email}
                        </p>
                      )}

                      {notification.recipient_phone && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Phone:</strong> {notification.recipient_phone}
                        </p>
                      )}

                      {notification.error_message && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-800 text-sm">
                            <strong>Error:</strong> {notification.error_message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(notification.sent_at).toLocaleDateString()}</span>
                    </div>
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