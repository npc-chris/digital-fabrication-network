'use client';

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        body {
          font-family: 'Inter', sans-serif;
          background-color: #f7f9fb;
        }

        .glass {
          backdrop-filter: blur(20px);
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      <nav className="fixed top-0 z-50 w-full bg-white/80 shadow-[0_20px_40px_rgba(0,96,152,0.06)] backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
          <div className="text-2xl font-black tracking-tighter text-slate-900">DFN Lab</div>
          <div className="hidden items-center gap-10 md:flex">
            <span className="border-b-2 border-blue-700 pb-1 font-bold text-blue-700">Research</span>
            <span className="font-medium text-slate-600">Prototyping</span>
            <span className="font-medium text-slate-600">Stakeholders</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input className="w-48 rounded-full border-none bg-slate-100 py-2 pl-10 pr-4 text-sm transition-all focus:ring-2 focus:ring-primary" placeholder="Search..." type="text" />
            </div>
            <button className="rounded-xl bg-gradient-to-b from-primary-container to-primary px-6 py-2.5 font-semibold text-on-primary shadow-md transition-transform hover:scale-95 active:scale-90">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-8 pb-20 pt-32">
        <header className="mb-24">
          <div className="mb-6 inline-flex items-center rounded-full bg-primary-fixed px-4 py-1 text-xs font-bold uppercase tracking-widest text-on-primary-fixed-variant">
            Advancing Regional Capability
          </div>
          <h1 className="mb-8 text-6xl font-black leading-[0.9] tracking-tighter text-on-surface md:text-8xl">
            Accelerating <span className="bg-gradient-to-br from-primary to-secondary-container bg-clip-text text-transparent">Hardware Research</span> in West Africa
          </h1>
          <p className="max-w-3xl text-xl leading-relaxed text-on-surface-variant md:text-2xl">
            We bridge the gap between conceptual design and physical realization by providing a decentralized network of high-precision laboratories and industrial partnerships.
          </p>
        </header>

        <section className="mb-32">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-4xl font-black tracking-tight">Specialized Instrumentation</h2>
            <span className="flex items-center gap-2 font-bold text-primary">
              Explore Inventory <span className="material-symbols-outlined">arrow_forward</span>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="relative flex h-[500px] flex-col justify-end overflow-hidden rounded-[2rem] bg-surface-container-low p-10 md:col-span-2">
              <div className="absolute inset-0 z-0 opacity-20 transition-transform duration-700 group-hover:scale-110">
                <img
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVo0Ml4x3xb065fBhY-XZt_FpcNy1suyGBOvTVQ-Se9vb2qMYGVMwOKaiPj16XlCvZae50r1jesYkYLU-jekRnWeSWJm4XJqL9C83T15NjGgae-Z3e7zEUkWPIH5xcij1Y9jtT74WtMABOzLHDUy_QNbqtz96QMSWwr3HJ_7p5fC_qTJ0RCUgoWXc1rQOddt9Bn7tbB2Y56z15DlAHSqhJYv2UOzcf63ecsWyTZOaJyb73LewiPH9NJ7-gawPRCzJPTGQqPdCWDv4"
                  alt="Close up of high precision industrial laboratory equipment"
                />
              </div>
              <div className="relative z-10">
                <h3 className="mb-4 text-3xl font-bold">Precision CNC & Additive Core</h3>
                <p className="mb-6 max-w-md text-on-surface-variant">Access 5-axis milling and industrial-grade SLM 3D printing for rapid hardware iteration without international shipping delays.</p>
                <div className="flex gap-3">
                  <span className="rounded-full border border-outline-variant/20 bg-white/80 px-4 py-2 text-sm font-medium backdrop-blur-sm">Micron Accuracy</span>
                  <span className="rounded-full border border-outline-variant/20 bg-white/80 px-4 py-2 text-sm font-medium backdrop-blur-sm">Remote Access</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex-1 rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-sm">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">biotech</span>
                </div>
                <h4 className="mb-2 text-xl font-bold">Micro-electronics Lab</h4>
                <p className="text-sm text-on-surface-variant">Clean-room environments for PCB fabrication and sensor calibration.</p>
              </div>
              <div className="flex-1 rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-sm">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">architecture</span>
                </div>
                <h4 className="mb-2 text-xl font-bold">Material Stress Testing</h4>
                <p className="text-sm text-on-surface-variant">Validating structural integrity for regional environmental conditions.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mb-32 overflow-hidden rounded-[3rem] bg-primary-container p-12 text-on-primary-container md:p-20">
          <div className="relative z-10 max-w-3xl">
            <h2 className="mb-8 text-4xl font-black leading-tight md:text-5xl">Forging the Academic-Industry Alliance</h2>
            <p className="mb-12 text-lg opacity-80">
              We facilitate direct pipelines between West African universities and global hardware manufacturers. Our partnership framework ensures research results move from lab to production at record speeds.
            </p>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-4xl text-primary-fixed">handshake</span>
                <div>
                  <h5 className="mb-1 text-xl font-bold">Dual-Credit Research</h5>
                  <p className="text-sm opacity-70">Published academic research with integrated IP protection for industrial sponsors.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-4xl text-primary-fixed">factory</span>
                <div>
                  <h5 className="mb-1 text-xl font-bold">Production Sandboxing</h5>
                  <p className="text-sm opacity-70">Test manufacturing workflows in our labs before scaling to regional factories.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-32 grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="mb-6 text-4xl font-black tracking-tight">Open Data, Secure Innovation</h2>
            <p className="mb-8 text-lg text-on-surface-variant">DFN Lab implements strict data sharing protocols that balance open-science collaboration with the competitive needs of local inventors.</p>
            <ul className="space-y-6">
              <li className="flex items-center gap-4 rounded-2xl bg-surface-container p-4">
                <div className="rounded-lg bg-surface-container-lowest p-2 text-primary shadow-sm">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <span className="font-medium">Encrypted Telemetry for Lab Machines</span>
              </li>
              <li className="flex items-center gap-4 rounded-2xl bg-surface-container p-4">
                <div className="rounded-lg bg-surface-container-lowest p-2 text-primary shadow-sm">
                  <span className="material-symbols-outlined">hub</span>
                </div>
                <span className="font-medium">Decentralized IP Ledger (Regional Nodes)</span>
              </li>
              <li className="flex items-center gap-4 rounded-2xl bg-surface-container p-4">
                <div className="rounded-lg bg-surface-container-lowest p-2 text-primary shadow-sm">
                  <span className="material-symbols-outlined">schema</span>
                </div>
                <span className="font-medium">Standardized Metadata for Hardware Testing</span>
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] bg-white p-4 shadow-2xl">
              <img
                className="h-full w-full rounded-xl object-cover grayscale transition-all duration-700 hover:grayscale-0"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTKKNCDPinYjC3WjuKBFGHSuq7tJ9eMrshc4eJnnjMAUCVmWiJJ-1jwebQm5ZUSHKQlWCf4wKfgSMn0shQYYxSoZ_AlHg8RM6TFuYhCflsgAVS5Qk0lnS-_O_j-VGWJXU_yLQTvEddds2I8_HC2xuqViOuMoyFsM2IPDoDu4xc6mfJIq2UI2vdJEpOywZYw_q8njx2DNxEv6aoi9YFrhD3Q12HoKG4wdN2BJZR1N7PiDWahm1FZt1_aol3tYEZGKXZ2FNaYUwsqVns"
                alt="Visual dashboard showing complex data visualization with hardware stats"
              />
            </div>
            <div className="glass absolute -bottom-8 -left-8 max-w-xs rounded-2xl bg-primary/90 p-8 text-on-primary shadow-xl">
              <p className="text-sm italic font-medium">"Standardizing our data sharing has allowed 4 regional hubs to collaborate on a single agricultural sensor in real-time."</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest opacity-70">- Dr. Kwame T., Research Lead</p>
            </div>
          </div>
        </section>

        <section className="mb-20 rounded-[3rem] bg-surface-container-low py-20 text-center">
          <h2 className="mb-6 text-4xl font-black">Ready to lead the next hardware revolution?</h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-on-surface-variant">Join the network as a research fellow or institutional partner today and get access to the continent's most advanced fabrication infrastructure.</p>
          <div className="flex flex-col justify-center gap-4 md:flex-row">
            <button className="rounded-xl bg-primary px-10 py-4 font-bold text-on-primary transition-all hover:bg-primary-container">Submit Research Proposal</button>
            <button className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-10 py-4 font-bold text-on-surface transition-all hover:bg-surface-container">Download Network Map</button>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-slate-200/50 bg-slate-50 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-8 md:grid-cols-2 lg:flex lg:justify-between">
          <div>
            <div className="mb-2 text-lg font-bold text-slate-900">DFN Lab</div>
            <p className="text-sm leading-relaxed text-slate-500">© 2024 Digital Fabrication Lab. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap gap-8 lg:justify-end">
            <span className="text-sm text-slate-500 transition-colors hover:text-blue-700">Privacy Policy</span>
            <span className="text-sm text-slate-500 transition-colors hover:text-blue-700">Terms of Service</span>
            <span className="text-sm text-slate-500 transition-colors hover:text-blue-700">Contact Lab</span>
            <span className="text-sm text-slate-500 transition-colors hover:text-blue-700">Documentation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}