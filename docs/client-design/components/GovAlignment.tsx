import React from "react";

export default function GovAlignment() {
  return (
    <section className="py-16 lg:py-20 bg-brandBg" id="compliance">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto" data-aos="fade-up">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-brandBlue inline-flex items-center justify-center mb-4">
            <i className="fa-solid fa-shield-check text-lg"></i>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brandDark tracking-tight mb-3 font-heading">
            Trusted. Compliant. <span className="gradient-text">Aligned with Government</span> Authorities.
          </h2>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-authority-card p-6 sm:p-8" data-aos="fade-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-0 divide-y sm:divide-y-0 lg:divide-x divide-gray-100">
            <div className="authority-card flex flex-col items-center text-center justify-between p-4 space-y-4 group cursor-pointer">
              <div className="h-16 flex items-center justify-center">
                <span className="text-3xl font-black text-blue-900">fssai <span className="text-green-600 text-xs font-bold">®</span></span>
              </div>
              <h3 className="text-sm font-bold">FSSAI</h3>
              <p className="text-[11px] text-brandMuted">Food Safety and Standards Authority of India</p>
              <a href="https://www.fssai.gov.in" target="_blank" rel="noreferrer" className="text-linkGreen hover:underline text-xs font-semibold inline-flex items-center gap-1.5 pt-2">
                Visit Official Website <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
            </div>

            <div className="authority-card flex flex-col items-center text-center justify-between p-4 space-y-4 group cursor-pointer">
              <div className="h-16 flex items-center justify-center">
                <span className="text-2xl font-extrabold text-emerald-700">FoSTaC</span>
              </div>
              <h3 className="text-sm font-bold">FoSTaC</h3>
              <p className="text-[11px] text-brandMuted">Food Safety Training & Certification</p>
              <a href="#" className="text-linkGreen hover:underline text-xs font-semibold inline-flex items-center gap-1.5 pt-2">
                Visit Official Website <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
            </div>

            <div className="authority-card flex flex-col items-center text-center justify-between p-4 space-y-4 group cursor-pointer">
              <div className="h-16 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-blue-900 flex items-center justify-center text-xs font-black text-blue-900">N</div>
                <span className="text-base font-bold text-blue-950 ml-2">NABL</span>
              </div>
              <h3 className="text-sm font-bold">NABL</h3>
              <p className="text-[11px] text-brandMuted">National Accreditation Board for Testing Laboratories</p>
              <a href="https://nabl-india.org" target="_blank" rel="noreferrer" className="text-linkGreen hover:underline text-xs font-semibold inline-flex items-center gap-1.5 pt-2">
                Visit Official Website <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
            </div>

            <div className="authority-card flex flex-col items-center text-center justify-between p-4 space-y-4 group cursor-pointer">
              <div className="h-16 flex items-center justify-center">
                <i className="fa-solid fa-building-columns text-3xl text-gray-800"></i>
              </div>
              <h3 className="text-sm font-bold">MoHFW</h3>
              <p className="text-[11px] text-brandMuted">Ministry of Health & Family Welfare</p>
              <a href="https://www.mohfw.gov.in" target="_blank" rel="noreferrer" className="text-linkGreen hover:underline text-xs font-semibold inline-flex items-center gap-1.5 pt-2">
                Visit Official Website <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
            </div>

            <div className="authority-card flex flex-col items-center text-center justify-between p-4 space-y-4 group cursor-pointer">
              <div className="h-16 flex items-center justify-center">
                <i className="fa-solid fa-award text-3xl text-blue-900"></i>
              </div>
              <h3 className="text-sm font-bold">BIS</h3>
              <p className="text-[11px] text-brandMuted">Bureau of Indian Standards</p>
              <a href="https://www.bis.gov.in" target="_blank" rel="noreferrer" className="text-linkGreen hover:underline text-xs font-semibold inline-flex items-center gap-1.5 pt-2">
                Visit Official Website <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="bg-cardBgTint border border-blue-100 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-5" data-aos="fade-up">
          <div className="flex items-start gap-3.5 text-xs text-brandMuted">
            <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 text-sm shrink-0">
              <i className="fa-regular fa-shield"></i>
            </div>
            <p>
              <strong className="text-brandDark font-semibold">FoodRaksha is a private consultancy service provider</strong> and is not affiliated, associated or endorsed by FSSAI or any Government Authority. We ensure 100% compliance with applicable laws.
            </p>
          </div>
          <div className="flex items-center gap-3 pl-0 md:pl-6 md:border-l border-blue-200/80 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-brandBlue flex items-center justify-center text-lg">
              <i className="fa-solid fa-lock"></i>
            </div>
            <div className="text-xs">
              <p className="font-extrabold text-brandBlue">Your Compliance.</p>
              <p className="font-bold text-brandBlue/80">Our Responsibility.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}