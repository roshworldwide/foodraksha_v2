"use client";

import React, { useState } from "react";

export default function EligibilityChecker() {
  const [turnover, setTurnover] = useState("");
  const [result, setResult] = useState<{
    type: "basic" | "state" | "central" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const checkEligibility = () => {
    const rawValue = turnover.replace(/[^0-9.]/g, "");
    const numericTurnover = parseFloat(rawValue);

    if (!rawValue || isNaN(numericTurnover) || numericTurnover <= 0) {
      setResult({
        type: "error",
        message: "Please enter a valid turnover amount in ₹.",
      });
      return;
    }

    if (numericTurnover <= 1200000) {
      setResult({
        type: "basic",
        message: "FSSAI Basic Registration (Annual turnover up to ₹12 Lakhs)",
      });
    } else if (numericTurnover <= 200000000) {
      setResult({
        type: "state",
        message: "FSSAI State License (Annual turnover ₹12 Lakhs to ₹20 Crores)",
      });
    } else {
      setResult({
        type: "central",
        message: "FSSAI Central License (Annual turnover above ₹20 Crores)",
      });
    }
  };

  return (
    <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-100 shadow-2xl shadow-blue-900/8 max-w-xl" id="eligibility-checker">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-brandBlueLight flex items-center justify-center">
          <i className="fa-solid fa-calculator text-brandBlue"></i>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Free Eligibility Checker</h3>
          <p className="text-xs text-gray-500">Find your FSSAI license type in seconds</p>
        </div>
      </div>

      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
        Enter your annual turnover
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold z-10">₹</span>
          <input
            type="text"
            value={turnover}
            onChange={(e) => setTurnover(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkEligibility()}
            placeholder="e.g., 25,00,000"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brandBlue/30 transition"
          />
        </div>
        <button
          onClick={checkEligibility}
          className="bg-brandBlue hover:bg-brandBlueHover text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          Check Eligibility <i className="fa-solid fa-arrow-right text-xs"></i>
        </button>
      </div>

      {result.type && (
        <div
          className={`mt-3 p-4 rounded-xl border text-sm font-semibold transition-all ${
            result.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : result.type === "basic"
              ? "bg-blue-50 border-blue-200 text-blue-800"
              : result.type === "state"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-purple-50 border-purple-200 text-purple-800"
          }`}
        >
          <i
            className={`fa-solid ${
              result.type === "error" ? "fa-circle-exclamation" : "fa-circle-check"
            } mr-2`}
          ></i>
          {result.type !== "error" && <span>You are eligible for: </span>}
          <strong>{result.message}</strong>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 mt-3 pt-1">
        <span className="flex items-center gap-1.5 text-gray-700">
          <i className="fa-regular fa-circle-check text-brandGreen text-sm"></i> 100% Confidential
        </span>
        <span className="text-gray-300">•</span>
        <span>Instant Result</span>
        <span className="text-gray-300">•</span>
        <span>No Obligation</span>
      </div>
    </div>
  );
}