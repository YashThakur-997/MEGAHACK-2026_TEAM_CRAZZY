import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Link as LinkIcon, Activity, ChevronRight, Database } from 'lucide-react';
import ManufacturerDashboard from './components/ui/manufacturer/ManufacturerDashboard.jsx';

// UI Components (Ensure these paths are correct in your project)
import { DotGlobeHero } from './components/ui/globe-hero.jsx';
import { AuthModal } from './components/auth/AuthModal.jsx';
import PharmaSealDashboard from './components/distributor/DistributorDashboard.jsx';

// Placeholder Components (Replace with your actual imports)
// const ManufacturerDashboard = () => <div className="p-20 text-white">Manufacturer Dashboard coming soon...</div>;
const PatientPortal = () => <div className="p-20 text-white">Patient Verification Portal coming soon...</div>;

// --- SUB-COMPONENTS ---

const Navbar = ({ openAuthModal }) => (
  <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
    <div className="w-full px-6 md:px-12 lg:px-24 h-20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-500" />
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text tracking-wide">
          PharmaSeal
        </span>
      </div>
      <div className="flex flex-shrink-0 items-center gap-4">
        <button onClick={openAuthModal} className="hidden lg:block px-6 py-2.5 rounded-full text-white text-sm font-medium hover:text-blue-400 transition-colors cursor-pointer">
          Login
        </button>
        <button onClick={openAuthModal} className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)] cursor-pointer">
          Launch App
        </button>
      </div>
    </div>
  </nav>
);

const StatBar = () => {
  const stats = [
    { label: "Secured Drugs", value: "2M+" },
    { label: "Active Nodes", value: "1,200" },
    { label: "Counterfeits Prevented", value: "50k+" },
    { label: "Network Uptime", value: "99.99%" },
  ];
  return (
    <div className="w-full bg-black border-y border-white/5 py-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</span>
            <span className="text-sm text-gray-500">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RoleCards = () => {
  const navigate = useNavigate();
  const roles = [
    { title: "Manufacturer", path: "/manufacturer", desc: "Mint secure NFTs for each batch, ensuring the origin is immutable.", icon: <Database className="w-8 h-8 text-emerald-400" />, color: "from-emerald-500/20 to-emerald-500/0", border: "hover:border-emerald-500/50" },
    { title: "Distributor", path: "/distributor", desc: "Record chain-of-custody handoffs and verify batch integrity during transit.", icon: <LinkIcon className="w-8 h-8 text-blue-400" />, color: "from-blue-500/20 to-blue-500/0", border: "hover:border-blue-500/50" },
    { title: "Hospital / Pharmacy", path: "/patient", desc: "Authenticate medicines instantly before final delivery to the patient.", icon: <Activity className="w-8 h-8 text-purple-400" />, color: "from-purple-500/20 to-purple-500/0", border: "hover:border-purple-500/50" }
  ];
  return (
    <div id="roles" className="py-24 bg-black relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, i) => (
            <div key={i} onClick={() => navigate(role.path)} className={`cursor-pointer p-8 rounded-2xl bg-gradient-to-b ${role.color} border border-white/10 ${role.border} transition-colors bg-black/50 backdrop-blur-sm group`}>
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-6">{role.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{role.title}</h3>
              <p className="text-gray-400 leading-relaxed">{role.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- LANDING PAGE ---

const LandingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navbar openAuthModal={() => setIsModalOpen(true)} />
      
      {/* Ensure AuthModal receives these props */}
      <AuthModal 
        isOpen={isModalOpen} 
        closeModal={() => setIsModalOpen(false)} 
        step={step} 
        setStep={setStep}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
      />
      
      <main>
        <section className="relative">
          <DotGlobeHero rotationSpeed={0.003} globeRadius={1.2}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-32 max-w-5xl mx-auto px-6 text-center">
              <h1 className="text-5xl md:text-8xl font-bold mb-8">
                Blockchain-Powered <br/>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">Drug Provenance</span>
              </h1>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/manufacturer" className="h-16 px-10 rounded-full bg-blue-600 flex items-center gap-2 text-xl font-bold hover:bg-blue-500 transition-all">
                  Manufacturer <ChevronRight />
                </Link>
                <Link to="/distributor" className="h-16 px-10 rounded-full bg-blue-600 flex items-center gap-2 text-xl font-bold hover:bg-blue-500 transition-all">
                  Distributor <ChevronRight />
                </Link>
                <Link to="/patient" className="h-16 px-10 rounded-full bg-blue-600 flex items-center gap-2 text-xl font-bold hover:bg-blue-500 transition-all">
                  Patient <ChevronRight />
                </Link>
              </div>
            </motion.div>
          </DotGlobeHero>
        </section>

        <StatBar />
        <RoleCards />
      </main>
    </div>
  );
};

// --- MAIN APP WITH ROUTING ---

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/distributor" element={<PharmaSealDashboard />} />
        <Route path="/manufacturer" element={<ManufacturerDashboard />} />
        <Route path="/patient" element={<PatientPortal />} />
      </Routes>
  );
}