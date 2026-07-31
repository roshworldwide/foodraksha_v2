import React from "react";
import EligibilityChecker from "./EligibilityChecker";

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-brandBg via-blue-50/30 to-brandBg pb-16 pt-8 lg:pt-16" id="home">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className="inline-flex items-center gap-2.5 bg-white/80 backdrop-blur-sm border border-gray-200/70 px-4 py-2 rounded-full text-xs font-semibold text-gray-700 mb-8 shadow-sm"
          data-aos="fade-up"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brandGreen opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brandGreen"></span>
          </span>
          <span>India's Leading FSSAI Compliance Partner</span>
          <span className="text-brandGreen font-bold">★ 4.9/5</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6" data-aos="fade-right">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-brandDark leading-[1.1] tracking-tight font-heading">
              Powering <span className="gradient-text">Safe Food.</span>
              <br />
              Building <span className="underline-swoosh">Trusted</span> Brands.
            </h1>
            <p className="text-base sm:text-lg text-brandMuted font-medium max-w-xl leading-relaxed">
              From FSSAI Registration to Compliance Audits & Food Safety Training — we make the entire process{" "}
              <strong className="text-brandDark">simple, fast, and 100% hassle-free</strong>.
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-700">
              <span className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-gray-100">
                <i className="fa-solid fa-check-circle text-brandGreen"></i> Govt. Authorized
              </span>
              <span className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-gray-100">
                <i className="fa-solid fa-bolt text-amber-500"></i> 24-Hour Processing
              </span>
              <span className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-gray-100">
                <i className="fa-solid fa-lock text-brandBlue"></i> 100% Secure
              </span>
            </div>

            <EligibilityChecker />
          </div>

          <div className="lg:col-span-6 relative" data-aos="fade-left">
            <div className="relative bg-gradient-to-b from-blue-50/50 to-transparent rounded-3xl p-4 sm:p-8">
              <div className="flex justify-end mb-6">
                <div className="bg-white border border-gray-100 shadow-lg px-5 py-2.5 rounded-full inline-flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-brandGreen flex items-center justify-center text-xs">
                    <i className="fa-solid fa-shield-check"></i>
                  </div>
                  <span className="text-xs font-semibold text-gray-600">
                    Trusted by <strong className="text-gray-900 font-extrabold">10,000+</strong> Businesses
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xl card-hover-lift">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-brandBlue flex items-center justify-center mb-3">
                    <i className="fa-solid fa-store"></i>
                  </div>
                  <p className="text-xs font-bold text-gray-800">Businesses Licensed</p>
                  <p className="text-2xl lg:text-3xl font-extrabold text-brandDark mt-2">
                    25,386<span className="text-brandBlue">+</span>
                  </p>
                  <p className="text-[11px] text-gray-400">Across 28 States</p>
                  <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end">
                    <span className="bg-badgeGreenBg text-brandGreen text-[11px] font-bold px-2.5 py-1 rounded-full">
                      <i className="fa-solid fa-arrow-trend-up"></i> +12%
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xl card-hover-lift">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-brandGreen flex items-center justify-center mb-3">
                    <i className="fa-solid fa-clipboard-check"></i>
                  </div>
                  <p className="text-xs font-bold text-gray-800">Active Audits</p>
                  <p className="text-2xl lg:text-3xl font-extrabold text-brandDark mt-2">
                    1,248<span className="text-brandGreen">+</span>
                  </p>
                  <p className="text-[11px] text-gray-400">Live & Ongoing</p>
                  <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end">
                    <span className="bg-badgeGreenBg text-brandGreen text-[11px] font-bold px-2.5 py-1 rounded-full">
                      <i className="fa-solid fa-arrow-trend-up"></i> +18%
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xl card-hover-lift">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                    <i className="fa-solid fa-wheat-awn"></i>
                  </div>
                  <p className="text-xs font-bold text-gray-800">Food Certified</p>
                  <p className="text-2xl lg:text-3xl font-extrabold text-brandDark mt-2">
                    3.62M<span className="text-orange-500">+</span>
                  </p>
                  <p className="text-[11px] text-gray-400">Metric Tons</p>
                  <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end">
                    <span className="bg-badgeGreenBg text-brandGreen text-[11px] font-bold px-2.5 py-1 rounded-full">
                      <i className="fa-solid fa-arrow-trend-up"></i> +15%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <span className="inline-flex items-center gap-2 text-xs text-gray-500 bg-white/70 px-4 py-2 rounded-full shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-brandGreen animate-pulse"></span>
                  Real-time data • Last updated: Just now
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}