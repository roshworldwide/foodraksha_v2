"use client";

import React, { useState, useEffect } from "react";
import AOS from "aos";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import ProcessSteps from "@/components/ProcessSteps";
import ImpactCalculator from "@/components/ImpactCalculator";
import EnterpriseClients from "@/components/EnterpriseClients";
import LiveLedger from "@/components/LiveLedger";
import SectorHub from "@/components/SectorHub";
import VideoCaseStudies from "@/components/VideoCaseStudies";
import GovAlignment from "@/components/GovAlignment";
import Footer from "@/components/Footer";

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    AOS.init({ duration: 700, once: true, offset: 50 });
  }, []);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brandBg font-sans text-brandDark">
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <ProcessSteps />
        <ImpactCalculator />
        <EnterpriseClients />
        <LiveLedger />
        <SectorHub />
        <VideoCaseStudies />
        <GovAlignment />
      </main>

      <Footer />
    </div>
  );
}