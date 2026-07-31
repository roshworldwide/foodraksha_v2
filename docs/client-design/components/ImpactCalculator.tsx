"use client";

import React, { useState, useEffect } from "react";

export default function ImpactCalculator() {
  const [sector, setSector] = useState("manufacturing");
  const [turnover, setTurnover] = useState("1cr-20cr");
  const [states, setStates] = useState("multi");
  const [employees, setEmployees] = useState("51-200");
  const [bizType, setBizType] = useState("pvtltd");
  const [importExport, setImportExport] = useState("no");

  const [riskScore, setRiskScore] = useState(72);
  const [costRange, setCostRange] = useState("₹48,500 – ₹62,000");
  const [breakdown, setBreakdown] = useState({
    licenseFee: "₹15,000 – ₹20,000",
    docFee: "₹20,000 – ₹28,000",
    complianceFee: "₹8,000 – ₹10,000",
    trainingFee: "₹5,500 – ₹8,000",
  });
  const [licenseType, setLicenseType] = useState("State + Central");
  const [calcDate, setCalcDate] = useState("");

  const calculateImpact = () => {
    let score = 30;

    if (turnover === "upto12l") score += 5;
    else if (turnover === "12l-12cr") score += 15;
    else if (turnover === "1cr-20cr") score += 25;
    else if (turnover === "above20cr") score += 40;

    if (states === "single") score += 5;
    else if (states === "multi") score += 15;
    else if (states === "panindia") score += 25;

    if (employees === "1-10") score += 2;
    else if (employees === "11-50") score += 8;
    else if (employees === "51-200") score += 15;
    else if (employees === "200+") score += 25;

    if (sector === "cloudkitchen") score += 10;
    else if (sector === "importexport") score += 20;
    else if (sector === "manufacturing") score += 15;
    else if (sector === "retail") score += 8;

    if (importExport === "yes") score += 18;

    if (bizType === "sole") score += 3;
    else if (bizType === "llp") score += 7;
    else if (bizType === "pvtltd") score += 12;

    const finalScore = Math.min(100, Math.max(0, Math.round(score)));
    setRiskScore(finalScore);

    // License type
    if (turnover === "upto12l") setLicenseType("Basic");
    else if (turnover === "above20cr" || states === "panindia" || importExport === "yes") setLicenseType("Central");
    else setLicenseType("State");

    // Cost Breakdown
    if (finalScore <= 30) {
      setCostRange("₹5,000 – ₹15,000");
      setBreakdown({
        licenseFee: "₹2,000 – ₹5,000",
        docFee: "₹2,000 – ₹5,000",
        complianceFee: "₹1,000 – ₹3,000",
        trainingFee: "₹500 – ₹2,000",
      });
    } else if (finalScore <= 70) {
      setCostRange("₹25,000 – ₹48,000");
      setBreakdown({
        licenseFee: "₹7,500 – ₹15,000",
        docFee: "₹10,000 – ₹20,000",
        complianceFee: "₹5,000 – ₹8,000",
        trainingFee: "₹2,500 – ₹5,000",
      });
    } else {
      setCostRange("₹48,500 – ₹62,000");
      setBreakdown({
        licenseFee: "₹15,000 – ₹20,000",
        docFee: "₹20,000 – ₹28,000",
        complianceFee: "₹8,000 – ₹10,000",
        trainingFee: "₹5,500 – ₹8,000",
      });
    }

    setCalcDate(new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }));
  };

  useEffect(() => {
    calculateImpact();
  }, []);

  const riskLabel = riskScore <= 30 ? "Low Risk" : riskScore <= 70 ? "Moderate Risk" : "High Risk";
  const complexity = riskScore <= 30 ? "Low" : riskScore <= 60 ? "Medium" : "High";

  const lowW = Math.min(30, riskScore);
  const modW = riskScore <= 30 ? 0 : Math.min(40, riskScore - 30);
  const highW = riskScore <= 70 ? 0 : riskScore - 70;

  return (
    <section className="py-16 lg:py-20" id="calculator">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-3" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-brandBlue px-3.5 py-1 rounded-full text-xs font-bold">
            <i className="fa-solid fa-calculator"></i> FoodRaksha Ecosystem
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brandDark tracking-tight font-heading">
            Business Impact <span className="text-brandBlue">Calculator</span>
          </h2>
          <p className="text-brandMuted text-xs sm:text-sm max-w-2xl">
            Get an instant estimate of your compliance requirements, risk score, and baseline costs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Panel */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/40 space-y-6" data-aos="fade-right">
            <h3 className="text-lg font-bold text-brandDark border-b border-gray-100 pb-4">
              Tell us about your business
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brandDark">1. Business Sector / Industry</label>
                <div className="relative">
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-brandDark focus:outline-none focus:ring-2 focus:ring-brandBlue/20"
                  >
                    <option value="manufacturing">Food Manufacturing</option>
                    <option value="cloudkitchen">Cloud Kitchen / Catering</option>
                    <option value="importexport">Import / Export</option>
                    <option value="retail">Retail / Restaurant</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brandDark">2. Annual Turnover (₹)</label>
                <select
                  value={turnover}
                  onChange={(e) => setTurnover(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-brandDark focus:outline-none focus:ring-2 focus:ring-brandBlue/20"
                >
                  <option value="upto12l">Up to ₹12 Lakhs</option>
                  <option value="12l-12cr">₹12 Lakhs – ₹12 Cr</option>
                  <option value="1cr-20cr">₹1 Cr – ₹20 Cr</option>
                  <option value="above20cr">Above ₹20 Cr</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brandDark">3. States of Operation</label>
                <select
                  value={states}
                  onChange={(e) => setStates(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-brandDark focus:outline-none focus:ring-2 focus:ring-brandBlue/20"
                >
                  <option value="single">Single State</option>
                  <option value="multi">Maharashtra, Karnataka, Gujarat (Multi)</option>
                  <option value="panindia">Pan India (10+ States)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brandDark">4. Number of Employees</label>
                <select
                  value={employees}
                  onChange={(e) => setEmployees(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-brandDark focus:outline-none focus:ring-2 focus:ring-brandBlue/20"
                >
                  <option value="1-10">1 – 10 Employees</option>
                  <option value="11-50">11 – 50 Employees</option>
                  <option value="51-200">51 – 200 Employees</option>
                  <option value="200+">200+ Employees</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brandDark">5. Business Type</label>
                <select
                  value={bizType}
                  onChange={(e) => setBizType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-brandDark focus:outline-none focus:ring-2 focus:ring-brandBlue/20"
                >
                  <option value="pvtltd">Private Limited Company</option>
                  <option value="sole">Sole Proprietorship</option>
                  <option value="llp">LLP / Partnership</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brandDark">6. Import / Export Food Products?</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="radio"
                      name="import_export"
                      value="yes"
                      checked={importExport === "yes"}
                      onChange={() => setImportExport("yes")}
                      className="w-4 h-4 text-brandBlue"
                    />{" "}
                    Yes
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="radio"
                      name="import_export"
                      value="no"
                      checked={importExport === "no"}
                      onChange={() => setImportExport("no")}
                      className="w-4 h-4 text-brandBlue"
                    />{" "}
                    No
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={calculateImpact}
              className="w-full bg-brandBlue hover:bg-brandBlueHover text-white font-bold text-sm py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 mt-4"
            >
              Calculate My Impact <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xl shadow-gray-200/40 space-y-6" data-aos="fade-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-brandDark">Your Compliance Impact Summary</h3>
                <p className="text-[10px] text-gray-400">Calculated on: {calcDate || "Just now"}</p>
              </div>
              <span className="bg-emerald-50 text-brandGreen border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brandGreen animate-pulse"></span> Live Result
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 text-center space-y-1">
                <p className="text-[10px] font-bold text-gray-500">Risk Score</p>
                <p className="text-xl font-extrabold text-brandOrange">
                  {riskScore}<span className="text-xs text-gray-400 font-normal">/100</span>
                </p>
                <span className="inline-block bg-boxOrange text-brandOrange text-[9px] font-bold px-2 py-0.5 rounded-full">
                  {riskLabel}
                </span>
              </div>
              <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 text-center space-y-1">
                <p className="text-[10px] font-bold text-gray-500">Complexity</p>
                <p className="text-base font-extrabold text-brandGreen mt-1">{complexity}</p>
                <p className="text-[9px] text-gray-400">Requirements</p>
              </div>
              <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 text-center space-y-1">
                <p className="text-[10px] font-bold text-gray-500">License Type</p>
                <p className="text-xs font-extrabold text-brandBlue mt-1">{licenseType}</p>
                <p className="text-[9px] text-gray-400">FSSAI License</p>
              </div>
            </div>

            <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-4 space-y-4">
              <div>
                <p className="text-[11px] font-bold text-gray-600">Estimated Cost (Baseline)</p>
                <h4 className="text-xl font-extrabold text-brandGreen">{costRange}</h4>
                <p className="text-[10px] text-gray-400">(Including Government Fees)</p>
              </div>

              <hr className="border-gray-200/60" />

              <div className="space-y-2">
                <p className="text-[11px] font-bold text-brandDark">What's Included?</p>
                <ul className="space-y-2 text-xs font-medium text-gray-700">
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><i className="fa-solid fa-circle-check text-brandGreen text-xs"></i> FSSAI License Fee</span>
                    <span className="font-bold text-brandDark">{breakdown.licenseFee}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><i className="fa-solid fa-circle-check text-brandGreen text-xs"></i> Documentation & Support</span>
                    <span className="font-bold text-brandDark">{breakdown.docFee}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><i className="fa-solid fa-circle-check text-brandGreen text-xs"></i> Compliance & Advisory</span>
                    <span className="font-bold text-brandDark">{breakdown.complianceFee}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><i className="fa-solid fa-circle-check text-brandGreen text-xs"></i> Basic Training</span>
                    <span className="font-bold text-brandDark">{breakdown.trainingFee}</span>
                  </li>
                </ul>
              </div>

              {/* Progress Bar */}
              <div className="pt-2 space-y-2">
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden flex">
                  <div style={{ width: `${lowW}%` }} className="bg-brandGreen"></div>
                  <div style={{ width: `${modW}%` }} className="bg-brandOrange"></div>
                  <div style={{ width: `${highW}%` }} className="bg-brandRed"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}