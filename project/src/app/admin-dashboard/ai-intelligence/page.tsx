'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Activity, 
  Target,
  Zap,
  Globe,
  BarChart3,
  Play,
  RefreshCw,
  Eye,
  Clock,
  DollarSign
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface ComprehensiveAnalysis {
  risks: any[];
  vulnerabilities: any[];
  networkAnalysis: any;
  events: any[];
  simulations: any[];
  strategies: any[];
  strategyComparison: any;
  summary: {
    totalRisks: number;
    criticalRisks: number;
    averageVulnerabilityScore: number;
    activeEvents: number;
    recommendedActions: number;
    expectedROI: number;
  };
}

export default function AIIntelligencePage() {
  const [analysis, setAnalysis] = useState<ComprehensiveAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/comprehensive-analysis', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to run analysis');
      }
      
      const result = await response.json();
      setAnalysis(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getVulnerabilityColor = (score: number) => {
    if (score >= 75) return 'text-red-600';
    if (score >= 50) return 'text-orange-600';
    if (score >= 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!analysis && !loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="text-center">
            <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">AI Intelligence Dashboard</h2>
            <p className="text-gray-500 mt-2">Click the button below to start your comprehensive analysis</p>
            <Button onClick={runAnalysis} className="mt-4">
              <Brain className="mr-2 h-4 w-4" />
              Start Analysis
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Intelligence Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive supply chain risk analysis powered by AI
            </p>
          </div>
          <Button onClick={runAnalysis} disabled={loading}>
            {loading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Analyzing...' : 'Refresh Analysis'}
          </Button>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.summary.totalRisks}</div>
                  <p className="text-xs text-muted-foreground">
                    {analysis.summary.criticalRisks} critical
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vulnerability Score</CardTitle>
                  <Shield className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(analysis.summary.averageVulnerabilityScore)}
                  </div>
                  <p className="text-xs text-muted-foreground">Average risk score</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                  <Globe className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.summary.activeEvents}</div>
                  <p className="text-xs text-muted-foreground">Disruption events</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expected ROI</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(analysis.summary.expectedROI)}%</div>
                  <p className="text-xs text-muted-foreground">From recommendations</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
                <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="simulations">Simulations</TabsTrigger>
                <TabsTrigger value="strategies">Strategies</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Risk Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                        Risk Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysis.risks.slice(0, 3).map((risk, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{risk.title}</h4>
                              <p className="text-sm text-gray-600">{risk.region}</p>
                            </div>
                            <Badge className={getRiskColor(risk.severity)}>
                              {risk.severity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Network Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                        Network Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Chokepoints</span>
                          <span className="font-medium">{analysis.networkAnalysis.chokepoints.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Single Source Risks</span>
                          <span className="font-medium">{analysis.networkAnalysis.singleSourceRisks.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Country Dependencies</span>
                          <span className="font-medium">{analysis.networkAnalysis.countryDependencies.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Risks Tab */}
              <TabsContent value="risks" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Risk Alerts</CardTitle>
                    <CardDescription>
                      Real-time risk detection based on your supply chain data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.risks.map((risk, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{risk.title}</h3>
                                <Badge className={getRiskColor(risk.severity)}>
                                  {risk.severity}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-2">{risk.description}</p>
                              <p className="text-sm text-gray-500 mb-3">
                                <strong>Impact:</strong> {risk.impact}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {risk.sources.map((source: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {source}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              {new Date(risk.detectedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Vulnerabilities Tab */}
              <TabsContent value="vulnerabilities" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vulnerability Analysis</CardTitle>
                    <CardDescription>
                      Network vulnerability scoring and chokepoint identification
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Top Vulnerabilities */}
                      <div>
                        <h3 className="font-semibold mb-4">Top Vulnerabilities</h3>
                        <div className="space-y-3">
                          {analysis.vulnerabilities.slice(0, 5).map((vuln, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{vuln.nodeName}</h4>
                                <Badge className={getVulnerabilityColor(vuln.riskScore)}>
                                  Score: {vuln.riskScore}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-gray-600">{vuln.nodeType}</span>
                                <Badge variant="outline" className={getRiskColor(vuln.riskLevel)}>
                                  {vuln.riskLevel}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                {vuln.factors.slice(0, 3).map((factor: any, idx: number) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span>{factor.name}</span>
                                    <span className="font-medium">{factor.score}/100</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Chokepoints */}
                      <div>
                        <h3 className="font-semibold mb-4">Network Chokepoints</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysis.networkAnalysis.chokepoints.map((chokepoint: any, index: number) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">{chokepoint.location}</h4>
                                  <Badge variant="outline">{chokepoint.type}</Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{chokepoint.description}</p>
                                <div className="flex justify-between text-sm">
                                  <span>Risk Score: {chokepoint.riskScore}</span>
                                  <span>Affected: {chokepoint.affectedShipments}</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Disruption Events</CardTitle>
                    <CardDescription>
                      Active external events affecting supply chains
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.events.map((event, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{event.title}</h3>
                                <Badge className={getRiskColor(event.severity)}>
                                  {event.severity}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-2">{event.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>📍 {event.location}</span>
                                <span>⏱️ {event.durationDays} days</span>
                                <span>🎯 {Math.round(event.confidence * 100)}% confidence</span>
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              {new Date(event.startDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Simulations Tab */}
              <TabsContent value="simulations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Impact Simulations</CardTitle>
                    <CardDescription>
                      What-if analysis for disruption scenarios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {analysis.simulations.map((sim, index) => (
                        <div key={index} className="border rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{sim.scenarioName}</h3>
                            <Badge variant="outline">
                              {Math.round(sim.confidence * 100)}% confidence
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {sim.kpis.onTimePercentage.toFixed(1)}%
                              </div>
                              <div className="text-sm text-gray-600">On-Time Delivery</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {sim.kpis.averageDelay.toFixed(1)} days
                              </div>
                              <div className="text-sm text-gray-600">Average Delay</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">
                                ${(sim.costImpact.totalAdditionalCost / 1000).toFixed(1)}K
                              </div>
                              <div className="text-sm text-gray-600">Additional Cost</div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium">Recommendations:</h4>
                            <ul className="space-y-1">
                              {sim.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <span className="mr-2">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Strategies Tab */}
              <TabsContent value="strategies" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Strategic Recommendations</CardTitle>
                    <CardDescription>
                      AI-powered strategies with impact analysis and trade-offs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Strategy Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Target className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                            <h4 className="font-medium">Best Cost Efficiency</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {analysis.strategyComparison.comparison.bestCostEfficiency.title}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Shield className="mx-auto h-8 w-8 text-green-500 mb-2" />
                            <h4 className="font-medium">Best Risk Reduction</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {analysis.strategyComparison.comparison.bestRiskReduction.title}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Zap className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                            <h4 className="font-medium">Quick Win</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {analysis.strategyComparison.comparison.bestQuickWin.title}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <TrendingUp className="mx-auto h-8 w-8 text-purple-500 mb-2" />
                            <h4 className="font-medium">Overall Best</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {analysis.strategyComparison.comparison.overallRecommendation.title}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Detailed Strategies */}
                      <div className="space-y-4">
                        {analysis.strategies.slice(0, 5).map((strategy, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold">{strategy.title}</h4>
                                <p className="text-sm text-gray-600">{strategy.description}</p>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="outline">{strategy.category}</Badge>
                                <Badge className={getRiskColor(strategy.priority)}>
                                  {strategy.priority}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">
                                  {strategy.impact.costDelta > 0 ? '+' : ''}{strategy.impact.costDelta}%
                                </div>
                                <div className="text-xs text-gray-600">Cost Impact</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-orange-600">
                                  {strategy.impact.delayDelta > 0 ? '+' : ''}{strategy.impact.delayDelta} days
                                </div>
                                <div className="text-xs text-gray-600">Delay Impact</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">
                                  -{strategy.impact.riskReduction}%
                                </div>
                                <div className="text-xs text-gray-600">Risk Reduction</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-purple-600">
                                  {strategy.implementation.timeline} days
                                </div>
                                <div className="text-xs text-gray-600">Timeline</div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h5 className="font-medium text-sm">Implementation Steps:</h5>
                              <ul className="space-y-1">
                                {strategy.implementation.steps.slice(0, 3).map((step: string, idx: number) => (
                                  <li key={idx} className="text-sm text-gray-600 flex items-start">
                                    <span className="mr-2">•</span>
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
