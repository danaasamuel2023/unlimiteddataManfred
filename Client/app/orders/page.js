'use client'
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Phone, Database, CreditCard, Clock, Search, Filter, X, 
  Zap, Activity, Sparkles, TrendingUp, RefreshCw, CheckCircle, 
  AlertCircle, Wifi, Signal, CircleDot, Timer, Calendar,
  ArrowUpRight, ArrowDownRight, Copy, Check
} from 'lucide-react';

// API constants
const GEONETTECH_BASE_URL = 'https://testhub.geonettech.site/api/v1/checkOrderStatus/:ref';
const API_KEY = '42|tjhxBxaWWe4mPUpxXN1uIk0KTxypvlSqOIOQWz6K162aa0d6';
const TELCEL_API_URL = 'https://iget.onrender.com/api/developer/orders/reference/:orderRef';
const TELCEL_API_KEY = '4cb6763274e86173d2c22c120493ca67b6185039f826f4aa43bb3057db50f858'; 
const API_BASE_URL = 'https://datanest-lkyu.onrender.com/api/v1';

// Auto-refresh interval (5 minutes)
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Format currency as GHS
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2
  }).format(amount);
};

// Network display names mapping
const networkNames = {
  'YELLO': 'MTN',
  'TELECEL': 'Telecel',
  'AT_PREMIUM': 'AirtelTigo Premium',
  'airteltigo': 'AirtelTigo',
  'at': 'AirtelTigo Standard'
};

// Network brand colors and gradients - Compact
const networkThemes = {
  'YELLO': {
    gradient: 'from-yellow-400 to-amber-600',
    lightGradient: 'from-yellow-50 to-amber-50',
    darkGradient: 'from-yellow-900/20 to-amber-900/20',
    icon: '📱',
    color: 'yellow'
  },
  'TELECEL': {
    gradient: 'from-red-400 to-rose-600',
    lightGradient: 'from-red-50 to-rose-50',
    darkGradient: 'from-red-900/20 to-rose-900/20',
    icon: '📡',
    color: 'red'
  },
  'AT_PREMIUM': {
    gradient: 'from-blue-400 to-indigo-600',
    lightGradient: 'from-blue-50 to-indigo-50',
    darkGradient: 'from-blue-900/20 to-indigo-900/20',
    icon: '🌟',
    color: 'blue'
  },
  'airteltigo': {
    gradient: 'from-blue-400 to-cyan-600',
    lightGradient: 'from-blue-50 to-cyan-50',
    darkGradient: 'from-blue-900/20 to-cyan-900/20',
    icon: '📶',
    color: 'blue'
  },
  'at': {
    gradient: 'from-teal-400 to-emerald-600',
    lightGradient: 'from-teal-50 to-emerald-50',
    darkGradient: 'from-teal-900/20 to-emerald-900/20',
    icon: '📞',
    color: 'teal'
  }
};

// Status configurations with animations - Compact
const statusConfigs = {
  'pending': {
    color: 'from-amber-400 to-yellow-600',
    bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-700 dark:text-amber-400',
    icon: Clock,
    animation: 'animate-pulse'
  },
  'completed': {
    color: 'from-emerald-400 to-green-600',
    bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    icon: CheckCircle,
    animation: ''
  },
  'failed': {
    color: 'from-red-400 to-rose-600',
    bgColor: 'bg-red-500/10 dark:bg-red-500/20',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-700 dark:text-red-400',
    icon: X,
    animation: ''
  },
  'processing': {
    color: 'from-blue-400 to-indigo-600',
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-700 dark:text-blue-400',
    icon: Activity,
    animation: 'animate-spin'
  },
  'refunded': {
    color: 'from-purple-400 to-violet-600',
    bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-700 dark:text-purple-400',
    icon: RefreshCw,
    animation: ''
  },
  'waiting': {
    color: 'from-gray-400 to-slate-600',
    bgColor: 'bg-gray-500/10 dark:bg-gray-500/20',
    borderColor: 'border-gray-500/30',
    textColor: 'text-gray-700 dark:text-gray-400',
    icon: Timer,
    animation: 'animate-pulse'
  }
};

