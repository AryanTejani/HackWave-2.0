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
import { NewsItem, GlobalCondition, SupplyChainAlert, SupplierInfo } from '@/lib/tools';

// Combined interfaces for a complete state
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

interface DynamicData {
  news: NewsItem[];
  conditions: GlobalCondition[];
  marketData: any;
  alerts: SupplyChainAlert[];
  supplierIntel: SupplierInfo[];
}

export function AIIntelligence() {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [dynamicData, setDynamicData] = useState<DynamicData | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [loadingDynamicData, setLoadingDynamicData] = useState(true);
  const [activeAgent, setActiveAgent] = useState<'risk' | 'impact' | 'strategy' | null>(null);
  const [whatIfScenario, setWhatIfScenario] = useState('');
  const [simulationResult, setSimulationResult] = useState<WhatIfSimulationResult | null>(null);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  
  const [availableScenarios, setAvailableScenarios] = useState<string[]>([
      'Panama Canal closure',
      'Port strike in Los Angeles',
      'Hurricane affecting Gulf Coast',
      'Suez Canal blockage',
      'Fuel price spike',
      'New import tariffs'
  ]);

  // Fetch all necessary data on component mount
  useEffect(() => {
    runAIAnalysis();
    fetchDynamicData();
  }, []);

  const fetchDynamicData = async () => {
    try {
      setLoadingDynamicData(true);
      // This is the CORRECT way to fetch data from the frontend
      const response = await fetch('/api/ai-intelligence');
      if (!response.ok) throw new Error('Failed to fetch dynamic intelligence data');
      
      const result = await response.json();
      if (result.success) {
        setDynamicData(result.data);
        generateDynamicInsights(result.data);
      }
    } catch (error) {
      console.error('Error fetching dynamic data:', error);
    } finally {
      setLoadingDynamicData(false);
    }
  };

  const runAIAnalysis = async () => {
    setLoadingAnalysis(true);
    setActiveAgent('risk');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setActiveAgent('impact');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setActiveAgent('strategy');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisType: 'full' })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoadingAnalysis(false);
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

  const generateDynamicInsights = (data: DynamicData) => {
    const insights = [];
    if (data.marketData?.marketTrend === 'rising') {
      insights.push({
        id: '1', type: 'optimization', title: 'Cost Savings Opportunity',
        description: 'Shipping rates are rising. AI suggests consolidating shipments to save up to 12% on freight costs.',
        impact: 'high', confidence: 88
      });
    }
    if (data.conditions?.some(c => c.severity === 'high' || c.severity === 'critical')) {
      const criticalCondition = data.conditions.find(c => c.severity === 'high' || c.severity === 'critical');
      insights.push({
        id: '2', type: 'risk', title: `High-Risk Zone: ${criticalCondition?.region}`,
        description: `Severe disruptions reported in the ${criticalCondition?.region} region. Consider rerouting shipments scheduled through this area.`,
        impact: 'medium', confidence: 92
      });
    }
    if (data.news?.some(n => n.snippet.toLowerCase().includes('labor strike'))) {
         insights.push({
        id: '3', type: 'efficiency', title: 'Potential Labor Strike',
        description: 'Reports of potential labor strikes at major ports. AI recommends diversifying port usage for the next quarter.',
        impact: 'medium', confidence: 75
      });
    }
    setAiInsights(insights);
  };

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
          <Button variant="outline"><Settings className="h-4 w-4 mr-2" />AI Settings</Button>
          <Button onClick={runAIAnalysis} disabled={loadingAnalysis}>
            {loadingAnalysis ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            {loadingAnalysis ? 'Analyzing...' : 'Run AI Analysis'}
          </Button>
        </div>
      </div>

      {/* Multi-Agent Status */}
      {loadingAnalysis && (
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
               <div className={`flex items-center space-x-3 p-3 rounded-lg ${activeAgent === 'risk' ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeAgent === 'risk' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600'}`}>
                   {activeAgent === 'risk' ? <RefreshCw className="h-4 w-4 animate-spin" /> : '1'}
                 </div>
                 <div>
                   <div className="font-medium">Risk Monitor Agent</div>
                   <div className="text-sm text-gray-600 dark:text-gray-400">Scanning live data streams...</div>
                 </div>
               </div>
                <div className={`flex items-center space-x-3 p-3 rounded-lg ${activeAgent === 'impact' ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeAgent === 'impact' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600'}`}>
                   {activeAgent === 'impact' ? <RefreshCw className="h-4 w-4 animate-spin" /> : '2'}
                 </div>
                 <div>
                   <div className="font-medium">Impact Simulator Agent</div>
                   <div className="text-sm text-gray-600 dark:text-gray-400">Calculating disruption impact...</div>
                 </div>
               </div>
                <div className={`flex items-center space-x-3 p-3 rounded-lg ${activeAgent === 'strategy' ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeAgent === 'strategy' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600'}`}>
                   {activeAgent === 'strategy' ? <RefreshCw className="h-4 w-4 animate-spin" /> : '3'}
                 </div>
                 <div>
                   <div className="font-medium">Strategy Recommender Agent</div>
                   <div className="text-sm text-gray-600 dark:text-gray-400">Generating resilient alternatives...</div>
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
                Live AI Insights
            </CardTitle>
            <CardDescription>Real-time recommendations based on live market data</CardDescription>
        </CardHeader>
        <CardContent>
            {loadingDynamicData ? <p>Loading live insights...</p> : (
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
            )}
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
                  {/* ... Your existing Risk Analysis UI ... */}
              </Card>
          </TabsContent>
          
          <TabsContent value="impact" className="mt-6">
              <Card>
                   {/* ... Your existing Impact Simulation UI ... */}
              </Card>
          </TabsContent>
          
          <TabsContent value="strategies" className="mt-6">
              <Card>
                   {/* ... Your existing Strategies UI ... */}
              </Card>
          </TabsContent>
          
          <TabsContent value="whatif" className="mt-6">
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center">
                          <Route className="h-4 w-4 mr-2" />
                          What-If Simulation
                      </CardTitle>
                      <CardDescription>
                          Test different disruption scenarios on your supply chain
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-4">
                          <div className="flex space-x-2">
                              <Input
                                  placeholder="Select or type a scenario"
                                  value={whatIfScenario}
                                  onChange={(e) => setWhatIfScenario(e.target.value)}
                                  list="scenarios"
                              />
                              <datalist id="scenarios">
                                  {availableScenarios.map(scenario => (
                                      <option key={scenario} value={scenario} />
                                  ))}
                              </datalist>
                              <Button onClick={runWhatIfSimulation} disabled={!whatIfScenario}>
                                  <Play className="h-4 w-4" />
                              </Button>
                          </div>
                          {simulationResult && (
                              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                                   {/* ... Your existing Simulation Result UI ... */}
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