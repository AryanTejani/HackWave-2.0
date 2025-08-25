"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Shield, Globe } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started and testing',
    features: [
      '1,000 API calls per month',
      'Basic AI services',
      'Community support',
      'Standard response times',
      'Basic analytics'
    ],
    limitations: [
      'No priority support',
      'Limited to basic models'
    ],
    popular: false,
    buttonText: 'Get Started Free',
    buttonVariant: 'outline' as const
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For growing applications and businesses',
    features: [
      '50,000 API calls per month',
      'All AI services',
      'Priority support',
      'Faster response times',
      'Advanced analytics',
      'Custom rate limits',
      'Webhook support'
    ],
    limitations: [],
    popular: true,
    buttonText: 'Start Pro Trial',
    buttonVariant: 'default' as const
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large-scale applications and teams',
    features: [
      'Unlimited API calls',
      'All AI services + custom models',
      'Dedicated support',
      '99.9% uptime SLA',
      'Custom integrations',
      'Advanced security features',
      'Dedicated infrastructure',
      'Custom pricing'
    ],
    limitations: [],
    popular: false,
    buttonText: 'Contact Sales',
    buttonVariant: 'outline' as const
  }
];

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Response times under 500ms for most requests'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with enterprise-grade security'
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description: 'CDN-powered global distribution for low latency'
  }
];

export function PricingSection() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include our core AI services powered by Google Gemini.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? 'ring-2 ring-blue-600 shadow-xl scale-105' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  )}
                </div>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.limitations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Limitations:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation) => (
                        <li key={limitation} className="text-sm text-gray-500 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <Button 
                  className={`w-full ${plan.buttonVariant === 'default' ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}`}
                  variant={plan.buttonVariant}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need a Custom Plan?
          </h3>
          <p className="text-gray-600 mb-6">
            We offer custom pricing for high-volume users and special use cases.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg">
              Contact Sales Team
            </Button>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
