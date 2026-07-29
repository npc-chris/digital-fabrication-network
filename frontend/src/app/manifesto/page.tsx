'use client';

import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';

export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        body {
          font-family: 'Inter', sans-serif;
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      <LandingNavbar active={null} />

      <main className="pt-14">
        {/* Hero Section - Viewport Height */}
        <section className="relative min-h-[calc(100vh-3.5rem)] flex items-end overflow-hidden pb-4 sm:pb-6 lg:pb-8">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover"
              alt="Heavy industrial precision manufacturing facility"
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1920&auto=format&fit=crop"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#004873]/95 via-[#004873]/85 to-[#004873]/45"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#002e4a]/90 via-[#002e4a]/30 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-2">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-black text-white tracking-tighter leading-[1.02] mb-4 sm:text-5xl lg:text-6xl">
                The Digital Infrastructure for{' '}
                <span className="bg-gradient-to-r from-sky-200 via-sky-300 to-sky-400 bg-clip-text text-transparent">
                  Local Manufacturing
                </span>
              </h1>
              <p className="text-lg text-white/90 leading-relaxed mb-2 max-w-2xl sm:text-xl font-medium">
                Connecting engineering designs, shop floor capacity, and supply chains for scaled volume manufacturing locally.
              </p>
            </div>
          </div>
        </section>

        {/* Section 1: Bridging the Industrial Disconnect - Viewport Height */}
        <section className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-8 sm:mb-10 max-w-3xl">
            <h2 className="text-3xl font-black text-[#191c1e] tracking-tighter mb-3 sm:text-4xl lg:text-5xl">
              Bridging the Industrial Disconnect
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              High regional demand for finished hardware meets underutilized local machine capacity. We build the digital layer to bridge the gap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Card 1: Unlocking Hidden Capacity */}
            <div className="md:col-span-7 p-6 sm:p-8 bg-white rounded-[2rem] shadow-sm border border-slate-200/60 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#006098]/10 text-[#006098] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-xl">precision_manufacturing</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#191c1e] mb-3">Unlocking Hidden Capacity</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  Nigeria possesses thousands of capable CNC machines, lathes, 3D printers, and skilled fabricators operating in isolation below full utilization. DFN aggregates and standardizes this distributed machine power into a unified, high-throughput network.
                </p>
              </div>
            </div>

            {/* Card 2: From Import Dependency to Local Supply */}
            <div className="md:col-span-5 p-6 sm:p-8 bg-[#004873] text-white rounded-[2rem] shadow-xl shadow-sky-900/15 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/10 text-sky-300 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-xl">published_with_changes</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">Replacing Supply Chain Vulnerability</h3>
                <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                  Over-reliance on foreign capital goods creates long lead times, exposure to currency fluctuations, and fragile operations. On-demand local manufacturing turns delivery timelines from months into days.
                </p>
              </div>
            </div>

            {/* Card 3: Actionable Software Orchestration */}
            <div className="md:col-span-5 p-6 sm:p-8 bg-[#f2f4f6] rounded-[2rem] border border-slate-200/60 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#006098]/10 text-[#006098] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-xl">hub</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#191c1e] mb-3">Software-Driven Orchestration</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  Rather than waiting years for monolithic mega-facilities, intelligent software routing enables independent machine shops to coordinate and fulfill complex production orders today.
                </p>
              </div>
            </div>

            {/* Card 4: Image with Overlay Quote */}
            <div className="md:col-span-7 relative min-h-[220px] sm:min-h-[250px] rounded-[2rem] overflow-hidden group">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="Precision metal fabrication sparks and industrial machining workshop"
                src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=1200&auto=format&fit=crop"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#191c1e]/90 via-[#191c1e]/50 to-transparent flex items-end p-6 sm:p-8">
                <div>
                  <p className="text-xs font-bold text-sky-300 uppercase tracking-widest mb-1">Our Operating Perspective</p>
                  <p className="text-white font-medium italic text-base sm:text-lg leading-relaxed">
                    &quot;Real economic transformation happens when local engineering designs connect seamlessly to local machine beds.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: What We Build — Viewport Height */}
        <section className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center bg-[#f2f4f6] py-10 sm:py-14 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="mb-8 sm:mb-10 max-w-3xl">
              <h2 className="text-3xl font-black text-[#191c1e] tracking-tighter mb-3 sm:text-4xl lg:text-5xl">
                What We Build
              </h2>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                We engineer solutions, software protocols and digital infrastructure that turn fragmented machine shops into standardized, enterprise-grade production pipelines.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-stretch">
              {/* Image Side */}
              <div className="flex-1 w-full min-h-[280px] sm:min-h-[340px] relative rounded-[2rem] overflow-hidden shadow-lg">
                <img
                  className="w-full h-full object-cover"
                  alt="High precision CNC milling and metal fabrication equipment"
                  src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1200&auto=format&fit=crop"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#004873]/90 via-transparent to-transparent flex items-end p-6">
                </div>
              </div>

              {/* Functional Tool Pillars */}
              <div className="flex-1 flex flex-col justify-center space-y-4">
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                  <h3 className="text-lg font-bold text-[#191c1e] mb-1.5 flex items-center gap-3">
                    <span className="text-[#006098] font-black text-lg">01</span>
                    CONNECT (Capacity & Routing)
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Automated matching between 3D CAD engineering models and verified local machine nodes based on material compatibility, precision tolerance, and real-time availability.
                  </p>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                  <h3 className="text-lg font-bold text-[#191c1e] mb-1.5 flex items-center gap-3">
                    <span className="text-[#006098] font-black text-lg">02</span>
                    FABRICATE (Prototype to Production)
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Standardized CAD-to-Cut toolpaths and execution tracking that transition physical prototypes smoothly into reliable, batch manufacturing runs.
                  </p>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                  <h3 className="text-lg font-bold text-[#191c1e] mb-1.5 flex items-center gap-3">
                    <span className="text-[#006098] font-black text-lg">03</span>
                    BENCHMARK (Quality & Engineering Specs)
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Material spectral verification, dimensional tolerance validation, and engineering reverse-tooling protocols to ensure local fabrication meets global quality standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Strategic Commitments — Viewport Height */}
        <section className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center py-10 sm:py-14 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Asset Consolidation Card */}
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-sm border border-slate-200/60 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#006098] text-white flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-2xl">build_circle</span>
                </div>
                <h3 className="text-2xl font-black text-[#191c1e] tracking-tighter mb-4 sm:text-3xl">
                  Consolidate First, Scale Second
                </h3>
                <p className="text-base text-slate-600 leading-relaxed mb-6">
                  Before deploying massive capital into new facilities, we aggregate, map, and standardize existing underutilized CNCs, lathes, and foundries across the region to unlock immediate capacity.
                </p>
              </div>
              <div className="p-5 bg-[#f7f9fb] rounded-2xl border border-slate-200/60">
                <p className="text-[#191c1e] font-bold text-sm mb-1">Capital Efficiency</p>
                <p className="text-slate-600 text-xs sm:text-sm">
                  Maximizing throughput from existing local capital assets before building anew.
                </p>
              </div>
            </div>

            {/* Formalizing Fabrication Card */}
            <div className="bg-[#004873] text-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-2xl">account_tree</span>
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-4 sm:text-3xl">
                  Formalizing Local Fabricators
                </h3>
                <p className="text-base text-white/80 leading-relaxed mb-6">
                  Integrating informal workshops into benchmarked, enterprise-grade supply chains. We connect local craftsmen with verified digital designs, quality control tools, and structured production queues.
                </p>
              </div>
              <div className="p-5 bg-white/10 rounded-2xl border border-white/10">
                <p className="text-lg font-bold mb-1">Informal is not inefficient.</p>
                <p className="text-xs sm:text-sm text-white/70">
                  It is simply unnetworked. DFN provides the protocol to unify it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: The Core Principles (Tenets) — Viewport Height */}
        <section className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center py-10 sm:py-14 bg-[#191c1e] text-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-6 opacity-10 select-none">
              AUTONOMY
            </h2>
            <div className="max-w-4xl mx-auto -mt-12 sm:-mt-16">
              <h3 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">
                The Core Principles of DFN
              </h3>
              <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-10 max-w-2xl mx-auto">
                Grounded standards guiding every protocol and toolchain we engineer.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-sky-400 font-black text-lg mb-1.5">01</p>
                  <h4 className="text-lg font-bold text-white mb-1.5">Industrial Autonomy</h4>
                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                    True economic stability requires the capability to fabricate critical spare parts, tools, and hardware components locally on demand.
                  </p>
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-sky-400 font-black text-lg mb-1.5">02</p>
                  <h4 className="text-lg font-bold text-white mb-1.5">Pragmatic Realism</h4>
                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                    Engineering digital tools designed specifically to function reliably within local power grids, material availability, and logistics realities.
                  </p>
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-sky-400 font-black text-lg mb-1.5">03</p>
                  <h4 className="text-lg font-bold text-white mb-1.5">Precision Standards</h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Local manufacturing must adhere strictly to international engineering tolerances, material specifications, and quality verification.
                  </p>
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-sky-400 font-black text-lg mb-1.5">04</p>
                  <h4 className="text-lg font-bold text-white mb-1.5">Measured by Production Output</h4>
                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                    We measure progress strictly by high-precision physical components manufactured and delivered on time to local industries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


