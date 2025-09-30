/**
 * Prospect creation page
 * Next.js page component for creating new prospects
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProspectForm } from '@/components/prospects/ProspectForm';

// Note: metadata cannot be exported from client components
// This would typically be handled by a server component or layout

/**
 * Prospect creation page component
 */
export default function ProspectCreationPage() {
  // const router = useRouter(); // Future navigation usage

  /**
   * Handle successful prospect creation
   */
  const handleSuccess = (prospectId: string) => {
    // Could navigate to prospect detail page
    // router.push(`/dashboard/prospects/${prospectId}`);

    // For now, show success and stay on page for new entries
    console.log('Prospect created successfully:', prospectId);
  };

  /**
   * Handle prospect creation error
   */
  const handleError = (error: string) => {
    // Error is already handled by the form component with toast
    console.error('Prospect creation error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <ProspectForm
          onSuccess={handleSuccess}
          onError={handleError}
          className="bg-gray-50"
        />
      </div>
    </div>
  );
}

/**
 * Export the component for integration tests
 */
export { ProspectCreationPage };