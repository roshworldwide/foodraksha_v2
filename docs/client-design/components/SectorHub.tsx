"use client";

import React, { useState } from "react";

type SectorKey = "dairy" | "nutraceuticals" | "meat" | "imports" | "alcohol" | "bakery";

interface SolutionItem {
  icon: string;
  title: string;
  desc: string;
}

interface SectorData {
  icon: string;
  title: string;
  desc: string;
  image: string;
  solutions: SolutionItem[];
}

const sectorMap: Record<SectorKey, SectorData> = {
  dairy: {
    icon: "fa-solid fa-cow",
    title: "Dairy & Milk Products – Compliance Solutions",
    desc: "End-to-end compliance support for dairy businesses including licensing, quality standards, testing and product registration.",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=600",
    solutions: [
      { icon: "fa-solid fa-file-invoice", title: "FSSAI Licenses", desc: "State, Central & Basic Registration for all dairy units." },
      { icon: "fa-solid fa-clipboard-check", title: "Product Standards", desc: "Ensure compliance with FSSAI, BIS & Codex standards." },
      { icon: "fa-solid fa-vial", title: "Testing & Quality", desc: "NABL approved lab testing for milk & dairy products." },
      { icon: "fa-solid fa-shield-check", title: "HACCP & Safety", desc: "Implementation of HACCP, GMP & Food Safety Systems." },
    ],
  },
  nutraceuticals: {
    icon: "fa-solid fa-leaf",
    title: "Nutraceuticals & Health Supplements",
    desc: "Regulatory support for nutraceuticals, dietary supplements, and health products including product approvals and claims.",
    image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=600",
    solutions: [
      { icon: "fa-solid fa-file-invoice", title: "FSSAI License", desc: "State/Central license for nutraceutical manufacturers." },
      { icon: "fa-solid fa-check-double", title: "Product Approvals", desc: "Product registration and approval from FSSAI." },
      { icon: "fa-solid fa-tag", title: "Label & Claims", desc: "Compliant label design and health claim validation." },
      { icon: "fa-solid fa-flask", title: "Testing Protocols", desc: "Lab testing for purity, potency, and contaminants." },
    ],
  },
  meat: {
    icon: "fa-solid fa-drumstick-bite",
    title: "Meat, Poultry & Seafood Processing",
    desc: "Complete licensing and safety solutions for meat processing units, slaughterhouses, and cold chains.",
    image: "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?auto=format&fit=crop&q=80&w=600",
    solutions: [
      { icon: "fa-solid fa-file-invoice", title: "Slaughterhouse License", desc: "Municipal and FSSAI licensing for slaughterhouses." },
      { icon: "fa-solid fa-shield-virus", title: "HACCP Implementation", desc: "Hazard analysis and critical control points setup." },
      { icon: "fa-solid fa-temperature-low", title: "Cold Chain Norms", desc: "Temperature-controlled storage and transport norms." },
      { icon: "fa-solid fa-vial", title: "Microbial Testing", desc: "Regular lab testing for pathogens and spoilage organisms." },
    ],
  },
  imports: {
    icon: "fa-solid fa-globe",
    title: "Food Imports & Exports",
    desc: "End-to-end support for import/export of food products including customs clearance and documentation.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600",
    solutions: [
      { icon: "fa-solid fa-file-signature", title: "Import NOC", desc: "Obtain necessary No Objection Certificates from FSSAI." },
      { icon: "fa-solid fa-ship", title: "Customs Clearance", desc: "Documentation and liaison for customs release." },
      { icon: "fa-solid fa-file-invoice", title: "FSSAI Import License", desc: "Mandatory registration for food importers." },
      { icon: "fa-solid fa-tag", title: "Labelling", desc: "Dual-language labeling compliant with FSSAI norms." },
    ],
  },
  alcohol: {
    icon: "fa-solid fa-wine-glass",
    title: "Alcoholic Beverages Compliance",
    desc: "Licensing and labeling support for breweries, distilleries, and alcoholic beverage importers.",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600",
    solutions: [
      { icon: "fa-solid fa-file-invoice", title: "FL & FSSAI License", desc: "State Excise license and FSSAI licensing." },
      { icon: "fa-solid fa-tag", title: "Statutory Labelling", desc: "Mandatory declarations and health warnings on labels." },
      { icon: "fa-solid fa-vial", title: "Quality Testing", desc: "Alcohol content, methanol, and contaminant testing." },
      { icon: "fa-solid fa-shield-halved", title: "Advisory Services", desc: "Advisory on state-specific rules and central regulations." },
    ],
  },
  bakery: {
    icon: "fa-solid fa-cake-candles",
    title: "Bakery & Confectionery Compliance",
    desc: "FSSAI registration, ingredient compliance, and labeling for bakeries and sweet manufacturers.",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=600",
    solutions: [
      { icon: "fa-solid fa-file-invoice", title: "FSSAI Registration", desc: "Basic/State license for bakeries and confectionery units." },
      { icon: "fa-solid fa-clipboard-check", title: "Additives Limit", desc: "Adherence to food additive and preservative limits." },
      { icon: "fa-solid fa-tag", title: "Label Declaration", desc: "Nutritional info, ingredient list, and allergen declaration." },
      { icon: "fa-solid fa-vial", title: "Shelf Life Testing", desc: "Shelf-life, microbial, and quality testing." },
    ],
  },
};

export default function SectorHub() {
  const [activeSector, setActiveSector] = useState<SectorKey>("dairy");
  const data = sectorMap[activeSector];

  return (
    <section className="py-16 lg:py-20" id="sectors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2" data-aos="fade-up">
          <span className="text-xs font-bold uppercase tracking-wider text-brandBlue">Industry Expertise</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brandDark tracking-tight font-heading">
            Industry Matrix – <span className="text-brandBlue">Sector Hub</span>
          </h2>
          <p className="text-brandMuted text-xs sm:text-sm">
            Explore industry-specific compliance solutions tailored to your business needs.
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" data-aos="fade-up">
          {(Object.keys(sectorMap) as SectorKey[]).map((key) => {
            const isActive = activeSector === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSector(key)}
                className={`p-4 rounded-2xl cursor-pointer flex flex-col items-center text-center justify-between min-h-[140px] transition ${
                  isActive
                    ? "bg-brandBlue text-white shadow-lg active-tab-arrow relative"
                    : "bg-white hover:bg-gray-50 border border-gray-100 shadow-sm text-brandDark"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-2 ${
                    isActive ? "bg-white/10 text-white" : "bg-blue-50 text-brandBlue"
                  }`}
                >
                  <i className={sectorMap[key].icon}></i>
                </div>
                <div>
                  <h3 className="text-xs font-bold leading-tight">{sectorMap[key].title.split(" –")[0]}</h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Tab Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl space-y-6" data-aos="fade-up">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-brandBlue flex items-center justify-center text-xl shrink-0">
                    <i className={data.icon}></i>
                  </div>
                  <h3 className="text-lg font-bold text-brandDark">{data.title}</h3>
                </div>
                <p className="text-xs text-brandMuted leading-relaxed">{data.desc}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.solutions.map((sol, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-brandBlue flex items-center justify-center text-sm shrink-0 mt-0.5">
                      <i className={sol.icon}></i>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-brandDark">{sol.title}</h4>
                      <p className="text-[10px] text-brandMuted">{sol.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-5 h-full min-h-[220px]">
              <img
                src={data.image}
                alt={data.title}
                className="w-full h-full object-cover rounded-2xl border border-gray-100 shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}