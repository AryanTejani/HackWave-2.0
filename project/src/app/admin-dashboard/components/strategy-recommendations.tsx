'use client';

import { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info,
  Play
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface StrategyItem {
  action: string;
  priority: 'high' | 'medium' | 'low';
  estimatedCost: number;
  timeToImplement: number;
  expectedImpact: string;
}

interface ContingencyPlan {
  scenario: string;
  action: string;
  trigger: string;
  estimatedCost: number;
  effectiveness: number;
}

interface RiskMitigation {
  riskType: string;
  strategy: string;
  cost: number;
  effectiveness: number;
  implementationTime: number;
}

interface StrategyRecommendation {
  immediate: StrategyItem[];
  shortTerm: StrategyItem[];
  longTerm: StrategyItem[];
  contingencyPlans: ContingencyPlan[];
  riskMitigation?: RiskMitigation[];
}

interface StrategyRecommendationsProps {
  recommendations?: StrategyRecommendation;
  loading?: boolean;
}

export function StrategyRecommendations({ recommendations, loading }: StrategyRecommendationsProps) {
  const [activeTab, setActiveTab] = useState('immediate');

  // Debug logging to see the actual data structure
  useEffect(() => {
    if (recommendations) {
      console.log('🔍 StrategyRecommendations received:', recommendations);
      console.log('🔍 Immediate actions sample:', recommendations.immediate?.[0]);
      console.log('🔍 Short-term sample:', recommendations.shortTerm?.[0]);
      console.log('🔍 Long-term sample:', recommendations.longTerm?.[0]);
      
      // Debug the specific fields that are causing issues
      if (recommendations.immediate?.[0]) {
        const sample = recommendations.immediate[0];
        console.log('🔍 Sample immediate action - Raw action field:', sample.action);
        console.log('🔍 Sample immediate action - Action field type:', typeof sample.action);
        console.log('🔍 Sample immediate action - Action field length:', sample.action?.length);
        console.log('🔍 Sample immediate action - Action field starts with:', sample.action?.substring(0, 50));
        console.log('🔍 Sample immediate action - Action field ends with:', sample.action?.substring(sample.action.length - 50));
        
        // Test the parseJsonString function
        const parsed = parseJsonString(sample.action);
        console.log('🔍 Sample immediate action - Parsed result:', parsed);
      }
    }
  }, [recommendations]);

  // Helper function to parse nested JSON strings
  const parseJsonString = (text: string): string => {
    if (!text || typeof text !== 'string') return text;
    
    console.log('🔍 Parsing text:', text);
    
    try {
      // Check if the text looks like a JSON string
      if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
        const parsed = JSON.parse(text);
        console.log('🔍 Parsed JSON object:', parsed);
        
        // If it's an object with common fields, extract the most relevant one
        if (typeof parsed === 'object' && parsed !== null) {
          // For recommendation objects, prioritize action field
          if (parsed.action) return parsed.action;
          if (parsed.description) return parsed.description;
          if (parsed.text) return parsed.text;
          if (parsed.message) return parsed.message;
          if (parsed.content) return parsed.content;
          
          // If none of the above, return the first string value found
          for (const [key, value] of Object.entries(parsed)) {
            if (typeof value === 'string' && value.trim()) {
              return value;
            }
          }
        }
      }
      
      // Check if it's an array-like string
      if (text.trim().startsWith('[') && text.trim().endsWith(']')) {
        const parsed = JSON.parse(text);
        console.log('🔍 Parsed JSON array:', parsed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Return the first item if it's a string, or parse it further
          const firstItem = parsed[0];
          if (typeof firstItem === 'string') return firstItem;
          if (typeof firstItem === 'object' && firstItem !== null) {
            return parseJsonString(JSON.stringify(firstItem));
          }
        }
      }
      
      // Check if it's a string that contains escaped quotes (common in AI responses)
      if (text.includes('\\"') || text.includes('\\\'')) {
        try {
          // Try to unescape and parse
          const unescaped = text.replace(/\\"/g, '"').replace(/\\'/g, "'");
          if (unescaped.trim().startsWith('{') && unescaped.trim().endsWith('}')) {
            const parsed = JSON.parse(unescaped);
            if (parsed.action) return parsed.action;
            if (parsed.description) return parsed.description;
            if (parsed.text) return parsed.text;
          }
        } catch (error) {
          console.warn('❌ Failed to parse unescaped string:', error);
        }
      }
      
    } catch (error) {
      // If parsing fails, return the original text
      console.warn('❌ Failed to parse JSON string:', text, error);
    }
    
    return text;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Clock className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const formatTime = (days: number) => {
    if (days >= 365) {
      return `${Math.round(days / 365)} year${Math.round(days / 365) !== 1 ? 's' : ''}`;
    } else if (days >= 30) {
      return `${Math.round(days / 30)} month${Math.round(days / 30) !== 1 ? 's' : ''}`;
    } else if (days >= 7) {
      return `${Math.round(days / 7)} week${Math.round(days / 7) !== 1 ? 's' : ''}`;
    }
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Strategic Recommendations
          </CardTitle>
          <CardDescription>
            AI-generated strategies to mitigate risks and optimize your supply chain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Generating recommendations...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Strategic Recommendations
          </CardTitle>
          <CardDescription>
            AI-generated strategies to mitigate risks and optimize your supply chain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No recommendations available yet</p>
            <p className="text-sm mb-4">Click "Run AI Analysis" to generate strategic recommendations based on your current supply chain data</p>
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
              <Play className="h-4 w-4" />
              Run AI Analysis to get started
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Strategic Recommendations
        </CardTitle>
        <CardDescription>
          AI-generated strategies to mitigate risks and optimize your supply chain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="immediate">
              Immediate ({recommendations.immediate?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="shortTerm">
              Short-term ({recommendations.shortTerm?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="longTerm">
              Long-term ({recommendations.longTerm?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="contingency">
              Contingency ({recommendations.contingencyPlans?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Immediate Actions Tab */}
          <TabsContent value="immediate" className="space-y-4">
            <div className="grid gap-4">
              {recommendations.immediate?.map((item, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-sm">{parseJsonString(item.action)}</h4>
                          <Badge className={getPriorityColor(item.priority)}>
                            {getPriorityIcon(item.priority)}
                            <span className="ml-1">{item.priority}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{parseJsonString(item.expectedImpact)}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(item.estimatedCost)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(item.timeToImplement)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Short-term Strategies Tab */}
          <TabsContent value="shortTerm" className="space-y-4">
            <div className="grid gap-4">
              {recommendations.shortTerm?.map((item, index) => (
                <Card key={index} className="border-l-4 border-l-yellow-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-sm">{parseJsonString(item.action)}</h4>
                          <Badge className={getPriorityColor(item.priority)}>
                            {getPriorityIcon(item.priority)}
                            <span className="ml-1">{item.priority}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{parseJsonString(item.expectedImpact)}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(item.estimatedCost)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(item.timeToImplement)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Long-term Planning Tab */}
          <TabsContent value="longTerm" className="space-y-4">
            <div className="grid gap-4">
              {recommendations.longTerm?.map((item, index) => (
                <Card key={index} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-sm">{parseJsonString(item.action)}</h4>
                          <Badge className={getPriorityColor(item.priority)}>
                            {getPriorityIcon(item.priority)}
                            <span className="ml-1">{item.priority}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{parseJsonString(item.expectedImpact)}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(item.estimatedCost)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(item.timeToImplement)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contingency Plans Tab */}
          <TabsContent value="contingency" className="space-y-4">
            <div className="grid gap-4">
              {recommendations.contingencyPlans?.map((plan, index) => (
                <Card key={index} className="border-l-4 border-l-purple-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-sm">{parseJsonString(plan.scenario)}</h4>
                          <Badge variant="outline" className="text-xs">
                            {plan.effectiveness}% effective
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{parseJsonString(plan.action)}</p>
                        <p className="text-xs text-gray-500 mb-3">
                          <strong>Trigger:</strong> {parseJsonString(plan.trigger)}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(plan.estimatedCost)}
                          </span>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <Progress value={plan.effectiveness} className="w-16 h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Risk Mitigation Section */}
        {recommendations.riskMitigation && recommendations.riskMitigation.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Mitigation Strategies
            </h3>
            <div className="grid gap-4">
              {recommendations.riskMitigation.map((strategy, index) => (
                <Card key={index} className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-sm">{parseJsonString(strategy.riskType)}</h4>
                          <Badge variant="outline" className="text-xs">
                            {strategy.effectiveness}% effective
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{parseJsonString(strategy.strategy)}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(strategy.cost)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(strategy.implementationTime)}
                          </span>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <Progress value={strategy.effectiveness} className="w-16 h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
