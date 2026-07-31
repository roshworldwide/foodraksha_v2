"use client";

import React, { useState } from "react";

interface VideoCard {
  id: number;
  title: string;
  subtitle: string;
  category: "license" | "inspection" | "product" | "compliance";
  person: string;
  role: string;
  duration: string;
  image: string;
  isMain?: boolean;
}

export default function VideoCaseStudies() {
  const [activeFilter, setActiveFilter] = useState("all");

  const videos: VideoCard[] = [
    {
      id: 1,
      title: "From License Rejection to Central License Approval in 45 Days",
      subtitle: "How PureBite Snacks got their FSSAI Central License with FoodRaksha",
      category: "license",
      person: "Rohit Verma",
      role: "Co-Founder, PureBite Snacks",
      duration: "03:28",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1000",
      isMain: true,
    },
    {
      id: 2,
      title: "Overcame FSSAI Inspection & Got 100% Compliance",
      subtitle: "Cloud Kitchen Business, Mumbai",
      category: "inspection",
      person: "Ananya Sharma",
      role: "Founder, FreshBites",
      duration: "02:47",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=500",
    },
    {
      id: 3,
      title: "Product Approval for a New Health Supplement",
      subtitle: "Nutraceutical Company, Bengaluru",
      category: "product",
      person: "Vikram Malhotra",
      role: "R&D Lead, NutraLife",
      duration: "03:15",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500",
    },
    {
      id: 4,
      title: "Resolved Show Cause Notice & Avoided Cancellation",
      subtitle: "Food Manufacturer, Hyderabad",
      category: "compliance",
      person: "Suresh Reddy",
      role: "Director, Heritage Foods",
      duration: "02:59",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=500",
    },
    {
      id: 5,
      title: "Seamless Multi-State License Registration in 10 States",
      subtitle: "FMCG Brand, New Delhi",
      category: "license",
      person: "Priya Kapoor",
      role: "Compliance Manager, Delish",
      duration: "03:02",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=500",
    },
  ];

  const filteredVideos = videos.filter(
    (v) => activeFilter === "all" || v.category === activeFilter
  );

  return (
    <section className="py-16 lg:py-20" id="videos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-brandBlue px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
            <i className="fa-regular fa-circle-play text-sm"></i> Video Case Studies
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brandDark tracking-tight font-heading">
            Real Results. Real Clients. <span className="text-brandBlue">Real Impact.</span>
          </h2>
          <p className="text-brandMuted text-xs sm:text-sm leading-relaxed">
            Hear directly from food business owners who overcame complex compliance challenges with FoodRaksha's expert guidance.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
            {[
              { id: "all", label: "All Stories" },
              { id: "license", label: "License Approvals" },
              { id: "inspection", label: "Inspection Support" },
              { id: "product", label: "Product Approvals" },
              { id: "compliance", label: "Compliance Success" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`font-semibold text-xs px-4 py-2 rounded-xl transition ${
                  activeFilter === tab.id
                    ? "bg-brandBlue text-white shadow-md"
                    : "bg-white border border-gray-200 text-brandMuted hover:text-brandBlue"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {filteredVideos.map((video) =>
            video.isMain ? (
              <div
                key={video.id}
                className="lg:col-span-6 relative rounded-3xl overflow-hidden min-h-[420px] shadow-2xl group flex flex-col justify-between p-6 sm:p-8 text-white bg-black"
              >
                <img
                  src={video.image}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30"></div>

                <div className="relative z-10 flex items-start justify-between">
                  <div className="max-w-md space-y-2">
                    <h3 className="text-xl sm:text-2xl font-extrabold leading-snug">{video.title}</h3>
                    <p className="text-xs text-gray-300">{video.subtitle}</p>
                  </div>
                </div>

                <div className="relative z-10 my-auto py-8 flex items-center justify-center">
                  <button className="w-16 h-16 rounded-full bg-brandBlue text-white flex items-center justify-center text-xl shadow-xl hover:scale-110 transition">
                    <i className="fa-solid fa-play ml-1"></i>
                  </button>
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl text-right">
                      <p className="text-xs font-bold text-white">{video.person}</p>
                      <p className="text-[10px] text-gray-300">{video.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={video.id}
                className="lg:col-span-3 relative rounded-2xl overflow-hidden min-h-[200px] shadow-lg group flex flex-col justify-between p-4 text-white bg-black"
              >
                <img
                  src={video.image}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"></div>

                <div className="relative z-10">
                  <h4 className="text-xs font-bold leading-snug">{video.title}</h4>
                </div>

                <div className="relative z-10 my-auto flex justify-center">
                  <button className="w-10 h-10 rounded-full bg-brandBlue text-white flex items-center justify-center text-xs shadow-lg hover:scale-110 transition">
                    <i className="fa-solid fa-play ml-0.5"></i>
                  </button>
                </div>

                <div className="relative z-10 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-gray-300 font-medium">{video.subtitle}</p>
                  </div>
                  <span className="bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold text-gray-200">
                    {video.duration}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}