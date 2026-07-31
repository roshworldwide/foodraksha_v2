import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100">
      <div className="py-8 border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center md:justify-between gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Aligned with</span>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-75 hover:opacity-100 transition-all duration-300">
            <div className="flex items-center gap-1.5 text-xl font-extrabold text-blue-900 tracking-tighter">
              fssai <span className="text-brandGreen text-xs">®</span>
            </div>
            <div className="text-xs font-bold text-gray-700 leading-none text-center">
              <span className="text-brandGreen text-sm font-extrabold">FoSTaC</span>
              <br />
              <span className="text-[9px] text-gray-400 font-normal">Food Safety Training</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
              <div className="w-7 h-7 rounded-full border-2 border-blue-900 flex items-center justify-center text-[10px] text-blue-900 font-black">
                N
              </div>
              <span>NABL Accredited</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
              <i className="fa-solid fa-shield-cat text-brandBlue text-lg"></i>
              <span>100% Legal & Compliant</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-bold text-brandDark mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-brandBlue transition">About Us</a></li>
            <li><a href="#" className="hover:text-brandBlue transition">Careers</a></li>
            <li><a href="#" className="hover:text-brandBlue transition">Contact</a></li>
            <li><a href="#" className="hover:text-brandBlue transition">Blog</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-brandDark mb-3">Services</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-brandBlue transition">Registration</a></li>
            <li><a href="#" className="hover:text-brandBlue transition">Audits</a></li>
            <li><a href="#" className="hover:text-brandBlue transition">FoSTaC</a></li>
            <li><a href="#" className="hover:text-brandBlue transition">Lab Testing</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-brandDark mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-brandBlue transition">Help Center</a></li>
            <li><a href="#" className="hover:text-brandBlue transition">FAQs</a></li>
            <li><a href="#" className="hover:text-brandBlue transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-brandBlue transition">Terms</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-brandDark mb-3">Contact Us</h4>
          <p className="text-sm text-gray-500">📧 support@foodraksha.com</p>
          <p className="text-sm text-gray-500">📞 +91 99999 99999</p>
          <div className="flex gap-3 mt-3 text-gray-400">
            <a href="#" className="hover:text-brandBlue transition text-lg"><i className="fa-brands fa-linkedin"></i></a>
            <a href="#" className="hover:text-brandBlue transition text-lg"><i className="fa-brands fa-twitter"></i></a>
            <a href="#" className="hover:text-brandBlue transition text-lg"><i className="fa-brands fa-instagram"></i></a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-50 py-5 text-center text-xs text-gray-400">
        © 2026 FoodRaksha. All rights reserved. | Compliance. Simplified.
      </div>
    </footer>
  );
}