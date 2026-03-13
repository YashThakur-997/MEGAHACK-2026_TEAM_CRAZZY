import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Link as LinkIcon, Activity, ChevronRight, Database } from 'lucide-react';
import { DotGlobeHero } from './components/ui/globe-hero.jsx';
import { AuthModal } from './components/auth/AuthModal.jsx';
import SkyToggle from './components/ui/sky-toggle';

// Navbar Component
const Navbar = ({ openAuthModal, isDark, onToggleTheme }) => (
  <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
    <div className="w-full px-6 md:px-12 lg:px-24 h-20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-500" />
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text tracking-wide">
          PharmaSeal
        </span>
      </div>
      <div className={`hidden md:flex flex-1 items-center justify-center gap-12 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-800'}`}>
        <a href="#how-it-works" className={`transition-colors cursor-pointer text-base uppercase tracking-wider ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>How it works</a>
        <a href="#roles" className={`transition-colors cursor-pointer text-base uppercase tracking-wider ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>Network Roles</a>
        <a href="#about" className={`transition-colors cursor-pointer text-base uppercase tracking-wider ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>About Us</a>
      </div>
      <div className="flex flex-shrink-0 items-center gap-4">
        <div className="hidden md:block">
          <SkyToggle checked={isDark} onChange={onToggleTheme} />
        </div>
        <button
          onClick={openAuthModal}
          className="hidden lg:block px-6 py-2.5 rounded-full text-white text-sm font-medium hover:text-blue-400 transition-colors cursor-pointer"
        >
          Login
        </button>
        <button
          onClick={openAuthModal}
          className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)] cursor-pointer"
        >
          Launch App
        </button>
      </div>
    </div>
  </nav>
);

// Stat Bar
const StatBar = ({ isDark }) => {
  const stats = [
    { label: "Secured Drugs", value: "2M+" },
    { label: "Active Nodes", value: "1,200" },
    { label: "Counterfeits Prevented", value: "50k+" },
    { label: "Network Uptime", value: "99.99%" },
  ];
  const bgClass = isDark ? 'bg-black border-white/5' : 'bg-slate-100 border-slate-200';

  return (
    <div className={`w-full ${bgClass} py-8`}>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className={`text-3xl md:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Role Cards
const RoleCards = ({ isDark }) => {
  const roles = [
    {
      title: "Manufacturer",
      desc: "Mint secure NFTs for each batch, ensuring the origin is immutable.",
      icon: <Database className="w-8 h-8 text-emerald-400" />,
      color: "from-emerald-500/20 to-emerald-500/0",
      border: "hover:border-emerald-500/50"
    },
    {
      title: "Distributor",
      desc: "Record chain-of-custody handoffs and verify batch integrity during transit.",
      icon: <LinkIcon className="w-8 h-8 text-blue-400" />,
      color: "from-blue-500/20 to-blue-500/0",
      border: "hover:border-blue-500/50"
    },
    {
      title: "Hospital / Pharmacy",
      desc: "Authenticate medicines instantly before final delivery to the patient.",
      icon: <Activity className="w-8 h-8 text-purple-400" />,
      color: "from-purple-500/20 to-purple-500/0",
      border: "hover:border-purple-500/50"
    }
  ];

  const sectionBg = isDark ? 'bg-black' : 'bg-slate-50';

  return (
    <div id="roles" className={`py-24 ${sectionBg} relative`}>
      <div className="absolute inset-0 bg-blue-900/5 rounded-full blur-[120px] max-w-lg mx-auto pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">A Unified Network</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">Every participant plays a vital role in keeping the pharmaceutical supply chain secure and transparent.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, i) => (
            <div key={i} className={`p-8 rounded-2xl bg-gradient-to-b ${role.color} border border-white/10 ${role.border} transition-colors bg-black/50 backdrop-blur-sm group`}>
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform">
                {role.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{role.title}</h3>
              <p className="text-gray-400 leading-relaxed">{role.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// How it Works
const HowItWorks = ({ isDark }) => {
  const steps = [
    { title: "Mint", desc: "Digital twin NFTs are created for physical medicine batches." },
    { title: "Track", desc: "Real-time location and temperature data recorded on-chain." },
    { title: "Verify", end: true, desc: "End users scan QR codes to confirm authenticity instantly." },
  ];

  const sectionBg = isDark ? 'bg-[#050505]' : 'bg-slate-100';

  const cardBg = isDark
    ? 'bg-white/[0.02] hover:bg-white/[0.04] border-white/5'
    : 'bg-white hover:bg-slate-100 border-slate-200';

  const headingText = isDark ? 'text-white' : 'text-slate-900';
  const bodyText = isDark ? 'text-gray-400' : 'text-slate-700';

  return (
    <div id="how-it-works" className={`py-24 ${sectionBg}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${headingText}`}>How It Works</h2>
          <p className={`${bodyText} max-w-xl mx-auto text-lg`}>Three simple steps to eradicate counterfeit drugs using blockchain.</p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div className={`relative p-8 w-full md:w-80 rounded-2xl border transition-colors ${cardBg}`}>
                <div className="text-blue-500 font-mono text-sm mb-4">0{i+1}</div>
                <h3 className={`text-2xl font-bold mb-2 ${headingText}`}>{step.title}</h3>
                <p className={bodyText}>{step.desc}</p>
              </div>
              {!step.end && (
                <div className="hidden md:flex text-gray-700">
                  <ChevronRight className="w-8 h-8" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// Infinite Slider for Brands
const InfiniteSlider = ({ isDark }) => {
  const brands = [
    "Pfizer", "Novartis", "Roche", "Merck", "Johnson & Johnson", 
    "GSK", "Sanofi", "AstraZeneca", "Abbott", "Bayer"
  ];
  
  const bgClass = isDark ? 'bg-black border-white/5' : 'bg-slate-100 border-slate-200';

  return (
    <div className={`w-full py-16 overflow-hidden border-y ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <p className="text-sm font-semibold tracking-widest text-gray-500 uppercase">Trusted by Global Healthcare Leaders</p>
      </div>
      <div className="relative w-full flex overflow-x-hidden pt-4">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16">
          {[...brands, ...brands, ...brands].map((brand, i) => (
            <span key={i} className="text-2xl md:text-3xl font-bold text-white/20 hover:text-white/50 transition-colors pointer-events-none">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};


// Footer CTA
const Footer = ({ isDark }) => (
  <footer className={`w-full py-20 border-t relative overflow-hidden ${isDark ? 'bg-black border-white/10' : 'bg-slate-100 border-slate-200'}`}>
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
      <h2 className={`text-4xl md:text-6xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Securing the Future of Health.</h2>
      <p className={`text-xl mb-10 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-slate-700'}`}>Join the decentralized network ensuring every patient receives authentic, safe medication.</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors cursor-pointer">
          Start Integrating
        </button>
        <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-colors border border-white/10 cursor-pointer">
          Read Documentation
        </button>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [isDark, setIsDark] = useState(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setStep(1);
      setSelectedRole(null);
      setAuthMode(null);
    }, 300);
  };

  const handleOverlayClick = () => closeModal();
  const openAuthModal = () => setIsModalOpen(true);
  const handleToggleTheme = (next) => setIsDark(next);

  const themeClasses = isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900';

  return (
    <div className={`min-h-screen selection:bg-blue-500/30 font-sans ${themeClasses}`}>
      <Navbar openAuthModal={openAuthModal} isDark={isDark} onToggleTheme={handleToggleTheme} />
      
      <main>
        {/* Hero Section */}
        <section className="relative">
          <DotGlobeHero rotationSpeed={0.003} globeRadius={1.2}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mt-32 max-w-5xl mx-auto px-6 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
                Live on Testnet
              </div>
              <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Blockchain-Powered <br className="hidden md:block"/>
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
                  Drug Provenance
                </span>
              </h1>
              <p className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-700'}`}>
                Immutable tracking from manufacturer to patient. Preventing counterfeits, ensuring compliance, and saving lives through decentralization.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="h-16 px-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 cursor-pointer text-xl">
                  Manufacturer
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button className="h-16 px-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 cursor-pointer text-xl">
                  Distributor
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button className="h-16 px-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 cursor-pointer text-xl">
                  Patient
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </DotGlobeHero>
          
          <div
            className={`absolute bottom-0 w-full h-32 pointer-events-none ${
              isDark
                ? 'bg-gradient-to-t from-black to-transparent'
                : 'bg-gradient-to-t from-slate-50 to-transparent'
            }`}
          />
        </section>

        <StatBar isDark={isDark} />
        <InfiniteSlider isDark={isDark} />
        <HowItWorks isDark={isDark} />
        <RoleCards isDark={isDark} />
      </main>

      <Footer isDark={isDark} />

      <AuthModal
        isOpen={isModalOpen}
        step={step}
        setStep={setStep}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        authMode={authMode}
        setAuthMode={setAuthMode}
        closeModal={closeModal}
        handleOverlayClick={handleOverlayClick}
      />
    </div>
  )
}
