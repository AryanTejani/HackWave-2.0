"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Copy, RotateCcw, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const endpoints = [
  {
    value: 'text-generation',
    label: 'Text Generation',
    method: 'POST',
    path: '/api/v1/generate/text',
    description: 'Generate creative content and articles'
  },
  {
    value: 'sentiment-analysis',
    label: 'Sentiment Analysis',
    method: 'POST',
    path: '/api/v1/analyze/sentiment',
    description: 'Analyze text sentiment and emotions'
  },
  {
    value: 'code-generation',
    label: 'Code Generation',
    method: 'POST',
    path: '/api/v1/generate/code',
    description: 'Generate code snippets and documentation'
  },
  {
    value: 'translation',
    label: 'Translation',
    method: 'POST',
    path: '/api/v1/translate',
    description: 'Translate text between languages'
  }
];

const sampleRequests = {
  'text-generation': {
    prompt: 'Write a short blog post about artificial intelligence in healthcare',
    max_tokens: 300,
    temperature: 0.7
  },
  'sentiment-analysis': {
    text: 'I absolutely love this product! It has exceeded all my expectations.',
    detailed: true
  },
  'code-generation': {
    prompt: 'Create a React component for a todo list',
    language: 'typescript',
    framework: 'react'
  },
  'translation': {
    text: 'Hello, how are you today?',
    target_language: 'es',
    source_language: 'en'
  }
};

export function ApiConsole() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('text-generation');
  const [apiKey, setApiKey] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const currentEndpoint = endpoints.find(ep => ep.value === selectedEndpoint);

  const handleEndpointChange = (value: string) => {
    setSelectedEndpoint(value);
    setRequestBody(JSON.stringify(sampleRequests[value as keyof typeof sampleRequests], null, 2));
    setResponse('');
    setStatus('idle');
  };

  const loadSampleRequest = () => {
    setRequestBody(JSON.stringify(sampleRequests[selectedEndpoint as keyof typeof sampleRequests], null, 2));
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
  };

  const resetConsole = () => {
    setRequestBody('');
    setResponse('');
    setStatus('idle');
  };

  const testApiCall = async () => {
    if (!apiKey.trim()) {
      setResponse('Error: Please enter your API key');
      setStatus('error');
      return;
    }

    if (!requestBody.trim()) {
      setResponse('Error: Please enter request body');
      setStatus('error');
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      // This is a demo - in real implementation, you'd make actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse = {
        success: true,
        data: {
          result: `Mock response for ${currentEndpoint?.label}`,
          tokens_used: Math.floor(Math.random() * 100) + 50,
          model: 'gemini-pro'
        },
        meta: {
          request_id: `demo_${Date.now()}`,
          timestamp: new Date().toISOString(),
          processing_time: Math.floor(Math.random() * 200) + 100
        }
      };

      setResponse(JSON.stringify(mockResponse, null, 2));
      setStatus('success');
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          API Testing Console
        </CardTitle>
        <CardDescription>
          Test our API endpoints directly from the documentation. Enter your API key and try out different services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Key Input */}
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Enter your API key to test endpoints"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Don't have an API key? <Button variant="link" className="p-0 h-auto">Get one here</Button>
          </p>
        </div>

        {/* Endpoint Selection */}
        <div className="space-y-2">
          <Label>Select Endpoint</Label>
          <Select value={selectedEndpoint} onValueChange={handleEndpointChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {endpoints.map((endpoint) => (
                <SelectItem key={endpoint.value} value={endpoint.value}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {endpoint.method}
                    </Badge>
                    <span>{endpoint.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentEndpoint && (
            <div className="text-sm text-gray-600">
              <code className="bg-gray-100 px-2 py-1 rounded">
                {currentEndpoint.method} {currentEndpoint.path}
              </code>
              <p className="mt-1">{currentEndpoint.description}</p>
            </div>
          )}
        </div>

        {/* Request Body */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="request-body">Request Body (JSON)</Label>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={loadSampleRequest}>
                Load Sample
              </Button>
              <Button size="sm" variant="outline" onClick={resetConsole}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Textarea
            id="request-body"
            placeholder="Enter your request body in JSON format"
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />
        </div>

        {/* Test Button */}
        <Button 
          onClick={testApiCall} 
          disabled={isLoading || !apiKey.trim() || !requestBody.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing API...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Test API Call
            </>
          )}
        </Button>

        {/* Response */}
        {response && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Response</Label>
              <div className="flex items-center gap-2">
                {status === 'success' && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Success</span>
                  </div>
                )}
                {status === 'error' && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Error</span>
                  </div>
                )}
                <Button size="sm" variant="outline" onClick={copyResponse}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="bg-gray-900 text-white p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{response}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• This is a demo console - responses are simulated</li>
            <li>• Use the "Load Sample" button to see example requests</li>
            <li>• All endpoints require authentication via API key</li>
            <li>• Check the API Reference tab for detailed parameter documentation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
