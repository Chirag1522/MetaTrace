"use client";
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, Lock, Zap, CheckCircle, ChevronDown, Moon, Sun } from 'lucide-react';
import Footer from '@/components/Footer';

const Home = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    // Apply dark class to html element
    if (typeof document !== 'undefined') {
      if (savedDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [mounted]);

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

  const faqs = [
    {
      id: 1,
      question: "What is MetaTrace?",
      answer: "MetaTrace is a secure platform for file authentication, metadata extraction, and blockchain-based verification. It helps you authenticate files and store metadata immutably."
    },
    {
      id: 2,
      question: "Do I need to connect my wallet?",
      answer: "No, wallet connection is optional. You can use MetaTrace without connecting MetaMask. The wallet feature is available after login for advanced features."
    },
    {
      id: 3,
      question: "Is my data secure?",
      answer: "Yes, we use encryption, JWT tokens, secure databases, and best security practices. Your private keys are never exposed. Metadata can be stored both in database and on blockchain."
    },
    {
      id: 4,
      question: "What file types are supported?",
      answer: "We support images (JPG, PNG, GIF, SVG), documents (PDF, DOC, DOCX), spreadsheets (XLS, XLSX, CSV), videos (MP4, WebM, MOV), audio (MP3, WAV, OGG), and compressed files (ZIP, TAR, GZ)."
    },
    {
      id: 5,
      question: "Can I access files from multiple devices?",
      answer: "Yes! Login with your account from any device to access your uploaded files and analysis results. Your data is synced across devices."
    }
  ];

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-[#ef4d31ff]" />,
      title: "Tamper Detection",
      description: "Advanced AI algorithm detects any file modifications or tampering attempts."
    },
    {
      icon: <Lock className="w-8 h-8 text-[#ef4d31ff]" />,
      title: "Secure Storage",
      description: "Files stored securely with IPFS and blockchain verification for immutability."
    },
    {
      icon: <Zap className="w-8 h-8 text-[#ef4d31ff]" />,
      title: "Instant Analysis",
      description: "Get comprehensive metadata analysis and recommendations in seconds."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-[#ef4d31ff]" />,
      title: "Public Verification",
      description: "Share blockchain proof with others for public file verification."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Create Account",
      description: "Sign up with your email to get started quickly and securely."
    },
    {
      num: "02",
      title: "Upload File",
      description: "Select or drag-drop your file to begin authentication process."
    },
    {
      num: "03",
      title: "View Analysis",
      description: "Receive detailed metadata insights and tamper detection results."
    },
    {
      num: "04",
      title: "Share Proof",
      description: "Share blockchain proof or store in cloud for verification."
    }
  ];

  return (
    <>
      <Head>
        <title>MetaTrace - File Authentication & Metadata Analysis</title>
        <meta name="description" content="Secure file authentication, metadata extraction, and blockchain verification" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-[#f7f7f7ff] to-[#f0f0f0] dark:bg-gradient-to-b dark:from-[#1a1a1a] dark:to-[#0f0f0f] transition-colors duration-300">
        {/* Navigation */}
        <nav className="bg-[#f74b25ff] dark:bg-[#2a2a2a] text-[#001215] dark:text-[#e0e0e0] p-4 md:p-6 sticky top-0 z-50 shadow-lg transition-colors duration-300">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Image 
                src="/metatrace.png" 
                alt="MetaTrace Logo" 
                width={40} 
                height={40}
                className="rounded-lg"
              />
              <h1 className="font-black text-lg md:text-2xl epilogue hidden sm:block dark:text-[#f7f7f7]">MetaTrace</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-[#ffffff33] dark:hover:bg-[#3a3a3a] transition"
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} className="text-[#001215]" />}
              </button>
              <Link href="/login">
                <button className="px-4 py-2 bg-[#001215] dark:bg-[#2a2a2a] text-[#f7f7f7] dark:text-[#e0e0e0] rounded-lg hover:bg-[#1a1a1aff] dark:hover:bg-[#3a3a3a] transition text-sm md:text-base font-semibold">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-4 py-2 bg-[#0b6623] dark:bg-[#0a5220] text-white rounded-lg hover:bg-[#0a5220] dark:hover:bg-[#084018] transition text-sm md:text-base font-semibold">
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-4 md:px-6 py-12 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Hero Text */}
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black epilogue text-[#001215] dark:text-[#f7f7f7] leading-tight">
                  Secure File <span className="text-[#f74b25ff] dark:text-[#ff6b35]">Authentication</span> Made Simple
                </h2>
                <p className="text-base md:text-lg text-[#5e5e5eff] dark:text-[#b0b0b0] poppins">
                  Verify file authenticity, extract metadata, and store proof on blockchain. Optional wallet integration for advanced features.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/signup">
                    <button className="w-full sm:w-auto px-8 py-3 bg-[#f74b25ff] dark:bg-[#ff6b35] text-white rounded-lg hover:bg-[#bf3e27] dark:hover:bg-[#ff8555] transition font-semibold text-sm md:text-base">
                      Get Started Free
                    </button>
                  </Link>
                  <button className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-[#2a2a2a] border-2 border-[#001215] dark:border-[#b0b0b0] text-[#001215] dark:text-[#e0e0e0] rounded-lg hover:bg-[#f0f0f0] dark:hover:bg-[#3a3a3a] transition font-semibold text-sm md:text-base">
                    Learn More
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-sm text-[#5e5e5eff] dark:text-[#b0b0b0]">
                  <CheckCircle size={20} className="text-[#0b6623]" />
                  <span>No credit card required</span>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative h-80 md:h-96">
                <div className="absolute inset-0 bg-gradient-to-br from-[#f74b25ff] to-[#ef4d31ff] dark:from-[#2a2a2a] dark:to-[#1a1a1a] rounded-2xl opacity-20 blur-3xl"></div>
                <Image
                  src="/landing_page/hero-section.png"
                  alt="Hero Section"
                  fill
                  className="object-contain relative z-10"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 md:px-6 py-12 md:py-24 bg-white dark:bg-[#1a1a1a] transition-colors duration-300">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black epilogue text-[#001215] dark:text-[#f7f7f7] mb-4">
                Powerful <span className="text-[#f74b25ff] dark:text-[#ff6b35]">Features</span>
              </h3>
              <p className="text-[#5e5e5eff] dark:text-[#b0b0b0] poppins text-sm md:text-base max-w-2xl mx-auto">
                Everything you need to authenticate files and verify their integrity
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-[#f7f7f7ff] dark:bg-[#2a2a2a] hover:shadow-lg dark:hover:shadow-[0_0_15px_rgba(255,107,53,0.3)] transition duration-300"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h4 className="text-lg font-bold epilogue text-[#001215] dark:text-[#f7f7f7] mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-[#5e5e5eff] dark:text-[#b0b0b0] poppins text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-4 md:px-6 py-12 md:py-24 dark:bg-[#0f0f0f] transition-colors duration-300">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black epilogue text-[#001215] dark:text-[#f7f7f7] mb-4">
                How It <span className="text-[#f74b25ff] dark:text-[#ff6b35]">Works</span>
              </h3>
              <p className="text-[#5e5e5eff] dark:text-[#b0b0b0] poppins text-sm md:text-base max-w-2xl mx-auto">
                Simple 4-step process to authenticate your files
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
              {steps.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="bg-[#f74b25ff] dark:bg-[#ff6b35] text-white rounded-full w-16 h-16 flex items-center justify-center font-black text-2xl epilogue mx-auto mb-4">
                    {step.num}
                  </div>
                  <h4 className="text-center font-bold epilogue text-[#001215] dark:text-[#f7f7f7] mb-2 text-lg">
                    {step.title}
                  </h4>
                  <p className="text-center text-[#5e5e5eff] dark:text-[#b0b0b0] poppins text-sm">
                    {step.description}
                  </p>
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 right-0 w-full">
                      <ChevronDown className="w-6 h-6 text-[#f74b25ff] dark:text-[#ff6b35] mx-auto -translate-y-2 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Wallet Section */}
        <section className="px-4 md:px-6 py-12 md:py-24 bg-[#f7f7f7ff] dark:bg-[#1a1a1a] transition-colors duration-300">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black epilogue text-[#001215] dark:text-[#f7f7f7]">
                Optional <span className="text-[#f74b25ff] dark:text-[#ff6b35]">Wallet Integration</span>
              </h3>
              <p className="text-[#5e5e5eff] dark:text-[#b0b0b0] poppins text-sm md:text-base">
                Connect your MetaMask wallet after login to store file metadata on blockchain. 
                Wallet connection is completely optional - use MetaTrace without it!
              </p>
              <ul className="space-y-3">
                {[
                  "Connect MetaMask after login",
                  "Store proof on blockchain",
                  "Create immutable records",
                  "Share verification publicly"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-3 text-[#001215] dark:text-[#e0e0e0]">
                    <CheckCircle size={20} className="text-[#0b6623] flex-shrink-0" />
                    <span className="poppins text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-4 md:px-6 py-12 md:py-24 bg-white dark:bg-[#0f0f0f] transition-colors duration-300">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black epilogue text-[#001215] dark:text-[#f7f7f7] mb-12 text-center">
              Frequently Asked <span className="text-[#f74b25ff] dark:text-[#ff6b35]">Questions</span>
            </h3>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-[#e0e0e0] dark:border-[#3a3a3a] rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full px-6 py-4 text-left bg-white dark:bg-[#1a1a1a] hover:bg-[#f7f7f7ff] dark:hover:bg-[#2a2a2a] transition flex justify-between items-center"
                  >
                    <span className="font-bold epilogue text-[#001215] dark:text-[#f7f7f7] text-sm md:text-base">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`text-[#f74b25ff] dark:text-[#ff6b35] transition ${
                        expandedFaq === faq.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-6 py-4 bg-[#f7f7f7ff] dark:bg-[#2a2a2a] border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
                      <p className="text-[#5e5e5eff] dark:text-[#b0b0b0] poppins text-sm md:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 md:px-6 py-12 md:py-24 bg-gradient-to-r from-[#f74b25ff] to-[#ef4d31ff] dark:from-[#2a2a2a] dark:to-[#1a1a1a] dark:border-t dark:border-[#3a3a3a] transition-colors duration-300">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black epilogue text-white dark:text-[#f7f7f7]">
              Ready to Authenticate Your Files?
            </h3>
            <p className="text-white dark:text-[#b0b0b0] poppins text-sm md:text-lg opacity-90 max-w-2xl mx-auto">
              Join thousands of users who trust MetaTrace for secure file authentication
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-[#2a2a2a] text-[#f74b25ff] dark:text-[#ff6b35] rounded-lg hover:bg-[#f0f0f0] dark:hover:bg-[#3a3a3a] transition font-semibold text-sm md:text-base">
                  Get Started Free
                </button>
              </Link>
              <Link href="/login">
                <button className="w-full sm:w-auto px-8 py-3 bg-transparent border-2 border-white dark:border-[#b0b0b0] text-white dark:text-[#e0e0e0] rounded-lg hover:bg-white dark:hover:bg-opacity-10 hover:bg-opacity-10 transition font-semibold text-sm md:text-base">
                  Already a Member? Login
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default Home;
