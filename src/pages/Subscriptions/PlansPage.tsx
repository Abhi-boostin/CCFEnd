import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { subscriptionService } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  Star,
  Utensils,
  Home,
  Truck
} from 'lucide-react';

interface Plan {
  id: number;
  code: string;
  name: string;
  description: string;
  service_type: 'mess' | 'tiffin';
  base_price: number;
  included_meals: any;
  can_add_breakfast: boolean;
  breakfast_addon_price: number;
  duration_days: number;
  is_active: boolean;
}

export default function PlansPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [includeBreakfast, setIncludeBreakfast] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await subscriptionService.getPlans();
      setPlans(response.data.filter((plan: Plan) => plan.is_active));
    } catch (error: any) {
      console.error('Failed to fetch plans:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load meal plans'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      addNotification({
        type: 'warning',
        title: 'Login Required',
        message: 'Please login to subscribe to a meal plan'
      });
      return;
    }

    try {
      const subscriptionData = {
        plan: plan.id,
        breakfast_included: includeBreakfast
      };

      await subscriptionService.createSubscription(subscriptionData);
      
      addNotification({
        type: 'success',
        title: 'Subscription Created',
        message: 'Your meal plan subscription has been created successfully!'
      });
      
      setSelectedPlan(null);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Subscription Failed',
        message: error.response?.data?.detail || 'Failed to create subscription'
      });
    }
  };

  const getServiceIcon = (serviceType: string) => {
    return serviceType === 'mess' ? <Home className="w-6 h-6" /> : <Truck className="w-6 h-6" />;
  };

  const getServiceColor = (serviceType: string) => {
    return serviceType === 'mess' ? 'text-blue-600' : 'text-green-600';
  };

  const getServiceBgColor = (serviceType: string) => {
    return serviceType === 'mess' ? 'bg-blue-100' : 'bg-green-100';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Meal Plan</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select from our variety of meal plans designed to fit your lifestyle and preferences. 
            Fresh, nutritious meals delivered with care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${getServiceBgColor(plan.service_type)} rounded-xl flex items-center justify-center`}>
                    <span className={getServiceColor(plan.service_type)}>
                      {getServiceIcon(plan.service_type)}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    plan.service_type === 'mess' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {plan.service_type === 'mess' ? 'Mess Service' : 'Tiffin Service'}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4 min-h-[3rem]">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline mb-2">
                    <span className="text-3xl font-bold text-gray-900">₹{plan.base_price}</span>
                    <span className="text-gray-600 ml-2">/ {plan.duration_days} days</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    ₹{Math.round(plan.base_price / plan.duration_days)} per day
                  </p>
                </div>

                {plan.included_meals && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Utensils className="w-4 h-4 mr-2" />
                      Included Meals
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(plan.included_meals).map(([meal, included]) => (
                        <div key={meal} className="flex items-center space-x-2">
                          {included ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="w-4 h-4 border border-gray-300 rounded-full" />
                          )}
                          <span className={`text-sm capitalize ${included ? 'text-gray-900' : 'text-gray-500'}`}>
                            {meal}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {plan.can_add_breakfast && (
                  <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-orange-900">Add Breakfast</h4>
                        <p className="text-sm text-orange-700">+₹{plan.breakfast_addon_price}</p>
                      </div>
                      <ChefHat className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedPlan(plan)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {plans.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Plans Available</h3>
            <p className="text-gray-600">Please check back later for available meal plans.</p>
          </div>
        )}
      </div>

      {/* Subscription Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Subscribe to {selectedPlan.name}</h3>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Base Price:</span>
                <span className="font-semibold">₹{selectedPlan.base_price}</span>
              </div>
              
              {selectedPlan.can_add_breakfast && (
                <div className="mt-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={includeBreakfast}
                      onChange={(e) => setIncludeBreakfast(e.target.checked)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-gray-700">Add Breakfast (+₹{selectedPlan.breakfast_addon_price})</span>
                  </label>
                </div>
              )}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>₹{selectedPlan.base_price + (includeBreakfast ? selectedPlan.breakfast_addon_price : 0)}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedPlan(null)}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubscribe(selectedPlan)}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Confirm Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}