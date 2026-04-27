"use client"

import { useLanguage } from "@/context/LanguageContext";
import { Home as HomeIcon } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import Image from "next/image";

export default function Footer() {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
      <div className="container-wide px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">

          {/* Logo & Info */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => window.location.href = "/"}>
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
                <HomeIcon size={18} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary-dark uppercase">PROPYOURS</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
              <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">101</span>
              <span>PropYours Premium Real Estate</span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 flex-1">
            <div className="space-y-4">
              <h5 className="font-bold text-gray-900 text-sm">Company</h5>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-primary">About Us</a></li>
                <li><a href="#" className="hover:text-primary">Careers</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-bold text-gray-900 text-sm">Services</h5>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-primary">Buy Home</a></li>
                <li><a href="#" className="hover:text-primary">Sell Property</a></li>
                <li><a href="#" className="hover:text-primary">Designers</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-bold text-gray-900 text-sm">Quick Links</h5>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-primary">Chennai</a></li>
                <li><a href="#" className="hover:text-primary">OMR</a></li>
                <li><a href="#" className="hover:text-primary">ECR</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-bold text-gray-900 text-sm">Quick Links</h5>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-primary">Featured</a></li>
                <li><a href="#" className="hover:text-primary">New Launch</a></li>
                <li><a href="#" className="hover:text-primary">Popular</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-bold text-gray-900 text-sm">Connect</h5>
              <div className="flex items-center gap-4 text-gray-400">
                <FaFacebook size={20} className="hover:text-primary cursor-pointer transition-colors" />
                <FaInstagram size={20} className="hover:text-primary cursor-pointer transition-colors" />
                <FaTwitter size={20} className="hover:text-primary cursor-pointer transition-colors" />
                <FaLinkedin size={20} className="hover:text-primary cursor-pointer transition-colors" />
              </div>
            </div>
          </div>

          {/* App Store Buttons */}
          <div className="flex flex-col gap-3">
            <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-zinc-800 transition-colors w-44 h-12 relative overflow-hidden group border border-zinc-800">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Google Play"
                fill
                className="object-contain p-2"
              />
            </div>
            <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-zinc-800 transition-colors w-44 h-12 relative overflow-hidden group border border-zinc-800">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                alt="App Store"
                fill
                className="object-contain p-2"
              />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2026 Propyours Real Estate Solutions India Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6 font-medium">
            <a href="#" className="hover:text-gray-600">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}