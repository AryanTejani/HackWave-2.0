'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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

interface AIAnalysis {
  risks: any[];
  recommendations: any;
  summary: {
    totalRisks: number;
    highRiskCount: number;
    recommendationsCount: number;
  };
  analysisTimestamp: string;
}

interface WhatIfSimulationResult {
  scenario: string;
  impact: {
    delayDays: number;
    additionalCost: number;
    affectedShipments: number;
    riskLevel: string;
  };
  recommendations: any;
  timestamp: Date;
}

export function AIIntelligence() {
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<'risk' | 'impact' | 'strategy' | null>(null);
  const [whatIfScenario, setWhatIfScenario] = useState('');
  const [simulationResult, setSimulationResult] = useState<WhatIfSimulationResult | null>(null);
  const [availableScenarios, setAvailableScenarios] = useState<string[]>([]);

  // Fetch available scenarios on component mount
  useEffect(() => {
    fetchAvailableScenarios();
  }, []);

  const fetchAvailableScenarios = async () => {
    try {
      const response = await fetch('/api/what-if-simulation');
      if (response.ok) {
        const data = await response.json();
        setAvailableScenarios(data.data.availableScenarios || []);
      }
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    }
  };

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
        body: JSON.stringify({ analysisType: 'full' })
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
    if (!whatIfScenario) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/what-if-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: whatIfScenario })
      });

      if (response.ok) {
        const data = await response.json();
        setSimulationResult(data.data);
      }
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            AI Intelligence
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Multi-agent AI analysis of your supply chain
          </p>
        </div>
        <Button onClick={runAIAnalysis} disabled={loading}>
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      {/* AI Analysis Results */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Risk Analysis
              </CardTitle>
              <CardDescription>
                {analysis.summary.totalRisks} risks detected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">High Risk</span>
                  <Badge variant="destructive">{analysis.summary.highRiskCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Risks</span>
                  <Badge>{analysis.summary.totalRisks}</Badge>
                </div>
                <Progress value={(analysis.summary.highRiskCount / analysis.summary.totalRisks) * 100} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Recommendations
              </CardTitle>
              <CardDescription>
                {analysis.summary.recommendationsCount} actionable items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Immediate</span>
                  <Badge variant="secondary">{analysis.recommendations.immediate.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Short Term</span>
                  <Badge variant="secondary">{analysis.recommendations.shortTerm.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Long Term</span>
                  <Badge variant="secondary">{analysis.recommendations.longTerm.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Last Updated
              </CardTitle>
              <CardDescription>
                Analysis timestamp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {new Date(analysis.analysisTimestamp).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risk Details */}
      {analysis && analysis.risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Risks</CardTitle>
            <CardDescription>
              AI-detected supply chain risks based on your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.risks.map((risk, index) => (
                <div key={risk.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getRiskColor(risk.severity)}>
                          {risk.severity}
                        </Badge>
                        <Badge variant="outline">{risk.type}</Badge>
                      </div>
                      <h4 className="font-semibold mb-1">{risk.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                      <p className="text-sm text-gray-500">{risk.impact}</p>
                      {risk.affectedProducts.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">Affected Products: </span>
                          <span className="text-xs">{risk.affectedProducts.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* What-If Simulation */}
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
              <Button onClick={runWhatIfSimulation} disabled={!whatIfScenario || loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>

            {simulationResult && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-2">Scenario: {simulationResult.scenario}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {simulationResult.impact.delayDays}
                    </div>
                    <div className="text-sm text-gray-600">Days Delay</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      ${simulationResult.impact.additionalCost.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Additional Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {simulationResult.impact.affectedShipments}
                    </div>
                    <div className="text-sm text-gray-600">Affected Shipments</div>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge className={getRiskColor(simulationResult.impact.riskLevel)}>
                    Risk Level: {simulationResult.impact.riskLevel}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Details */}
      {analysis && analysis.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Strategic Recommendations
            </CardTitle>
            <CardDescription>
              AI-generated strategies based on your supply chain data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="immediate" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="immediate">Immediate</TabsTrigger>
                <TabsTrigger value="shortTerm">Short Term</TabsTrigger>
                <TabsTrigger value="longTerm">Long Term</TabsTrigger>
                <TabsTrigger value="contingency">Contingency</TabsTrigger>
              </TabsList>
              
              <TabsContent value="immediate" className="space-y-2">
                {analysis.recommendations.immediate.map((rec: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="shortTerm" className="space-y-2">
                {analysis.recommendations.shortTerm.map((rec: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="longTerm" className="space-y-2">
                {analysis.recommendations.longTerm.map((rec: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="contingency" className="space-y-2">
                {analysis.recommendations.contingencyPlans.map((rec: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-purple-50 rounded">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
