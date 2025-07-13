import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { paymentService } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { 
  CreditCard, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Receipt,
  Calendar,
  Filter
} from 'lucide-react';

interface Payment {
  id: number;
  subscription: any;
  payment_gateway: string;
  transaction_id: string;
  amount: number;
  amount_inr: string;
  currency: string;
  status: string;
  gateway_order_id: string;
  gateway_payment_id: string;
  failure_reason?: string;
  created_at: string;
  updated_at: string;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentService.getPayments();
      setPayments(response.data);
    } catch (error: any) {
      console.error('Failed to fetch payments:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load payment history'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (paymentId: number) => {
    try {
      const response = await paymentService.downloadReceiptPdf(paymentId);
      // Handle PDF download
      addNotification({
        type: 'success',
        title: 'Receipt Downloaded',
        message: 'Payment receipt has been downloaded successfully'
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download receipt'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'INITIATED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'INITIATED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  const totalAmount = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, payment) => sum + payment.amount, 0);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-2">View and manage your payment transactions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalAmount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Successful</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter(p => p.status === 'SUCCESS').length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter(p => p.status === 'FAILED').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

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
              <option value="all">All Payments</option>
              <option value="SUCCESS">Successful</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
              <option value="INITIATED">Initiated</option>
            </select>
          </div>
        </div>

        {/* Payments List */}
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payments Found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You haven't made any payments yet." 
                : `No ${filter.toLowerCase()} payments found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-orange-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Payment #{payment.id}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span>{payment.status}</span>
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>Amount:</strong> ₹{payment.amount}</p>
                          <p><strong>Transaction ID:</strong> {payment.transaction_id}</p>
                          <p><strong>Gateway:</strong> {payment.payment_gateway}</p>
                        </div>
                        <div>
                          <p><strong>Date:</strong> {new Date(payment.created_at).toLocaleDateString()}</p>
                          <p><strong>Time:</strong> {new Date(payment.created_at).toLocaleTimeString()}</p>
                          {payment.subscription && (
                            <p><strong>Plan:</strong> {payment.subscription.plan?.name}</p>
                          )}
                        </div>
                      </div>

                      {payment.failure_reason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-800 text-sm">
                            <strong>Failure Reason:</strong> {payment.failure_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">₹{payment.amount}</p>
                      <p className="text-sm text-gray-600">{payment.currency}</p>
                    </div>
                    
                    {payment.status === 'SUCCESS' && (
                      <button
                        onClick={() => downloadReceipt(payment.id)}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Receipt</span>
                      </button>
                    )}
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