'use client';

import { useState } from 'react';
import { AlertTriangle, Shield, Truck } from 'lucide-react';

interface RiskSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon?: 'political' | 'reliability' | 'transport';
  className?: string;
}

export default function RiskSlider({ 
  label, 
  value, 
  onChange, 
  icon = 'political',
  className = '' 
}: RiskSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const getIcon = () => {
    switch (icon) {
      case 'political':
        return <AlertTriangle className="h-4 w-4" />;
      case 'reliability':
        return <Shield className="h-4 w-4" />;
      case 'transport':
        return <Truck className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getRiskColor = (value: number) => {
    if (value >= 70) return 'text-red-600';
    if (value >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskLevel = (value: number) => {
    if (value >= 70) return 'High';
    if (value >= 40) return 'Medium';
    return 'Low';
  };

  const getSliderColor = (value: number) => {
    if (value >= 70) return 'bg-red-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-gray-600">
            {getIcon()}
          </div>
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-semibold ${getRiskColor(value)}`}>
            {value}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(value)} bg-opacity-10 ${getRiskColor(value).replace('text-', 'bg-')}`}>
            {getRiskLevel(value)}
          </span>
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-all duration-200 ${
            isDragging ? 'scale-105' : ''
          }`}
          style={{
            background: `linear-gradient(to right, ${getSliderColor(value)} 0%, ${getSliderColor(value)} ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`
          }}
        />
        
        {/* Custom slider thumb */}
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer"
          style={{
            left: `${value}%`,
            backgroundColor: value >= 70 ? '#ef4444' : value >= 40 ? '#eab308' : '#22c55e'
          }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>Low Risk (0)</span>
        <span>High Risk (100)</span>
      </div>
    </div>
  );
}
