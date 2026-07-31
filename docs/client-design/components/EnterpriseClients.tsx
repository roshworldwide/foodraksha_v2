import React from "react";

export default function EnterpriseClients() {
  const clients = [
    { name: "zomato", desc: "Multi-State Food Delivery Compliance", style: "text-red-600 italic tracking-tighter text-2xl font-black" },
    { name: "SWIGGY", desc: "Central License & State Registrations", style: "text-orange-500 font-black text-lg tracking-wider" },
    { name: "blinkit", desc: "FSSAI Licensing & Ongoing Compliance", style: "text-black font-black text-xl tracking-tight" },
    { name: "Dabur", desc: "Multiple Manufacturing Units Compliance", style: "text-emerald-800 font-bold text-lg" },
    { name: "BRITANNIA", desc: "Regulatory Advisory & License Management", style: "bg-red-600 text-white font-black px-2 py-0.5 rounded text-sm tracking-wider" },
    { name: "ITC Limited", desc: "Pan India Food Business Compliance", style: "text-blue-950 font-black text-xl tracking-widest border-b-2 border-blue-950" },
    { name: "Amul", desc: "Dairy & Food Safety Compliance", style: "bg-red-600 text-white font-extrabold px-2 py-0.5 text-xs rounded-sm" },
    { name: "Haldiram's", desc: "Multiple State Licenses & Renewals", style: "bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-full border border-red-700" },
    { name: "VARUN BEVERAGES", desc: "Plant Approvals & FSSAI Compliance", style: "text-blue-900 font-black text-sm" },
    { name: "mamaearth", desc: "FSSAI Compliance for Food Products", style: "text-cyan-600 font-extrabold text-base tracking-tight" },
    { name: "slurrp farm", desc: "Licensing & Label Compliance", style: "text-red-900 font-black text-lg" },
    { name: "EATCLUB", desc: "Cloud Kitchen Compliance & Registrations", style: "text-black font-black text-sm tracking-wider" },
  ];

  return (
    <section className="py-16 lg:py-20" id="enterprise">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-brandBlue px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
            <i className="fa-solid fa-shield-check text-sm"></i> Trusted by Leading Food Businesses
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brandDark tracking-tight font-heading">
            Enterprise Clients <span className="text-brandBlue">We Serve</span>
          </h2>
          <p className="text-brandMuted text-xs sm:text-sm">
            Proud to partner with India's most innovative food businesses across sectors and states.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" data-aos="fade-up">
          {clients.map((client, idx) => (
            <div
              key={idx}
              className="enterprise-card bg-white rounded-2xl p-5 border border-gray-100 shadow-md shadow-gray-200/30 flex flex-col justify-between text-center min-h-[140px] transition duration-300"
            >
              <div className="h-10 flex items-center justify-center">
                <span className={client.style}>{client.name}</span>
              </div>
              <p className="text-[11px] font-medium text-brandMuted leading-tight mt-3">{client.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}