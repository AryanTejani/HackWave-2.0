"use client"

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  BookOpen, 
  Code, 
  Zap, 
  Shield, 
  TrendingUp, 
  Star,
  Copy,
  ExternalLink,
  Download,
  Play,
  Terminal,
  Globe,
  Lock,
  Users,
  BarChart3,
  Settings,
  Key,
  Database,
  Cpu,
  Brain,
  MessageSquare,
  Image,
  FileText,
  Languages,
  Sparkles
} from 'lucide-react';
import { PricingSection } from './components/PricingSection';
import { ApiConsole } from './components/ApiConsole';

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const services = [
    {
      name: 'Text Generation',
      description: 'Create compelling content, articles, and creative writing',
      endpoint: '/api/v1/generate/text',
      icon: FileText,
      category: 'generation'
    },
    {
      name: 'Code Generation',
      description: 'Generate code snippets, documentation, and debugging help',
      endpoint: '/api/v1/generate/code',
      icon: Code,
      category: 'generation'
    },
    {
      name: 'Sentiment Analysis',
      description: 'Analyze text sentiment and emotional context',
      endpoint: '/api/v1/analyze/sentiment',
      icon: Brain,
      category: 'analysis'
    },
    {
      name: 'Content Summarization',
      description: 'Extract key insights and create concise summaries',
      endpoint: '/api/v1/analyze/summarize',
      icon: FileText,
      category: 'analysis'
    },
    {
      name: 'Translation',
      description: 'Multi-language translation with context awareness',
      endpoint: '/api/v1/translate',
      icon: Languages,
      category: 'processing'
    },
    {
      name: 'Image Analysis',
      description: 'Analyze images, extract text, and generate descriptions',
      endpoint: '/api/v1/analyze/image',
      icon: Image,
      category: 'analysis'
    },
    {
      name: 'Chat Conversation',
      description: 'Multi-turn conversations with memory and context',
      endpoint: '/api/v1/chat/conversation',
      icon: MessageSquare,
      category: 'interaction'
    },
    {
      name: 'Data Processing',
      description: 'Parse, clean, and extract insights from structured data',
      endpoint: '/api/v1/process/data',
      icon: Database,
      category: 'processing'
    }
  ];

  const codeExamples = {
    textGeneration: `curl -X POST https://api.hackwave.ai/v1/generate/text \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Write a blog post about AI in healthcare",
    "max_tokens": 500,
    "temperature": 0.7
  }'`,
    
    sentimentAnalysis: `curl -X POST https://api.hackwave.ai/v1/analyze/sentiment \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "I absolutely love this product! It's amazing.",
    "detailed": true
  }'`,
    
    codeGeneration: `curl -X POST https://api.hackwave.ai/v1/generate/code \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Create a React component for a todo list",
    "language": "typescript",
    "framework": "react"
  }'`
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              HackWave AI API
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Powerful AI services powered by Google Gemini. Build intelligent applications with our comprehensive suite of LLM-powered APIs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Key className="mr-2 h-5 w-5" />
                Get API Key
              </Button>
              <Button variant="outline" size="lg">
                <Download className="mr-2 h-5 w-5" />
                Download SDK
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 h-16">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="quickstart" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Quick Start
            </TabsTrigger>
            <TabsTrigger value="reference" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              API Reference
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Examples
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Pricing
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Lightning Fast</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Response times under 500ms for most requests</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Enterprise Ready</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">99.9% uptime SLA with enterprise-grade security</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Global Scale</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">CDN-powered global distribution for low latency</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Why Choose HackWave AI?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">🚀 Powered by Gemini</h4>
                    <p className="text-gray-600">Built on Google's latest Gemini AI models for superior performance and accuracy.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">🔧 Developer First</h4>
                    <p className="text-gray-600">Comprehensive SDKs, detailed documentation, and extensive examples.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">📊 Analytics & Insights</h4>
                    <p className="text-gray-600">Detailed usage analytics, cost tracking, and performance monitoring.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">🛡️ Enterprise Security</h4>
                    <p className="text-gray-600">SOC 2 compliant, enterprise-grade security with audit logging.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">All</Button>
                <Button variant="outline" size="sm">Generation</Button>
                <Button variant="outline" size="sm">Analysis</Button>
                <Button variant="outline" size="sm">Processing</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <service.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <Badge variant="secondary">{service.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="font-medium">Endpoint:</span>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                          {service.endpoint}
                        </code>
                      </div>
                      <Button size="sm" className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Docs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Quick Start Tab */}
          <TabsContent value="quickstart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Get Started in 5 Minutes</CardTitle>
                <CardDescription>
                  Follow these steps to integrate HackWave AI into your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">Get Your API Key</h4>
                      <p className="text-gray-600">Sign up and generate your API key from the dashboard</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">Install SDK (Optional)</h4>
                      <p className="text-gray-600">Install our SDK for your preferred programming language</p>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <Terminal className="h-4 w-4 text-gray-500" />
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">npm install @hackwave/ai-sdk</code>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard('npm install @hackwave/ai-sdk')}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Terminal className="h-4 w-4 text-gray-500" />
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">pip install hackwave-ai</code>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard('pip install hackwave-ai')}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold">Make Your First API Call</h4>
                      <p className="text-gray-600">Test the API with a simple text generation request</p>
                      <div className="mt-2">
                        <div className="bg-gray-900 text-white p-4 rounded-lg">
                          <pre className="text-sm overflow-x-auto">
                            <code>{codeExamples.textGeneration}</code>
                          </pre>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="mt-2"
                          onClick={() => copyToClipboard(codeExamples.textGeneration)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Code
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="reference" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>
                  All API requests require authentication using your API key
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Header Authentication</h4>
                    <div className="bg-gray-900 text-white p-4 rounded-lg">
                      <pre className="text-sm">Authorization: Bearer YOUR_API_KEY</pre>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Rate Limits</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">1,000</div>
                        <div className="text-sm text-gray-600">Free Tier</div>
                        <div className="text-xs text-gray-500">per month</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">50,000</div>
                        <div className="text-sm text-gray-600">Pro Tier</div>
                        <div className="text-xs text-gray-500">per month</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">Unlimited</div>
                        <div className="text-sm text-gray-600">Enterprise</div>
                        <div className="text-xs text-gray-500">with SLA</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Format</CardTitle>
                <CardDescription>
                  All API responses follow a consistent JSON format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-white p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`{
  "success": true,
  "data": {
    "result": "Generated content here...",
    "tokens_used": 150,
    "model": "gemini-pro"
  },
  "meta": {
    "request_id": "req_123456",
    "timestamp": "2024-01-15T10:30:00Z",
    "processing_time": 245
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            {/* API Console */}
            <ApiConsole />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Text Generation</CardTitle>
                  <CardDescription>
                    Generate creative content, articles, and marketing copy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Request</h4>
                      <div className="bg-gray-900 text-white p-3 rounded-lg">
                        <pre className="text-xs overflow-x-auto">
                          <code>{codeExamples.textGeneration}</code>
                        </pre>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Response</h4>
                      <div className="bg-gray-900 text-white p-3 rounded-lg">
                        <pre className="text-xs overflow-x-auto">
{`{
  "success": true,
  "data": {
    "result": "AI in Healthcare: A Revolution in Patient Care...",
    "tokens_used": 450
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Analysis</CardTitle>
                  <CardDescription>
                    Analyze text sentiment and emotional context
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Request</h4>
                      <div className="bg-gray-900 text-white p-3 rounded-lg">
                        <pre className="text-xs overflow-x-auto">
                          <code>{codeExamples.sentimentAnalysis}</code>
                        </pre>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Response</h4>
                      <div className="bg-gray-900 text-white p-3 rounded-lg">
                        <pre className="text-xs overflow-x-auto">
{`{
  "success": true,
  "data": {
    "sentiment": "positive",
    "confidence": 0.95,
    "emotions": ["joy", "excitement"]
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>SDK Examples</CardTitle>
                <CardDescription>
                  Code examples using our official SDKs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="javascript" className="w-full">
                  <TabsList>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="javascript" className="mt-4">
                    <div className="bg-gray-900 text-white p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
{`import { HackWaveAI } from '@hackwave/ai-sdk';

const ai = new HackWaveAI('YOUR_API_KEY');

// Generate text
const result = await ai.generateText({
  prompt: 'Write a blog post about AI',
  maxTokens: 500
});

console.log(result.data.result);`}
                      </pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="python" className="mt-4">
                    <div className="bg-gray-900 text-white p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
{`from hackwave_ai import HackWaveAI

ai = HackWaveAI('YOUR_API_KEY')

# Generate text
result = ai.generate_text(
    prompt="Write a blog post about AI",
    max_tokens=500
)

print(result.data.result)`}
                      </pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="curl" className="mt-4">
                    <div className="bg-gray-900 text-white p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        <code>{codeExamples.textGeneration}</code>
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
                           </CardContent>
           </Card>
         </TabsContent>



         {/* Pricing Tab */}
         <TabsContent value="pricing" className="space-y-6">
           <PricingSection />
         </TabsContent>
       </Tabs>
     </div>

      {/* Footer CTA */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of developers building intelligent applications with HackWave AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Key className="mr-2 h-5 w-5" />
                Get Your API Key
              </Button>
                             <Button 
                 variant="outline" 
                 size="lg"
                 onClick={() => setActiveTab('pricing')}
               >
                 <Users className="mr-2 h-5 w-5" />
                 View Pricing
               </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
