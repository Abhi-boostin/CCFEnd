import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { feedbackService, subscriptionService } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { 
  MessageSquare, 
  Star, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Send
} from 'lucide-react';

interface Feedback {
  id: number;
  feedback_type: string;
  subject: string;
  message: string;
  rating?: number;
  meal_date?: string;
  meal_type?: string;
  status: string;
  priority: string;
  created_at: string;
  admin_response?: string;
  responded_at?: string;
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    feedback_type: 'general_feedback',
    subject: '',
    message: '',
    rating: 5,
    subscription: '',
    meal_date: '',
    meal_type: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [feedbackResponse, subscriptionResponse] = await Promise.all([
        feedbackService.getFeedback(),
        subscriptionService.getSubscriptions()
      ]);
      
      setFeedbacks(feedbackResponse.data);
      setSubscriptions(subscriptionResponse.data);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load feedback data'
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
        subscription: formData.subscription ? parseInt(formData.subscription) : null,
        meal_date: formData.meal_date || null,
        meal_type: formData.meal_type || null
      };

      await feedbackService.createFeedback(submitData);
      
      addNotification({
        type: 'success',
        title: 'Feedback Submitted',
        message: 'Your feedback has been submitted successfully!'
      });
      
      setShowForm(false);
      setFormData({
        feedback_type: 'general_feedback',
        subject: '',
        message: '',
        rating: 5,
        subscription: '',
        meal_date: '',
        meal_type: ''
      });
      
      fetchData();
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: error.response?.data?.detail || 'Failed to submit feedback'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feedback & Support</h1>
            <p className="text-gray-600 mt-2">Share your experience and get help when needed</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Feedback</span>
          </button>
        </div>

        {feedbacks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Feedback Yet</h3>
            <p className="text-gray-600 mb-6">Share your experience or report any issues.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Submit Feedback
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      {feedback.feedback_type === 'food_complaint' ? (
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{feedback.subject}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="capitalize">{feedback.feedback_type.replace('_', ' ')}</span>
                        <span className={`font-medium ${getPriorityColor(feedback.priority)}`}>
                          {feedback.priority} priority
                        </span>
                        <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(feedback.status)}`}>
                      {getStatusIcon(feedback.status)}
                      <span className="capitalize">{feedback.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{feedback.message}</p>

                {feedback.rating && (
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-sm text-gray-600">Rating:</span>
                    <div className="flex space-x-1">
                      {renderStars(feedback.rating)}
                    </div>
                  </div>
                )}

                {feedback.meal_date && (
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Meal Date: {new Date(feedback.meal_date).toLocaleDateString()}</span>
                    </div>
                    {feedback.meal_type && (
                      <span className="capitalize">Meal: {feedback.meal_type}</span>
                    )}
                  </div>
                )}

                {feedback.admin_response && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <span className="font-semibold text-blue-900">Admin Response</span>
                      {feedback.responded_at && (
                        <span className="text-sm text-blue-700">
                          • {new Date(feedback.responded_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-blue-800">{feedback.admin_response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Submit Feedback</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback Type
                  </label>
                  <select
                    value={formData.feedback_type}
                    onChange={(e) => setFormData({ ...formData, feedback_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="general_feedback">General Feedback</option>
                    <option value="food_complaint">Food Complaint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Brief description of your feedback"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Detailed description of your feedback or issue"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating (1-5)
                    </label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value={1}>1 - Very Poor</option>
                      <option value={2}>2 - Poor</option>
                      <option value={3}>3 - Average</option>
                      <option value={4}>4 - Good</option>
                      <option value={5}>5 - Excellent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Related Subscription
                    </label>
                    <select
                      value={formData.subscription}
                      onChange={(e) => setFormData({ ...formData, subscription: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select subscription (optional)</option>
                      {subscriptions.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.plan?.name} - {sub.subscription_type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.feedback_type === 'food_complaint' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meal Date
                      </label>
                      <input
                        type="date"
                        value={formData.meal_date}
                        onChange={(e) => setFormData({ ...formData, meal_date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meal Type
                      </label>
                      <select
                        value={formData.meal_type}
                        onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Select meal type</option>
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                      </select>
                    </div>
                  </div>
                )}

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
                    <span>Submit Feedback</span>
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