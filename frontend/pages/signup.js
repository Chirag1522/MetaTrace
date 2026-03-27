"use client";
import React, { useState } from 'react';
import Head from 'next/head';
import { ArrowRight, User, Mail, Lock, Eye, EyeOff, CheckCircle, Rocket } from "lucide-react";
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwStrength, setPwStrength] = useState({ score: 0, label: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
  
    const formErrors = {};
  
    if (!name) formErrors.name = "Name is required.";
    if (!email) {
      formErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = "Please enter a valid email.";
    }
    if (!password) {
      formErrors.password = "Password is required.";
    } else if (password.length < 8) {
      formErrors.password = "Password must be at least 8 characters.";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      formErrors.password = "Password must contain at least one special character.";
    }
    if (confirmPassword !== password) {
      formErrors.confirmPassword = "Passwords do not match.";
    }
  
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // enforce minimal strength on client-side
    if (pwStrength.score < 2) {
      setErrors({ password: 'Please choose a stronger password.' });
      return;
    }

    
    if (Object.keys(formErrors).length === 0) {
      setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setErrors({ email: data.error || "Signup failed." }); // Display API error
      } else {
        console.log("Registration Successful: ", data);
        router.push("/login"); // Redirect to upload page on success
      }
    } catch (error) {
      console.error("Signup Error:", error);
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }
  };  

  return (
    <>
      <Head>
        <title>MetaTrace | Sign Up</title>
      </Head>
      <div className="flex justify-center items-center min-h-screen bg-[#dfdfdf] dark:bg-[#1a1a1a] p-4 transition-colors duration-300">
        <div className="w-full max-w-4xl bg-[#f7f7f7ff] dark:bg-[#2a2a2a] rounded-lg shadow-lg flex flex-col md:flex-row md:h-[650px] transition-colors duration-300">
          {/* Image Section - Hidden on Mobile */}
          <div className="hidden md:flex w-full md:w-1/2 h-64 md:h-full relative justify-center items-center bg-gradient-to-br from-[#f74b25ff] to-[#ff6b35] dark:from-[#ff6b35] dark:to-[#ff8555]">
            <Link href="/" className='poppins font-semibold text-white'>
              <button
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm py-2 px-4 rounded-lg hover:bg-white/30 flex items-center space-x-2 z-10 text-sm transition-colors"
              >
                <span>MetaTrace</span>
                <ArrowRight size={18} />
              </button>
            </Link>
            <div className="text-center text-white space-y-6">
              <div className="flex justify-center">
                <div className="p-6 bg-white/20 rounded-full backdrop-blur-sm">
                  <Rocket size={64} strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-2 epilogue">Get Started</h3>
                <p className="text-white/80 poppins text-sm">Join MetaTrace and explore metadata insights</p>
              </div>
            </div>
          </div>
          </div>
          {/* Form Section */}
          <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-6 sm:px-8 py-8 md:py-12 md:pl-8 md:pr-8 overflow-y-auto max-h-[600px]">
            <h2 className="text-xl sm:text-2xl font-black mb-2 epilogue dark:text-[#f7f7f7]">Join <strong className='text-[#ef4d31ff] dark:text-[#ff6b35]'>MetaTrace</strong> Today</h2>
            <p className="text-[#5e5e5eff] dark:text-[#b0b0b0] mb-6 poppins text-sm sm:text-base">Unlock the power of metadata visualization and insights.</p>
            <form onSubmit={handleSubmit} className='poppins space-y-4'>
              <div>
                <label htmlFor="name" className="block text-[#5e5e5eff] dark:text-[#b0b0b0] font-bold mb-2 text-sm">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-[#ef4d31ff] dark:text-[#ff6b35] w-5 h-5" />
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-[#3a3a3a] rounded-lg bg-white dark:bg-[#1a1a1a] text-[#1c1c1c] dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#ef4d31ff] dark:focus:ring-[#ff6b35] text-sm transition-colors"
                  />
                </div>
                {errors.name && <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-2">{errors.name}</p>}
              </div>
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
                <label htmlFor="password" className="block text-[#5e5e5eff] dark:text-[#b0b0b0] font-bold mb-2 text-sm">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-[#ef4d31ff] dark:text-[#ff6b35] w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPassword(v);
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
                {errors.password && <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-2">{errors.password}</p>}
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
              <div>
                <label className="inline-flex items-center text-sm">
                  <input
                    type="checkbox"
                    className="form-checkbox text-[#ef4d31ff] dark:text-[#ff6b35] focus:ring-2 focus:ring-[#ef4d31ff] dark:focus:ring-[#ff6b35]"
                  />
                  <span className="ml-2 text-[#5e5e5eff] dark:text-[#b0b0b0]">
                    I agree to the <span className='text-[#f74b25ff] dark:text-[#ff6b35] underline hover:text-[#bf3e27] dark:hover:text-[#ff8555]'>terms and conditions</span>
                  </span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#f74b25ff] to-[#ff6b35] dark:from-[#ff6b35] dark:to-[#ff8555] text-white py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-[#f74b25ff]/50 dark:hover:shadow-[#ff6b35]/50 font-bold transition mt-6 text-sm sm:text-base disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Signing up..." : "Sign Up"}
              </button>
            </form>
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-[#3a3a3a]">
              <p className="text-center text-[#5e5e5eff] dark:text-[#b0b0b0] epilogue font-medium text-sm sm:text-base">
                Already have an account?{' '}
                <a href="/login" className="text-[#f74b25ff] dark:text-[#ff6b35] hover:underline hover:text-[#bf3e27] dark:hover:text-[#ff8555] font-bold transition">
                  Log in
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

export default Signup;