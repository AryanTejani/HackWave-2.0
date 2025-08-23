// components/AlertsSection.tsx
'use client';

import { Alert } from '@/lib/types';
import { AlertTriangle, Clock, TrendingUp, CheckCircle } from 'lucide-react';

interface AlertsSectionProps {
  alerts: Alert[];
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
}

export default function AlertsSection({ alerts, summary }: AlertsSectionProps) {
  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'High': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'Medium': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Low': return <TrendingUp className="h-5 w-5 text-blue-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'border-red-200 bg-red-50';
      case 'Medium': return 'border-yellow-200 bg-yellow-50';
      case 'Low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Risk Alerts</h2>
            <p className="mt-1 text-sm text-gray-500">
              Shipments requiring attention with AI-powered recommendations
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              High: {summary.high}
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              Medium: {summary.medium}
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Low: {summary.low}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-500">No risk alerts at the moment. Your supply chain is running smoothly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div
                key={`${alert.shipmentId}-${index}`}
                className={`rounded-lg border-2 p-4 ${getRiskColor(alert.riskLevel)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getRiskIcon(alert.riskLevel)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {alert.productName}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          alert.status === 'Delayed' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Route: {alert.origin} → {alert.destination} | 
                        Expected: {formatDate(alert.expectedDelivery)}
                      </p>
                      
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Recommended Actions:
                        </h4>
                        <ul className="space-y-1">
                          {alert.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alert.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                      alert.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.riskLevel} Risk
                    </span>
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