export default function DataPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [allPurchases, setAllPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterNetwork, setFilterNetwork] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState({});
  const [lastAutoUpdate, setLastAutoUpdate] = useState(null);
  const [nextUpdateIn, setNextUpdateIn] = useState(AUTO_REFRESH_INTERVAL);
  const [copiedRef, setCopiedRef] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const router = useRouter();
  
  // Get userId from localStorage userData object
  const getUserId = () => {
    if (typeof window === 'undefined') return null;
    
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return null;
    
    try {
      const userData = JSON.parse(userDataString);
      return userData.id;
    } catch (err) {
      console.error('Error parsing user data:', err);
      return null;
    }
  };

  // Check order status for a single purchase
  const checkOrderStatus = useCallback(async (purchase) => {
    if (!purchase.geonetReference || purchase.network === 'at') {
      return purchase;
    }
    
    try {
      let statusResponse;
      let status;
      
      if (purchase.network === 'TELECEL') {
        const telcelUrl = TELCEL_API_URL.replace(':orderRef', purchase.geonetReference);
        statusResponse = await axios.get(telcelUrl, {
          headers: { 'X-API-Key': TELCEL_API_KEY }
        });
        status = statusResponse.data.data.order.status;
      } else {
        const url = GEONETTECH_BASE_URL.replace(':ref', purchase.geonetReference);
        statusResponse = await axios.get(url, {
          headers: { Authorization: `Bearer ${API_KEY}` }
        });
        status = statusResponse.data.data.status;
      }
      
      if (status && status !== purchase.status) {
        return { ...purchase, status, lastChecked: new Date().toISOString() };
      }
      
      return { ...purchase, lastChecked: new Date().toISOString() };
    } catch (error) {
      console.error(`Failed to fetch status for purchase ${purchase._id}:`, error);
      return purchase;
    }
  }, []);

  // Batch check all pending purchases
  const batchCheckStatuses = useCallback(async () => {
    const pendingPurchases = allPurchases.filter(p => 
      p.status === 'pending' || p.status === 'processing' || p.status === 'waiting'
    );
    
    if (pendingPurchases.length === 0) return;
    
    setCheckingStatus(prev => {
      const newStatus = {};
      pendingPurchases.forEach(p => {
        newStatus[p._id] = true;
      });
      return { ...prev, ...newStatus };
    });
    
    try {
      const updatePromises = pendingPurchases.map(purchase => checkOrderStatus(purchase));
      const updatedPurchases = await Promise.all(updatePromises);
      
      setAllPurchases(prev => {
        const purchaseMap = new Map(prev.map(p => [p._id, p]));
        updatedPurchases.forEach(updated => {
          purchaseMap.set(updated._id, updated);
        });
        return Array.from(purchaseMap.values());
      });
      
      setLastAutoUpdate(new Date());
    } finally {
      setCheckingStatus({});
    }
  }, [allPurchases, checkOrderStatus]);

  // Manual check for single purchase
  const manualCheckStatus = async (purchaseId) => {
    const purchase = allPurchases.find(p => p._id === purchaseId);
    if (!purchase) return;
    
    setCheckingStatus(prev => ({ ...prev, [purchaseId]: true }));
    
    try {
      const updated = await checkOrderStatus(purchase);
      
      setAllPurchases(prev => prev.map(p => 
        p._id === purchaseId ? updated : p
      ));
    } finally {
      setCheckingStatus(prev => ({ ...prev, [purchaseId]: false }));
    }
  };

  // Fetch initial purchases
  useEffect(() => {
    const userId = getUserId();
    
    if (!userId) {
      router.push('/SignIn');
      return;
    }
    
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/data/purchase-history/${userId}`, {
          params: { page: 1, limit: 50 }
        });
        
        if (response.data.status === 'success') {
          const purchasesData = response.data.data.purchases;
          setAllPurchases(purchasesData);
          setPurchases(purchasesData);
          
          // Initial status check for pending orders
          setTimeout(() => batchCheckStatuses(), 2000);
        } else {
          throw new Error('Failed to fetch purchases');
        }
      } catch (err) {
        console.error('Error fetching purchases:', err);
        setError('Failed to load purchase history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [router]);

  // Set up auto-refresh interval
  useEffect(() => {
    if (!loading && allPurchases.length > 0) {
      const interval = setInterval(() => {
        batchCheckStatuses();
      }, AUTO_REFRESH_INTERVAL);
      
      // Update countdown timer
      const countdownInterval = setInterval(() => {
        setNextUpdateIn(prev => {
          if (prev <= 1000) {
            return AUTO_REFRESH_INTERVAL;
          }
          return prev - 1000;
        });
      }, 1000);
      
      return () => {
        clearInterval(interval);
        clearInterval(countdownInterval);
      };
    }
  }, [loading, allPurchases.length, batchCheckStatuses]);

  // Apply filters and search
  useEffect(() => {
    if (allPurchases.length > 0) {
      let filteredPurchases = [...allPurchases];
      
      if (filterStatus !== 'all') {
        filteredPurchases = filteredPurchases.filter(purchase => purchase.status === filterStatus);
      }
      
      if (filterNetwork !== 'all') {
        filteredPurchases = filteredPurchases.filter(purchase => purchase.network === filterNetwork);
      }
      
      if (searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase();
        filteredPurchases = filteredPurchases.filter(purchase => 
          purchase.phoneNumber.toLowerCase().includes(searchLower) ||
          purchase.geonetReference?.toLowerCase().includes(searchLower) ||
          networkNames[purchase.network]?.toLowerCase().includes(searchLower)
        );
      }
      
      setPurchases(filteredPurchases);
    }
  }, [searchTerm, filterStatus, filterNetwork, allPurchases]);

  // Copy reference to clipboard
  const copyToClipboard = (text, purchaseId) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(purchaseId);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  // Format date - Compact
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format data size
  const formatDataSize = (capacity) => {
    return capacity >= 1000 ? `${capacity / 1000}MB` : `${capacity}GB`;
  };

  // Format countdown timer
  const formatCountdown = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get unique networks and statuses
  const getUniqueNetworks = () => {
    if (!allPurchases.length) return [];
    return [...new Set(allPurchases.map(p => p.network))].sort();
  };

  const getUniqueStatuses = () => {
    if (!allPurchases.length) return [];
    return [...new Set(allPurchases.map(p => p.status))].sort();
  };

  // Calculate stats
  const stats = {
    total: purchases.length,
    completed: purchases.filter(p => p.status === 'completed').length,
    pending: purchases.filter(p => p.status === 'pending').length,
    failed: purchases.filter(p => p.status === 'failed').length,
    totalAmount: purchases.reduce((sum, p) => sum + p.price, 0),
    todayAmount: purchases
      .filter(p => new Date(p.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, p) => sum + p.price, 0)
  };

  // Check authentication - Compact
  const userId = getUserId();
  if (!userId && typeof window !== 'undefined') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 dark:bg-gray-900/50 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-white/20 text-center max-w-sm w-full"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-3 shadow">
            <Zap className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-base font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-transparent bg-clip-text mb-2">
            CHEAPDATE
          </h2>
          <p className="mb-4 text-white/80 text-xs">You need to be logged in to view your purchases.</p>
          <button 
            onClick={() => router.push('/SignIn')}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow transform hover:scale-105 transition-all w-full text-xs"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated background - Smaller */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-400/10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/10 blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 py-3">
        {/* Header with Stats - Compact */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="bg-white/10 dark:bg-gray-900/50 backdrop-blur-xl rounded-lg p-3 border border-white/20 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow">
                  <Database className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white">Purchase History</h1>
                  <p className="text-white/70 text-xs">Track your data purchases</p>
                </div>
              </div>
              
              {/* Auto-update timer - Compact */}
              {!loading && purchases.length > 0 && (
                <div className="flex items-center space-x-2 bg-white/5 rounded-lg px-2 py-1">
                  <RefreshCw className={`w-3 h-3 text-emerald-400 ${checkingStatus && Object.keys(checkingStatus).length > 0 ? 'animate-spin' : ''}`} />
                  <span className="text-[10px] text-white/70">
                    Next update: <span className="font-mono text-emerald-400">{formatCountdown(nextUpdateIn)}</span>
                  </span>
                  <button
                    onClick={batchCheckStatuses}
                    disabled={Object.keys(checkingStatus).length > 0}
                    className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-md transition-colors"
                  >
                    Update
                  </button>
                </div>
              )}
            </div>
            
            {/* Stats Grid - Compact */}
            {!loading && !error && purchases.length > 0 && (
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mt-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-white/60 uppercase tracking-wider">Total</p>
                      <p className="text-sm font-bold text-white">{stats.total}</p>
                    </div>
                    <Database className="w-4 h-4 text-white/20" />
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-emerald-500/20 backdrop-blur-sm rounded-lg p-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-emerald-300 uppercase tracking-wider">Done</p>
                      <p className="text-sm font-bold text-emerald-400">{stats.completed}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-400/30" />
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-amber-500/20 backdrop-blur-sm rounded-lg p-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-amber-300 uppercase tracking-wider">Wait</p>
                      <p className="text-sm font-bold text-amber-400">{stats.pending}</p>
                    </div>
                    <Clock className="w-4 h-4 text-amber-400/30" />
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-red-500/20 backdrop-blur-sm rounded-lg p-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-red-300 uppercase tracking-wider">Fail</p>
                      <p className="text-sm font-bold text-red-400">{stats.failed}</p>
                    </div>
                    <X className="w-4 h-4 text-red-400/30" />
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-purple-500/20 backdrop-blur-sm rounded-lg p-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-purple-300 uppercase tracking-wider">Spent</p>
                      <p className="text-[10px] font-bold text-purple-400">{formatCurrency(stats.totalAmount)}</p>
                    </div>
                    <TrendingUp className="w-4 h-4 text-purple-400/30" />
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-teal-500/20 backdrop-blur-sm rounded-lg p-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-teal-300 uppercase tracking-wider">Today</p>
                      <p className="text-[10px] font-bold text-teal-400">{formatCurrency(stats.todayAmount)}</p>
                    </div>
                    <Calendar className="w-4 h-4 text-teal-400/30" />
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Content - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 dark:bg-gray-900/50 backdrop-blur-xl rounded-lg border border-white/20 overflow-hidden shadow-lg"
        >
          {/* Search and Filters - Compact */}
          {!loading && !error && purchases.length > 0 && (
            <div className="p-3 border-b border-white/10">
              <div className="flex flex-col lg:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent transition-all text-xs"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-3.5 h-3.5 text-white/40 hover:text-white transition-colors" />
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center justify-center px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${
                    showFilters 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5 mr-1" />
                  Filters
                  <motion.span
                    animate={{ rotate: showFilters ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-1 text-[10px]"
                  >
                    ▼
                  </motion.span>
                </button>
              </div>
              
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 p-2 bg-white/5 rounded-lg">
                      <div>
                        <label className="block text-[10px] font-medium text-white/70 mb-1">Status</label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                        >
                          <option value="all" className="bg-gray-800">All Statuses</option>
                          {getUniqueStatuses().map(status => (
                            <option key={status} value={status} className="bg-gray-800">
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-medium text-white/70 mb-1">Network</label>
                        <select
                          value={filterNetwork}
                          onChange={(e) => setFilterNetwork(e.target.value)}
                          className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                        >
                          <option value="all" className="bg-gray-800">All Networks</option>
                          {getUniqueNetworks().map(network => (
                            <option key={network} value={network} className="bg-gray-800">
                              {networkNames[network] || network}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {/* Content Area - Compact */}
          <div className="p-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 mb-2"
                />
                <p className="text-white/60 text-xs">Loading your purchases...</p>
              </div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-xs"
              >
                <AlertCircle className="w-4 h-4 mb-1" />
                <p>{error}</p>
              </motion.div>
            ) : purchases.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-10"
              >
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Database className="w-6 h-6 text-white/40" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">No purchases found</h3>
                <p className="text-white/60 mb-3 text-xs">
                  {searchTerm || filterStatus !== 'all' || filterNetwork !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Start your CHEAPDATE journey today!'}
                </p>
                {(searchTerm || filterStatus !== 'all' || filterNetwork !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setFilterNetwork('all');
                    }}
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg font-medium transition-all text-xs"
                  >
                    Clear Filters
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {purchases.map((purchase, index) => {
                    const theme = networkThemes[purchase.network] || networkThemes['at'];
                    const statusConfig = statusConfigs[purchase.status] || statusConfigs['pending'];
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <motion.div
                        key={purchase._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setSelectedPurchase(purchase)}
                        className="relative bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group"
                      >
                        {/* Network gradient accent */}
                        <div className={`absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b ${theme.gradient} rounded-l-lg`} />
                        
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                          {/* Left side - Purchase info - Compact */}
                          <div className="flex items-start space-x-2">
                            {/* Network icon - Compact */}
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white font-bold text-xs shadow group-hover:scale-110 transition-transform`}>
                              {theme.icon}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-xs font-bold text-white">
                                  {formatDataSize(purchase.capacity)} Data
                                </h3>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.textColor} border`}>
                                  <StatusIcon className={`w-2.5 h-2.5 mr-0.5 ${statusConfig.animation}`} />
                                  {purchase.status}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/60">
                                <div className="flex items-center space-x-0.5">
                                  <Phone className="w-3 h-3" />
                                  <span>{purchase.phoneNumber}</span>
                                </div>
                                
                                <div className="flex items-center space-x-0.5">
                                  <Wifi className="w-3 h-3" />
                                  <span>{networkNames[purchase.network] || purchase.network}</span>
                                </div>
                                
                                <div className="flex items-center space-x-0.5">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(purchase.createdAt)}</span>
                                </div>
                                
                                {purchase.geonetReference && (
                                  <div className="flex items-center space-x-0.5">
                                    <span className="text-[9px]">Ref:</span>
                                    <code className="text-[9px] bg-white/10 px-1 py-0.5 rounded">{purchase.geonetReference}</code>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(purchase.geonetReference, purchase._id);
                                      }}
                                      className="ml-0.5 hover:text-emerald-400 transition-colors"
                                    >
                                      {copiedRef === purchase._id ? (
                                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-2.5 h-2.5" />
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              {purchase.lastChecked && (
                                <div className="mt-1 text-[9px] text-white/40">
                                  Last checked: {formatDate(purchase.lastChecked)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Right side - Price and actions - Compact */}
                          <div className="flex flex-col items-end space-y-1.5">
                            <div className="text-right">
                              <p className="text-sm font-bold text-white">{formatCurrency(purchase.price)}</p>
                              <p className="text-[9px] text-white/60">Amount paid</p>
                            </div>
                            
                            {purchase.geonetReference && purchase.network !== 'at' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  manualCheckStatus(purchase._id);
                                }}
                                disabled={checkingStatus[purchase._id]}
                                className="flex items-center space-x-1 px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-md font-medium text-[10px] transition-all disabled:opacity-50"
                              >
                                <RefreshCw className={`w-3 h-3 ${checkingStatus[purchase._id] ? 'animate-spin' : ''}`} />
                                <span>{checkingStatus[purchase._id] ? 'Checking...' : 'Check Status'}</span>
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
          
          {/* Footer - Compact */}
          {!loading && !error && (
            <div className="border-t border-white/10 p-3">
              <div className="flex items-center justify-center space-x-1 text-white/60 text-[10px]">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>Powered by CHEAPDATE</span>
                <span className="text-white/40">•</span>
                <span>Need help? Contact support</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Purchase Detail Modal - Compact */}
      <AnimatePresence>
        {selectedPurchase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPurchase(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900/90 backdrop-blur-xl rounded-lg p-4 max-w-sm w-full border border-white/20 shadow-lg"
            >
              <h3 className="text-base font-bold text-white mb-3">Purchase Details</h3>
              
              <div className="space-y-2">
                <div className="bg-white/5 rounded-lg p-2.5">
                  <p className="text-[10px] text-white/60 mb-0.5">Data Package</p>
                  <p className="text-xs font-bold text-white">{formatDataSize(selectedPurchase.capacity)}</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-2.5">
                  <p className="text-[10px] text-white/60 mb-0.5">Phone Number</p>
                  <p className="text-xs font-bold text-white">{selectedPurchase.phoneNumber}</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-2.5">
                  <p className="text-[10px] text-white/60 mb-0.5">Network</p>
                  <p className="text-xs font-bold text-white">{networkNames[selectedPurchase.network] || selectedPurchase.network}</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-2.5">
                  <p className="text-[10px] text-white/60 mb-0.5">Status</p>
                  <p className="text-xs font-bold text-white capitalize">{selectedPurchase.status}</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-2.5">
                  <p className="text-[10px] text-white/60 mb-0.5">Amount Paid</p>
                  <p className="text-xs font-bold text-white">{formatCurrency(selectedPurchase.price)}</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-2.5">
                  <p className="text-[10px] text-white/60 mb-0.5">Purchase Date</p>
                  <p className="text-xs font-bold text-white">{formatDate(selectedPurchase.createdAt)}</p>
                </div>
                
                {selectedPurchase.geonetReference && (
                  <div className="bg-white/5 rounded-lg p-2.5">
                    <p className="text-[10px] text-white/60 mb-0.5">Reference</p>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-mono text-white">{selectedPurchase.geonetReference}</p>
                      <button
                        onClick={() => copyToClipboard(selectedPurchase.geonetReference, selectedPurchase._id)}
                        className="ml-1 text-emerald-400 hover:text-emerald-300"
                      >
                        {copiedRef === selectedPurchase._id ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedPurchase(null)}
                className="mt-3 w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-medium transition-colors text-xs"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}