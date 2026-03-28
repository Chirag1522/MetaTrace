"use client";
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { ArrowRight, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [pwStrength, setPwStrength] = useState({ score: 0, label: '' });
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    // Validate token exists
    if (token === undefined) {
      // Still loading router query
      return;
    }
    
    if (!token || token.trim().length === 0) {
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = {};

    // Client-side validation
    if (!newPassword) {
      formErrors.newPassword = "Password is required.";
    } else if (newPassword.length < 8) {
      formErrors.newPassword = "Password must be at least 8 characters.";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      formErrors.newPassword = "Password must contain at least one special character.";
    }

    if (!confirmPassword) {
      formErrors.confirmPassword = "Please confirm your password.";
    } else if (newPassword !== confirmPassword) {
      formErrors.confirmPassword = "Passwords do not match.";
    }

    if (pwStrength.score < 2) {
      formErrors.newPassword = 'Please choose a stronger password.';
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ submit: data.message || "Failed to reset password. Please try again." });
      } else {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <>
        <Head>
          <title>MetaTrace | Reset Password</title>
        </Head>
        <div className="flex justify-center items-center min-h-screen bg-[#dfdfdf] dark:bg-[#1a1a1a] p-4 transition-colors duration-300">
          <div className="w-full max-w-4xl bg-[#f7f7f7ff] dark:bg-[#2a2a2a] rounded-lg shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold epilogue dark:text-[#f7f7f7] mb-4">Invalid Reset Link</h2>
            <p className="text-[#5e5e5eff] dark:text-[#b0b0b0] mb-6">
              The password reset link is invalid or has expired.
            </p>
            <Link href="/forgot-password" className="inline-block bg-gradient-to-r from-[#f74b25ff] to-[#ff6b35] dark:from-[#ff6b35] dark:to-[#ff8555] text-white py-3 px-6 rounded-lg font-bold hover:shadow-lg transition">
              Request New Link
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>MetaTrace | Reset Password</title>
      </Head>
      <div className="flex justify-center items-center min-h-screen bg-[#dfdfdf] dark:bg-[#1a1a1a] p-4 transition-colors duration-300">
        <div className="w-full max-w-4xl bg-[#f7f7f7ff] dark:bg-[#2a2a2a] rounded-lg shadow-lg flex flex-col md:flex-row md:h-[550px] transition-colors duration-300">
          {/* Image Section - Hidden on Mobile */}
          <div className="hidden md:flex w-full md:w-1/2 h-64 md:h-full relative justify-center items-center bg-gradient-to-br from-[#f74b25ff] to-[#ff6b35] dark:from-[#ff6b35] dark:to-[#ff8555]">
            <div className="text-center text-white">
              <Lock className="w-24 h-24 mx-auto mb-4 opacity-80" />
              <h3 className="text-3xl font-bold mb-2 epilogue">Create New Password</h3>
              <p className="text-white/80 poppins">Secure your account with a strong password</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-6 sm:px-8 py-8 md:py-12">
            {!submitted ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-black mb-2 epilogue dark:text-[#f7f7f7]">
                    Create <span className="text-[#ef4d31ff] dark:text-[#ff6b35]">New Password</span>
                  </h2>
                  <p className="text-[#5e5e5eff] dark:text-[#b0b0b0] poppins text-sm sm:text-base">
                    Enter a strong password to secure your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className='poppins space-y-6'>
                  {errors.submit && (
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                      <p className="text-red-700 dark:text-red-400 text-sm">{errors.submit}</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="newPassword" className="block text-[#5e5e5eff] dark:text-[#b0b0b0] font-bold mb-2 text-sm">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-[#ef4d31ff] dark:text-[#ff6b35] w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => {
                          const v = e.target.value;
                          setNewPassword(v);
                          let score = 0;
                          if (v.length >= 8) score++;
                          if (/[A-Z]/.test(v)) score++;
                          if (/[0-9]/.test(v)) score++;
                          if (/[!@#$%^&*(),.?":{}|<>]/.test(v)) score++;
                          const label = score <= 1 ? 'Very Weak' : score === 2 ? 'Weak' : score === 3 ? 'Good' : 'Strong';
                          setPwStrength({ score, label });
                        }}
                        placeholder="Create a strong password"
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
                    <div className="mt-2 space-y-2">
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-[#b0b0b0]">Strength: <span className={`font-semibold ${pwStrength.score >= 3 ? 'text-green-500' : pwStrength.score === 2 ? 'text-yellow-400' : 'text-red-500'}`}>{pwStrength.label}</span></div>
                      <div className="w-full bg-gray-200 dark:bg-[#3a3a3a] h-2 rounded">
                        <div className={`h-2 rounded ${pwStrength.score >= 3 ? 'bg-green-500' : pwStrength.score === 2 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${(pwStrength.score/4)*100}%` }} />
                      </div>
                    </div>
                    {errors.newPassword && <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-2">{errors.newPassword}</p>}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-[#5e5e5eff] dark:text-[#b0b0b0] font-bold mb-2 text-sm">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-[#ef4d31ff] dark:text-[#ff6b35] w-5 h-5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-[#3a3a3a] rounded-lg bg-white dark:bg-[#1a1a1a] text-[#1c1c1c] dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#ef4d31ff] dark:focus:ring-[#ff6b35] text-sm transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((s) => !s)}
                        className="absolute right-3 top-3 text-gray-600 dark:text-[#b0b0b0] hover:text-gray-800 dark:hover:text-[#e0e0e0] transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-2">{errors.confirmPassword}</p>}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#f74b25ff] to-[#ff6b35] dark:from-[#ff6b35] dark:to-[#ff8555] text-white py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-[#f74b25ff]/50 dark:hover:shadow-[#ff6b35]/50 font-bold transition text-sm sm:text-base disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-[#3a3a3a]">
                  <Link href="/login" className="flex items-center justify-center text-[#ef4d31ff] dark:text-[#ff6b35] hover:underline font-medium text-sm transition">
                    Back to login
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CheckCircle className="w-16 h-16 text-green-500 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black mb-3 epilogue dark:text-[#f7f7f7]">
                    Password <span className="text-[#ef4d31ff] dark:text-[#ff6b35]">Reset!</span>
                  </h2>
                  <p className="text-[#5e5e5eff] dark:text-[#b0b0b0] poppins text-sm sm:text-base mb-8">
                    Your password has been successfully reset. You can now log in with your new password.
                  </p>

                  <Link href="/login" className="inline-block w-full bg-gradient-to-r from-[#f74b25ff] to-[#ff6b35] dark:from-[#ff6b35] dark:to-[#ff8555] text-white py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-[#f74b25ff]/50 dark:hover:shadow-[#ff6b35]/50 font-bold transition text-sm sm:text-base">
                    Go to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResetPassword;
