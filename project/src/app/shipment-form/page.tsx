'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Package, MapPin, Calendar, DollarSign, Save, ArrowLeft, CheckCircle, AlertCircle, Plus, X } from 'lucide-react';
import Link from 'next/link';

// Form data interface
interface ShipmentFormData {
  productId: string;
  origin: string;
  destination: string;
  status: 'On-Time' | 'Delayed' | 'Stuck' | 'Delivered';
  expectedDelivery: string;
  trackingNumber: string;
  quantity: number;
  totalValue: number;
  shippingMethod: 'Air' | 'Sea' | 'Land' | 'Express';
  carrier: string;
  currentLocation: string;
  estimatedArrival: string;
  riskFactors: string[];
}

// Product interface for dropdown
interface Product {
  _id: string;
  name: string;
  category: string;
  supplier: string;
  origin: string;
  unitCost: number;
}

// Initial form state
const initialFormData: ShipmentFormData = {
  productId: '',
  origin: '',
  destination: '',
  status: 'On-Time',
  expectedDelivery: '',
  trackingNumber: '',
  quantity: 1,
  totalValue: 0,
  shippingMethod: 'Sea',
  carrier: '',
  currentLocation: '',
  estimatedArrival: '',
  riskFactors: []
};

// Predefined carriers for better UX
const carriers = [
  'Maersk Line',
  'MSC',
  'CMA CGM',
  'COSCO Shipping',
  'Hapag-Lloyd',
  'ONE',
  'Evergreen Marine',
  'Yang Ming',
  'FedEx Express',
  'DHL Express',
  'UPS Airlines',
  'Emirates SkyCargo',
  'Other'
];

export default function ShipmentForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ShipmentFormData>(initialFormData);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [newRiskFactor, setNewRiskFactor] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch products for dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products', { credentials: 'include' });
        const result = await response.json();
        if (result.success) {
          setProducts(result.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle form field changes
  const handleInputChange = (field: keyof ShipmentFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle risk factor management
  const addRiskFactor = () => {
    if (newRiskFactor.trim() && !formData.riskFactors.includes(newRiskFactor.trim())) {
      setFormData(prev => ({
        ...prev,
        riskFactors: [...prev.riskFactors, newRiskFactor.trim()]
      }));
      setNewRiskFactor('');
    }
  };

  const removeRiskFactor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      riskFactors: prev.riskFactors.filter((_, i) => i !== index)
    }));
  };

  // Calculate total value when product or quantity changes
  useEffect(() => {
    if (formData.productId && formData.quantity > 0) {
      const selectedProduct = products.find(p => p._id === formData.productId);
      if (selectedProduct) {
        const totalValue = selectedProduct.unitCost * formData.quantity;
        setFormData(prev => ({ ...prev, totalValue }));
      }
    }
  }, [formData.productId, formData.quantity, products]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        // Reset form after successful submission
        setTimeout(() => {
          setFormData(initialFormData);
          setSubmitStatus('idle');
          router.push('/admin-dashboard');
        }, 2000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Failed to save shipment data');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/admin-dashboard"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Shipment Tracking Form
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create new shipments and track them through your supply chain with detailed logistics information.
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-green-800 font-medium">
                Shipment created successfully!
              </span>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <span className="text-red-800 font-medium">
                {errorMessage}
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Selection */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Package className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Product Selection</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-2">
                  Product *
                </label>
                <select
                  id="productId"
                  value={formData.productId}
                  onChange={(e) => handleInputChange('productId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name} - {product.supplier}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1"
                  min="1"
                  required
                />
              </div>
            </div>
            
            {formData.totalValue > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Total Value:</span>
                  <span className="text-lg font-bold text-blue-900">${formData.totalValue.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Shipment Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Truck className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Shipment Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-2">
                  Origin *
                </label>
                <input
                  type="text"
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => handleInputChange('origin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Shenzhen, China"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                  Destination *
                </label>
                <input
                  type="text"
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Rotterdam, Netherlands"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as 'On-Time' | 'Delayed' | 'Stuck' | 'Delivered')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="On-Time">On-Time</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Stuck">Stuck</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="expectedDelivery" className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Delivery *
                </label>
                <input
                  type="date"
                  id="expectedDelivery"
                  value={formData.expectedDelivery}
                  onChange={(e) => handleInputChange('expectedDelivery', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number
                </label>
                <input
                  type="text"
                  id="trackingNumber"
                  value={formData.trackingNumber}
                  onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tracking number"
                />
              </div>
            </div>
          </div>

          {/* Logistics Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <MapPin className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Logistics Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="shippingMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Method *
                </label>
                <select
                  id="shippingMethod"
                  value={formData.shippingMethod}
                  onChange={(e) => handleInputChange('shippingMethod', e.target.value as 'Air' | 'Sea' | 'Land' | 'Express')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="Sea">Sea Freight</option>
                  <option value="Air">Air Freight</option>
                  <option value="Land">Land Transport</option>
                  <option value="Express">Express Delivery</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="carrier" className="block text-sm font-medium text-gray-700 mb-2">
                  Carrier *
                </label>
                <select
                  id="carrier"
                  value={formData.carrier}
                  onChange={(e) => handleInputChange('carrier', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a carrier</option>
                  {carriers.map(carrier => (
                    <option key={carrier} value={carrier}>{carrier}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="currentLocation" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Location
                </label>
                <input
                  type="text"
                  id="currentLocation"
                  value={formData.currentLocation}
                  onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., In Transit - Pacific Ocean"
                />
              </div>
              
              <div>
                <label htmlFor="estimatedArrival" className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Arrival
                </label>
                <input
                  type="date"
                  id="estimatedArrival"
                  value={formData.estimatedArrival}
                  onChange={(e) => handleInputChange('estimatedArrival', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Risk Factors</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newRiskFactor}
                  onChange={(e) => setNewRiskFactor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add risk factor (e.g., Weather delays, Port congestion)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRiskFactor())}
                />
                <button
                  type="button"
                  onClick={addRiskFactor}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {formData.riskFactors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.riskFactors.map((factor, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                    >
                      {factor}
                      <button
                        type="button"
                        onClick={() => removeRiskFactor(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin-dashboard"
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center px-6 py-3 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Shipment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
