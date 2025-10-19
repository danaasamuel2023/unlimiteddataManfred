'use client'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Shield, Loader2, Database } from 'lucide-react';

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // List of paths that should bypass authentication
  const publicPaths = ['/SignIn', '/SignUp', '/reset', '/forgot-password'];
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    // If current path is public, don't check auth
    if (isPublicPath) {
      setLoading(false);
      setIsAuthenticated(true);
      return;
    }
    
    // Check if user is authenticated
    const userData = localStorage.getItem('userData');
    const authToken = localStorage.getItem('authToken');
    
    if (!userData || !authToken) {
      // Redirect to sign in instead of sign up for better UX
      router.push('/SignIn');
    } else {
      // Verify the data is valid JSON
      try {
        JSON.parse(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Invalid user data:', error);
        // Clear invalid data
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        router.push('/SignIn');
      }
    }
    
    setLoading(false);
  }, [router, isPublicPath, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          {/* Professional Loading Animation */}
          <div className="relative w-20 h-20 mx-auto mb-8">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-3 border-slate-200 dark:border-slate-700"></div>
            <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-blue-600 dark:border-t-blue-500 animate-spin"></div>
            
            {/* Inner logo container */}
            <div className="absolute inset-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center shadow-lg">
              <Database className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            
            {/* Pulse effect */}
            <div className="absolute inset-0 rounded-full bg-blue-600/20 dark:bg-blue-500/20 animate-ping"></div>
          </div>
          
          {/* Brand and Status */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
                Unlimited Data <span className="text-blue-600 dark:text-blue-500">GH</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Secure Data Services
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-2.5 text-slate-700 dark:text-slate-300">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-500" strokeWidth={2.5} />
              <span className="text-sm font-medium">Verifying authentication...</span>
            </div>
          </div>
          
          {/* Professional Progress Bar */}
          <div className="mt-10 w-64 mx-auto">
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400 rounded-full animate-progress shadow-sm"></div>
            </div>
          </div>
          
          {/* Security Badge */}
          <div className="mt-8 inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-500" strokeWidth={2} />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Secure Connection</span>
          </div>
        </div>
        
        {/* Add animation styles */}
        <style jsx>{`
          @keyframes progress {
            0% {
              width: 0%;
              opacity: 0.8;
            }
            50% {
              width: 75%;
              opacity: 1;
            }
            100% {
              width: 100%;
              opacity: 0.8;
            }
          }
          
          .animate-progress {
            animation: progress 2s ease-in-out infinite;
          }
          
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
          
          @keyframes ping {
            75%, 100% {
              transform: scale(1.1);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default AuthGuard;