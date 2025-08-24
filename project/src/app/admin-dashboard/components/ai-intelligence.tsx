'use client';

import { useState, useEffect } from 'react';
import { 
  Brain, 
  AlertTriangle, 
  TrendingDown, 
  Route, 
  Shield, 
  Play,
  RefreshCw,
  MapPin,
  Clock,
  DollarSign,
  Truck,
  Zap,
  Settings,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSupplyChainNews, getMarketData, getGlobalConditions, NewsItem, GlobalCondition } from '@/lib/tools';

interface AIAnalysis {
  risks: any[];
  simulation: any;
  strategies: any;
  companyProfile: any;
  analysisTimestamp: string;
}

interface WhatIfSimulationResult {
  scenario: string;
  impact: {
    delayDays: number;
    additionalCost: number;
    affectedShipments: number;
    riskLevel: string;
    supplyChainDisruption: string;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  alternativeRoutes: {
    name: string;
    description: string;
    pros: string[];
    cons: string[];
    costImpact: number;
    timeImpact: number;
  }[];
  timestamp: Date;
  aiEnhancement?: string;
}

export function AIIntelligence() {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<'risk' | 'impact' | 'strategy' | null>(null);
  const [whatIfScenario, setWhatIfScenario] = useState('');
  const [simulationResult, setSimulationResult] = useState<WhatIfSimulationResult | null>(null);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [supplyChainNews, setSupplyChainNews] = useState<NewsItem[]>([]);
  const [marketData, setMarketData] = useState<any>(null);
  const [globalConditions, setGlobalConditions] = useState<GlobalCondition[]>([]);

  const runAIAnalysis = async () => {
    setLoading(true);
    setActiveAgent('risk');
    
    try {
      // Simulate multi-agent processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setActiveAgent('impact');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setActiveAgent('strategy');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: 'Worldwide' })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
      setActiveAgent(null);
    }
  };

  const runWhatIfSimulation = async () => {
    if (!whatIfScenario.trim()) return;
    
    try {
      const response = await fetch('/api/what-if-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: whatIfScenario })
      });

      if (response.ok) {
        const data = await response.json();
        setSimulationResult(data.simulation);
      }
    } catch (error) {
      console.error('What-if simulation error:', error);
    }
  };

  useEffect(() => {
    // Auto-run demo analysis on page load
    runAIAnalysis();
    
    // Fetch dynamic data from the API route
    const fetchDynamicData = async () => {
      try {
        const response = await fetch('/api/supply-chain-data');
        if (!response.ok) {
          throw new Error('Failed to fetch supply chain data');
        }
        
        const { data } = await response.json();
        const { news, market, conditions } = data;
        
        setSupplyChainNews(news || []);
        setMarketData(market);
        setGlobalConditions(conditions || []);
        
        // Generate dynamic AI insights based on real data
        const dynamicInsights = [
          {
            id: '1',
            type: 'optimization',
            title: 'Route Optimization Opportunity',
            description: market?.marketTrend === 'rising' ? 
              'AI detected 15% cost savings potential by rerouting through Suez Canal' :
              'AI recommends optimizing routes based on current market conditions',
            impact: 'high',
            confidence: 87
          },
          {
            id: '2',
            type: 'risk',
            title: 'Supplier Risk Alert',
            description: conditions && conditions.length > 0 ? 
              `Increased risk detected for suppliers in ${conditions[0]?.region} region` :
              'Monitoring supplier risks across global network',
            impact: 'medium',
            confidence: 73
          },
          {
            id: '3',
            type: 'efficiency',
            title: 'Inventory Optimization',
            description: news && news.length > 0 ? 
              'AI recommends adjusting inventory levels based on current supply chain disruptions' :
              'AI recommends reducing safety stock by 20% for non-critical items',
            impact: 'medium',
            confidence: 91
          }
        ];
        
        setAiInsights(dynamicInsights);
      } catch (error) {
        console.error('Error fetching dynamic data:', error);
        // Fallback to default insights
        setAiInsights([
          // ... your default insights ...
        ]);
      }
    };
    
    fetchDynamicData();
  }, []);


  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
      case 'low': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <BarChart3 className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      case 'efficiency': return <Settings className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Intelligence</h1>
          <p className="text-gray-600 dark:text-gray-400">AI-powered supply chain analysis and predictive insights</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            AI Settings
          </Button>
          <Button onClick={runAIAnalysis} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Analyzing...' : 'Run AI Analysis'}
          </Button>
        </div>
      </div>

