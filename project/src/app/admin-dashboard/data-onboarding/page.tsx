'use client';

import { DataOnboarding } from '../components/data-onboarding';

export default function DataOnboardingPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Data Onboarding
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Upload your supply chain data files and let AI map them to our system
        </p>
      </div>
      
      <DataOnboarding />
    </div>
  );
}
