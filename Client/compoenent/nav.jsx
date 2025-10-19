'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  LayoutDashboard, 
  Layers, 
  User,
  CreditCard,
  LogOut,
  ChevronRight,
  ShoppingCart,
  BarChart2,
  Menu,
  X,
  Activity,
  TrendingUp,
  Settings,
  Wallet,
  Globe,
  Shield,
  FileText,
  HelpCircle,
  Moon,
  Sun,
  Database
} from 'lucide-react';

const MobileNavbar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [userRole, setUserRole] = useState("user");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  
  // Check user role and login status on initial load
  useEffect(() => {
    try {
      const authToken = localStorage.getItem('authToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const dataUser = JSON.parse(localStorage.getItem('data.user') || '{}');
      
      const loggedIn = !!authToken;
      setIsLoggedIn(loggedIn);
      
      if (!loggedIn) {
        return;
      }
      
      if (userData && userData.role) {
        setUserRole(userData.role);
        setUserName(userData.name || '');
        setUserEmail(userData.email || '');
      } else if (dataUser && dataUser.role) {
        setUserRole(dataUser.role);
        setUserName(dataUser.name || '');
        setUserEmail(dataUser.email || '');
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      setIsLoggedIn(false);
    }
  }, []);

  // Check for dark mode preference on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Enhanced Logout function
  const handleLogout = () => {
    console.log("Logout initiated");
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('data.user');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      setIsLoggedIn(false);
      setUserRole("user");
      
      window.location.href = '/';
    } catch (error) {
      console.error("Error during logout:", error);
      window.location.href = '/';
    }
  };

  // Navigate to profile page
  const navigateToProfile = () => {
    router.push('/profile');
    setIsMobileMenuOpen(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  // Navigation Item Component
  const NavItem = ({ icon, text, path, onClick, disabled = false, badge = null, isActive = false }) => {
    const itemClasses = `flex items-center py-3.5 px-5 ${
      disabled 
        ? 'opacity-40 cursor-not-allowed' 
        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer active:bg-slate-100 dark:active:bg-slate-800'
    } transition-all duration-200 ${
      isActive ? 'bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent border-l-4 border-blue-600 dark:border-blue-500' : ''
    }`;
    
    return (
      <div 
        className={itemClasses}
        onClick={() => {
          if (disabled) return;
          if (onClick) {
            onClick();
          } else {
            router.push(path);
            setIsMobileMenuOpen(false);
          }
        }}
      >
        <div className={`mr-3.5 ${isActive ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 dark:text-slate-400'}`}>
          {React.cloneElement(icon, { size: 20, strokeWidth: 2 })}
        </div>
        <span className={`font-medium text-sm flex-1 ${
          isActive ? 'text-slate-900 dark:text-slate-50 font-semibold' : 'text-slate-700 dark:text-slate-300'
        }`}>
          {text}
        </span>
        {badge && (
          <span className="px-2.5 py-1 text-xs font-semibold bg-blue-600 dark:bg-blue-600 text-white rounded-md shadow-sm">
            {badge}
          </span>
        )}
        {disabled && (
          <span className="px-2 py-0.5 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded">
            Soon
          </span>
        )}
        {!disabled && (
          <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" strokeWidth={2} />
        )}
      </div>
    );
  };

  // Section Heading Component
  const SectionHeading = ({ title }) => (
    <div className="px-5 pt-5 pb-2">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {title}
      </p>
    </div>
  );

  return (
    <>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full bg-white dark:bg-slate-900 shadow-sm z-40 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center h-16 px-5 max-w-screen-xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Database className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span 
              className="cursor-pointer"
              onClick={() => router.push('/')}
            >
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Unlimited Data <span className="text-blue-600 dark:text-blue-500">GH</span>
              </h1>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-amber-500" strokeWidth={2} />
              ) : (
                <Moon className="h-5 w-5 text-slate-600" strokeWidth={2} />
              )}
            </button>
            
            {isLoggedIn && (
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-500" strokeWidth={2} />
              </div>
            )}
            
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? 
                <X size={20} className="text-slate-700 dark:text-slate-300" strokeWidth={2} /> : 
                <Menu size={20} className="text-slate-700 dark:text-slate-300" strokeWidth={2} />
              }
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed right-0 top-0 h-full w-80 max-w-[85%] bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-out z-50 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center px-5 py-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <Database className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Unlimited Data <span className="text-blue-600 dark:text-blue-500">GH</span>
              </h2>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X size={20} className="text-slate-700 dark:text-slate-300" strokeWidth={2} />
            </button>
          </div>
          
          {/* User Info Section */}
          {isLoggedIn && (
            <div className="px-5 pb-4">
              <div 
                className="flex items-center p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 border border-slate-200 dark:border-slate-700/50"
                onClick={navigateToProfile}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center text-white shadow-md">
                  <User size={20} strokeWidth={2} />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {userName || 'User Account'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {userEmail || 'View profile settings'}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" strokeWidth={2} />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="h-[calc(100vh-180px)] overflow-y-auto bg-white dark:bg-slate-900">
          {isLoggedIn ? (
            <div className="pb-4">
              <SectionHeading title="Overview" />
              <NavItem 
                icon={<Home />} 
                text="Dashboard" 
                path="/" 
                isActive={activeSection === "Dashboard"}
              />
              {userRole === "admin" && (
                <NavItem 
                  icon={<Shield />} 
                  text="Administration" 
                  path="/admin" 
                  badge="Admin"
                />
              )}

              <SectionHeading title="Data Services" />
              <NavItem 
                icon={<Globe />} 
                text="AirtelTigo" 
                path="/at-ishare" 
              />
              <NavItem 
                icon={<Activity />} 
                text="MTN Data" 
                path="/mtnup2u" 
              />
              <NavItem 
                icon={<Layers />} 
                text="Telecel" 
                path="/TELECEL" 
              />
              <NavItem 
                icon={<Activity />} 
                text="AT Big Time" 
                path="/at-big-time"
                disabled={true} 
              />

              <SectionHeading title="Financial" />
              <NavItem 
                icon={<Wallet />} 
                text="Deposit Funds" 
                path="/topup" 
              />
              <NavItem 
                icon={<FileText />} 
                text="Transaction History" 
                path="/myorders" 
              />
              <NavItem 
                icon={<BarChart2 />} 
                text="Analytics & Reports" 
                path="/reports"
                disabled={true}
              />

              <SectionHeading title="Support & Settings" />
              <NavItem 
                icon={<HelpCircle />} 
                text="Help Center" 
                path="/help"
                disabled={true}
              />
              <NavItem 
                icon={<Settings />} 
                text="Account Settings" 
                path="/settings"
                disabled={true}
              />

              {/* Logout Button */}
              <div className="mt-6 px-5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center py-3 px-4 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-200 font-semibold text-sm shadow-sm"
                >
                  <LogOut size={18} className="mr-2" strokeWidth={2} />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            // Not logged in state
            <div className="p-6 flex flex-col items-center justify-center h-full">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                  <User className="w-9 h-9 text-slate-400 dark:text-slate-500" strokeWidth={2} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Welcome to Unlimited Data GH
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sign in to access your account and manage your data services
                </p>
              </div>
              
              <div className="w-full space-y-3">
                <button
                  onClick={() => {
                    router.push('/SignIn');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-200 font-semibold text-sm shadow-lg shadow-blue-500/30"
                >
                  Sign In to Account
                </button>
                
                <button
                  onClick={() => {
                    router.push('/SignUp');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 px-4 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-500 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 transition-all duration-200 font-semibold text-sm shadow-sm"
                >
                  Create New Account
                </button>
              </div>

              <div className="mt-10 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  © 2025 Unlimited Data GH. All rights reserved.
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pt-16">
        {/* Your content goes here */}
      </main>
    </>
  );
};

export default MobileNavbar;