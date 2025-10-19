'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Info, AlertCircle, X, Copy, AlertTriangle, Shield, CreditCard, TrendingUp, ArrowRight, Database, CheckCircle } from 'lucide-react';

export default function DepositPage() {
  const [amount, setAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [fee, setFee] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [accountStatus, setAccountStatus] = useState('');
  const [disableReason, setDisableReason] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  
  const router = useRouter();
  
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('userData');
      
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.id);
        setUserEmail(user.email);
        setIsAuthenticated(true);
        
        if (user.isDisabled) {
          setAccountStatus('disabled');
          setDisableReason(user.disableReason || 'No reason provided');
        } else if (user.approvalStatus === 'pending') {
          setAccountStatus('pending');
        } else if (user.approvalStatus === 'rejected') {
          setAccountStatus('not-approved');
          setDisableReason(user.rejectionReason || 'Your account has not been approved.');
        }
      } else {
        router.push('/SignIn');
      }
    };
    
    checkAuth();
  }, [router]);
  
  useEffect(() => {
    if (amount && amount > 0) {
      const feeAmount = parseFloat(amount) * 0.03;
      const total = parseFloat(amount) + feeAmount;
      setFee(feeAmount.toFixed(2));
      setTotalAmount(total.toFixed(2));
    } else {
      setFee('');
      setTotalAmount('');
    }
  }, [amount]);
  
  const handleDeposit = async (e) => {
    e.preventDefault();
    
    if (!amount || amount <= 9) {
      setError('Please enter a valid amount greater than 9 GHS.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('https://Unlimited Data-lkyu.onrender.com/api/v1/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount: parseFloat(amount),
          totalAmountWithFee: parseFloat(totalAmount),
          email: userEmail
        })
      });

      const data = await response.json();
      
      if (response.ok && data.paystackUrl) {
        setSuccess('Redirecting to Paystack...');
        window.location.href = data.paystackUrl;
      } else {
        throw new Error(data.error || 'Failed to process deposit');
      }
    } catch (error) {
      console.error('Deposit error:', error);
      
      if (error.message.includes('Account is disabled')) {
        setAccountStatus('disabled');
        setDisableReason('No reason provided');
        setShowApprovalModal(true);
      } else if (error.message.includes('Account not approved')) {
        setAccountStatus('pending');
        setShowApprovalModal(true);
      } else {
        setError(error.message || 'Failed to process deposit. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyMomoNumber = () => {
    navigator.clipboard.writeText('0597760914');
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 rounded-full border-3 border-slate-200 dark:border-slate-700"></div>
            <div className="absolute top-0 w-20 h-20 rounded-full border-3 border-transparent border-t-blue-600 dark:border-t-blue-500 animate-spin"></div>
            <div className="absolute inset-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center shadow-lg">
              <Database className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Unlimited Data <span className="text-blue-600 dark:text-blue-500">GH</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Database className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Unlimited Data <span className="text-blue-600 dark:text-blue-500">GH</span>
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-semibold">Deposit Funds</p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Add money to your account balance</p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <CreditCard className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Add Funds</h2>
                  <p className="text-blue-100 text-sm">Secure payment via Paystack</p>
                </div>
              </div>
              
              <Link 
                href="/howtodeposite" 
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/30 hover:bg-white/30 transition-all"
              >
                <Info size={16} strokeWidth={2} />
                <span className="text-sm">Help Guide</span>
              </Link>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Info Banner */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex-shrink-0">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    Need assistance with deposits?
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <Link href="/howtodeposite" className="underline font-semibold hover:text-blue-800 dark:hover:text-blue-300">
                      View our step-by-step guide
                    </Link> for detailed instructions.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 rounded-xl flex items-start bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3 flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={2} />
                </div>
                <span className="text-sm font-medium text-red-800 dark:text-red-300">{error}</span>
              </div>
            )}

            {/* Success Display */}
            {success && (
              <div className="p-4 rounded-xl flex items-start bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mr-3 flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                </div>
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{success}</span>
              </div>
            )}

            {/* Deposit Form */}
            <div className="space-y-5">
              <div>
                <label htmlFor="amount" className="block text-sm font-bold mb-2 text-slate-900 dark:text-white">
                  Deposit Amount (GHS)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-blue-600 dark:text-blue-400 text-lg font-bold">₵</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    className="pl-12 pr-4 py-3 block w-full rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-lg transition-all"
                    placeholder="Enter amount (min. 10 GHS)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="10"
                    step="0.01"
                    required
                  />
                </div>
                <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Minimum deposit: GHS 10.00
                </p>
              </div>
              
              {/* Amount Breakdown */}
              {amount && amount > 0 && (
                <div className="p-5 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                    Payment Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span className="font-medium">Deposit Amount:</span>
                      <span className="font-bold">GHS {parseFloat(amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span className="font-medium">Processing Fee (3%):</span>
                      <span className="font-bold">GHS {fee}</span>
                    </div>
                    <div className="border-t border-slate-300 dark:border-slate-600 pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">Total Amount:</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">GHS {totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                type="button"
                onClick={handleDeposit}
                disabled={isLoading || !amount || amount <= 9}
                className="w-full flex items-center justify-center py-4 px-6 rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-base shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <div className="mr-3 animate-spin">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                    </div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-3 w-5 h-5" strokeWidth={2} />
                    Proceed to Paystack
                    <ArrowRight className="ml-3 w-5 h-5" strokeWidth={2} />
                  </>
                )}
              </button>
            </div>

            {/* Footer Info */}
            <div className="p-5 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <p className="flex items-center font-medium">
                  <Shield className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  Secure payments powered by Paystack
                </p>
                <p className="flex items-center font-medium">
                  <Shield className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  3% processing fee applies to all deposits
                </p>
                <Link 
                  href="/myorders" 
                  className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                >
                  <TrendingUp className="w-4 h-4 mr-2" strokeWidth={2} />
                  View transaction history
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Account Status Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={2} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {accountStatus === 'pending' ? 'Account Pending Approval' : 
                   accountStatus === 'disabled' ? 'Account Disabled' : 
                   'Account Not Approved'}
                </h2>
              </div>
              <button 
                onClick={() => setShowApprovalModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            
            {accountStatus === 'disabled' ? (
              <p className="text-red-600 dark:text-red-400 font-medium mb-5">
                {disableReason}
              </p>
            ) : (
              <>
                <p className="text-slate-700 dark:text-slate-300 font-medium mb-5">
                  {accountStatus === 'pending' ? 
                    'To activate your account, please pay the activation fee of GHS 100 via Mobile Money:' : 
                    'Your account requires approval. Pay the activation fee of GHS 100 to:'}
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl mb-5 border border-blue-200 dark:border-blue-800">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <p className="text-slate-900 dark:text-white font-semibold">
                        <span className="text-blue-600 dark:text-blue-400">Mobile Money:</span> 0597760914
                      </p>
                      <p className="text-slate-900 dark:text-white font-semibold">
                        <span className="text-blue-600 dark:text-blue-400">Account Name:</span> KOJO Frimpong
                      </p>
                    </div>
                    <button 
                      onClick={copyMomoNumber}
                      className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold p-3 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                    >
                      <Copy size={16} strokeWidth={2} />
                      {copySuccess && <span className="text-sm text-emerald-600 dark:text-emerald-400">{copySuccess}</span>}
                    </button>
                  </div>
                </div>
                
                <p className="text-amber-700 dark:text-amber-400 text-sm font-bold text-center mb-5 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  Important: Use your email or phone number as the payment reference
                </p>
              </>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-xl transition-all border border-slate-200 dark:border-slate-600"
              >
                Close
              </button>
              
              <a
                href="mailto:datamartghana@gmail.com"
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold rounded-xl text-center transition-all shadow-lg hover:shadow-xl"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}