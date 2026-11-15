import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F3F7F4] flex flex-col text-[#0F172A]">
      {/* Top Navigation Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-10 h-10 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center text-xl shadow-xs">
              🌱
            </span>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#1B4332]">
                TerraCrop
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs bg-emerald-100 text-[#1B4332] font-semibold px-2 py-0.5 rounded-full">
                NASA Space Apps Challenge
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="ghost" size="md">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="md">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-white to-[#F3F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 bg-emerald-100 text-[#1B4332] px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
              <span>🛰️ Powered by NASA Earth Observation Data</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
              Data-Driven Crop Shift for <span className="text-[#1B4332]">Sri Lankan Farms</span>
            </h1>

            <p className="text-base sm:text-xl text-[#475569] leading-relaxed">
              Compare crop rotation options using real NASA POWER agroclimate metrics, field soil parameters, and FAO-56 Penman-Monteith crop modeling. Built to help smallholders adapt to climate variability.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto px-8">
                  Plan Your Crop Rotation
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                  Sign In to My Farm
                </Button>
              </Link>
            </div>

            <div className="pt-2 text-xs text-slate-500">
              Free & Open • Focused on Dry & Intermediate Agro-Ecological Zones
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-[#F3F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
              Real Space Agency Science in the Farmer's Hands
            </h2>
            <p className="text-sm text-[#475569]">
              No mock data or guesswork. TerraCrop uses verified meteorological observation pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0369A1] flex items-center justify-center text-2xl font-bold">
                🛰️
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                NASA POWER Daily Data
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Fetches real 90-day daily point observations from NASA's Agroclimatology (AG) community: precipitation (PRECTOTCORR), temperature profile (T2M), relative humidity, solar irradiance, and root-zone wetness (GWETROOT).
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#1B4332] flex items-center justify-center text-2xl font-bold">
                ⚙️
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                Deterministic Rules Engine
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Pure TypeScript rules engine calculating FAO-56 Penman-Monteith evapotranspiration, seasonal timing (Maha vs Yala), botanical family rotation breaks, and water deficit balances with interactive rainfall what-if sliders.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center text-2xl font-bold">
                🤖
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                Gemini Advisory Explanations
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                Provides structured, plain-language agronomic rationale via Firebase AI Logic. Explains why a crop fits, risks to verify locally, and cites scientific references without ever compromising farmer privacy.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Three Strategies Overview */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
              Three Tailored Rotation Strategies
            </h2>
            <p className="text-sm text-[#475569]">
              Compare different approaches depending on your operational goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#F3F7F4] border border-slate-200 space-y-2">
              <span className="text-2xl">📊</span>
              <h3 className="font-bold text-base text-[#0F172A]">
                1. Current Practice Baseline
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Objective scoring across all catalogued crops matching your observed rainfall, temperature, water reliability, and harvest window.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <span className="text-2xl">🌱</span>
              <h3 className="font-bold text-base text-[#1B4332]">
                2. Soil-Building Rotation
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Filters exclusively for grain legumes (Green Gram, Black Gram, Cowpea) and green manures (Sunn Hemp) with documented biological nitrogen-fixation evidence.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-sky-50 border border-sky-200 space-y-2">
              <span className="text-2xl">⚡</span>
              <h3 className="font-bold text-base text-[#0369A1]">
                3. Constraint-Adapted Best Match
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Dynamically prioritizes drought-tolerant, rapid-maturing varieties when facing rain-fed dry spells, short tenancy leases, or drainage bottlenecks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#1B4332] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-emerald-200">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🌱</span>
            <span className="font-bold text-white text-base">TerraCrop</span>
            <span>— NASA Space Apps Challenge 2024</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a
              href="https://power.larc.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              NASA POWER
            </a>
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              © OpenStreetMap
            </a>
            <Link to="/login" className="hover:text-white font-semibold">
              Farmer Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
