import React from "react";

export default function ProcessSteps() {
  return (
    <section className="py-16 lg:py-20 bg-white" id="process">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto" data-aos="fade-up">
          <div className="inline-flex items-center bg-brandBlueLight text-brandBlue px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
            <i className="fa-solid fa-list-ol mr-1.5"></i> Our Process
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brandDark leading-tight font-heading">
            Your FSSAI License in <span className="gradient-text relative">Simple Steps</span>
          </h2>
        </div>

        <div className="relative" data-aos="fade-up">
          <div className="hidden lg:block absolute top-[108px] left-[7%] right-[3%] h-[2px] border-t-2 border-dashed border-gray-300 z-0"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
            <div className="flex flex-col items-center group step-card">
              <div className="w-20 h-20 rounded-full bg-brandBlueLight text-brandBlue flex items-center justify-center text-3xl shadow-sm mb-3">
                <i className="fa-solid fa-file-arrow-up"></i>
              </div>
              <div className="w-7 h-7 rounded-full bg-brandBlue text-white text-xs font-bold flex items-center justify-center shadow-md mb-4">01</div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-step-card w-full flex-1 flex flex-col justify-between text-center">
                <h3 className="text-sm font-bold">Document Collection</h3>
                <p className="text-[11px] text-brandMuted">We collect documents and upload on FoSCoS portal.</p>
                <span className="inline-flex items-center justify-center gap-1.5 bg-brandBlueLight text-brandBlue px-3 py-1 rounded-full text-[11px] font-bold mt-2">
                  <i className="fa-regular fa-clock"></i> 1–2 Days
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center group step-card">
              <div className="w-20 h-20 rounded-full bg-brandBlueLight text-brandBlue flex items-center justify-center text-3xl shadow-sm mb-3">
                <i className="fa-solid fa-file-circle-check"></i>
              </div>
              <div className="w-7 h-7 rounded-full bg-brandBlue text-white text-xs font-bold flex items-center justify-center shadow-md mb-4">02</div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-step-card w-full flex-1 flex flex-col justify-between text-center">
                <h3 className="text-sm font-bold">Scrutiny & Verification</h3>
                <p className="text-[11px] text-brandMuted">Experts verify documents for accuracy.</p>
                <span className="inline-flex items-center justify-center gap-1.5 bg-brandBlueLight text-brandBlue px-3 py-1 rounded-full text-[11px] font-bold mt-2">
                  <i className="fa-regular fa-clock"></i> 2–3 Days
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center group step-card">
              <div className="w-20 h-20 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center text-3xl shadow-sm mb-3">
                <i className="fa-solid fa-paper-plane"></i>
              </div>
              <div className="w-7 h-7 rounded-full bg-brandBlue text-white text-xs font-bold flex items-center justify-center shadow-md mb-4">03</div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-step-card w-full flex-1 flex flex-col justify-between text-center">
                <h3 className="text-sm font-bold">Application Submission</h3>
                <p className="text-[11px] text-brandMuted">We submit to FSSAI authority on FoSCoS.</p>
                <span className="inline-flex items-center justify-center gap-1.5 bg-brandBlueLight text-brandBlue px-3 py-1 rounded-full text-[11px] font-bold mt-2">
                  <i className="fa-regular fa-clock"></i> 1 Day
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center group step-card">
              <div className="w-20 h-20 rounded-full bg-brandGreenLight text-brandGreen flex items-center justify-center text-3xl shadow-sm mb-3">
                <i className="fa-solid fa-clipboard-check"></i>
              </div>
              <div className="w-7 h-7 rounded-full bg-brandGreen text-white text-xs font-bold flex items-center justify-center shadow-md mb-4">04</div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-step-card w-full flex-1 flex flex-col justify-between text-center">
                <h3 className="text-sm font-bold">Authority Scrutiny</h3>
                <p className="text-[11px] text-brandMuted">FSSAI reviews your application.</p>
                <span className="inline-flex items-center justify-center gap-1.5 bg-brandGreenLight text-brandGreen px-3 py-1 rounded-full text-[11px] font-bold mt-2">
                  <i className="fa-regular fa-clock"></i> 15–30 Days*
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center group step-card">
              <div className="w-20 h-20 rounded-full bg-brandGreenLight text-brandGreen flex items-center justify-center text-3xl shadow-sm mb-3">
                <i className="fa-solid fa-comments-circle"></i>
              </div>
              <div className="w-7 h-7 rounded-full bg-brandGreen text-white text-xs font-bold flex items-center justify-center shadow-md mb-4">05</div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-step-card w-full flex-1 flex flex-col justify-between text-center">
                <h3 className="text-sm font-bold">Clarification (if any)</h3>
                <p className="text-[11px] text-brandMuted">We respond to queries promptly.</p>
                <span className="inline-flex items-center justify-center gap-1.5 bg-brandGreenLight text-brandGreen px-3 py-1 rounded-full text-[11px] font-bold mt-2">
                  <i className="fa-regular fa-clock"></i> 2–7 Days*
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center group step-card">
              <div className="w-20 h-20 rounded-full bg-brandGreenLight text-brandGreen flex items-center justify-center text-3xl shadow-sm mb-3">
                <i className="fa-solid fa-certificate"></i>
              </div>
              <div className="w-7 h-7 rounded-full bg-brandGreen text-white text-xs font-bold flex items-center justify-center shadow-md mb-4">06</div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-step-card w-full flex-1 flex flex-col justify-between text-center">
                <h3 className="text-sm font-bold">License Approval</h3>
                <p className="text-[11px] text-brandMuted">License delivered electronically & physically.</p>
                <span className="inline-flex items-center justify-center gap-1.5 bg-brandGreenLight text-brandGreen px-3 py-1 rounded-full text-[11px] font-bold mt-2">
                  <i className="fa-regular fa-clock"></i> 3–5 Days
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400">
          *Timeline may vary based on application type, business category and authority workload.
        </p>
      </div>
    </section>
  );
}