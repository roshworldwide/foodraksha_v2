import React from "react";
import { services } from "@/data/services";

export default function ServicesSection() {
  return (
    <section className="py-16 lg:py-20 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12" data-aos="fade-up">
          <span className="text-xs font-bold uppercase tracking-widest text-brandBlue bg-brandBlueLight px-4 py-1.5 rounded-full">
            Our Services
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-brandDark mt-4 font-heading">
            Everything You Need for <span className="gradient-text">FSSAI Compliance</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg card-hover-lift group"
            data-aos="fade-up"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-brandBlue flex items-center justify-center text-2xl mb-5 group-hover:bg-brandBlue group-hover:text-white transition-all duration-300">
              <i className="fa-solid fa-file-certificate"></i>
            </div>
            <h3 className="font-bold text-lg text-brandDark mb-2">FSSAI Registration</h3>
            <p className="text-sm text-brandMuted leading-relaxed mb-4">
              Basic, State & Central licenses. Get your FSSAI number in as fast as 24 hours.
            </p>
            <a href="#" className="text-brandBlue font-semibold text-sm flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
              Learn More <i className="fa-solid fa-arrow-right text-xs"></i>
            </a>
          </div>

          <div
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg card-hover-lift group"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-brandGreen flex items-center justify-center text-2xl mb-5 group-hover:bg-brandGreen group-hover:text-white transition-all duration-300">
              <i className="fa-solid fa-magnifying-glass-chart"></i>
            </div>
            <h3 className="font-bold text-lg text-brandDark mb-2">Compliance Audits</h3>
            <p className="text-sm text-brandMuted leading-relaxed mb-4">
              Thorough hygiene & safety audits by FSSAI-empaneled experts.
            </p>
            <a href="#" className="text-brandGreen font-semibold text-sm flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
              Schedule Audit <i className="fa-solid fa-arrow-right text-xs"></i>
            </a>
          </div>

          <div
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg card-hover-lift group"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-2xl mb-5 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <h3 className="font-bold text-lg text-brandDark mb-2">FoSTaC Training</h3>
            <p className="text-sm text-brandMuted leading-relaxed mb-4">
              Mandatory food safety training & certification programs.
            </p>
            <a href="#" className="text-orange-600 font-semibold text-sm flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
              View Courses <i className="fa-solid fa-arrow-right text-xs"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}