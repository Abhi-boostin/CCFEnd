import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASEURL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete apiClient.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Account services
export const authService = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await apiClient.post('/accounts/login/', credentials);
    const { access, refresh } = response.data;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    return response;
  },
  register: (userData: any) =>
    apiClient.post('/accounts/register/', userData),
  getProfile: () =>
    apiClient.get('/accounts/profile/'),
  completeProfile: (profileData: any) =>
    apiClient.post('/accounts/complete-profile/', profileData),
  changePassword: (passwordData: any) =>
    apiClient.post('/accounts/change-password/', passwordData),
  verifyOtp: (otpData: any) =>
    apiClient.post('/accounts/verify-otp/', otpData),
  resendOtp: (data: { phone: string }) =>
    apiClient.post('/accounts/resend-otp/', data),
};

// Subscription services
export const subscriptionService = {
  getPlans: () =>
    apiClient.get('/subscriptions/plans/'),
  
  getPlan: (id: number) =>
    apiClient.get(`/subscriptions/plans/${id}/`),
  
  getSubscriptions: () =>
    apiClient.get('/subscriptions/subscriptions/'),
  
  getActiveSubscription: () =>
    apiClient.get('/subscriptions/subscriptions/active/'),
  
  createSubscription: (subscriptionData: any) =>
    apiClient.post('/subscriptions/subscriptions/', subscriptionData),
  
  cancelSubscription: (id: number, data: any = {}) =>
    apiClient.post(`/subscriptions/subscriptions/${id}/cancel/`, data),
  
  renewSubscription: (id: number, data: any = {}) =>
    apiClient.post(`/subscriptions/subscriptions/${id}/renew/`, data),

  deleteSubscription: (id: number) =>
    apiClient.delete(`/subscriptions/subscriptions/${id}/`),
};

// Feedback services
export const feedbackService = {
  getFeedback: () =>
    apiClient.get('/feedback/'),
  
  createFeedback: (feedbackData: any) =>
    apiClient.post('/feedback/', feedbackData),
  
  getFeedbackById: (id: number) =>
    apiClient.get(`/feedback/${id}/`),
  
  updateFeedback: (id: number, data: any) =>
    apiClient.patch(`/feedback/${id}/`, data),
  
  deleteFeedback: (id: number) =>
    apiClient.delete(`/feedback/${id}/`),
  
  getMyStats: () =>
    apiClient.get('/feedback/my_stats/'),
  
  addAttachment: (id: number, formData: FormData) =>
    apiClient.post(`/feedback/${id}/add_attachment/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  removeAttachment: (id: number) =>
    apiClient.delete(`/feedback/${id}/remove_attachment/`),
};

// Admin feedback services
export const adminFeedbackService = {
  getAllFeedback: () =>
    apiClient.get('/feedback/admin/feedback/'),
  
  getDashboardStats: () =>
    apiClient.get('/feedback/admin/feedback/dashboard_stats/'),
  
  getPendingResponses: () =>
    apiClient.get('/feedback/admin/feedback/pending_responses/'),
  
  getUrgentComplaints: () =>
    apiClient.get('/feedback/admin/feedback/urgent_complaints/'),
  
  getPrioritySummary: () =>
    apiClient.get('/feedback/admin/feedback/priority_summary/'),
  
  getRecentActivity: () =>
    apiClient.get('/feedback/admin/feedback/recent_activity/'),
  
  respondToFeedback: (id: number, responseData: any) =>
    apiClient.post(`/feedback/admin/feedback/${id}/respond/`, responseData),
  
  updateFeedbackStatus: (id: number, statusData: any) =>
    apiClient.patch(`/feedback/admin/feedback/${id}/update_status/`, statusData),
};

// Payment services
export const paymentService = {
  getPayments: () =>
    apiClient.get('/payments/payments/'),
  
  getPayment: (id: number) =>
    apiClient.get(`/payments/payments/${id}/`),
  
  downloadReceipt: (id: number) =>
    apiClient.get(`/payments/payments/${id}/receipt/`),
  
  downloadReceiptPdf: (id: number) =>
    apiClient.get(`/payments/payments/${id}/receipt_pdf/`),
  
  createOrder: (orderData: any) =>
    apiClient.post('/payments/orders/', orderData),
  
  verifyPayment: (paymentData: any) =>
    apiClient.post('/payments/orders/verify_payment/', paymentData),
  
  getOrders: () =>
    apiClient.get('/payments/orders/'),
};

// Refund services
export const refundService = {
  getRefunds: () =>
    apiClient.get('/payments/refunds/'),
  
  createRefund: (refundData: any) =>
    apiClient.post('/payments/refunds/', refundData),
  
  getRefund: (id: number) =>
    apiClient.get(`/payments/refunds/${id}/`),
  
  getPendingRefunds: () =>
    apiClient.get('/payments/refunds/pending/'),
  
  getApprovedRefunds: () =>
    apiClient.get('/payments/refunds/approved/'),
  
  approveRefund: (id: number, data: any = {}) =>
    apiClient.post(`/payments/refunds/${id}/approve/`, data),
  
  rejectRefund: (id: number, data: any) =>
    apiClient.post(`/payments/refunds/${id}/reject/`, data),
  
  markRefundPaid: (id: number, data: any = {}) =>
    apiClient.post(`/payments/refunds/${id}/mark_paid/`, data),
};

// Leave services
export const leaveService = {
  getLeaves: () =>
    apiClient.get('/subscriptions/leaves/'),
  
  createLeave: (leaveData: any) =>
    apiClient.post('/subscriptions/leaves/', leaveData),
  
  getLeave: (id: number) =>
    apiClient.get(`/subscriptions/leaves/${id}/`),
  
  updateLeave: (id: number, data: any) =>
    apiClient.patch(`/subscriptions/leaves/${id}/`, data),
  
  deleteLeave: (id: number) =>
    apiClient.delete(`/subscriptions/leaves/${id}/`),
  
  approveLeave: (id: number) =>
    apiClient.post(`/subscriptions/leaves/${id}/approve/`),
  
  rejectLeave: (id: number) =>
    apiClient.post(`/subscriptions/leaves/${id}/reject/`),
  
  getDashboardStats: () =>
    apiClient.get('/subscriptions/leaves/dashboard_stats/'),
  
  getPendingLeaves: () =>
    apiClient.get('/subscriptions/leaves/pending/'),
};

// Owner leave services
export const ownerLeaveService = {
  getLeaves: () =>
    apiClient.get('/owner/leaves/'),
  
  getDashboardStats: () =>
    apiClient.get('/owner/leaves/dashboard_stats/'),
  
  getPendingLeaves: () =>
    apiClient.get('/owner/leaves/pending/'),
  
  approveLeave: (id: number) =>
    apiClient.post(`/owner/leaves/${id}/approve/`),
  
  rejectLeave: (id: number) =>
    apiClient.post(`/owner/leaves/${id}/reject/`),
};

// Notification services
export const notificationService = {
  getLogs: () =>
    apiClient.get('/notifications/logs/'),
  
  getLog: (id: number) =>
    apiClient.get(`/notifications/logs/${id}/`),
  
  getLogsByType: () =>
    apiClient.get('/notifications/logs/by_type/'),
  
  getStats: () =>
    apiClient.get('/notifications/logs/stats/'),
};