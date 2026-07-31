"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface NavbarProps {
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
}

export default function Navbar({ activeSection = "home", onNavigate }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(sectionId);
    }
  };

  return (
    <header
      className={`w-full bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 transition-shadow ${
        scrolled ? "shadow-md" : "shadow-sm"
      }`}
      id="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative overflow-visible">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick("home")}
          className="flex items-center space-x-3 cursor-pointer group text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brandBlue to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
            <i className="fa-solid fa-shield-halved text-xl"></i>
          </div>
          <div>
            <span className="text-xl font-extrabold text-brandBlue tracking-tight font-heading">
              Food<span className="text-brandGreen">Raksha</span>
            </span>
            <p className="text-[10px] text-gray-500 font-semibold tracking-widest uppercase -mt-1">
              Compliance. Simplified.
            </p>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center space-x-1 text-sm font-semibold text-gray-700">
          <button
            onClick={() => handleNavClick("home")}
            className={`px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-brandBlue transition-colors ${
              activeSection === "home" ? "text-brandBlue font-bold border-b-2 border-brandBlue" : ""
            }`}
          >
            Home
          </button>

          {/* Services Mega Menu */}
          <div className="group relative">
            <button
              onClick={() => handleNavClick("services")}
              className={`px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-brandBlue transition-colors flex items-center gap-1.5 ${
                activeSection === "services" ? "text-brandBlue font-bold border-b-2 border-brandBlue" : ""
              }`}
            >
              Services <i className="fa-solid fa-chevron-down text-[10px] text-gray-400 group-hover:text-brandBlue"></i>
            </button>

            {/* Mega Menu Dropdown */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-screen max-w-7xl hidden group-hover:block z-[9999] bg-white rounded-b-2xl shadow-2xl border border-gray-100 p-8 transition-all duration-200">
              <div className="grid grid-cols-4 gap-8 text-sm">
                {/* Column 1: License Services */}
                <div>
                  <h4 className="font-extrabold text-brandBlue mb-4 flex items-center gap-2 text-base">
                    <i className="fa-solid fa-file-certificate"></i> License Services
                  </h4>
                  <ul className="space-y-3 text-gray-700 font-medium text-xs">
                    <li><a href="#" className="hover:text-brandBlue block py-0.5 leading-relaxed">License classification, documentation & application</a></li>
                    <li><a href="#" className="hover:text-brandBlue block py-0.5 leading-relaxed">Follow-up & query response till conclusion</a></li>
                    <li><a href="#" className="hover:text-brandBlue block py-0.5 leading-relaxed">License modification application</a></li>
                    <li><a href="#" className="hover:text-brandBlue block py-0.5 leading-relaxed">Fortified / Organic / Vegan Endorsement</a></li>
                    <li><a href="#" className="hover:text-brandBlue block py-0.5 leading-relaxed">Annual Return Filing Guidance</a></li>
                    <li><a href="#" className="hover:text-brandBlue block py-0.5 leading-relaxed">License Renewal</a></li>
                  </ul>
                </div>

                {/* Column 2: Documentation Services */}
                <div>
                  <h4 className="font-extrabold text-brandGreen mb-4 flex items-center gap-2 text-base">
                    <i className="fa-solid fa-folder-tree"></i> Documentation
                  </h4>
                  <ul className="space-y-3 text-gray-700 font-medium text-xs">
                    <li><a href="#" className="hover:text-brandGreen block py-0.5 leading-relaxed">FSMS Documentation Checklist</a></li>
                    <li><a href="#" className="hover:text-brandGreen block py-0.5 leading-relaxed">Preparation & Verification by FRCC Team</a></li>
                    <li><a href="#" className="hover:text-brandGreen block py-0.5 leading-relaxed">On-field FSMS Implementation</a></li>
                    <li><a href="#" className="hover:text-brandGreen block py-0.5 leading-relaxed">FSSAI Post License Checklist</a></li>
                    <li><a href="#" className="hover:text-brandGreen block py-0.5 leading-relaxed">Import Clearance Query Responses</a></li>
                    <li><a href="#" className="hover:text-brandGreen block py-0.5 leading-relaxed">Annual Medical Exam Assistance</a></li>
                  </ul>
                </div>

                {/* Column 3: Facility & Product Compliance */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-extrabold text-brandPurple mb-3 flex items-center gap-2 text-base">
                      <i className="fa-solid fa-building-shield"></i> Facility Compliance
                    </h4>
                    <ul className="space-y-2 text-gray-700 font-medium text-xs">
                      <li><a href="#" className="hover:text-brandPurple block py-0.5">Internal Audit Field Visits</a></li>
                      <li><a href="#" className="hover:text-brandPurple block py-0.5">Facility Layout Audits</a></li>
                      <li><a href="#" className="hover:text-brandPurple block py-0.5">Third-Party FSSAI Audits</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-brandOrange mb-3 flex items-center gap-2 text-base">
                      <i className="fa-solid fa-flask"></i> Product Compliance
                    </h4>
                    <ul className="space-y-2 text-gray-700 font-medium text-xs">
                      <li><a href="#" className="hover:text-brandOrange block py-0.5">Labelling Guidance & Validation</a></li>
                      <li><a href="#" className="hover:text-brandOrange block py-0.5">Advertising & Claim Verification</a></li>
                      <li><a href="#" className="hover:text-brandOrange block py-0.5">Nutritional Value Testing / Calculation</a></li>
                    </ul>
                  </div>
                </div>

                {/* Column 4: Training & Legal Services */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-extrabold text-cyan-600 mb-3 flex items-center gap-2 text-base">
                      <i className="fa-solid fa-chalkboard-user"></i> Training & Lab
                    </h4>
                    <ul className="space-y-2 text-gray-700 font-medium text-xs">
                      <li><a href="#" className="hover:text-cyan-600 block py-0.5">Food Handler & Managerial Training</a></li>
                      <li><a href="#" className="hover:text-cyan-600 block py-0.5">Mandatory Water & Product Testing</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-red-600 mb-3 flex items-center gap-2 text-base">
                      <i className="fa-solid fa-scale-balanced"></i> Legal Services
                    </h4>
                    <ul className="space-y-2 text-gray-700 font-medium text-xs">
                      <li><a href="#" className="hover:text-red-600 block py-0.5">Regulatory Notices Response</a></li>
                      <li><a href="#" className="hover:text-red-600 block py-0.5">Adjudication & Prosecution Technical Support</a></li>
                      <li><a href="#" className="hover:text-red-600 block py-0.5">Product Recall & Seizure Support</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleNavClick("calculator")}
            className={`px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-brandBlue transition-colors flex items-center gap-1.5 ${
              activeSection === "calculator" ? "text-brandBlue font-bold border-b-2 border-brandBlue" : ""
            }`}
          >
            <i className="fa-solid fa-calculator"></i> Calculator
          </button>
          <button
            onClick={() => handleNavClick("enterprise")}
            className={`px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-brandBlue transition-colors flex items-center gap-1.5 ${
              activeSection === "enterprise" ? "text-brandBlue font-bold border-b-2 border-brandBlue" : ""
            }`}
          >
            <i className="fa-solid fa-building"></i> Enterprise
          </button>
          <button
            onClick={() => handleNavClick("sectors")}
            className={`px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-brandBlue transition-colors flex items-center gap-1.5 ${
              activeSection === "sectors" ? "text-brandBlue font-bold border-b-2 border-brandBlue" : ""
            }`}
          >
            <i className="fa-solid fa-industry"></i> Sectors
          </button>
          <button
            onClick={() => handleNavClick("videos")}
            className={`px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-brandBlue transition-colors flex items-center gap-1.5 ${
              activeSection === "videos" ? "text-brandBlue font-bold border-b-2 border-brandBlue" : ""
            }`}
          >
            <i className="fa-solid fa-video"></i> Videos
          </button>
        </nav>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="tel:+919999999999"
            className="text-sm font-medium text-gray-600 hover:text-brandBlue transition-colors flex items-center gap-1.5"
          >
            <i className="fa-solid fa-phone text-brandGreen"></i> +91 99999 99999
          </a>
          <button
            onClick={() => handleNavClick("home")}
            className="bg-brandBlue hover:bg-brandBlueHover text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 transition-all duration-300 flex items-center gap-2"
          >
            Get Started <i className="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden flex items-center text-gray-700 hover:text-brandBlue focus:outline-none p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <i className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"} text-2xl`}></i>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-2xl rounded-b-2xl">
          <div className="px-4 py-4 space-y-2">
            <button
              onClick={() => handleNavClick("home")}
              className="w-full text-left block px-4 py-3 rounded-xl hover:bg-gray-50 font-medium text-sm"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick("calculator")}
              className="w-full text-left block px-4 py-3 rounded-xl hover:bg-gray-50 font-medium text-sm"
            >
              Impact Calculator
            </button>
            <button
              onClick={() => handleNavClick("enterprise")}
              className="w-full text-left block px-4 py-3 rounded-xl hover:bg-gray-50 font-medium text-sm"
            >
              Enterprise Clients
            </button>
            <button
              onClick={() => handleNavClick("sectors")}
              className="w-full text-left block px-4 py-3 rounded-xl hover:bg-gray-50 font-medium text-sm"
            >
              Industry Sectors
            </button>
            <button
              onClick={() => handleNavClick("videos")}
              className="w-full text-left block px-4 py-3 rounded-xl hover:bg-gray-50 font-medium text-sm"
            >
              Video Case Studies
            </button>
            <button
              onClick={() => handleNavClick("home")}
              className="w-full text-center bg-brandBlue text-white px-4 py-3 rounded-xl font-semibold shadow-md text-sm mt-2"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}