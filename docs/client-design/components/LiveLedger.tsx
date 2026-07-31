"use client";

import React, { useRef } from "react";

export default function LiveLedger() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -220, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 220, behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 lg:py-20 bg-white" id="ledger">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 bg-brandBlueLight text-brandBlue px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase mb-5">
            <span className="w-2 h-2 rounded-full bg-liveDot pulse-live-dot"></span> Live Operations
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brandDark leading-tight font-heading">
            Real-Time <span className="gradient-text">Compliance Operations</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-aos="fade-up">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-stat-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-blueStatBg text-blueStat flex items-center justify-center text-2xl">
                <i className="fa-solid fa-shield-check"></i>
              </div>
              <span className="text-base font-bold">Businesses Licensed</span>
            </div>
            <h3 className="text-4xl font-extrabold text-blueStat">25,386+</h3>
            <p className="text-sm text-gray-500">Across India</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-stat-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-greenStatBg text-greenStat flex items-center justify-center text-2xl">
                <i className="fa-solid fa-clipboard-check"></i>
              </div>
              <span className="text-base font-bold">Active Audits</span>
            </div>
            <h3 className="text-4xl font-extrabold text-greenStat">1,248+</h3>
            <p className="text-sm text-gray-500">Live & Ongoing</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-stat-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-orangeStatBg text-orangeStat flex items-center justify-center text-2xl">
                <i className="fa-solid fa-box-open"></i>
              </div>
              <span className="text-base font-bold">Food Certified</span>
            </div>
            <h3 className="text-4xl font-extrabold text-orangeStat">3.62M+</h3>
            <p className="text-sm text-gray-500">Metric Tons</p>
          </div>
        </div>

        {/* Live Operations Ledger */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden" data-aos="fade-up">
          <div className="bg-ledgerNavy px-6 py-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
            <div className="flex flex-wrap items-center gap-3.5">
              <span className="bg-livePill text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-liveDot pulse-live-dot"></span> LIVE
              </span>
              <h3 className="text-lg sm:text-xl font-bold">FSSAI Operations Ledger</h3>
              <p className="text-xs text-blue-100/80">Real-time updates</p>
            </div>
            <a href="#" className="border border-white/30 hover:bg-white/10 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition inline-flex items-center gap-2">
              View All Updates <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </a>
          </div>

          <div className="relative px-2 py-6 sm:px-4">
            <button
              onClick={scrollLeft}
              className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg text-gray-600 flex items-center justify-center text-sm z-20 hover:bg-brandBlue hover:text-white transition"
              aria-label="Previous"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            <div
              ref={carouselRef}
              className="carousel-container flex overflow-x-auto gap-0 snap-x snap-mandatory scroll-smooth"
            >
              <div className="flex flex-nowrap min-w-full">
                <div className="carousel-item p-5 flex flex-col justify-between space-y-3 min-w-[200px] sm:min-w-[220px] flex-shrink-0 snap-start border-r border-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-greenStatBg text-greenStat flex items-center justify-center text-sm">
                      <i className="fa-solid fa-file-signature"></i>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-greenStat pulse-live-dot"></span> 2 min ago
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-brandDark">State License Filed for Dairy Plant</h4>
                  <p className="text-[11px] text-gray-400"><i className="fa-solid fa-location-dot mr-1"></i>Pune, MH</p>
                </div>

                <div className="carousel-item p-5 flex flex-col justify-between space-y-3 min-w-[200px] sm:min-w-[220px] flex-shrink-0 snap-start border-r border-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blueStatBg text-blueStat flex items-center justify-center text-sm">
                      <i className="fa-solid fa-award"></i>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-greenStat pulse-live-dot"></span> 5 min ago
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-brandDark">Central License Approved</h4>
                  <p className="text-[11px] text-gray-400"><i className="fa-solid fa-location-dot mr-1"></i>Chennai, TN</p>
                </div>

                <div className="carousel-item p-5 flex flex-col justify-between space-y-3 min-w-[200px] sm:min-w-[220px] flex-shrink-0 snap-start border-r border-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
                      <i className="fa-solid fa-store"></i>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-greenStat pulse-live-dot"></span> 8 min ago
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-brandDark">FSSAI Registration Completed</h4>
                  <p className="text-[11px] text-gray-400"><i className="fa-solid fa-location-dot mr-1"></i>Ahmedabad, GJ</p>
                </div>

                <div className="carousel-item p-5 flex flex-col justify-between space-y-3 min-w-[200px] sm:min-w-[220px] flex-shrink-0 snap-start border-r border-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-orangeStatBg text-orangeStat flex items-center justify-center text-sm">
                      <i className="fa-solid fa-clipboard-check"></i>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-greenStat pulse-live-dot"></span> 12 min ago
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-brandDark">Pre-License Audit Completed</h4>
                  <p className="text-[11px] text-gray-400"><i className="fa-solid fa-location-dot mr-1"></i>Kolkata, WB</p>
                </div>

                <div className="carousel-item p-5 flex flex-col justify-between space-y-3 min-w-[200px] sm:min-w-[220px] flex-shrink-0 snap-start">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
                      <i className="fa-solid fa-shield-circle-check"></i>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-greenStat pulse-live-dot"></span> 15 min ago
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-brandDark">Renewal Approved Successfully</h4>
                  <p className="text-[11px] text-gray-400"><i className="fa-solid fa-location-dot mr-1"></i>Hyderabad, TS</p>
                </div>
              </div>
            </div>

            <button
              onClick={scrollRight}
              className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg text-gray-600 flex items-center justify-center text-sm z-20 hover:bg-brandBlue hover:text-white transition"
              aria-label="Next"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs font-medium text-gray-500">
            <i className="fa-regular fa-shield-check mr-2"></i>Updates are anonymized to protect client confidentiality
          </p>
        </div>
      </div>
    </section>
  );
}