'use client'
import React, { useState, useEffect } from 'react';
import { Zap, Star, AlertTriangle, CheckCircle, X, Info, Shield, Phone, CreditCard, ArrowRight, Sparkles } from 'lucide-react';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`p-3 rounded-xl shadow-xl flex items-center backdrop-blur-xl border max-w-sm ${
        type === 'success' 
          ? 'bg-emerald-500/90 text-white border-emerald-400/50' 
          : type === 'error' 
            ? 'bg-red-500/90 text-white border-red-400/50' 
            : 'bg-yellow-500/90 text-white border-yellow-400/50'
      }`}>
        <div className="mr-2">
          {type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : type === 'error' ? (
            <X className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
        </div>
        <div className="flex-grow">
          <p className="font-medium text-sm">{message}</p>
        </div>
        <button onClick={onClose} className="ml-3 hover:scale-110 transition-transform">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Purchase Modal Component
const PurchaseModal = ({ isOpen, onClose, bundle, phoneNumber, setPhoneNumber, onPurchase, error, isLoading }) => {
  if (!isOpen || !bundle) return null;

  const handlePhoneNumberChange = (e) => {
    let formatted = e.target.value.replace(/\D/g, '');
    
    if (!formatted.startsWith('0') && formatted.length > 0) {
      formatted = '0' + formatted;
    }
    
    if (formatted.length > 10) {
      formatted = formatted.substring(0, 10);
    }
    
    setPhoneNumber(formatted);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPurchase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-md shadow-xl">
        {/* Modal header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            Purchase {bundle.capacity}GB
          </h3>
          <button onClick={onClose} className="text-white hover:text-white/70 p-1 rounded-lg hover:bg-white/10 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Modal content */}
        <div className="px-6 py-4">
          {/* Bundle Info */}
          <div className="bg-white/10 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Data Bundle:</span>
              <span className="text-purple-400 font-bold">{bundle.capacity}GB</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Service:</span>
              <span className="text-purple-400 font-bold">iShare Premium</span>
            </div>
            <div className="flex justify-between items-center border-t border-white/20 pt-2">
              <span className="text-white font-bold">Total Price:</span>
              <span className="text-purple-400 font-bold text-lg">GH₵{bundle.price}</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 rounded-xl flex items-start bg-red-500/20 border border-red-500/30">
              <X className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-red-200 text-sm">{error}</span>
            </div>
          )}

          {/* Phone Number Form */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-white">
              Enter Recipient Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="w-4 h-4 text-purple-400" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="pl-10 pr-4 py-3 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
                placeholder="0XXXXXXXXX"
                required
                autoFocus
              />
            </div>
            <p className="mt-1 text-xs text-white/70">AirtelTigo numbers only (026, 056, 027, 057, 023, 053)</p>
          </div>

          {/* Warning */}
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-200 text-xs">
                  <strong>Important:</strong> Verify your number carefully. No refunds for wrong numbers.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/20"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onPurchase}
              disabled={isLoading || !phoneNumber || phoneNumber.length !== 10}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Purchase Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceInfoModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-md shadow-xl">
        {/* Modal header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            iShare Premium Service
          </h3>
          <button onClick={onClose} className="text-white hover:text-white/70 p-1 rounded-lg hover:bg-white/10 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Modal content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3 text-white/80 text-sm">
            <div className="flex items-start">
              <div className="w-1 h-1 rounded-full bg-purple-400 mr-2 mt-2 flex-shrink-0"></div>
              <p><strong className="text-white">Premium instant service</strong> - Guaranteed API processing</p>
            </div>
            <div className="flex items-start">
              <div className="w-1 h-1 rounded-full bg-purple-400 mr-2 mt-2 flex-shrink-0"></div>
              <p>Works with AirtelTigo numbers (026, 056, 027, 057, 023, 053)</p>
            </div>
            <div className="flex items-start">
              <div className="w-1 h-1 rounded-full bg-purple-400 mr-2 mt-2 flex-shrink-0"></div>
              <p>No refunds for incorrect phone numbers</p>
            </div>
            <div className="flex items-start">
              <div className="w-1 h-1 rounded-full bg-purple-400 mr-2 mt-2 flex-shrink-0"></div>
              <p>30-day validity for all bundles</p>
            </div>
            <div className="flex items-start">
              <div className="w-1 h-1 rounded-full bg-purple-400 mr-2 mt-2 flex-shrink-0"></div>
              <p>Premium processing - Never delayed</p>
            </div>
          </div>
          
          <div className="bg-purple-500/20 border border-purple-500/30 p-3 rounded-xl mt-4">
            <div className="flex items-start">
              <Info className="w-4 h-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-purple-200 text-sm">
                iShare Premium guarantees instant processing through our premium API channel.
              </p>
            </div>
          </div>
        </div>
        
        {/* Modal footer */}
        <div className="px-6 py-4 border-t border-white/10 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/20 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium rounded-xl transition-all transform hover:scale-105 text-sm"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading Overlay
const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 max-w-xs w-full mx-auto text-center shadow-xl">
        <div className="flex justify-center mb-4">
          <div className="relative w-12 h-12">
            <div className="w-12 h-12 rounded-full border-3 border-purple-200/20"></div>
            <div className="absolute top-0 w-12 h-12 rounded-full border-3 border-transparent border-t-purple-400 border-r-pink-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 animate-pulse flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <h4 className="text-lg font-bold text-white mb-2">Processing...</h4>
        <p className="text-white/80 text-sm">Please wait while we process your order</p>
      </div>
    </div>
  );
};

const iShareBundleSelect = () => {
  const [selectedBundle, setSelectedBundle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });
  
  // Manual inventory control
  const inventoryAvailable = true;
  
  const bundles = [
    { value: '1', label: '1GB', capacity: '1', price: '3.95', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '2', label: '2GB', capacity: '2', price: '8.35', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '3', label: '3GB', capacity: '3', price: '13.25', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '4', label: '4GB', capacity: '4', price: '16.50', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '5', label: '5GB', capacity: '5', price: '19.50', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '6', label: '6GB', capacity: '6', price: '23.50', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '8', label: '8GB', capacity: '8', price: '30.50', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '10', label: '10GB', capacity: '10', price: '38.50', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '12', label: '12GB', capacity: '12', price: '45.50', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '15', label: '15GB', capacity: '15', price: '57.50', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '25', label: '25GB', capacity: '25', price: '95.00', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '30', label: '30GB', capacity: '30', price: '115.00', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '40', label: '40GB', capacity: '40', price: '151.00', network: 'AT_PREMIUM', inStock: inventoryAvailable },
    { value: '50', label: '50GB', capacity: '50', price: '190.00', network: 'AT_PREMIUM', inStock: inventoryAvailable }
  ];

  // Get user data from localStorage on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      .animate-slide-in {
        animation: slideIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Function to validate AirtelTigo phone number (iShare uses same network)
  const validatePhoneNumber = (number) => {
    const airtelTigoPrefixes = ['026', '056', '027', '057', '023', '053'];
    const cleanNumber = number.replace(/[\s-]/g, '');
    
    if (cleanNumber.startsWith('0')) {
      return cleanNumber.length === 10 && airtelTigoPrefixes.includes(cleanNumber.substring(0, 3));
    }
    
    return false;
  };
  
  // Format phone number as user types
  const formatPhoneNumber = (input) => {
    let formatted = input.replace(/\D/g, '');
    
    if (!formatted.startsWith('0') && formatted.length > 0) {
      formatted = '0' + formatted;
    }
    
    if (formatted.length > 10) {
      formatted = formatted.substring(0, 10);
    }
    
    return formatted;
  };

  const handlePhoneNumberChange = (e) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedNumber);
  };

  // Function to show toast
  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type
    });
  };

  // Function to hide toast
  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false
    }));
  };

  // Get selected bundle details
  const getSelectedBundleDetails = () => {
    return bundles.find(bundle => bundle.value === selectedBundle);
  };

  // Handle bundle selection - opens purchase modal
  const handleBundleSelect = (bundle) => {
    if (!bundle.inStock) {
      showToast('This bundle is currently out of stock', 'error');
      return;
    }

    if (!userData || !userData.id) {
      showToast('Please login to continue', 'error');
      return;
    }

    setSelectedBundle(bundle.value);
    setPendingPurchase(bundle);
    setPhoneNumber(''); // Reset phone number
    setError(''); // Clear any previous errors
    setIsPurchaseModalOpen(true);
  };

  // Process the actual purchase
  const processPurchase = async () => {
    if (!pendingPurchase) return;
    
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid AirtelTigo number (026, 056, 027, 057, 023, 053)');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/v1/data/purchase-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userData.id,
          phoneNumber: phoneNumber,
          network: 'AT_PREMIUM',
          capacity: parseInt(pendingPurchase.capacity), 
          price: parseFloat(pendingPurchase.price)
        })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        showToast(`${pendingPurchase.capacity}GB purchased successfully for ${phoneNumber}!`, 'success');
        setSelectedBundle('');
        setPhoneNumber('');
        setError('');
        setIsPurchaseModalOpen(false);
        setPendingPurchase(null);
      } else {
        throw new Error(data.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      const errorMessage = error.message || 'Purchase failed. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-400/5 to-pink-400/5 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-pink-400/5 to-red-400/5 blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      
      {/* Loading Overlay */}
      <LoadingOverlay isLoading={isLoading} />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <ServiceInfoModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => {
              setIsModalOpen(false);
            }}
          />

          <PurchaseModal
            isOpen={isPurchaseModalOpen}
            onClose={() => {
              setIsPurchaseModalOpen(false);
              setPendingPurchase(null);
              setPhoneNumber('');
              setError('');
            }}
            bundle={pendingPurchase}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            onPurchase={processPurchase}
            error={error}
            isLoading={isLoading}
          />
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 text-transparent bg-clip-text">
                iShare Premium
              </h1>
            </div>
            <p className="text-white/80 text-sm">Premium 30-Day Data Bundles</p>
          </div>

          {/* Main Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-6 relative overflow-hidden">
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <Shield className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Premium Service</h2>
                    <p className="text-white/90 text-sm">Guaranteed instant delivery</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              {/* Service info button */}
              <div className="mb-6 flex justify-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 font-medium rounded-lg hover:bg-purple-500/30 transition-all text-sm"
                >
                  <Info className="h-4 w-4" />
                  <span>Premium Service Information</span>
                </button>
              </div>

              {/* Bundle Selection Grid */}
              <div>
                <label className="block text-lg font-bold mb-4 text-white text-center">
                  Choose Your Premium Bundle
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {bundles.map((bundle) => (
                    <button
                      key={bundle.value}
                      type="button"
                      onClick={() => handleBundleSelect(bundle)}
                      disabled={!bundle.inStock}
                      className={`p-4 rounded-xl text-center transition-all border transform hover:scale-105 ${
                        bundle.inStock
                          ? 'bg-white/10 border-white/20 text-white/90 hover:bg-purple-500/20 hover:border-purple-400/50 cursor-pointer'
                          : 'bg-gray-500/20 border-gray-500/30 text-gray-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="text-sm font-bold mb-1">{bundle.label}</div>
                      <div className="text-purple-400 font-bold text-sm">GH₵{bundle.price}</div>
                      {!bundle.inStock && (
                        <div className="text-red-400 text-xs mt-1">Out of Stock</div>
                      )}
                      {bundle.inStock && (
                        <div className="text-white/60 text-xs mt-1">Click to buy</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Important Notice */}
              <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500/30 rounded-xl">
                <div className="flex items-start">
                  <Shield className="w-4 h-4 text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-purple-400 mb-2">Premium Benefits</h4>
                    <div className="space-y-1 text-white/80 text-xs">
                      <p>• Guaranteed instant processing - Never delayed</p>
                      <p>• Premium API channel - Highest priority</p>
                      <p>• Works with AirtelTigo numbers (026, 056, 027, 057, 023, 053)</p>
                      <p>• 30-day validity for all bundles</p>
                      <p>• No refunds for wrong numbers - Please verify</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default iShareBundleSelect;