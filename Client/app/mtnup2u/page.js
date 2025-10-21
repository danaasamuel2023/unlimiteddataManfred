'use client'
import React, { useState, useEffect, createContext, useContext } from 'react';
import { AlertTriangle, CheckCircle, X, Info, Shield, Phone, CreditCard, ArrowRight, Database, Globe, Grid3X3, List, LayoutGrid, Columns, Sliders, LogOut, LogIn } from 'lucide-react';

// Authentication Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('userData');
      
      if (storedToken && storedUser) {
        try {
          setAuthToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error loading auth data:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://unlimiteddatamanfred.onrender.com/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      if (data.token && data.user) {
        setAuthToken(data.token);
        setUser(data.user);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        return { success: true, message: 'Login successful' };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  const value = {
    user,
    authToken,
    isLoading,
    isAuthenticated: !!user && !!authToken,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Toast Component
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

// Login Modal
const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      setEmail('');
      setPassword('');
      onLoginSuccess();
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-full max-w-md shadow-2xl">
        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-5 rounded-t-xl flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center">
            <LogIn className="w-6 h-6 mr-3" strokeWidth={2} />
            Login to Continue
          </h3>
          <button onClick={onClose} className="text-white hover:text-white/70 p-2 rounded-lg hover:bg-white/10 transition-all">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
        
        <div className="px-6 py-6">
          <div className="space-y-4">
            {error && (
              <div className="mb-4 p-4 rounded-xl flex items-start bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <X className="w-4 h-4 text-red-600 dark:text-red-400 mt-1 mr-3 flex-shrink-0" strokeWidth={2} />
                <span className="text-red-800 dark:text-red-300 text-sm font-medium">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold mb-2 text-slate-900 dark:text-white">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-semibold transition-all"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-slate-900 dark:text-white">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-semibold transition-all"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <div className="flex space-x-3 pt-4">
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
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" strokeWidth={2} />
                    Login
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-slate-600 dark:text-slate-400 text-xs font-medium mt-4">
            Demo: Use any email and password to test
          </p>
        </div>
      </div>
    </div>
  );
};

// Purchase Modal
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

  const handleSubmit = () => {
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

// Service Info Modal
const ServiceInfoModal = ({ isOpen, onClose }) => {
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
        
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Got it
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

// Bundle Card Components
const BundleCardGrid = ({ bundle, onSelect }) => (
  <button
    onClick={() => onSelect(bundle)}
    disabled={!bundle.inStock}
    className={`h-full p-6 rounded-2xl text-center transition-all border-2 transform hover:scale-105 flex flex-col ${
      bundle.inStock
        ? 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-700/30 border-slate-200 dark:border-slate-600 hover:bg-gradient-to-br hover:from-yellow-50 hover:to-amber-50 dark:hover:from-yellow-900/30 dark:hover:to-amber-900/30 hover:border-yellow-400 dark:hover:border-yellow-500 cursor-pointer shadow-md hover:shadow-xl'
        : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 cursor-not-allowed opacity-50'
    }`}
  >
    <div className="flex-1 flex flex-col justify-center">
      <div className="text-4xl font-black mb-3 text-slate-900 dark:text-white">{bundle.label}</div>
      <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">Non-Expiry Data</div>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
        <Database className="w-6 h-6 text-white" strokeWidth={2} />
      </div>
    </div>
    <div className="border-t border-slate-200 dark:border-slate-600 pt-4 mt-4">
      <div className="text-yellow-600 dark:text-yellow-400 font-black text-3xl mb-2">GH₵{bundle.price}</div>
      {!bundle.inStock ? (
        <div className="text-red-600 dark:text-red-400 text-xs font-bold">OUT OF STOCK</div>
      ) : (
        <div className="text-slate-500 dark:text-slate-400 text-xs font-bold flex items-center justify-center">
          TAP TO BUY <ArrowRight className="w-3 h-3 ml-2" />
        </div>
      )}
    </div>
  </button>
);

const BundleCardList = ({ bundle, onSelect }) => (
  <button
    onClick={() => onSelect(bundle)}
    disabled={!bundle.inStock}
    className={`w-full p-5 rounded-xl transition-all border-2 flex items-center justify-between ${
      bundle.inStock
        ? 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-400 dark:hover:border-yellow-500 cursor-pointer shadow-md hover:shadow-lg'
        : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 cursor-not-allowed opacity-50'
    }`}
  >
    <div className="flex items-center space-x-4 flex-1">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
        <Database className="w-6 h-6 text-white" strokeWidth={2} />
      </div>
      <div className="text-left">
        <div className="text-2xl font-black text-slate-900 dark:text-white">{bundle.label}</div>
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Non-Expiry Data Package</div>
      </div>
    </div>
    <div className="flex flex-col items-end">
      <div className="text-yellow-600 dark:text-yellow-400 font-black text-2xl">GH₵{bundle.price}</div>
      {!bundle.inStock ? (
        <div className="text-red-600 dark:text-red-400 text-xs font-bold">OUT OF STOCK</div>
      ) : (
        <div className="text-slate-500 dark:text-slate-400 text-xs font-bold">Click to purchase</div>
      )}
    </div>
  </button>
);

const BundleCardCompact = ({ bundle, onSelect }) => (
  <button
    onClick={() => onSelect(bundle)}
    disabled={!bundle.inStock}
    className={`p-4 rounded-xl text-center transition-all border-2 transform hover:scale-105 ${
      bundle.inStock
        ? 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-400 dark:hover:border-yellow-500 cursor-pointer shadow-sm hover:shadow-md'
        : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 cursor-not-allowed opacity-50'
    }`}
  >
    <div className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">{bundle.label}</div>
    <div className="text-yellow-600 dark:text-yellow-400 font-bold text-lg mb-1">GH₵{bundle.price}</div>
    {!bundle.inStock ? (
      <div className="text-red-600 dark:text-red-400 text-xs font-bold">Out of Stock</div>
    ) : (
      <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">Click to buy</div>
    )}
  </button>
);

const BundleCardTable = ({ bundle, onSelect }) => (
  <tr className={`border-b border-slate-200 dark:border-slate-700 transition-all hover:bg-yellow-50 dark:hover:bg-yellow-900/20 ${!bundle.inStock ? 'opacity-50' : ''}`}>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md">
          <Database className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div className="text-lg font-bold text-slate-900 dark:text-white">{bundle.label}</div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className="text-yellow-600 dark:text-yellow-400 font-bold text-lg">GH₵{bundle.price}</span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className="text-slate-600 dark:text-slate-400 font-medium">No-Expiry</span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <button
        onClick={() => onSelect(bundle)}
        disabled={!bundle.inStock}
        className={`px-4 py-2 rounded-lg font-bold transition-all ${
          bundle.inStock
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg'
            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
        }`}
      >
        {!bundle.inStock ? 'Out of Stock' : 'Buy Now'}
      </button>
    </td>
  </tr>
);

const BundleCardBillboard = ({ bundle, onSelect, index }) => {
  const isEven = index % 2 === 0;
  return (
    <button
      onClick={() => onSelect(bundle)}
      disabled={!bundle.inStock}
      className={`w-full p-8 rounded-2xl transition-all border-2 flex flex-col md:flex-row items-center justify-between gap-6 ${
        bundle.inStock
          ? 'bg-gradient-to-r hover:shadow-2xl cursor-pointer'
          : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 cursor-not-allowed opacity-50'
      } ${
        isEven
          ? 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700'
          : 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700'
      }`}
    >
      <div className="flex-1 text-left">
        <div className="text-5xl font-black mb-2 text-slate-900 dark:text-white">{bundle.label}</div>
        <p className="text-slate-600 dark:text-slate-400 font-semibold mb-4">Non-Expiry Data Package</p>
        {!bundle.inStock ? (
          <div className="text-red-600 dark:text-red-400 font-bold">OUT OF STOCK</div>
        ) : (
          <div className="text-slate-700 dark:text-slate-300 font-medium flex items-center">
            Tap to purchase <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        )}
      </div>
      <div className="flex flex-col items-center space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-xl">
          <Database className="w-10 h-10 text-white" strokeWidth={2} />
        </div>
        <div className="text-center">
          <div className="text-4xl font-black text-yellow-600 dark:text-yellow-400 mb-1">GH₵{bundle.price}</div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Best Value</div>
        </div>
      </div>
    </button>
  );
};

// Main MTN Bundle Selector Component
const MTNBundleSelectContent = () => {
  const { user, isAuthenticated, logout, authToken } = useAuth();
  const [selectedBundle, setSelectedBundle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState(null);
  const [layoutType, setLayoutType] = useState('grid');
  
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });
  
  const inventoryAvailable = true;
  
  const bundles = [
    { value: '1', label: '1GB', capacity: '1', price: '4.70', network: 'YELLO', inStock: inventoryAvailable },
    { value: '2', label: '2GB', capacity: '2', price: '9.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '3', label: '3GB', capacity: '3', price: '13.90', network: 'YELLO', inStock: inventoryAvailable },
    { value: '4', label: '4GB', capacity: '4', price: '18.80', network: 'YELLO', inStock: inventoryAvailable },
    { value: '5', label: '5GB', capacity: '5', price: '24.70', network: 'YELLO', inStock: inventoryAvailable },
    { value: '6', label: '6GB', capacity: '6', price: '28.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '8', label: '8GB', capacity: '8', price: '38.70', network: 'YELLO', inStock: inventoryAvailable },
    { value: '10', label: '10GB', capacity: '10', price: '46.70', network: 'YELLO', inStock: inventoryAvailable },
    { value: '15', label: '15GB', capacity: '15', price: '66.70', network: 'YELLO', inStock: inventoryAvailable },
    { value: '20', label: '20GB', capacity: '20', price: '88.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '25', label: '25GB', capacity: '25', price: '112.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '30', label: '30GB', capacity: '30', price: '137.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '40', label: '40GB', capacity: '40', price: '169.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '50', label: '50GB', capacity: '50', price: '210.50', network: 'YELLO', inStock: inventoryAvailable },
    { value: '100', label: '100GB', capacity: '100', price: '420.50', network: 'YELLO', inStock: inventoryAvailable }
  ];

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

    if (!isAuthenticated) {
      showToast('Please login to continue', 'error');
      setIsLoginModalOpen(true);
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
      const response = await fetch('https://unlimiteddatamanfred.onrender.com/api/v1/data/purchase-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          userId: user.id,
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
      
      <div className="max-w-7xl mx-auto">
        <ServiceInfoModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={() => {
            setIsLoginModalOpen(false);
            showToast('Login successful!', 'success');
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
        
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
              <Globe className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                MTN Data Bundles
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Non-Expiry Data Packages</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 flex-wrap">
            {isAuthenticated && user && (
              <div className="flex items-center space-x-3 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
                <Shield className="w-5 h-5 text-yellow-500" strokeWidth={2} />
                <div className="text-sm">
                  <p className="font-semibold text-slate-900 dark:text-white">{user.email || user.name || 'User'}</p>
                </div>
              </div>
            )}
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <LogOut size={16} strokeWidth={2} />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <LogIn size={16} strokeWidth={2} />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
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
                <span className="text-sm">Info</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Choose Layout</h3>
              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg overflow-x-auto">
                <button
                  onClick={() => setLayoutType('grid')}
                  className={`p-2 rounded-md transition-all whitespace-nowrap ${
                    layoutType === 'grid'
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Grid Layout"
                >
                  <Grid3X3 size={20} strokeWidth={2} />
                </button>
                <button
                  onClick={() => setLayoutType('list')}
                  className={`p-2 rounded-md transition-all whitespace-nowrap ${
                    layoutType === 'list'
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="List Layout"
                >
                  <List size={20} strokeWidth={2} />
                </button>
                <button
                  onClick={() => setLayoutType('compact')}
                  className={`p-2 rounded-md transition-all whitespace-nowrap ${
                    layoutType === 'compact'
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Compact Layout"
                >
                  <LayoutGrid size={20} strokeWidth={2} />
                </button>
                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                <button
                  onClick={() => setLayoutType('table')}
                  className={`p-2 rounded-md transition-all whitespace-nowrap ${
                    layoutType === 'table'
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Table Layout"
                >
                  <Columns size={20} strokeWidth={2} />
                </button>
                <button
                  onClick={() => setLayoutType('billboard')}
                  className={`p-2 rounded-md transition-all whitespace-nowrap ${
                    layoutType === 'billboard'
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Billboard Layout"
                >
                  <Sliders size={20} strokeWidth={2} />
                </button>
              </div>
            </div>

            {layoutType === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {bundles.map((bundle) => (
                  <BundleCardGrid
                    key={bundle.value}
                    bundle={bundle}
                    onSelect={handleBundleSelect}
                  />
                ))}
              </div>
            )}

            {layoutType === 'list' && (
              <div className="space-y-4 mb-8">
                {bundles.map((bundle) => (
                  <BundleCardList
                    key={bundle.value}
                    bundle={bundle}
                    onSelect={handleBundleSelect}
                  />
                ))}
              </div>
            )}

            {layoutType === 'compact' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {bundles.map((bundle) => (
                  <BundleCardCompact
                    key={bundle.value}
                    bundle={bundle}
                    onSelect={handleBundleSelect}
                  />
                ))}
              </div>
            )}

            {layoutType === 'table' && (
              <div className="mb-8 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-yellow-500 to-amber-500">
                    <tr>
                      <th className="px-6 py-4 text-left text-white font-bold">Bundle</th>
                      <th className="px-6 py-4 text-left text-white font-bold">Price</th>
                      <th className="px-6 py-4 text-left text-white font-bold">Validity</th>
                      <th className="px-6 py-4 text-left text-white font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {bundles.map((bundle) => (
                      <BundleCardTable
                        key={bundle.value}
                        bundle={bundle}
                        onSelect={handleBundleSelect}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {layoutType === 'billboard' && (
              <div className="space-y-4 mb-8">
                {bundles.map((bundle, index) => (
                  <BundleCardBillboard
                    key={bundle.value}
                    bundle={bundle}
                    onSelect={handleBundleSelect}
                    index={index}
                  />
                ))}
              </div>
            )}

            <div className="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-start">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-4 flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-red-900 dark:text-red-300 mb-3">Important Notice</h4>
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

// Main App with Auth Provider
export default function MTNBundleSelect() {
  return (
    <AuthProvider>
      <MTNBundleSelectContent />
    </AuthProvider>
  );
}