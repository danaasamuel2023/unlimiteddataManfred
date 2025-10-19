'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  CreditCard, 
  ShoppingCart, 
  Award, 
  Clock, 
  Mail, 
  Phone, 
  Calendar, 
  Wallet,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Percent,
  TrendingUp,
  Moon,
  Sun,
  Activity,
  Target,
  Star,
  ArrowUp,
  DollarSign,
  BarChart3,
  Zap,
  Sparkles
} from 'lucide-react';

const UserStatsPage = () => {
  const router = useRouter();
  
  // State variables
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Get token and user data from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      const userDataStr = localStorage.getItem('userData');
      
      // Check for system dark mode preference or saved preference
      const savedDarkMode = localStorage.getItem('darkMode');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      setDarkMode(savedDarkMode === 'true' || (savedDarkMode === null && prefersDark));
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      setAuthToken(token);
      
      if (userDataStr) {
        try {
          const parsedUserData = JSON.parse(userDataStr);
          setUserData(parsedUserData);
        } catch (err) {
          console.error('Error parsing user data:', err);
          localStorage.removeItem('userData');
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    }
  }, [router]);

  // Listen for system dark mode changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only change if user hasn't explicitly set a preference
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Check if user is admin
  const isAdmin = userData?.role === 'admin';

  // Fetch user stats when component mounts
  useEffect(() => {
    if (userData && authToken) {
      fetchUserStats();
    }
  }, [authToken, userData]);

  // Function to fetch user stats
  const fetchUserStats = async () => {
    if (!authToken || !userData) return;
    
    setLoading(true);
    try {
      const userId = userData.id;
      
      // Using GET request with userId in URL params
      const response = await fetch(`https://datanest-lkyu.onrender.com/api/v1/user-stats/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUserStats(data.data);
      } else {
        setError('Failed to fetch user statistics');
      }
    } catch (err) {
      if (err.message && err.message.includes('401')) {
        // Handle token expiration
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        router.push('/login');
      } else {
        setError('An error occurred while fetching user statistics');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Show loading spinner if data is still loading
  if (!userData || !authToken || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200/20"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-400 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-purple-200 font-medium">Loading your statistics...</p>
        </div>
      </div>
    );
  }
  
  // Show error message if there was an error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/20 p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Oops! Something went wrong</h2>
              <p className="text-gray-300 mb-8">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900 transition-all duration-300">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-800/30 to-pink-800/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/20 p-8 mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 animate-gradient-x"></div>
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center mb-3">
                <Sparkles className="w-5 h-5 text-yellow-400 mr-2 animate-pulse" />
                <span className="text-sm font-medium text-yellow-400 uppercase tracking-wider">Analytics Hub</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white mb-2">
                Performance Center
              </h1>
              <p className="text-purple-200 text-lg">Real-time insights at your fingertips</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm text-white rounded-2xl hover:bg-white/20 transition-all duration-200 border border-white/10"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={fetchUserStats}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Sync Data
              </button>
            </div>
          </div>
        </div>
        
        {/* User Profile Card - New Design */}
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/20 p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Section */}
            <div className="lg:col-span-1">
              <div className="relative">
                <div className="w-32 h-32 mx-auto lg:mx-0 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
                  <User className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-gray-800 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-6 text-center lg:text-left">
                <h2 className="text-3xl font-black text-white mb-2">{userStats.userInfo.name}</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-center lg:justify-start text-purple-300">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="text-sm">{userStats.userInfo.email}</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start text-purple-300">
                    <Phone className="w-4 h-4 mr-2" />
                    <span className="text-sm">{userStats.userInfo.phoneNumber}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Wallet Balance Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/30 hover:border-green-400/50 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-400/20 transition-all"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <Wallet className="w-8 h-8 text-green-400" />
                    <ArrowUp className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-green-300 text-sm font-medium mb-1">Current Balance</p>
                  <p className="text-3xl font-black text-white">{formatCurrency(userStats.userInfo.walletBalance)}</p>
                </div>
              </div>
              
              {/* Member Duration Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-400/20 transition-all"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-8 h-8 text-blue-400" />
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>
                  <p className="text-blue-300 text-sm font-medium mb-1">Membership Duration</p>
                  <p className="text-3xl font-black text-white">{userStats.userInfo.accountAge} days</p>
                  <p className="text-xs text-blue-300/70 mt-1">Since {formatDate(userStats.userInfo.registrationDate)}</p>
                </div>
              </div>
              
              {/* Total Deposits Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-400/20 transition-all"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 text-purple-400" />
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-purple-300 text-sm font-medium mb-1">Total Deposited</p>
                  <p className="text-3xl font-black text-white">{formatCurrency(userStats.depositStats.totalAmount)}</p>
                  <p className="text-xs text-purple-300/70 mt-1">{userStats.depositStats.numberOfDeposits} transactions</p>
                </div>
              </div>
              
              {/* Success Rate Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-2xl p-6 border border-yellow-500/30 hover:border-yellow-400/50 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-400/20 transition-all"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-8 h-8 text-yellow-400" />
                    <BarChart3 className="w-5 h-5 text-yellow-400" />
                  </div>
                  <p className="text-yellow-300 text-sm font-medium mb-1">Success Rate</p>
                  <p className="text-3xl font-black text-white">{userStats.orderStats.successRate}%</p>
                  <div className="mt-3">
                    <div className="bg-gray-700/50 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${userStats.orderStats.successRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Statistics Section - New Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Orders Overview */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/20 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white">Order Analytics</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-2xl border border-gray-600/30">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center mr-3">
                    <Target className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Orders</p>
                    <p className="text-xl font-bold text-white">{userStats.orderStats.totalOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-2xl border border-gray-600/30">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mr-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Successful Orders</p>
                    <p className="text-xl font-bold text-white">{userStats.orderStats.successfulOrders}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Activity Summary */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/20 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mr-4">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white">Activity Summary</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-pink-600/10 to-rose-600/10 rounded-2xl border border-pink-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-pink-300 text-sm font-medium">Performance Score</span>
                  <span className="text-2xl font-bold text-white">{Math.round((userStats.orderStats.successRate + (userStats.orderStats.totalOrders / 10)) / 2)}%</span>
                </div>
                <div className="text-xs text-gray-400">Based on success rate and order volume</div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-2xl border border-cyan-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-cyan-300 text-sm font-medium">Engagement Level</span>
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-white mr-2">
                      {userStats.orderStats.totalOrders > 50 ? 'High' : userStats.orderStats.totalOrders > 20 ? 'Medium' : 'Growing'}
                    </span>
                    <Activity className={`w-5 h-5 ${userStats.orderStats.totalOrders > 50 ? 'text-green-400' : userStats.orderStats.totalOrders > 20 ? 'text-yellow-400' : 'text-blue-400'}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Admin-only Ranking Section - New Design */}
        {isAdmin && userStats.ranking && (
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/20 p-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mr-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Leaderboard Position</h3>
                <p className="text-purple-300 text-sm">Administrator view</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
                    <span className="text-4xl font-black text-white">#{userStats.ranking.position}</span>
                  </div>
                  <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white text-sm font-bold">
                    Top {userStats.ranking.percentile}%
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-2">Global Ranking</p>
                <p className="text-2xl font-bold text-white">Position {userStats.ranking.position} of {userStats.ranking.outOf}</p>
              </div>
              
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 bg-gradient-to-r from-amber-600/10 to-orange-600/10 rounded-2xl border border-amber-500/20">
                  <h4 className="text-amber-300 font-bold mb-4">Performance Percentile</h4>
                  <div className="relative">
                    <div className="bg-gray-700 h-4 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
                        style={{ width: `${userStats.ranking.percentile}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-3 text-sm">
                      <span className="text-amber-300 font-bold">Top {userStats.ranking.percentile}%</span>
                      <span className="text-gray-400">Outperforming {100 - userStats.ranking.percentile}% of users</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl border border-purple-500/20">
                  <h4 className="text-purple-300 font-bold mb-3 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Performance Analysis
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {userStats.ranking.position <= 10 ? (
                      "🏆 Elite performer! This user demonstrates exceptional engagement and drives significant value to the platform."
                    ) : userStats.ranking.position <= 50 ? (
                      "⭐ Top-tier user with strong activity patterns. Consistent performance places them well above average."
                    ) : (
                      "📈 Active participant showing growth potential. Continued engagement will improve their standing."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            transform: translateX(0%);
          }
          50% {
            transform: translateX(-100%);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-gradient-x {
          animation: gradient-x 15s ease infinite;
          background-size: 200% 200%;
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default UserStatsPage;