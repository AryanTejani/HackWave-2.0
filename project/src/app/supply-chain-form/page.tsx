'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Building2, MapPin, Truck, Save, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import RiskSlider from '@/components/ui/risk-slider';
import Link from 'next/link';

// Form data interface
interface SupplyChainFormData {
  productName: string;
  supplier: {
    name: string;
    country: string;
    region: string;
  };
  shipment: {
    origin: string;
    destination: string;
    status: 'In Transit' | 'Delivered' | 'Delayed';
  };
  riskFactors: {
    politicalRisk: number;
    supplierReliability: number;
    transportRisk: number;
  };
}

// Initial form state
const initialFormData: SupplyChainFormData = {
  productName: '',
  supplier: {
    name: '',
    country: '',
    region: ''
  },
  shipment: {
    origin: '',
    destination: '',
    status: 'In Transit'
  },
  riskFactors: {
    politicalRisk: 50,
    supplierReliability: 50,
    transportRisk: 50
  }
};

export default function SupplyChainForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<SupplyChainFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle form field changes
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        (newData as any)[parent][child] = value;
      } else {
        (newData as any)[field] = value;
      }
      
      return newData;
    });
  };

  // Handle risk factor changes
  const handleRiskChange = (factor: keyof SupplyChainFormData['riskFactors'], value: number) => {
    setFormData(prev => ({
      ...prev,
      riskFactors: {
        ...prev.riskFactors,
        [factor]: value
      }
    }));
  };

  // Calculate overall risk score
  const calculateOverallRisk = () => {
    const { politicalRisk, supplierReliability, transportRisk } = formData.riskFactors;
    const weightedScore = (politicalRisk * 0.3) + ((100 - supplierReliability) * 0.4) + (transportRisk * 0.3);
    return Math.round(weightedScore);
  };

  const overallRisk = calculateOverallRisk();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/supply-chain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        // Reset form after successful submission
        setTimeout(() => {
          setFormData(initialFormData);
          setSubmitStatus('idle');
        }, 2000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Failed to save supply chain data');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get risk level color
  const getRiskLevelColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Supply Chain Input Form
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Enter detailed information about your supply chain to monitor risks and track shipments effectively.
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-green-800 font-medium">
                Supply chain data saved successfully!
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

        {/* Overall Risk Indicator */}
        <div className={`mb-8 p-4 border rounded-lg ${getRiskLevelColor(overallRisk)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Overall Risk Assessment</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{overallRisk}</div>
              <div className="text-sm">{getRiskLevel(overallRisk)}</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Package className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Supplier Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Building2 className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Supplier Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="supplierName" className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  id="supplierName"
                  value={formData.supplier.name}
                  onChange={(e) => handleInputChange('supplier.name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter supplier name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="supplierCountry" className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  id="supplierCountry"
                  value={formData.supplier.country}
                  onChange={(e) => handleInputChange('supplier.country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter country"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="supplierRegion" className="block text-sm font-medium text-gray-700 mb-2">
                  Region *
                </label>
                <input
                  type="text"
                  id="supplierRegion"
                  value={formData.supplier.region}
                  onChange={(e) => handleInputChange('supplier.region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter region"
                  required
                />
              </div>
            </div>
          </div>

          {/* Shipment Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Truck className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Shipment Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-2">
                  Origin *
                </label>
                <input
                  type="text"
                  id="origin"
                  value={formData.shipment.origin}
                  onChange={(e) => handleInputChange('shipment.origin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter origin location"
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
                  value={formData.shipment.destination}
                  onChange={(e) => handleInputChange('shipment.destination', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter destination"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  value={formData.shipment.status}
                  onChange={(e) => handleInputChange('shipment.status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Risk Assessment</h2>
            </div>
            
            <div className="space-y-8">
              <RiskSlider
                label="Political Risk"
                value={formData.riskFactors.politicalRisk}
                onChange={(value) => handleRiskChange('politicalRisk', value)}
                icon="political"
              />
              
              <RiskSlider
                label="Supplier Reliability"
                value={formData.riskFactors.supplierReliability}
                onChange={(value) => handleRiskChange('supplierReliability', value)}
                icon="reliability"
              />
              
              <RiskSlider
                label="Transport Risk"
                value={formData.riskFactors.transportRisk}
                onChange={(value) => handleRiskChange('transportRisk', value)}
                icon="transport"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard"
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Supply Chain Data
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
