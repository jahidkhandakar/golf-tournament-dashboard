import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, ShieldCheck, Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-white border-b border-gray-100 py-20 lg:py-28">

      <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          <div className="lg:col-span-6 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200 mb-6">
              <Zap className="w-3.5 h-3.5 text-primary" />
              Smart Inventory & Supply Chain
            </span>

            <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 tracking-tight leading-tight sm:leading-none">
              Streamline your business <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-slate-800 to-gray-700">
                operations in one place.
              </span>
            </h1>


            <p className="mt-4 text-base sm:text-lg text-gray-500 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              A minimalist ERP engineered for modern suppliers, logistics partners, and exporters. Manage inventory, track orders, and monitor insights with zero friction.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="#"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="#"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all duration-200"
              >
                Documentation
              </Link>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-center lg:justify-start gap-6 text-xs text-gray-400 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Enterprise Security
              </div>
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-primary" /> Real-time Syncing
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="lg:col-span-6 hidden lg:block relative">
            <div className="bg-slate-50 border border-gray-200/80 rounded-xl p-5 shadow-sm max-w-[540px] ml-auto">

              <div className="flex items-center gap-1.5 mb-4 border-b border-gray-200/60 pb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                <span className="text-[11px] text-gray-400 font-medium ml-2">erp-system-v2.0</span>
              </div>

              <div className="space-y-3">
                <div className="h-8 bg-white border border-gray-100 rounded-md flex items-center justify-between px-3">
                  <div className="w-24 h-2 bg-gray-200 rounded" />
                  <div className="w-12 h-4 bg-emerald-50 border border-emerald-100 rounded text-[10px] text-emerald-600 font-semibold flex items-center justify-center">Active</div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="h-16 bg-white border border-gray-100 rounded-md p-3 flex flex-col justify-between">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Stock</span>
                    <span className="text-sm font-semibold text-gray-800">14,204 units</span>
                  </div>
                  <div className="h-16 bg-white border border-gray-100 rounded-md p-3 flex flex-col justify-between">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Orders</span>
                    <span className="text-sm font-semibold text-gray-800">182 Pending</span>
                  </div>
                  <div className="h-16 bg-white border border-gray-100 rounded-md p-3 flex flex-col justify-between">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Revenue</span>
                    <span className="text-sm font-semibold text-gray-800">$48.2k</span>
                  </div>
                </div>

                <div className="h-32 bg-white border border-gray-100 rounded-md p-3">
                  <div className="w-32 h-2 bg-gray-200 rounded mb-4" />
                  <div className="w-full h-16 flex items-end gap-1.5 pt-2">
                    <div className="w-full bg-gray-100 rounded-t h-[40%]" />
                    <div className="w-full bg-gray-100 rounded-t h-[65%]" />
                    <div className="w-full bg-gray-200 rounded-t h-[50%]" />
                    <div className="w-full bg-gray-900 rounded-t h-[85%]" />
                    <div className="w-full bg-gray-200 rounded-t h-[60%]" />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}