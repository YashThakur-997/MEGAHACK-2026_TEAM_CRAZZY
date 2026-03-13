import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Link as LinkIcon, Activity, ChevronRight, Database } from 'lucide-react';

import { DotGlobeHero } from './components/ui/globe-hero.jsx';
import { AuthModal } from './components/auth/AuthModal.jsx';
import PharmaSealDashboard from './components/distributor/DistributorDashboard.jsx';
import ManufacturerDashboard from './components/ui/manufacturer/ManufacturerDashboard.jsx';
import RegisterBatch from './components/ui/manufacturer/RegisterBatch.jsx';
import BatchList from './components/ui/manufacturer/BatchList.jsx';
import SkyToggle from './components/ui/sky-toggle';

const PatientPortal = () => (
  <div className="min-h-screen bg-black text-white grid place-items-center px-6">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Patient Verification Portal</h1>
      <p className="text-gray-400">Coming soon</p>
    </div>
  </div>
);

const Navbar = ({ openAuthModal, isDark, onToggleTheme }) => (
  <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
    <div className="w-full px-6 md:px-12 lg:px-24 h-20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-500" />
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text tracking-wide">
          PharmaSeal
        </span>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden md:block">
          <SkyToggle checked={isDark} onChange={onToggleTheme} />
        </div>
        <button
          onClick={openAuthModal}
          className="hidden lg:block px-6 py-2.5 rounded-full text-white text-sm font-medium hover:text-blue-400 transition-colors"
        >
          Login
        </button>
        <button
          onClick={openAuthModal}
          className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)]"
        >
          Launch App
        </button>
      </div>
    </div>
  </nav>
);

const RoleCards = ({ isDark, navigate }) => {
  const roles = [
    {
      title: 'Manufacturer',
      path: '/manufacturer',
      desc: 'Mint secure NFTs for each batch, ensuring the origin is immutable.',
      icon: <Database className="w-8 h-8 text-emerald-400" />,
      color: 'from-emerald-500/20 to-emerald-500/0',
      border: 'hover:border-emerald-500/50',
    },
    {
      title: 'Distributor',
      path: '/distributor',
      desc: 'Record chain-of-custody handoffs and verify batch integrity during transit.',
      icon: <LinkIcon className="w-8 h-8 text-blue-400" />,
      color: 'from-blue-500/20 to-blue-500/0',
      border: 'hover:border-blue-500/50',
    },
    {
      title: 'Hospital / Pharmacy',
      path: '/patient',
      desc: 'Authenticate medicines instantly before final delivery to the patient.',
      icon: <Activity className="w-8 h-8 text-purple-400" />,
      color: 'from-purple-500/20 to-purple-500/0',
      border: 'hover:border-purple-500/50',
    },
  ];

  return (
    <div id="roles" className={`py-24 ${isDark ? 'bg-black' : 'bg-slate-50'} relative`}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <button
              key={role.title}
              onClick={() => navigate(role.path)}
              className={`text-left p-8 rounded-2xl bg-gradient-to-b ${role.color} border border-white/10 ${role.border} transition-colors bg-black/50 backdrop-blur-sm group`}
            >
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform">
                {role.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{role.title}</h3>
              <p className="text-gray-400 leading-relaxed">{role.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [authMode, setAuthMode] = useState(null);

  const openAuthModal = () => {
    setStep(1);
    setSelectedRole(null);
    setAuthMode(null);
    setIsModalOpen(true);
  };

  const closeAuthModal = () => setIsModalOpen(false);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'} selection:bg-blue-500/30`}>
      <Navbar openAuthModal={openAuthModal} isDark={isDark} onToggleTheme={setIsDark} />

      <AuthModal
        isOpen={isModalOpen}
        closeModal={closeAuthModal}
        handleOverlayClick={closeAuthModal}
        step={step}
        setStep={setStep}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        authMode={authMode}
        setAuthMode={setAuthMode}
      />

      <main>
        <section className="relative">
          <DotGlobeHero rotationSpeed={0.003} globeRadius={1.2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="mt-32 max-w-5xl mx-auto px-6 text-center"
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 text-white">
                Blockchain-Powered <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
                  Drug Provenance
                </span>
              </h1>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/manufacturer')}
                  className="h-16 px-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 text-xl"
                >
                  Manufacturer
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/distributor')}
                  className="h-16 px-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 text-xl"
                >
                  Distributor
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/patient')}
                  className="h-16 px-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 text-xl"
                >
                  Patient
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </DotGlobeHero>
        </section>

        <RoleCards isDark={isDark} navigate={navigate} />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/distributor" element={<PharmaSealDashboard />} />
      <Route path="/distributor/dashboard" element={<PharmaSealDashboard />} />
      <Route path="/manufacturer" element={<ManufacturerDashboard />} />
      <Route path="/manufacturer/dashboard" element={<ManufacturerDashboard />} />
      <Route path="/manufacturer/register-batch" element={<RegisterBatch />} />
      <Route path="/manufacturer/batch-list" element={<BatchList />} />
      <Route path="/patient" element={<PatientPortal />} />
      <Route path="/patient/dashboard" element={<PatientPortal />} />
    </Routes>
  );
}
