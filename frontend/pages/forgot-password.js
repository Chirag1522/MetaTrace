"use client";
import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { ArrowRight, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = {};

    // Client-side validation
    if (!email) {
      formErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = "Please enter a valid email.";
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ email: data.message || "Failed to send reset email. Please try again." });
      } else {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ email: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>MetaTrace | Forgot Password</title>
      </Head>
      <div className="flex justify-center items-center min-h-screen bg-[#dfdfdf] dark:bg-[#1a1a1a] p-4 transition-colors duration-300">
        <div className="w-full max-w-4xl bg-[#f7f7f7ff] dark:bg-[#2a2a2a] rounded-lg shadow-lg flex flex-col md:flex-row md:h-[550px] transition-colors duration-300">
          {/* Image Section - Hidden on Mobile */}
          <div className="hidden md:flex w-full md:w-1/2 h-64 md:h-full relative justify-center items-center bg-gradient-to-br from-[#f74b25ff] to-[#ff6b35] dark:from-[#ff6b35] dark:to-[#ff8555]">
            <div className="text-center text-white">
              <Mail className="w-24 h-24 mx-auto mb-4 opacity-80" />
              <h3 className="text-3xl font-bold mb-2 epilogue">Password Reset</h3>
              <p className="text-white/80 poppins">We'll send you a link to reset your password</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-6 sm:px-8 py-8 md:py-12">
            {!submitted ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-black mb-2 epilogue dark:text-[#f7f7f7]">
                    Forgot Your <span className="text-[#ef4d31ff] dark:text-[#ff6b35]">Password?</span>
                  </h2>
                  <p className="text-[#5e5e5eff] dark:text-[#b0b0b0] poppins text-sm sm:text-base">
                    No worries! Enter your email address and we'll send you a link to reset it.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className='poppins space-y-6'>
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

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#f74b25ff] to-[#ff6b35] dark:from-[#ff6b35] dark:to-[#ff8555] text-white py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-[#f74b25ff]/50 dark:hover:shadow-[#ff6b35]/50 font-bold transition text-sm sm:text-base disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-[#3a3a3a]">
                  <Link href="/login" className="flex items-center justify-center text-[#ef4d31ff] dark:text-[#ff6b35] hover:underline font-medium text-sm transition">
                    <ArrowLeft className="w-4 h-4 mr-2" />
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
                    Check Your <span className="text-[#ef4d31ff] dark:text-[#ff6b35]">Email!</span>
                  </h2>
                  <p className="text-[#5e5e5eff] dark:text-[#b0b0b0] poppins text-sm sm:text-base mb-6">
                    We've sent a password reset link to <strong className="text-[#1c1c1c] dark:text-[#e0e0e0]">{email}</strong>
                  </p>
                  <p className="text-[#5e5e5eff] dark:text-[#b0b0b0] poppins text-xs sm:text-sm mb-8">
                    If you don't see the email, check your spam folder or try again.
                  </p>

                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setEmail('');
                    }}
                    className="w-full bg-gradient-to-r from-[#f74b25ff] to-[#ff6b35] dark:from-[#ff6b35] dark:to-[#ff8555] text-white py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-[#f74b25ff]/50 dark:hover:shadow-[#ff6b35]/50 font-bold transition text-sm sm:text-base mb-4"
                  >
                    Try Another Email
                  </button>

                  <Link href="/login" className="flex items-center justify-center text-[#ef4d31ff] dark:text-[#ff6b35] hover:underline font-medium text-sm transition">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
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

export default ForgotPassword;
