"use client";
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwWarning, setPwWarning] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    if (!token || !tokenExpiry) {
      console.warn("❌ No token or expiry found. Logging out...");
      logoutUser();
      return;
    }

    const expiryTime = Number(tokenExpiry);
    console.log("✅ Stored Token Expiry:", new Date(expiryTime).toLocaleString());
    console.log("✅ Current Time:", new Date().toLocaleString());

    if (Date.now() > expiryTime) {
      console.warn("❌ Session expired. Logging out...");
      logoutUser();
    } else {
      console.log("✅ Token is still valid!");
    }
  }, []);

  

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    alert("Session expired. Please log in again.");
    router.push("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = {};
  
    // Client-side validation
    if (!email) {
      formErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = "Please enter a valid email.";
    }
  
    if (!password) {
      formErrors.password = "Password is required.";
    }
  
    
    if (Object.keys(formErrors).length === 0) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.message || "Invalid credentials");
        } 
        console.log('Login successful:', data.token);
        console.log("✅ Received Expiry:", new Date(data.expiry).toLocaleString());
        localStorage.setItem("token", data.token);
        localStorage.setItem("tokenExpiry", data.expiry);
        setTimeout(() => {
          router.push("/upload");
        }, 500);
      } catch (error) {
        console.error('Login Error:', error.message);
        setErrors({ email: 'Something went wrong. Please try again.' });
      }
      finally {
        setIsLoading(false);
      }
    } else {
      setErrors(formErrors); // Show client-side validation errors
    }
  };  
  

  return (
    <>
      <Head>
        <title>MetaTrace | Login</title>
      </Head>
      <div className="flex justify-center items-center min-h-screen bg-[#dfdfdf] dark:bg-[#1a1a1a] p-4 transition-colors duration-300">
        <div className="w-full max-w-4xl bg-[#f7f7f7ff] dark:bg-[#2a2a2a] rounded-lg shadow-lg flex flex-col md:flex-row md:h-[650px] transition-colors duration-300">
          {/* Image Section - Hidden on Mobile, Top on Tablet */}
          <div className="hidden md:flex w-full md:w-1/2 h-64 md:h-full relative justify-center items-center bg-gradient-to-br from-[#f74b25ff] to-[#ff6b35] dark:from-[#ff6b35] dark:to-[#ff8555]">
            <Link href="/" className='poppins font-semibold text-white'>
              <button
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm py-2 px-4 rounded-lg hover:bg-white/30 flex items-center space-x-2 z-10 transition-colors"
              >
                <span>MetaTrace</span>
                <ArrowRight size={18} />
              </button>
            </Link>
            <div className="text-center text-white space-y-6">
              <div className="flex justify-center">
                <div className="p-6 bg-white/20 rounded-full backdrop-blur-sm">
                  <Lock size={64} strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-2 epilogue">Secure Access</h3>
                <p className="text-white/80 poppins text-sm">Sign in to explore metadata insights</p>
              </div>
            </div>
          </div>
          {/* Form Section */}
          <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-6 sm:px-8 py-8 md:py-12 md:pl-8 md:pr-8">
            <h2 className="text-xl sm:text-2xl font-black mb-2 epilogue dark:text-[#f7f7f7]">Welcome Back to <strong className='text-[#ef4d31ff] dark:text-[#ff6b35]'>MetaTrace</strong></h2>
            <p className="text-[#5e5e5eff] dark:text-[#b0b0b0] mb-6 poppins text-sm sm:text-base">Unlock the power of metadata visualization and insights.</p>
            <form onSubmit={handleSubmit} className='poppins space-y-4'>
              <div>
                <label htmlFor="email" className="block text-[#5e5e5eff] dark:text-[#b0b0b0] font-bold mb-2 text-sm">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-[#ef4d31ff] dark:text-[#ff6b35] w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-[#3a3a3a] rounded-lg bg-white dark:bg-[#1a1a1a] text-[#1c1c1c] dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#ef4d31ff] dark:focus:ring-[#ff6b35] text-sm transition-colors"
                  />
                </div>
                {errors.email && <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-2">{errors.email}</p>}
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-[#5e5e5eff] dark:text-[#b0b0b0] font-bold text-sm">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-[#ef4d31ff] dark:text-[#ff6b35] hover:underline font-medium">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-[#ef4d31ff] dark:text-[#ff6b35] w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPassword(v);
                      if (v && v.length < 8) setPwWarning('Password looks weak (less than 8 chars)');
                      else setPwWarning('');
                    }}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-[#3a3a3a] rounded-lg bg-white dark:bg-[#1a1a1a] text-[#1c1c1c] dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#ef4d31ff] dark:focus:ring-[#ff6b35] text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-3 text-gray-600 dark:text-[#b0b0b0] hover:text-gray-800 dark:hover:text-[#e0e0e0] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-2">{errors.password}</p>}
                {pwWarning && <p className="text-yellow-600 dark:text-yellow-400 text-xs sm:text-sm mt-2">{pwWarning}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#f74b25ff] to-[#ff6b35] dark:from-[#ff6b35] dark:to-[#ff8555] text-white py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-[#f74b25ff]/50 dark:hover:shadow-[#ff6b35]/50 font-bold transition mt-6 text-sm sm:text-base disabled:opacity-50"
                disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </form>
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-[#3a3a3a]">
              <p className="text-center text-[#5e5e5eff] dark:text-[#b0b0b0] epilogue font-medium text-sm sm:text-base">
                Don't have an account?{' '}
                <a href="/signup" className="text-[#f74b25ff] dark:text-[#ff6b35] hover:underline hover:text-[#bf3e27] dark:hover:text-[#ff8555] font-bold transition">
                  Sign up for free
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Login;
