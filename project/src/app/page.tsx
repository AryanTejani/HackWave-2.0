// app/page.tsx (Landing/Home page)
import Link from 'next/link';
import { Truck, Shield, BarChart3, AlertTriangle, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screenbg-gradient-to-b from-background via-secondary/20 via-70% pb-28 pt-20">
   
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 text-balance">
            Supply Chain Risk Detection & Monitoring
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto text-balance">
            Monitor your shipments in real-time, detect potential risks, and get AI-powered recommendations 
            to keep your supply chain running smoothly.
          </p>
          <Link
            href="/admin-dashboard"
            className="btn-primary text-lg px-8 py-3"
          >
            Get Started
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Real-time Tracking
            </h3>
            <p className="text-gray-600">
              Monitor all your shipments from origin to destination with live status updates.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Risk Detection
            </h3>
            <p className="text-gray-600">
              Get instant alerts about delayed shipments, customs issues, and supply chain disruptions.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI Recommendations
            </h3>
            <p className="text-gray-600">
              Receive intelligent suggestions for risk mitigation and supply chain optimization.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analytics Dashboard
            </h3>
            <p className="text-gray-600">
              Visualize performance metrics and identify trends in your supply chain operations.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Add Your Shipments
              </h3>
              <p className="text-gray-600">
                Input your product and shipment details including origin, destination, and expected delivery dates.
              </p>
            </div>

            <div className="relative">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Monitor in Real-time
              </h3>
              <p className="text-gray-600">
                Track status updates and receive automated alerts when risks are detected in your supply chain.
              </p>
            </div>

            <div className="relative">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Take Action
              </h3>
              <p className="text-gray-600">
                Follow AI-powered recommendations to mitigate risks and optimize your supply chain operations.
              </p>
            </div>
          </div>
        </div>
      </main>

    
    </div>
  );
}
            