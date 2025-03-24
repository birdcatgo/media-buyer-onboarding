'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function GeneratePDFPage() {
  const router = useRouter();
  const { formId } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function generateAndSendPDF() {
      if (!formId) return;

      try {
        const response = await fetch('/api/generateAndSendPDF', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ formId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to generate and send PDF');
        }

        setSuccess(true);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (formId) {
      generateAndSendPDF();
    }
  }, [formId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4">Generating and sending your contract...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md w-full">
          <h2 className="text-red-700 text-xl font-bold mb-2">Error Generating Contract</h2>
          <p className="text-red-600">{error}</p>
          <p className="mt-4 text-gray-600">If you continue to experience issues, please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Contract Signed Successfully!</h2>
        <p className="text-gray-600 mb-4">
          Thank you for signing the contract. A copy has been sent to your email address.
        </p>
        <p className="text-gray-500 text-sm">
          You may close this window now.
        </p>
      </div>
    </div>
  );
} 