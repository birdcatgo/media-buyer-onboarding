'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SignaturePage() {
  const router = useRouter();
  const { formId } = router.query;
  const [formData, setFormData] = useState(null);
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchForm() {
      if (!formId) return;

      try {
        console.log('Fetching form:', formId);
        const response = await fetch(`/api/getForm?formId=${formId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch form');
        }

        if (data.status === 'completed') {
          throw new Error('This contract has already been signed');
        }

        console.log('Form data received:', data);
        setFormData(data);
      } catch (err) {
        console.error('Error fetching form:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (formId) {
      fetchForm();
    }
  }, [formId]);

  const handleSign = async (e) => {
    e.preventDefault();
    if (!signature.trim()) {
      setError('Please provide your signature');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/finalizeContract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          signature,
          date: new Date().toISOString().split('T')[0]
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign contract');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!formId) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md w-full">
          <h2 className="text-red-700 text-xl font-bold mb-2">Error Loading Contract</h2>
          <p className="text-red-600">{error}</p>
          <p className="mt-4 text-gray-600">If you continue to experience issues, please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-6">
        {success ? (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Contract Signed Successfully!</h2>
            <p className="text-gray-600">Thank you for signing the contract. You will receive a copy via email shortly.</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6">Media Buyer Contract Signature</h1>
            
            {/* Display Contract Details */}
            <div className="mb-8 prose prose-sm max-w-none">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2>Contract Details</h2>
                <p>Name: {formData?.formData?.name}</p>
                <p>Email: {formData?.formData?.email}</p>
                <p>Start Date: {formData?.formData?.contractDetails?.startDate}</p>
                <p>Commission: {formData?.formData?.commission}</p>
              </div>
            </div>

            {/* Signature Section */}
            <form onSubmit={handleSign} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Digital Signature
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Please type your full legal name as your signature
                </p>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Type your full name"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full p-3 rounded text-white font-medium
                  ${loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {loading ? 'Signing...' : 'Sign Contract'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
} 