                                                  import React, { useEffect, useState } from 'react';
import { subscriptionService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

interface Plan {
  id: number;
  code: string;
  name: string;
  description: string;
  service_type: string;
  base_price: number;
  included_meals: string[];
  can_add_breakfast: boolean;
  breakfast_addon_price: number;
  duration_days: number;
  is_active: boolean;
}

interface SubscribedPlan {
  planId: number;
  totalPaid: number;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [subscribedPlans, setSubscribedPlans] = useState<SubscribedPlan[]>([]);
  const [breakfastSelections, setBreakfastSelections] = useState<{ [planId: number]: boolean }>({});
  const { addNotification } = useNotification();

  useEffect(() => {
  const fetchPlans = async () => {
      setLoading(true);
    try {
      const response = await subscriptionService.getPlans();
        setPlans(response.data);
    } catch (error: any) {
      addNotification({
        type: 'error',
          title: 'Failed to Load Plans',
          message: error.response?.data?.detail || 'Could not fetch plans.'
      });
    } finally {
      setLoading(false);
    }
  };
    fetchPlans();
  }, [addNotification]);

  const handleBreakfastChange = (planId: number, value: boolean) => {
    setBreakfastSelections(prev => ({ ...prev, [planId]: value }));
  };

  const handleSubscribe = async (planId: number) => {
    setSubscribing(planId);
    try {
      const breakfast_included = breakfastSelections[planId] || false;
      const response = await subscriptionService.createSubscription({ plan: planId, breakfast_included });
      const totalPaid = response.data?.data?.total_paid || 0;
      setSubscribedPlans(prev => [...prev, { planId, totalPaid }]);
      addNotification({
        type: 'success',
        title: 'Subscribed',
        message: 'You have successfully subscribed to this plan.'
        });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Subscription Failed',
        message: error.response?.data?.detail || 'Could not subscribe to this plan.'
      });
    } finally {
      setSubscribing(null);
    }
  };

  const isPlanSubscribed = (planId: number) =>
    subscribedPlans.some(sp => sp.planId === planId);

  const getTotalPaid = (planId: number) =>
    subscribedPlans.find(sp => sp.planId === planId)?.totalPaid;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Available Plans</h1>
      {loading ? (
        <div>Loading plans...</div>
      ) : plans.length === 0 ? (
        <div>No plans available.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map(plan => {
            const subscribed = isPlanSubscribed(plan.id);
            const totalPaid = getTotalPaid(plan.id);
            return (
              <div key={plan.id} className="bg-white rounded-lg shadow p-6 flex flex-col border border-gray-200">
                <div className="mb-2 text-xs text-gray-400">{plan.code}</div>
                <h2 className="text-xl font-semibold mb-1">{plan.name}</h2>
                <div className="mb-2 text-sm text-gray-500">{plan.description}</div>
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-medium mr-2">
                    {plan.service_type === 'mess' ? 'Mess Service' : plan.service_type === 'tiffin' ? 'Tiffin Service' : plan.service_type}
                  </span>
                  {plan.is_active ? (
                    <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium">Active</span>
                  ) : (
                    <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-medium">Inactive</span>
                  )}
                </div>
                <div className="mb-2 text-lg font-bold text-gray-900">₹{plan.base_price} <span className="text-sm font-normal text-gray-600">/ {plan.duration_days} days</span></div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Included Meals:</span>
                  <ul className="list-disc list-inside ml-2 text-sm text-gray-700">
                    {plan.included_meals && plan.included_meals.length > 0 ? (
                      plan.included_meals.map(meal => (
                        <li key={meal}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</li>
                      ))
                    ) : (
                      <li>None</li>
                    )}
                  </ul>
                </div>
                {plan.can_add_breakfast && (
                  <div className="mb-2 p-2 bg-yellow-50 rounded flex items-center">
                    <input
                      type="checkbox"
                      id={`breakfast-${plan.id}`}
                      checked={!!breakfastSelections[plan.id]}
                      onChange={e => handleBreakfastChange(plan.id, e.target.checked)}
                      className="mr-2"
                      disabled={subscribed}
                    />
                    <label htmlFor={`breakfast-${plan.id}`} className="font-semibold text-yellow-700 cursor-pointer">
                      Breakfast Add-on (+₹{plan.breakfast_addon_price})
                  </label>
                </div>
              )}
                {subscribed && (
                  <>
                    <div className="mb-2 text-green-700 font-semibold">Total Paid: ₹{totalPaid}</div>
              <button
                      className="mb-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                      disabled
              >
                      Pay Now
              </button>
                  </>
      )}
              <button
                  className={`mt-auto px-4 py-2 rounded bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50`}
                  disabled={subscribing === plan.id || subscribed || !plan.is_active}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {subscribed ? 'Subscribed' : (subscribing === plan.id ? 'Subscribing...' : 'Subscribe')}
              </button>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}