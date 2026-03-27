"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

const Navbar = () => {
  const router = useRouter();
  const isActive = (path) => router.pathname === path;
  const { address, isConnected } = useAccount();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Shorten address for display
  const shortAddress = (addr) => {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };

  const logoutUser = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('walletAddress');
    if (isConnected && address) {
      localStorage.setItem('walletAddress', address);
    }
    router.push('/login');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    if (typeof document !== 'undefined') {
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    // Sync wallet address from wagmi
    if (isConnected && address) {
      localStorage.setItem('walletAddress', address);
    }

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (typeof document !== 'undefined') {
      if (savedDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isConnected, address, mounted]);

  return (
    <>
      <div className="bg-[#f7f7f7ff] dark:bg-[#2a2a2a] w-full h-2 transition-colors duration-300"></div>
      <nav className="bg-[#f74b25ff] dark:bg-[#2a2a2a] text-[#001215] dark:text-[#e0e0e0] p-2 md:p-4 rounded-xl shadow-sm mx-2 md:mx-4 transition-colors duration-300">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Image src="/metatrace.png" alt="MetaTrace Logo" width={40} height={40} />
            <Link href="/" className="font-black text-lg md:text-xl epilogue hover:text-[#f6cc31ff] hidden sm:block dark:text-[#f7f7f7]">
              MetaTrace
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 poppins font-semibold">
            {isAuthenticated && (
              <>
                <Link
                  href="/upload"
                  className={`px-3 py-2 rounded-lg hover:text-[#f8d65a] dark:hover:text-[#ffd028] transition ${
                    isActive('/upload') ? 'text-[#f6cc31ff]' : 'text-[#001215] dark:text-[#e0e0e0]'
                  }`}
                >
                  Upload
                </Link>
                <Link
                  href="/profile"
                  className={`px-3 py-2 rounded-lg hover:text-[#f8d65a] dark:hover:text-[#ffd028] transition ${
                    isActive('/profile') ? 'text-[#f6cc31ff]' : 'text-[#001215] dark:text-[#e0e0e0]'
                  }`}
                >
                  Profile
                </Link>

                {/* Wallet Section - RainbowKit ConnectButton */}
                <div className="border-l border-[#001215] dark:border-[#5e5e5e] pl-4 lg:pl-6">
                  <ConnectButton />
                </div>
              </>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-[#ffffff33] dark:hover:bg-[#3a3a3a] transition"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} className="text-[#001215]" />}
            </button>

            <button
              onClick={logoutUser}
              className="bg-[#1a1a1aff] dark:bg-[#e0e0e0] text-[#f7f7ff] dark:text-[#1a1a1a] px-4 py-2 rounded-lg hover:bg-[#f7f7ff] dark:hover:bg-[#f7f7f7] hover:text-[#1a1a1aff] dark:hover:text-[#1a1a1a] transition"
            >
              {isAuthenticated ? 'Logout' : 'Login'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#001215] dark:text-[#e0e0e0] p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 poppins font-semibold">
            {isAuthenticated && (
              <>
                <Link
                  href="/upload"
                  className={`block px-4 py-2 rounded-lg hover:text-[#f8d65a] dark:hover:text-[#ffd028] transition ${
                    isActive('/upload') ? 'text-[#f6cc31ff]' : 'text-[#001215] dark:text-[#e0e0e0]'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Upload
                </Link>
                <Link
                  href="/profile"
                  className={`block px-4 py-2 rounded-lg hover:text-[#f8d65a] dark:hover:text-[#ffd028] transition ${
                    isActive('/profile') ? 'text-[#f6cc31ff]' : 'text-[#001215] dark:text-[#e0e0e0]'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>

                {/* Wallet Section - Mobile RainbowKit */}
                <div className="px-4 py-2 border-t border-[#001215] dark:border-[#5e5e5e] mt-2">
                  <ConnectButton />
                </div>
              </>
            )}

            {/* Dark Mode Toggle - Mobile */}
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-[#ffffff33] dark:hover:bg-[#3a3a3a] transition border-t border-[#001215] dark:border-[#5e5e5e] mt-2"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? (
                <>
                  <Sun size={20} className="text-yellow-300" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={20} className="text-[#001215]" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <button
              onClick={logoutUser}
              className="w-full bg-[#1a1a1aff] dark:bg-[#e0e0e0] text-[#f7f7ff] dark:text-[#1a1a1a] px-4 py-2 rounded-lg hover:bg-[#f7f7ff] dark:hover:bg-[#f7f7f7] hover:text-[#1a1a1aff] dark:hover:text-[#1a1a1a] transition"
            >
              {isAuthenticated ? 'Logout' : 'Login'}
            </button>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
