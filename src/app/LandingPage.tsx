import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F6F9F6] flex flex-col text-[#0F172A] font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-[#1B4332] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#1B4332] rounded-[14px] flex items-center justify-center text-xl text-white">
                🌱
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#1B4332]">
                TerraCrop
              </span>
              <span className="hidden sm:inline-block ml-2.5 text-[11px] bg-emerald-100/80 text-[#1B4332] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                NASA Space Apps Challenge
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="ghost" size="md" className="rounded-2xl font-bold">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                variant="primary"
                size="md"
                className="rounded-2xl font-extrabold bg-[#1B4332] hover:bg-[#245A43] shadow-md px-5"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (Inspired by Image 1 & 2) */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-white via-[#F6F9F6] to-[#F6F9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-100/90 text-[#1B4332] px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase border border-emerald-200">
                <span>🛰️ Real NASA Earth Observation Data</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#0F172A] leading-tight">
                Shaping the Future of{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B4332] to-emerald-600">
                  Modern Farming
                </span>
              </h1>

              <p className="text-base sm:text-xl text-[#475569] leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Compare crop rotation choices for Sri Lankan farms using real NASA POWER agroclimate metrics, field soil parameters, and FAO-56 crop water modeling.
              </p>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold bg-[#1B4332] hover:bg-[#245A43] shadow-lg text-base"
                  >
                    Plan Your Crop Rotation →
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold border-slate-300 text-slate-700 hover:border-[#1B4332] text-base"
                  >
                    Farmer Sign In
                  </Button>
                </Link>
              </div>

              <div className="pt-2 text-xs text-slate-500 font-medium">
                100% Free • No Mock Data • Focused on Sri Lanka's Agro-Ecological Zones
              </div>
            </div>

            {/* Right Visual Card Showcase (Inspired by Image 1 & 2) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm rounded-[32px] overflow-hidden shadow-2xl border-4 border-white bg-white">
                <img
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80"
                  alt="Modern Agriculture"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Floating Frosted Badges */}
                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md rounded-2xl px-3 py-1.5 shadow-md flex items-center space-x-2 text-xs font-bold text-[#1B4332]">
                  <span>🌱</span>
                  <span>Soil Moisture: 78%</span>
                </div>

                <div className="absolute top-4 right-4 bg-emerald-950/80 backdrop-blur-md rounded-2xl px-3 py-1.5 shadow-md text-xs font-bold text-emerald-200">
                  ☀️ 28°C Sunny
                </div>

                {/* Bottom Content inside Visual Card */}
                <div className="absolute bottom-5 left-5 right-5 text-white space-y-2">
                  <div className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
                    Next Optimal Crop
                  </div>
                  <div className="text-xl font-extrabold">Green Gram (Mung Bean)</div>
                  <div className="flex items-center justify-between text-xs text-slate-200">
                    <span>95% Suitability Match</span>
                    <span>70 Days Harvest</span>
                  </div>
                  <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-emerald-400 h-full w-[95%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
              Space Agency Science in the Farmer's Hands
            </h2>
            <p className="text-sm text-[#475569]">
              Verified satellite climatology directly integrated with FAO-56 agricultural guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 rounded-[28px] border border-slate-200/90 hover:shadow-md transition-all space-y-3 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0369A1] flex items-center justify-center text-2xl font-bold">
                🛰️
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                NASA POWER Daily Data
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Fetches real 90-day daily observations from NASA's Agroclimatology (AG) feed: regional rainfall, temperature range, humidity, solar radiation, and root-zone wetness.
              </p>
            </Card>

            <Card className="p-6 rounded-[28px] border border-slate-200/90 hover:shadow-md transition-all space-y-3 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#1B4332] flex items-center justify-center text-2xl font-bold">
                🌾
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                Deterministic Rotation Engine
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Evaluates crop water demand (ETc via Penman-Monteith), rotation family safety (breaking pathogen cycles), and season fit (Maha vs Yala) with what-if rainfall sliders.
              </p>
            </Card>

            <Card className="p-6 rounded-[28px] border border-slate-200/90 hover:shadow-md transition-all space-y-3 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center text-2xl font-bold">
                ✨
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                Gemini Advisory Explanations
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Generates clear, farmer-friendly rationales explaining why a crop was selected, risks to verify locally, and scientific evidence without leaking private farm GPS data.
              </p>
            </Card>
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
