"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  Camera,
  ShieldCheck,
  Zap,
  Home as HomeIcon,
  Store,
  Layers,
  HeadphonesIcon,
  Building2,
  Menu
} from "lucide-react";

export default function SellPage() {
  return (
    <main className="flex-1 bg-white pt-24 font-body">
      {/* Hero Section - Mirrored from Home Page */}
      <section className="relative bg-[#fafafa] z-[60]">
        {/* Abstract Background Curve */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-0 right-0 h-full w-[60%] text-[#f0f5f5]" preserveAspectRatio="none" viewBox="0 0 100 100" fill="currentColor">
            <path d="M0,0 C40,40 20,100 100,100 L100,0 Z"></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 lg:pt-20 pb-0 relative z-30 flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-3/5 pr-0 lg:pr-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 font-heading"
            >
              Sell Property <span className="text-primary">Faster</span> & Better
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 mb-8 max-w-lg"
            >
              List your property for free, connect with verified buyers, and experience a seamless selling journey with Propyours.
            </motion.p>

            {/* CTA Container - Styled like Home Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative z-[100] mt-12 bg-white p-4 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row items-center gap-6 max-w-2xl"
            >
              <div className="flex-1 flex items-center gap-4 px-2">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Store size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">List for Free</h3>
                  <p className="text-xs text-gray-500">Takes less than 10 minutes</p>
                </div>
              </div>

              <Link
                href="/post-property"
                className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white rounded-xl px-10 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm shadow-primary/20"
              >
                Post Property Now
                <ArrowRight size={18} />
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex items-center gap-3 mt-8 flex-wrap"
            >
              <span className="text-sm text-gray-500 font-medium">Trusted by:</span>
              {["10k+ Owners", "500+ Brokers", "Verified Leads"].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] uppercase font-bold tracking-wider bg-white border border-gray-200 text-gray-400 px-3 py-1.5 rounded-full shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Hero Image - Mirrored Frame from Home Page */}
          <div className="w-full lg:w-2/5 mt-12 lg:mt-0 relative h-[450px]">
            <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border-4 border-white">
              <Image
                src="/sell-hero.png"
                alt="Modern Property"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Floating Info Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 max-w-[200px]"
            >
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                <Zap size={20} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Recent Sale</p>
                <p className="text-sm font-bold text-gray-900">Sold in 12 Days</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quick Process Bar - Mirrored from Home Quick Links */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-10 relative z-20 translate-y-12">
          <div className="bg-white rounded-[1.5rem] shadow-lg border border-gray-100 p-2 md:p-3 flex flex-col md:flex-row justify-between divide-y md:divide-y-0 md:divide-x divide-gray-100">

            <div className="flex items-center gap-3 px-4 py-3 md:py-1 hover:bg-gray-50 rounded-xl transition-colors flex-1">
              <div className="w-11 h-11 rounded-full bg-[#f0f7f7] flex items-center justify-center text-primary border border-primary/10 flex-shrink-0">
                <Camera size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">1. Post Details</h3>
                <p className="text-[10px] text-gray-500">Add photos & features</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 md:py-1 hover:bg-gray-50 rounded-xl transition-colors flex-1">
              <div className="w-11 h-11 rounded-full bg-[#f0f7f7] flex items-center justify-center text-primary border border-primary/10 flex-shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">2. Verification</h3>
                <p className="text-[10px] text-gray-500">Quality check by experts</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-3 md:py-1 hover:bg-gray-50 rounded-xl transition-colors flex-1">
              <div className="w-11 h-11 rounded-full bg-[#f5f0fb] flex items-center justify-center text-[#8a5bd6] border border-[#8a5bd6]/10 flex-shrink-0">
                <Store size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">3. Get Leads</h3>
                <p className="text-[10px] text-gray-500">Receive calls directly</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-3 md:py-1 hover:bg-gray-50 rounded-xl transition-colors flex-1">
              <div className="w-11 h-11 rounded-full bg-[#fffcf0] flex items-center justify-center text-[#d19b33] border border-[#d19b33]/10 flex-shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">4. Sold</h3>
                <p className="text-[10px] text-gray-500">Close the best deal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Mirrored from Home Trusted By */}
      <section className="bg-[#fafafa] pt-32 pb-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 font-heading">Why Owners Trust Us</h2>
              <p className="text-gray-500 mb-10 text-sm">Experience the most transparent selling journey in the market.</p>

              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Efficiency</h4>
                  <div className="flex items-center gap-8 justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">0%</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Brokerage</p>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">3.5x</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">More Views</p>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">24h</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Verification</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Reach</h4>
                  <div className="flex items-center gap-8 justify-start">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">10k+</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Active Buyers</p>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-black text-gray-900">1M+</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Monthly Traffic</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 font-heading">The Propyours Advantage</h3>
                  <p className="text-gray-500 text-sm">Professional tools to help you sell with confidence.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex gap-3">
                    <CheckCircle className="text-primary flex-shrink-0" size={24} />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Legal Support</h4>
                      <p className="text-xs text-gray-500">Paperwork handled.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Layers className="text-primary flex-shrink-0" size={24} />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Analytics</h4>
                      <p className="text-xs text-gray-500">Track your leads.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <HeadphonesIcon className="text-primary flex-shrink-0" size={24} />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Expert Advice</h4>
                      <p className="text-xs text-gray-500">Price guidance.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Mockup Section - Mirrored from Home */}
            <div className="hidden lg:block w-[400px] relative pointer-events-none">
              <div className="absolute top-0 right-10 w-[240px] h-[500px] bg-white rounded-[2.5rem] border-[8px] border-gray-900 shadow-2xl overflow-hidden z-20">
                <div className="w-1/2 h-5 bg-gray-900 absolute top-0 left-1/4 rounded-b-2xl"></div>
                <div className="h-full w-full bg-gray-50 flex flex-col relative">
                  <div className="h-14 bg-white border-b border-gray-100 flex items-center px-4 justify-between">
                    <div className="font-bold text-primary text-xs flex items-center gap-1"><HomeIcon size={12} /> PROPYOURS</div>
                    <Menu size={16} />
                  </div>
                  <div className="p-4 flex-1">
                    <div className="text-lg font-bold">Sell Your</div>
                    <div className="text-lg font-bold text-primary mb-2">Home Fast</div>
                    <div className="h-20 bg-gray-200 rounded-xl mb-4 w-full flex items-center justify-center text-gray-400 text-[10px]">LISTING PREVIEW</div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Clean & Minimal */}
      <section className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center font-heading">Common Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Is it really free to post?",
                a: "Yes, basic listing is completely free. We offer premium boosters for faster sales."
              },
              {
                q: "How do I handle buyer calls?",
                a: "Buyers call you directly. We provide a dashboard to manage all your leads."
              },
              {
                q: "What if I sold my property elsewhere?",
                a: "You can simply mark your property as 'Sold' or 'Inactive' from your dashboard anytime."
              }
            ].map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
