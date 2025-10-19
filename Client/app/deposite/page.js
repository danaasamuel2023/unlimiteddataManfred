'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ArrowRight,
  Phone,
  AlertCircle,
  RefreshCw,
  Info,
  Wallet,
  Shield,
  Send,
  Activity,
  Circle,
  ChevronRight
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://datanest-lkyu.onrender.com/api/v1';

const DataSpotDeposit = () => {
  // States
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [network, setNetwork] = useState('mtn');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [reference, setReference] = useState('');
  const [externalRef, setExternalRef] = useState('');
  const [userId, setUserId] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');
  const [step, setStep] = useState(1);
  const [checkReminder, setCheckReminder] = useState(false);

  // Get user data from localStorage on component mount
  useEffect(() => {
    try {
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserId(userData.id);
        
        // Also try to get user's phone number if available
        if (userData.phone) {
          setPhoneNumber(userData.phone);
        }
      } else {
        setError('You need to be logged in to make a deposit');
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      setError('Error retrieving user information');
    }
  }, []);

  // Form validation
  const isFormValid = () => {
    if (!amount || parseFloat(amount) <= 9) {
      setError('Please enter a valid amount greater than GHS 9');
      return false;
    }
    
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }
    
    if (!network) {
      setError('Please select a network');
      return false;
    }
    
    if (!userId) {
      setError('User ID not found. Please log in again');
      return false;
    }
    
    setError('');
    return true;
  };

  // Handle deposit submission
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) return;
    
    setLoading(true);
    setSuccess('');
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/depositsmoolre`, {
        userId,
        amount: parseFloat(amount),
        phoneNumber,
        network,
        currency: 'GHS'
      });
      
      console.log('Deposit response:', response.data);
      
      if (response.data.success && response.data.requiresOtp) {
        setOtpRequired(true);
        setReference(response.data.reference);
        setExternalRef(response.data.externalRef);
        setSuccess('OTP code has been sent to your phone. Please enter it below.');
        setStep(2);
      } else if (response.data.success) {
        setSuccess('Deposit initiated! Please check your phone to approve the payment.');
        setReference(response.data.reference);
        setCheckReminder(true);
        setStep(3);
      } else {
        setError(response.data.message || 'Failed to initiate deposit');
      }
    } catch (err) {
      console.error('Deposit error:', err);
      if (err.response && err.response.data) {
        console.error('Error response:', err.response.data);
        setError(err.response.data.error || 'An error occurred while processing your deposit');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        reference: reference,
        otpCode: otpCode,
        phoneNumber: phoneNumber
      };
      
      console.log('Sending OTP verification with:', payload);
      
      const response = await axios.post(`${API_BASE_URL}/verify-otp`, payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('OTP verification response:', response.data);
      
      if (response.data.success) {
        setSuccess('OTP verified successfully. Please check your phone to approve the payment.');
        setOtpRequired(false);
        setCheckReminder(true);
        setStep(3);
      } else {
        setError(response.data.message || 'Invalid OTP code');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      
      if (err.response) {
        console.error('Error response data:', err.response.data);
        
        if (err.response.status === 400) {
          const errorMsg = err.response.data.error || 'Invalid OTP code or format';
          setError(`Verification failed: ${errorMsg}. Please check the code and try again.`);
        } else if (err.response.status === 404) {
          setError('Transaction not found. Please start a new deposit.');
        } else {
          setError(err.response.data.error || 'OTP verification failed');
        }
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response from server. Please check your connection and try again.');
      } else {
        console.error('Error setting up request:', err.message);
        setError('Error preparing verification request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check transaction status
  const checkTransactionStatus = async () => {
    if (!reference) {
      setError('Reference ID is missing. Cannot check status.');
      return;
    }
    
    setLoading(true);
    setCheckReminder(false);
    
    try {
      console.log('Checking transaction status for reference:', reference);
      
      const response = await axios.get(`${API_BASE_URL}/verify-payments?reference=${encodeURIComponent(reference)}`);
      
      console.log('Transaction status response:', response.data);
      
      if (response.data.success) {
        setTransactionStatus(response.data.data.status);
        
        if (response.data.data.status === 'completed') {
          setSuccess(`Payment of GHS ${response.data.data.amount.toFixed(2)} completed successfully!`);
          
          setTimeout(() => {
            setAmount('');
            setPhoneNumber('');
            setOtpCode('');
            setReference('');
            setExternalRef('');
            setOtpRequired(false);
            setStep(1);
          }, 5000);
        } else if (response.data.data.status === 'failed') {
          setError('Payment failed. Please try again with a new deposit.');
        } else {
          setTransactionStatus('pending');
          setSuccess('Your payment is still being processed. Please complete the payment on your phone.');
          setCheckReminder(true);
        }
      } else {
        setError(response.data.message || 'Could not verify payment status');
      }
    } catch (err) {
      console.error('Check status error:', err);
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        if (err.response.status === 404) {
          setError('Transaction not found. The reference may be invalid.');
        } else {
          setError(err.response.data.error || 'Failed to check payment status');
        }
      } else {
        setError('Network error while checking payment status. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                DataSpot
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Secure Payment Gateway</span>
              <Shield className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Payment Details' },
              { num: 2, label: 'Verification' },
              { num: 3, label: 'Confirmation' }
            ].map((s, index) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    ${step >= s.num 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    step >= s.num ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    step > s.num ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wallet className="w-6 h-6 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {step === 1 && 'Add Funds to Wallet'}
                  {step === 2 && 'Verify Your Transaction'}
                  {step === 3 && 'Complete Payment'}
                </h2>
              </div>
              {step === 1 && (
                <span className="text-sm text-gray-500">
                  Min: GHS 10
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Success Display */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-green-800">{success}</span>
                </div>
              </div>
            )}

            {/* Step 1: Deposit Form */}
            {step === 1 && (
              <form onSubmit={handleDepositSubmit} className="space-y-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (GHS)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">GHS</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-12 pr-3 py-2.5 block w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      step="0.01"
                      min="10"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    Enter the amount you want to deposit to your wallet
                  </p>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Money Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="02XXXXXXXX"
                      className="pl-10 pr-3 py-2.5 block w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    Enter your mobile money registered phone number
                  </p>
                </div>

                <div>
                  <label htmlFor="network" className="block text-sm font-medium text-gray-700 mb-2">
                    Network Provider
                  </label>
                  <select
                    id="network"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="py-2.5 px-3 block w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="vodafone">Vodafone Cash</option>
                    <option value="at">AirtelTigo Money</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && otpRequired && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Smartphone className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Verification Code</h3>
                  <p className="text-sm text-gray-600">
                    We've sent a 6-digit code to {phoneNumber}
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 mb-2">
                      OTP Code
                    </label>
                    <input
                      type="text"
                      id="otpCode"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="py-3 px-4 block w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-xl tracking-widest font-semibold text-gray-900"
                    />
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      Enter the 6-digit code from your SMS
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Code
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Back to payment details
                  </button>
                </form>
              </div>
            )}

            {/* Step 3: Awaiting Payment */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Complete Payment on Your Phone
                  </h3>
                  <p className="text-sm text-gray-600">
                    Check your phone for the payment prompt and enter your PIN to approve
                  </p>
                </div>
                
                {checkReminder && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium mb-1">Action Required</p>
                        <p>After approving the payment on your phone, click "Check Status" below to complete the transaction.</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={checkTransactionStatus}
                  disabled={loading}
                  className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Checking Status...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Check Payment Status
                    </>
                  )}
                </button>
                
                {transactionStatus && (
                  <div className={`p-4 rounded-lg border ${
                    transactionStatus === 'completed' 
                      ? 'bg-green-50 border-green-200' 
                      : transactionStatus === 'failed' 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Transaction Status:</span>
                      <span className={`text-sm font-semibold ${
                        transactionStatus === 'completed' 
                          ? 'text-green-700' 
                          : transactionStatus === 'failed' 
                            ? 'text-red-700' 
                            : 'text-yellow-700'
                      }`}>
                        {transactionStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtpRequired(false);
                      setTransactionStatus('');
                    }}
                    className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Start a new transaction
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">Secure Transaction</p>
              <p>Your payment information is encrypted and processed through secure channels. We never store your mobile money PIN.</p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact support at{' '}
            <a href="mailto:support@dataspot.com" className="text-blue-600 hover:text-blue-700 font-medium">
              support@dataspot.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataSpotDeposit;