'use client'
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, X, Info, Shield, Phone, CreditCard, ArrowRight, Database, Globe } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`p-4 rounded-xl shadow-xl flex items-center border ${
        type === 'success' 
          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
          : type === 'error' 
            ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800' 
            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      }`}>
        <div className="mr-3">
          {type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          ) : type === 'error' ? (
            <X className="h-5 w-5 text-red-600 dark:text-red-400" strokeWidth={2} />
          ) : (
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" strokeWidth={2} />
          )}
        </div>
        <div className="flex-grow">
          <p className="font-semibold text-sm">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 hover:opacity-70 transition-opacity">
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

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
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-full max-w-md shadow-2xl">
        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-5 rounded-t-xl flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Globe className="w-6 h-6 mr-3" strokeWidth={2} />
            Purchase {bundle.capacity}GB
          </h3>
          <button onClick={onClose} className="text-white hover:text-white/70 p-2 rounded-lg hover:bg-white/10 transition-all">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
        
        <div className="px-6 py-6">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 mb-5 border border-slate-200 dark:border-slate-600">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Data Bundle:</span>
              <span className="text-yellow-600 dark:text-yellow-400 font-bold text-lg">{bundle.capacity}GB</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Duration:</span>
              <span className="text-yellow-600 dark:text-yellow-400 font-bold">No-Expiry</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-300 dark:border-slate-600 pt-3">
              <span className="text-slate-900 dark:text-white font-bold text-lg">Total Price:</span>
              <span className="text-yellow-600 dark:text-yellow-400 font-bold text-xl">GH₵{bundle.price}</span>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl flex items-start bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
                <X className="w-4 h-4 text-red-600 dark:text-red-400" strokeWidth={2} />
              </div>
              <span className="text-red-800 dark:text-red-300 text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm font-bold mb-2 text-slate-900 dark:text-white">
              MTN Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-yellow-600 dark:text-yellow-400" strokeWidth={2} />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="pl-12 pr-4 py-3 block w-full rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-semibold text-base transition-all"
                placeholder="0XXXXXXXXX"
                required
                autoFocus
              />
            </div>
            <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">Format: 0 followed by 9 digits</p>
          </div>

          <div className="mb-5 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-start">
              <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg mr-3 flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={2} />
              </div>
              <div>
                <p className="text-amber-900 dark:text-amber-300 text-sm font-semibold mb-1">
                  Important Notice
                </p>
                <p className="text-amber-800 dark:text-amber-400 text-xs font-medium">
                  Verify your number carefully. No refunds for incorrect numbers.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-xl transition-all border border-slate-200 dark:border-slate-600"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !phoneNumber || phoneNumber.length !== 10}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" strokeWidth={2} />
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
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-full max-w-md shadow-2xl">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 rounded-t-xl flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center">
            <AlertTriangle className="w-6 h-6 mr-3" strokeWidth={2} />
            Service Notice
          </h3>
          <button onClick={onClose} className="text-white hover:text-white/70 p-2 rounded-lg hover:bg-white/10 transition-all">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
        
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-3 mt-2 flex-shrink-0"></div>
              <p className="font-medium"><strong className="text-slate-900 dark:text-white">Not instant service</strong> - delivery times vary</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-3 mt-2 flex-shrink-0"></div>
              <p className="font-medium">For urgent data, use <strong className="text-slate-900 dark:text-white">*138#</strong> instead</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-3 mt-2 flex-shrink-0"></div>
              <p className="font-medium">Please be patient - orders may take time to process</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-3 mt-2 flex-shrink-0"></div>
              <p className="font-medium">Not suitable for instant bundle needs</p>
            </div>
          </div>
          
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl mt-5">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 mt-0.5 flex-shrink-0" strokeWidth={2} />
              <p className="text-emerald-800 dark:text-emerald-300 text-sm font-medium">
                Thank you for your patience and understanding.
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-xl transition-all border border-slate-200 dark:border-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 max-w-xs w-full mx-auto text-center shadow-2xl">
        <div className="flex justify-center mb-5">
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 rounded-full border-3 border-slate-200 dark:border-slate-700"></div>
            <div className="absolute top-0 w-16 h-16 rounded-full border-3 border-transparent border-t-yellow-500 animate-spin"></div>
            <div className="absolute inset-3 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg">
              <Globe className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Processing Order</h4>
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Please wait while we process your purchase</p>
      </div>
    </div>
  );
};

const MTNBundleSelect = () => {
  const [selectedBundle, setSelectedBundle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState(null);
  
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });
  
  const inventoryAvailable = true;
  
  const bundles = [
    { value: '1', label: '1GB', capacity: '1', price: '4.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '2', label: '2GB', capacity: '2', price: '9.20', network: 'YELLO', inStock: inventoryAvailable },
    { value: '3', label: '3GB', capacity: '3', price: '13.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '4', label: '4GB', capacity: '4', price: '18.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '5', label: '5GB', capacity: '5', price: '24.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '6', label: '6GB', capacity: '6', price: '28.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '8', label: '8GB', capacity: '8', price: '38.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '10', label: '10GB', capacity: '10', price: '46.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '15', label: '15GB', capacity: '15', price: '66.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '20', label: '20GB', capacity: '20', price: '88.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '25', label: '25GB', capacity: '25', price: '112.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '30', label: '30GB', capacity: '30', price: '137.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '40', label: '40GB', capacity: '40', price: '169.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '50', label: '50GB', capacity: '50', price: '210.00', network: 'YELLO', inStock: inventoryAvailable },
    { value: '100', label: '100GB', capacity: '100', price: '420.00', network: 'YELLO', inStock: inventoryAvailable }
  ];

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

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

  const validatePhoneNumber = (number) => {
    const cleanNumber = number.replace(/[\s-]/g, '');
    if (cleanNumber.startsWith('0')) {
      return cleanNumber.length === 10 && /^0\d{9}$/.test(cleanNumber);
    }
    return false;
  };

  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false
    }));
  };

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
    setPhoneNumber('');
    setError('');
    setIsPurchaseModalOpen(true);
  };

  const processPurchase = async () => {
    if (!pendingPurchase) return;
    
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid MTN number (10 digits starting with 0)');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://datanest-lkyu.onrender.com/api/v1/data/purchase-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userData.id,
          phoneNumber: phoneNumber,
          network: pendingPurchase.network,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      {toast.visible && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      
      <LoadingOverlay isLoading={isLoading} />
      
      <div className="max-w-4xl mx-auto">
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
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
              <Globe className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              MTN Data Bundles
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-semibold">Non-Expiry Data Packages</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Globe className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Select Your Bundle</h2>
                  <p className="text-white/90 text-sm">Choose data size and purchase instantly</p>
                </div>
              </div>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/30 hover:bg-white/30 transition-all"
              >
                <Info size={16} strokeWidth={2} />
                <span className="text-sm">Service Info</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-6">
              {bundles.map((bundle) => (
                <button
                  key={bundle.value}
                  type="button"
                  onClick={() => handleBundleSelect(bundle)}
                  disabled={!bundle.inStock}
                  className={`p-5 rounded-xl text-center transition-all border transform hover:scale-105 ${
                    bundle.inStock
                      ? 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-400 dark:hover:border-yellow-500 cursor-pointer shadow-sm hover:shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{bundle.label}</div>
                  <div className="text-yellow-600 dark:text-yellow-400 font-bold text-base mb-1">GH₵{bundle.price}</div>
                  {!bundle.inStock ? (
                    <div className="text-red-600 dark:text-red-400 text-xs font-semibold">Out of Stock</div>
                  ) : (
                    <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">Click to buy</div>
                  )}
                </button>
              ))}
            </div>

            <div className="p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-start">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-red-900 dark:text-red-300 mb-3">Important Notice</h4>
                  <div className="space-y-2 text-red-800 dark:text-red-400 text-sm font-medium">
                    <p>• Not instant service - delivery takes time</p>
                    <p>• Turbonet & Broadband SIMs not eligible</p>
                    <p>• No refunds for incorrect numbers</p>
                    <p>• For urgent data needs, use *138# instead</p>
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

export default MTNBundleSelect;