      {/* Multi-Agent Status */}
      {loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 text-blue-600 mr-2" />
              Multi-Agent AI Processing
            </CardTitle>
            <CardDescription>AI agents are analyzing your supply chain data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`flex items-center space-x-3 p-3 rounded-lg ${activeAgent === 'risk' ? 'bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeAgent === 'risk' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                  {activeAgent === 'risk' ? <RefreshCw className="h-4 w-4 animate-spin" /> : '1'}
                </div>
                <div>
                  <div className="font-medium dark:text-white">Risk Monitor Agent</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Scanning news, trade data, and geopolitical signals...</div>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-lg ${activeAgent === 'impact' ? 'bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeAgent === 'impact' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                  {activeAgent === 'impact' ? <RefreshCw className="h-4 w-4 animate-spin" /> : '2'}
                </div>
                <div>
                  <div className="font-medium dark:text-white">Impact Simulator Agent</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Calculating disruption impact on shipments and costs...</div>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-lg ${activeAgent === 'strategy' ? 'bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeAgent === 'strategy' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                  {activeAgent === 'strategy' ? <RefreshCw className="h-4 w-4 animate-spin" /> : '3'}
                </div>
                <div>
                  <div className="font-medium dark:text-white">Strategy Recommender Agent</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Generating resilient alternatives and recommendations...</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 text-yellow-600 mr-2" />
            AI Insights
          </CardTitle>
          <CardDescription>Intelligent recommendations and optimizations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiInsights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-full ${getSeverityColor(insight.impact)}`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'secondary' : 'default'}>
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{insight.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Impact: </span>
                    <span className={`text-xs font-medium ${getImpactColor(insight.impact)}`}>
                      {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Analysis Results */}
      {analysis && (
        <Tabs defaultValue="risks" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
            <TabsTrigger value="impact">Impact Simulation</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="whatif">What-If Scenarios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="risks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  Risk Detection Results
                </CardTitle>
                <CardDescription>AI-detected supply chain risks and vulnerabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.risks?.map((risk: any, index: number) => (
                    <div
                      key={risk.id || index}
                      className={`p-4 rounded-lg border-2 ${getSeverityColor(risk.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm dark:text-white">{risk.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(risk.severity)}`}>
                          {risk.severity?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm mb-2 dark:text-gray-300">{risk.description}</p>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="dark:text-gray-300">{risk.region}</span>
                        </div>
                        <div className="font-medium dark:text-gray-300">Impact: {risk.impact}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="impact" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingDown className="h-5 w-5 text-orange-500 mr-2" />
                  Impact Simulation Results
                </CardTitle>
                <CardDescription>Predicted impact of detected risks on your supply chain</CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.simulation && (
                  <div className="space-y-6">
                    {/* Impact Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />
                          <div>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                              {analysis.simulation.disruptionImpact?.delayDays || 0} days
                            </div>
                            <div className="text-sm text-red-700 dark:text-red-300">Expected Delay</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          <div>
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                              {formatCurrency(analysis.simulation.disruptionImpact?.additionalCost || 0)}
                            </div>
                            <div className="text-sm text-orange-700 dark:text-orange-300">Additional Cost</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                        <div className="flex items-center space-x-2">
                          <Truck className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          <div>
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                              {analysis.simulation.disruptionImpact?.affectedShipments || 0}
                            </div>
                            <div className="text-sm text-yellow-700 dark:text-yellow-300">Affected Shipments</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <div>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 capitalize">
                              {analysis.simulation.disruptionImpact?.riskLevel || 'Medium'}
                            </div>
                            <div className="text-sm text-purple-700 dark:text-purple-300">Risk Level</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alternative Routes */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alternative Routes</h3>
                      <div className="space-y-4">
                        {analysis.simulation.alternatives?.map((alt: any, index: number) => (
                          <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 dark:bg-gray-700/50">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">{alt.recommendation}</h4>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  <Route className="h-4 w-4 inline mr-1" />
                                  {alt.origin} → {alt.destination}
                                </div>
                              </div>
                              <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-2 py-1 text-xs font-medium rounded-full">
                                {alt.riskReduction}% Risk Reduction
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                              <div className="text-sm dark:text-gray-300">
                                <span className="font-medium">Duration:</span> {alt.duration} days
                              </div>
                              <div className="text-sm dark:text-gray-300">
                                <span className="font-medium">Cost:</span> {formatCurrency(alt.cost)}
                              </div>
                              <div className="text-sm dark:text-gray-300">
                                <span className="font-medium">Distance:</span> {alt.distance?.toLocaleString()} km
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="font-medium text-green-700 dark:text-green-400 mb-1">Pros:</div>
                                <ul className="space-y-1">
                                  {alt.pros?.map((pro: string, i: number) => (
                                    <li key={i} className="text-green-600 dark:text-green-300">• {pro}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <div className="font-medium text-red-700 dark:text-red-400 mb-1">Cons:</div>
                                <ul className="space-y-1">
                                  {alt.cons?.map((con: string, i: number) => (
                                    <li key={i} className="text-red-600 dark:text-red-300">• {con}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="strategies" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-500 mr-2" />
                  Strategic Recommendations
                </CardTitle>
                <CardDescription>AI-generated strategies for supply chain resilience</CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.strategies && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                        <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center">
                          <Zap className="h-4 w-4 mr-2" />
                          Immediate Actions (24-48 hours)
                        </h3>
                        <ul className="space-y-2">
                          {analysis.strategies.immediate?.map((action: string, index: number) => (
                            <li key={index} className="text-sm text-red-700 dark:text-red-300">• {action}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Short-term (2-4 weeks)
                        </h3>
                        <ul className="space-y-2">
                          {analysis.strategies.shortTerm?.map((strategy: string, index: number) => (
                            <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">• {strategy}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Long-term (3-6 months)
                        </h3>
                        <ul className="space-y-2">
                          {analysis.strategies.longTerm?.map((plan: string, index: number) => (
                            <li key={index} className="text-sm text-blue-700 dark:text-blue-300">• {plan}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                          <Route className="h-4 w-4 mr-2" />
                          Contingency Plans
                        </h3>
                        <ul className="space-y-2">
                          {analysis.strategies.contingencyPlans?.map((plan: string, index: number) => (
                            <li key={index} className="text-sm text-green-700 dark:text-green-300">• {plan}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="whatif" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 text-purple-500 mr-2" />
                  What-If Scenario Simulation
                </CardTitle>
                <CardDescription>Test different scenarios and see their impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <Input
                      type="text"
                      value={whatIfScenario}
                      onChange={(e) => setWhatIfScenario(e.target.value)}
                      placeholder="e.g., 'What if the Panama Canal is blocked for 2 weeks?'"
                      className="flex-1"
                    />
                    <Button onClick={runWhatIfSimulation}>
                      Simulate
                    </Button>
                  </div>
                  
                  {/* Suggested Scenarios */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">💡 Try these scenarios:</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Panama Canal closure',
                        'Port strike in Los Angeles',
                        'Hurricane affecting Gulf Coast',
                        'Suez Canal blockage',
                        'Fuel price spike',
                        'New import tariffs'
                      ].map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setWhatIfScenario(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {simulationResult && (
                    <div className="mt-6 space-y-6">
                      {/* Impact Summary */}
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                        <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3">Scenario: {simulationResult.scenario}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{simulationResult.impact?.delayDays || 0} days</div>
                            <div className="text-sm text-red-700 dark:text-red-300">Expected Delay</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(simulationResult.impact?.additionalCost || 0)}</div>
                            <div className="text-sm text-red-700 dark:text-red-300">Additional Cost</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{simulationResult.impact?.affectedShipments || 0}</div>
                            <div className="text-sm text-red-700 dark:text-red-300">Affected Shipments</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400 capitalize">{simulationResult.impact?.riskLevel || 'Medium'}</div>
                            <div className="text-sm text-red-700 dark:text-red-300">Risk Level</div>
                          </div>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-300">{simulationResult.impact?.supplyChainDisruption}</p>
                      </div>

                      {/* Recommendations */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Immediate Actions</h4>
                          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                            {simulationResult.recommendations?.immediate?.map((rec: string, index: number) => (
                              <li key={index}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Short-term (2-4 weeks)</h4>
                          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            {simulationResult.recommendations?.shortTerm?.map((rec: string, index: number) => (
                              <li key={index}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Long-term (3-6 months)</h4>
                          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                            {simulationResult.recommendations?.longTerm?.map((rec: string, index: number) => (
                              <li key={index}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Alternative Routes */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Alternative Routes</h4>
                        <div className="space-y-3">
                          {simulationResult.alternativeRoutes?.map((route: any, index: number) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 dark:bg-gray-700/50">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h5 className="font-semibold text-gray-900 dark:text-white">{route.name}</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{route.description}</p>
                                </div>
                                <div className="text-right text-sm">
                                  <div className="text-red-600 dark:text-red-400">+{route.costImpact}% cost</div>
                                  <div className="text-blue-600 dark:text-blue-400">+{route.timeImpact} days</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="font-medium text-green-700 dark:text-green-400 mb-1">Pros:</div>
                                  <ul className="space-y-1">
                                    {route.pros?.map((pro: string, i: number) => (
                                      <li key={i} className="text-green-600 dark:text-green-300">• {pro}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <div className="font-medium text-red-700 dark:text-red-400 mb-1">Cons:</div>
                                  <ul className="space-y-1">
                                    {route.cons?.map((con: string, i: number) => (
                                      <li key={i} className="text-red-600 dark:text-red-300">• {con}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Enhancement */}
                      {simulationResult.aiEnhancement && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                          <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🤖 AI Enhancement</h4>
                          <p className="text-sm text-purple-700 dark:text-purple-300">{simulationResult.aiEnhancement}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
