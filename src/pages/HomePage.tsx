import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChefHat, 
  Clock, 
  Star, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Utensils,
  Home,
  Truck
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  const features = [
    {
      icon: Clock,
      title: 'Flexible Timing',
      description: 'Choose your preferred meal delivery times that fit your schedule.'
    },
    {
      icon: Star,
      title: 'Quality Food',
      description: 'Fresh, nutritious meals prepared with care and high-quality ingredients.'
    },
    {
      icon: Users,
      title: 'Community Focused',
      description: 'Perfect for students, professionals, and anyone looking for convenient meals.'
    },
    {
      icon: CheckCircle,
      title: 'Reliable Service',
      description: 'Consistent meal delivery with flexible subscription and leave options.'
    }
  ];

  const services = [
    {
      icon: Home,
      title: 'Mess Service',
      description: 'Full meal plans with breakfast, lunch, and dinner options.',
      price: 'Starting from ₹3,000/month'
    },
    {
      icon: Truck,
      title: 'Tiffin Service',
      description: 'Convenient home delivery of fresh, hot meals.',
      price: 'Starting from ₹2,500/month'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-red-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Delicious Meals,
              <span className="text-orange-600"> Delivered Fresh</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience the convenience of home-style cooking with our mess and tiffin services. 
              Flexible subscriptions, quality ingredients, and meals that feel like home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center transition-colors"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center transition-colors"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/plans"
                    className="border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    View Plans
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our flexible meal service options designed to fit your lifestyle
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <Icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <p className="text-orange-600 font-semibold text-lg">{service.price}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Choolha Chawka?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best meal experience with convenience and quality
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Meal Journey?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their daily meals. 
            Flexible plans, quality food, and reliable service.
          </p>
          {!user && (
            <Link
              to="/register"
              className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold inline-flex items-center transition-colors"
            >
              Start Your Subscription
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}