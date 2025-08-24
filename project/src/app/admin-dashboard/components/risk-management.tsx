'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  MapPin, 
  Clock,
  DollarSign,
  Activity,
  Eye,
  Settings,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getSupplyChainAlerts, getGlobalConditions, SupplyChainAlert, GlobalCondition } from '@/lib/tools';
import { StrategyRecommendations } from './strategy-recommendations';

interface RiskAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  region: string;
  title: string;
  description: string;
  impact: string;
  detectedAt: Date;
  sources: string[];
}

export function RiskManagement() {
  const [riskAlerts, setRiskAlerts] = useState<SupplyChainAlert[]>([]);
  const [globalConditions, setGlobalConditions] = useState<GlobalCondition[]>([]);
  const [riskScore, setRiskScore] = useState(7.2);
  const [loading, setLoading] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        setLoading(true);
        
        // Fetch dynamic risk alerts and global conditions
        const [alerts, conditions] = await Promise.all([
          getSupplyChainAlerts(),
          getGlobalConditions()
        ]);
        
        setRiskAlerts(alerts);
        setGlobalConditions(conditions);
        
        // Calculate dynamic risk score based on alerts
        const severityScores = { critical: 4, high: 3, medium: 2, low: 1 };
        const totalScore = alerts.reduce((sum, alert) => sum + severityScores[alert.severity], 0);
        const avgScore = alerts.length > 0 ? (totalScore / alerts.length) * 2 : 7.2;
        setRiskScore(Math.min(10, Math.max(0, avgScore)));
        
      } catch (error) {
        console.error('Error fetching risk data:', error);
        // Fallback to default data if API fails
        setRiskScore(7.2);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskData();
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

  const generateAIRecommendations = async () => {
    try {
      setGeneratingRecommendations(true);
      
      // Call the multi-agent system to generate recommendations
      const response = await fetch('/api/strategy-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAiRecommendations(data.recommendations);
        console.log('✅ AI recommendations generated:', data);
      } else {
        console.error('Failed to generate AI recommendations');
      }
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
    } finally {
      setGeneratingRecommendations(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading risk data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Risk Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage supply chain risks proactively</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={generateAIRecommendations}
            disabled={generatingRecommendations}
            variant="outline"
          >
            {generatingRecommendations ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-blue-600"></div>
                Generating...
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4 mr-2" />
                Generate AI Recommendations
              </>
            )}
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Risk Settings
          </Button>
          <Button>
            <Eye className="h-4 w-4 mr-2" />
            View All Risks
          </Button>
        </div>
      </div>

      {/* Risk Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Risk Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{riskScore}/10</div>
            <Progress value={riskScore * 10} className="mt-2" />
            <Badge variant={riskScore > 7 ? "destructive" : riskScore > 4 ? "secondary" : "default"} className="mt-2">
              {riskScore > 7 ? "High Risk" : riskScore > 4 ? "Medium Risk" : "Low Risk"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</CardTitle>
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{riskAlerts.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Risk Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">-12%</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Active Risk Alerts
          </CardTitle>
          <CardDescription>Current risks affecting your supply chain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-2 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-sm dark:text-white">{alert.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {alert.type}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2 dark:text-gray-300">{alert.description}</p>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="dark:text-gray-300">{alert.region}</span>
                      </div>
                      <div className="font-medium dark:text-gray-300">Impact: {alert.impact}</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        Detected: {alert.detectedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Categories</CardTitle>
            <CardDescription>Breakdown by risk type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Geopolitical</span>
                </div>
                <span className="text-sm font-medium">High</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Weather</span>
                </div>
                <span className="text-sm font-medium">Medium</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Regulatory</span>
                </div>
                <span className="text-sm font-medium">Low</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Operational</span>
                </div>
                <span className="text-sm font-medium">Low</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Mitigation</CardTitle>
            <CardDescription>Actions taken to reduce risks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Route Diversification</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Supplier Backup</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Insurance Coverage</span>
                <Badge variant="secondary">Pending</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Inventory Buffer</span>
                <Badge variant="outline">Planned</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Recommendations */}
      <StrategyRecommendations 
        recommendations={aiRecommendations}
        loading={generatingRecommendations}
      />
    </div>
  );
}
