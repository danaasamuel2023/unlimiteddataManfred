'use client';

import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

export default function PhoneNumbersPage() {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('evansow2002@gmail.com'); // Pre-filled email
  const [copiedIndex, setCopiedIndex] = useState(null);

  const fetchPhoneNumbers = async (userEmail) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`http://localhost:5000/api/orders/email/${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }
      
      console.log('API Response:', data); // Debug log to see the response structure
      
      // Extract phone numbers from orders
      const numbers = [];
      
      // Handle different response formats
      let orders = [];
      if (Array.isArray(data)) {
        orders = data;
      } else if (data.orders && Array.isArray(data.orders)) {
        orders = data.orders;
      } else if (data.data && Array.isArray(data.data)) {
        orders = data.data;
      } else if (typeof data === 'object' && data !== null) {
        // If it's a single order object, wrap it in an array
        orders = [data];
      } else {
        throw new Error('Invalid response format: expected array of orders');
      }
      
      orders.forEach(order => {
        if (order.phoneNumbers && Array.isArray(order.phoneNumbers)) {
          numbers.push(...order.phoneNumbers);
        } else if (order.phoneNumber) {
          numbers.push(order.phoneNumber);
        }
      });
      
      // Remove duplicates and filter out empty values
      const uniqueNumbers = [...new Set(numbers.filter(num => num && num.trim()))];
      setPhoneNumbers(uniqueNumbers);
      
    } catch (err) {
      setError(err.message);
      setPhoneNumbers([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on component mount
  useEffect(() => {
    fetchPhoneNumbers('evansow2002@gmail.com');
  }, []);

  const copyToClipboard = async (phoneNumber, index) => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyAllNumbers = async () => {
    try {
      const allNumbers = phoneNumbers.join('\n');
      await navigator.clipboard.writeText(allNumbers);
      setCopiedIndex('all');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy all numbers:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      fetchPhoneNumbers(email.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Phone Numbers for evansow2002@gmail.com
          </h1>
          
          {/* Email Input Form */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to fetch phone numbers"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Fetch Numbers'}
              </button>
            </div>
          </form>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Fetching phone numbers for evansow2002@gmail.com...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Phone Numbers Display */}
          {!loading && phoneNumbers.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-700">
                  Phone Numbers Found ({phoneNumbers.length})
                </h2>
                <button
                  onClick={copyAllNumbers}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  {copiedIndex === 'all' ? (
                    <>
                      <Check size={16} />
                      Copied All!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy All ({phoneNumbers.length})
                    </>
                  )}
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {phoneNumbers.map((phoneNumber, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-3 rounded-md border hover:shadow-sm transition-shadow"
                    >
                      <span className="font-mono text-gray-800 select-all text-lg">
                        {phoneNumber}
                      </span>
                      <button
                        onClick={() => copyToClipboard(phoneNumber, index)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check size={14} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No Numbers Found */}
          {!loading && phoneNumbers.length === 0 && !error && (
            <div className="text-center py-8">
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-md">
                <strong>No phone numbers found</strong> for evansow2002@gmail.com
                <br />
                <small>Make sure the email has orders with phone numbers in the database.</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}