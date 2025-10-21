'use client'

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  Home
} from 'lucide-react';

function PaymentCallbackClient() {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Verifying your payment...');
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  
  useEffect(() => {
    // Only proceed if we have a reference from the URL
    if (reference) {
      let checkCount = 0;
      const maxChecks = 10; // Maximum number of verification attempts
      
      const verifyPayment = async () => {
        try {
          // Call your backend to verify the payment status
          const response = await axios.get(`https://unlimiteddatamanfred.onrender.com/api/v1/verify-payment?reference=${reference}`);
          
          if (response.data.success) {
            setStatus('success');
            setMessage('Your deposit was successful! Funds have been added to your wallet.');
            // No need to check anymore
            return true;
          } else if (response.data.data && response.data.data.status === 'failed') {
            setStatus('failed');
            setMessage('Payment failed. Please try again or contact support.');
            return true;
          } else if (checkCount < maxChecks) {
            // Still pending, continue checking
            return false;
          } else {
            // Reached max attempts, tell user to check account later
            setStatus('pending');
            setMessage('Your payment is still processing. Please check your account in a few minutes.');
            return true;
          }
        } catch (error) {
          console.error('Verification error:', error);
          if (checkCount < maxChecks) {
            // Error occurred but still have attempts left
            return false;
          } else {
            setStatus('failed');
            setMessage('An error occurred while verifying your payment. Please contact support.');
            return true;
          }
        }
      };
      
      const checkPaymentStatus = async () => {
        const isComplete = await verifyPayment();
        
        if (!isComplete) {
          checkCount++;
          // Wait 3 seconds before checking again
          setTimeout(checkPaymentStatus, 3000);
        }
      };
      
      // Start the verification process
      checkPaymentStatus();
    }
  }, [reference]);

  // Handle redirect to dashboard after success
  useEffect(() => {
    if (status === 'success') {
      // Optionally auto-redirect after a few seconds
      const redirectTimer = setTimeout(() => {
        router.push('/');
      }, 5000); // Redirect after 5 seconds
      
      return () => clearTimeout(redirectTimer);
    }
  }, [status, router]);

  const statusConfig = {
    processing: {
      icon: <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />,
      iconBg: 'bg-blue-100',
      statusText: 'Processing',
      statusColor: 'text-blue-700'
    },
    success: {
      icon: <CheckCircle className="w-16 h-16 text-green-600" />,
      iconBg: 'bg-green-100',
      statusText: 'Success',
      statusColor: 'text-green-700'
    },
    failed: {
      icon: <XCircle className="w-16 h-16 text-red-600" />,
      iconBg: 'bg-red-100',
      statusText: 'Failed',
      statusColor: 'text-red-700'
    },
    pending: {
      icon: <Clock className="w-16 h-16 text-yellow-600" />,
      iconBg: 'bg-yellow-100',
      statusText: 'Pending',
      statusColor: 'text-yellow-700'
    }
  };

  const currentConfig = statusConfig[status] || statusConfig.processing;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Unlimited Data</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Payment Verification</span>
              <Shield className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Status Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Payment {currentConfig.statusText}
              </h2>
              <span className={`text-sm font-medium ${currentConfig.statusColor}`}>
                Status: {currentConfig.statusText}
              </span>
            </div>
          </div>

          <div className="p-8">
            {/* Icon Display */}
            <div className="flex justify-center mb-6">
              <div className={`${currentConfig.iconBg} rounded-full p-6`}>
                {currentConfig.icon}
              </div>
            </div>
            
            {/* Message */}
            <p className="text-center text-gray-600 mb-8">
              {message}
            </p>
            
            {/* Progress Bar for Success */}
            {status === 'success' && (
              <div className="mb-8">
                <p className="text-sm text-gray-500 text-center mb-3">
                  Redirecting to dashboard in 5 seconds...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full animate-progress" />
                </div>
              </div>
            )}
            
            {/* Reference Display */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Reference ID:</span>
                <span className="text-sm font-mono font-medium text-gray-900">
                  {reference ? reference.substring(0, 20) + '...' : 'N/A'}
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            {status !== 'processing' && (
              <div className="space-y-3">
                <Link href="/" className="block">
                  <button className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-medium">
                    <Home className="w-5 h-5 mr-2" />
                    Return to Dashboard
                  </button>
                </Link>
                
                {status === 'failed' && (
                  <Link href="/deposit" className="block">
                    <button className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-medium">
                      Try Again
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                  </Link>
                )}
                
                {(status === 'failed' || status === 'pending') && (
                  <div className="text-center">
                    <a 
                      href="mailto:support@Unlimited Data.com" 
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Contact Support
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Support Information */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Need Help?</p>
              <p>If you're experiencing issues with your payment, please contact our support team at{' '}
                <a href="mailto:support@Unlimited Data.com" className="text-blue-600 hover:text-blue-700 font-medium">
                  support@Unlimited Data.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
    </div>
  );
}

// Fallback component to show while loading
function PaymentCallbackFallback() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">unlimiteddatagh</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Payment Verification</span>
              <Shield className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Processing
            </h2>
          </div>

          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 rounded-full p-6">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
              </div>
            </div>
            <p className="text-center text-gray-600">
              Loading payment details...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component that wraps the client component with Suspense
export default function PaymentCallback() {
  return (
    <Suspense fallback={<PaymentCallbackFallback />}>
      <PaymentCallbackClient />
    </Suspense>
  );
}