"use client";

import React, { useEffect } from "react";
import AOS from "aos";
import Navbar from "@/components/Navbar";
import ImpactCalculator from "@/components/ImpactCalculator";
import Footer from "@/components/Footer";

export default function CalculatorPage() {
  useEffect(() => {
    AOS.init({ duration: 700, once: true, offset: 50 });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-brandBg font-sans text-brandDark">
      <Navbar activeSection="calculator" />

      <main className="flex-1 py-6">
        <ImpactCalculator />
      </main>

      <Footer />
    </div>
  );
}