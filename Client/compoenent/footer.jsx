// components/Footer.jsx
'use client'
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Mail, Phone, MapPin, Database } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                  <Database className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Unlimited Data  <span className="text-blue-500">GH</span>
                </h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                Your trusted partner for reliable and affordable data services across Ghana.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2.5">
                <a 
                  href="mailto:support@unlimiteddatagh.com" 
                  className="flex items-center text-slate-400 hover:text-white transition-colors text-sm group"
                >
                  <Mail className="w-4 h-4 mr-2.5 text-blue-500 group-hover:text-blue-400" strokeWidth={2} />
                  unlimiteddatagh@gmail.com
                </a>
                <a 
                  href="tel:+233 54 404 1482" 
                  className="flex items-center text-slate-400 hover:text-white transition-colors text-sm group"
                >
                  <Phone className="w-4 h-4 mr-2.5 text-blue-500 group-hover:text-blue-400" strokeWidth={2} />
                    +233 25 670 2995     </a>
                <div className="flex items-start text-slate-400 text-sm">
                  <MapPin className="w-4 h-4 mr-2.5 mt-0.5 text-blue-500 flex-shrink-0" strokeWidth={2} />
                  <span>Accra, Ghana</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { name: 'Dashboard', path: '/' },
                { name: 'My Orders', path: '/orders' },
                { name: 'Transactions', path: '/myorders' },
                { name: 'Account Profile', path: '/profile' },
                { name: 'Customer Support', path: '/support' }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.path} 
                    className="text-slate-400 hover:text-white transition-colors text-sm inline-flex items-center group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">
              Data Services
            </h3>
            <ul className="space-y-2.5">
              {[
                { name: 'MTN Data Plans', path: '/mtnup2u' },
                { name: 'AirtelTigo Data', path: '/at-ishare' },
                { name: 'Telecel Data', path: '/TELECEL' },
                { name: 'Bulk Orders', path: '/bulk-orders' },
                { name: 'API Integration', path: '/api' }
              ].map((service) => (
                <li key={service.name}>
                  <Link 
                    href={service.path} 
                    className="text-slate-400 hover:text-white transition-colors text-sm inline-flex items-center group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{service.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {[
                { name: 'About unlimiteddata', path: '/about' },
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Contact Us', path: '/contact' },
                { name: 'Help & FAQ', path: '/faq' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.path} 
                    className="text-slate-400 hover:text-white transition-colors text-sm inline-flex items-center group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Social Media Links */}
        <div className="mt-10 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              {/* Social Media Icons */}
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 flex items-center justify-center transition-all duration-200"
                aria-label="Twitter"
              >
                <TwitterIcon className="w-4.5 h-4.5 text-slate-400 hover:text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 flex items-center justify-center transition-all duration-200"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4.5 h-4.5 text-slate-400 hover:text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 flex items-center justify-center transition-all duration-200"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4.5 h-4.5 text-slate-400 hover:text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 flex items-center justify-center transition-all duration-200"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="w-4.5 h-4.5 text-slate-400 hover:text-white" />
              </a>
            </div>
            
            {/* Security Badge */}
            <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
              <Shield className="w-4 h-4 text-emerald-500" strokeWidth={2} />
              <span className="text-sm font-medium text-slate-300">Secure & Trusted Service</span>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-slate-400 text-sm font-medium">
                © {new Date().getFullYear()} unlimiteddata GH. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link 
                href="/privacy" 
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                Privacy
              </Link>
              <Link 
                href="/terms" 
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                Terms
              </Link>
              <Link 
                href="/cookies" 
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Social Media Icon Components
const TwitterIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const LinkedInIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
  </svg>
);

export default Footer;