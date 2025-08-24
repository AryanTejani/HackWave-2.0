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
  recommendations: any;
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
      setLoadingAnalysis(true);
      
      const response = await fetch('/api/what-if-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: whatIfScenario }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Simulation failed');
      }
      
        const data = await response.json();
      
      if (data.success && data.simulation) {
        setSimulationResult({
          ...data.simulation,
          timestamp: new Date()
        });
        console.log('What-If simulation completed successfully:', data.simulation);
      } else {
        throw new Error('Invalid simulation response');
      }
    } catch (error) {
      console.error('What-If simulation error:', error);
      // You could add a toast notification here for better UX
    } finally {
      setLoadingAnalysis(false);
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

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-orange-600 dark:text-orange-400';
      case 'low': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

    const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      case 'optimization': return <TrendingDown className="h-4 w-4" />;
      case 'efficiency': return <Zap className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
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
                  <CardHeader>
                      <CardTitle className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Risk Analysis
                      </CardTitle>
                      <CardDescription>
                          AI-detected risks based on your supply chain data and global conditions
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      {analysis?.risks && analysis.risks.length > 0 ? (
                          <div className="space-y-4">
                              {analysis.risks.map((risk: any, index: number) => (
                                  <div key={risk.id || index} className="border rounded-lg p-4">
                                      <div className="flex items-start justify-between mb-2">
                                          <h4 className="font-semibold text-gray-900 dark:text-white">{risk.title}</h4>
                                          <Badge className={getSeverityColor(risk.severity)}>
                                              {risk.severity}
                                          </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{risk.description}</p>
                                      <div className="flex items-center gap-4 text-xs text-gray-500">
                                          <span className="flex items-center">
                                              <MapPin className="h-3 w-3 mr-1" />
                                              {risk.region}
                                          </span>
                                          <span className="flex items-center">
                                              <AlertTriangle className="h-3 w-3 mr-1" />
                                              {risk.type}
                                          </span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center py-8 text-gray-500">
                              No risks detected. Your supply chain appears to be operating normally.
                          </div>
                      )}
                  </CardContent>
              </Card>
          </TabsContent>
          
          <TabsContent value="impact" className="mt-6">
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center">
                          <TrendingDown className="h-4 w-4 mr-2" />
                          Impact Simulation
                      </CardTitle>
                      <CardDescription>
                          Simulated impact of detected risks on your supply chain
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      {analysis?.simulation ? (
                          <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="text-center p-4 border rounded-lg">
                                      <div className="text-2xl font-bold text-red-600">{analysis.simulation.disruptionImpact.delayDays}</div>
                                      <div className="text-sm text-gray-600">Days Delay</div>
                                  </div>
                                  <div className="text-center p-4 border rounded-lg">
                                      <div className="text-2xl font-bold text-orange-600">${analysis.simulation.disruptionImpact.additionalCost.toLocaleString()}</div>
                                      <div className="text-sm text-gray-600">Additional Cost</div>
                                  </div>
                                  <div className="text-center p-4 border rounded-lg">
                                      <div className="text-2xl font-bold text-blue-600">{analysis.simulation.disruptionImpact.affectedShipments}</div>
                                      <div className="text-sm text-gray-600">Affected Shipments</div>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="text-center py-8 text-gray-500">
                              No impact simulation available.
                          </div>
                      )}
                  </CardContent>
              </Card>
          </TabsContent>
          
          <TabsContent value="strategies" className="mt-6">
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center">
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Strategic Recommendations
                      </CardTitle>
                      <CardDescription>
                          AI-generated strategies to mitigate risks and optimize your supply chain
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                                             {analysis?.recommendations ? (
                           <div className="space-y-6">
                               {/* Handle different recommendation formats */}
                               {Array.isArray(analysis.recommendations.immediate) ? (
                                   <div>
                                       <h4 className="font-semibold text-green-700 mb-2">Immediate Actions</h4>
                                       <ul className="space-y-1">
                                           {analysis.recommendations.immediate.map((rec: any, index: number) => (
                                               <li key={index} className="flex items-start">
                                                   <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                   <span className="text-sm text-gray-700 dark:text-gray-300">
                                                       {typeof rec === 'string' ? rec : rec.recommendation || rec.description || JSON.stringify(rec)}
                                                   </span>
                                               </li>
                                           ))}
                                       </ul>
                                   </div>
                               ) : null}
                               
                               {Array.isArray(analysis.recommendations.shortTerm) ? (
                                   <div>
                                       <h4 className="font-semibold text-blue-700 mb-2">Short-term Strategies</h4>
                                       <ul className="space-y-1">
                                           {analysis.recommendations.shortTerm.map((rec: any, index: number) => (
                                               <li key={index} className="flex items-start">
                                                   <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                   <span className="text-sm text-gray-700 dark:text-gray-300">
                                                       {typeof rec === 'string' ? rec : rec.recommendation || rec.description || JSON.stringify(rec)}
                                                   </span>
                                               </li>
                                           ))}
                                       </ul>
                                   </div>
                               ) : null}
                               
                               {Array.isArray(analysis.recommendations.longTerm) ? (
                                   <div>
                                       <h4 className="font-semibold text-purple-700 mb-2">Long-term Planning</h4>
                                       <ul className="space-y-1">
                                           {analysis.recommendations.longTerm.map((rec: any, index: number) => (
                                               <li key={index} className="flex items-start">
                                                   <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                   <span className="text-sm text-gray-700 dark:text-gray-300">
                                                       {typeof rec === 'string' ? rec : rec.recommendation || rec.description || JSON.stringify(rec)}
                                                   </span>
                                               </li>
                                           ))}
                                       </ul>
                                   </div>
                               ) : null}
                               
                               {/* Fallback for unexpected format */}
                               {!Array.isArray(analysis.recommendations.immediate) && 
                                !Array.isArray(analysis.recommendations.shortTerm) && 
                                !Array.isArray(analysis.recommendations.longTerm) && (
                                   <div className="text-center py-8 text-gray-500">
                                       <p>Unexpected recommendations format. Raw data:</p>
                                       <pre className="text-xs mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                           {JSON.stringify(analysis.recommendations, null, 2)}
                                       </pre>
                                   </div>
                               )}
                           </div>
                       ) : (
                           <div className="text-center py-8 text-gray-500">
                               No strategic recommendations available.
                           </div>
                       )}
                  </CardContent>
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
                              <Button onClick={runWhatIfSimulation} disabled={!whatIfScenario || loadingAnalysis}>
                                  {loadingAnalysis ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Play className="h-4 w-4 mr-2" />
                                  )}
                                  {loadingAnalysis ? 'Running...' : 'Run Simulation'}
                              </Button>
                          </div>
                          {simulationResult && (
                              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                                  <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                          <h3 className="text-lg font-semibold">Simulation Results</h3>
                                          <Badge variant="outline">
                                              {simulationResult.timestamp?.toLocaleString()}
                                          </Badge>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <Card>
                                              <CardHeader className="pb-2">
                                                  <CardTitle className="text-sm">Impact Analysis</CardTitle>
                                              </CardHeader>
                                              <CardContent className="space-y-2">
                                                  <div className="flex justify-between">
                                                      <span className="text-sm">Delay Days:</span>
                                                      <span className="font-medium">{simulationResult.impact?.delayDays || 0}</span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                      <span className="text-sm">Additional Cost:</span>
                                                      <span className="font-medium">{formatCurrency(simulationResult.impact?.additionalCost || 0)}</span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                      <span className="text-sm">Affected Shipments:</span>
                                                      <span className="font-medium">{simulationResult.impact?.affectedShipments || 0}</span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                      <span className="text-sm">Risk Level:</span>
                                                      <Badge className={getSeverityColor(simulationResult.impact?.riskLevel || 'medium')}>
                                                          {simulationResult.impact?.riskLevel || 'Medium'}
                                                      </Badge>
                                                  </div>
                                              </CardContent>
                                          </Card>
                                          
                                          <Card>
                                              <CardHeader className="pb-2">
                                                  <CardTitle className="text-sm">Recommendations</CardTitle>
                                              </CardHeader>
                                              <CardContent className="space-y-2">
                                                  {simulationResult.recommendations?.immediate && (
                                                      <div>
                                                          <h4 className="text-sm font-medium text-red-700 mb-1">Immediate Actions</h4>
                                                          <ul className="text-xs space-y-1">
                                                              {simulationResult.recommendations.immediate.slice(0, 2).map((rec: any, index: number) => (
                                                                  <li key={index} className="flex items-start">
                                                                      <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                                                      <span>{typeof rec === 'string' ? rec : rec.action || rec}</span>
                                                                  </li>
                                                              ))}
                                                          </ul>
                                                      </div>
                                                  )}
                                                  
                                                  {simulationResult.recommendations?.shortTerm && (
                                                      <div>
                                                          <h4 className="text-sm font-medium text-blue-700 mb-1">Short-term</h4>
                                                          <ul className="text-xs space-y-1">
                                                              {simulationResult.recommendations.shortTerm.slice(0, 2).map((rec: any, index: number) => (
                                                                  <li key={index} className="flex items-start">
                                                                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                                                      <span>{typeof rec === 'string' ? rec : rec.action || rec}</span>
                                                                  </li>
                                                              ))}
                                                          </ul>
                                                      </div>
                                                  )}
                                              </CardContent>
                                          </Card>
                                      </div>
                                      
                                      {simulationResult.alternativeRoutes && simulationResult.alternativeRoutes.length > 0 && (
                                          <Card>
                                              <CardHeader className="pb-2">
                                                  <CardTitle className="text-sm">Alternative Routes</CardTitle>
                                              </CardHeader>
                                              <CardContent>
                                                  <div className="space-y-3">
                                                      {simulationResult.alternativeRoutes.slice(0, 2).map((route: any, index: number) => (
                                                          <div key={index} className="border rounded p-3">
                                                              <div className="flex justify-between items-start mb-2">
                                                                  <h5 className="font-medium text-sm">{route.name}</h5>
                                                                  <div className="text-xs text-gray-500">
                                                                      +{formatCurrency(route.costImpact)} | +{route.timeImpact} days
                                                                  </div>
                                                              </div>
                                                              <p className="text-xs text-gray-600 mb-2">{route.description}</p>
                                                              <div className="grid grid-cols-2 gap-2 text-xs">
                                                                  <div>
                                                                      <span className="font-medium text-green-600">Pros:</span>
                                                                      <ul className="mt-1">
                                                                          {route.pros?.slice(0, 2).map((pro: string, i: number) => (
                                                                              <li key={i} className="flex items-start">
                                                                                  <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 mr-1 flex-shrink-0"></span>
                                                                                  {pro}
                                                                              </li>
                                                                          ))}
                                                                      </ul>
                                                                  </div>
                                                                  <div>
                                                                      <span className="font-medium text-red-600">Cons:</span>
                                                                      <ul className="mt-1">
                                                                          {route.cons?.slice(0, 2).map((con: string, i: number) => (
                                                                              <li key={i} className="flex items-start">
                                                                                  <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 mr-1 flex-shrink-0"></span>
                                                                                  {con}
                                                                              </li>
                                                                          ))}
                                                                      </ul>
                                                                  </div>
                                                              </div>
                                                          </div>
                                                      ))}
                                                  </div>
                                              </CardContent>
                                          </Card>
                                      )}
                                  </div>
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