"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BusinessDetailsForm } from './components/BusinessDetailsForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Loader2 } from 'lucide-react';

export default function BusinessDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Check if user already has a company profile
    const checkCompanyProfile = async () => {
      try {
        const response = await fetch('/api/company/check');
        if (response.ok) {
          const data = await response.json();
          if (data.exists && data.isComplete) {
            // User already has a complete profile, redirect to dashboard
            router.push('/admin-dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking company profile:', error);
      }
      setIsLoading(false);
    };

    if (session?.user) {
      checkCompanyProfile();
    }
  }, [session, status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to HackWave!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Let's get to know your company better. This information will help us personalize your experience 
            and provide better insights for your supply chain management.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Company Profile Setup</CardTitle>
            <CardDescription>
              Tell us about your business. All fields are optional - you can always update them later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BusinessDetailsForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
