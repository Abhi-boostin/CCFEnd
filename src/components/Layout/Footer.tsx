import React from 'react';
import { ChefHat, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Choolha Chawka</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Your trusted partner for delicious and nutritious meals. We provide convenient 
              mess and tiffin services with flexible subscription plans.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span>support@choolhachawka.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/plans" className="text-gray-300 hover:text-orange-400 transition-colors">Meal Plans</a></li>
              <li><a href="/subscriptions" className="text-gray-300 hover:text-orange-400 transition-colors">Subscriptions</a></li>
              <li><a href="/feedback" className="text-gray-300 hover:text-orange-400 transition-colors">Feedback</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-orange-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="/help" className="text-gray-300 hover:text-orange-400 transition-colors">Help Center</a></li>
              <li><a href="/faq" className="text-gray-300 hover:text-orange-400 transition-colors">FAQ</a></li>
              <li><a href="/privacy" className="text-gray-300 hover:text-orange-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-gray-300 hover:text-orange-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © 2025 Choolha Chawka. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <span className="text-gray-300 text-sm">Made with ❤️ for food lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}