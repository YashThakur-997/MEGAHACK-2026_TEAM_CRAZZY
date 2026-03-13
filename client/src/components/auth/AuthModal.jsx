import React, { useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Factory,
  Truck,
  UserCheck,
  LogIn,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react'
import { AuthInput } from './AuthInput.jsx'

export const AuthModal = ({
  isOpen,
  step,
  setStep,
  selectedRole,
  setSelectedRole,
  authMode,
  setAuthMode,
  closeModal,
  handleOverlayClick,
}) => {
  const navigate = useNavigate()

  const roles = useMemo(
    () => [
      {
        id: 'manufacturer',
        label: 'Manufacturer',
        subtitle: 'Register & dispatch drug batches',
        icon: Factory,
        accent: '#3B82F6',
        dashboard: '/manufacturer/dashboard',
      },
      {
        id: 'distributor',
        label: 'Distributor',
        subtitle: 'Verify shipments & track routes',
        icon: Truck,
        accent: '#A855F7',
        dashboard: '/distributor/dashboard',
      },
      {
        id: 'patient',
        label: 'Patient',
        subtitle: 'Scan & verify your medicine',
        icon: UserCheck,
        accent: '#22C55E',
        dashboard: '/patient/dashboard',
      },
    ],
    [],
  )

  const activeRole = roles.find((r) => r.id === selectedRole) ?? null

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, closeModal])

  const handleLogin = async (e) => {
    e.preventDefault()
    closeModal()
    if (activeRole?.dashboard) navigate(activeRole.dashboard)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    closeModal()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-4 lg:mx-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
            style={{
              background: 'rgba(10,10,10,0.95)',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors z-10"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="px-7 py-8 sm:px-10 sm:py-10">
              {/* Progress indicator */}
              <div className="flex items-center gap-0 mb-8">
                {[1, 2, 3].map((s, i) => (
                  <React.Fragment key={s}>
                    <div
                      className="w-2 h-2 rounded-full transition-all duration-300"
                      style={{
                        background:
                          step > s
                            ? `${activeRole?.accent ?? '#3B82F6'}60`
                            : step === s
                              ? activeRole?.accent ?? '#3B82F6'
                              : 'rgba(255,255,255,0.15)',
                      }}
                    />
                    {i < 2 && (
                      <div
                        className="flex-1 h-px transition-all duration-500"
                        style={{
                          background:
                            step > s + 1
                              ? `${activeRole?.accent ?? '#3B82F6'}40`
                              : 'rgba(255,255,255,0.08)',
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${step}-${authMode ?? 'none'}-${selectedRole ?? 'none'}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {step === 1 && (
                    <>
                      <h2 className="text-2xl font-semibold text-white mb-1">Who are you?</h2>
                      <p className="text-base text-white/40 mb-6">Select your role to continue</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {roles.map((role) => (
                          <motion.button
                            key={role.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedRole(role.id)
                              setStep(2)
                            }}
                            className="flex items-center gap-4 px-5 py-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 text-left w-full group"
                          >
                            <div
                              className="w-0.5 h-10 rounded-full flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
                              style={{ background: role.accent }}
                            />

                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: `${role.accent}15` }}
                            >
                              <role.icon size={18} style={{ color: role.accent }} />
                            </div>

                            <div className="flex-1">
                              <p className="text-base font-semibold text-white leading-snug">
                                {role.label}
                              </p>
                              <p className="text-sm text-white/35 mt-0.5">{role.subtitle}</p>
                            </div>

                            <ArrowRight
                              size={16}
                              className="text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all duration-200"
                            />
                          </motion.button>
                        ))}
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedRole(null)
                          setStep(1)
                        }}
                        className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border text-xs font-mono hover:bg-white/5 transition-colors"
                        style={{
                          borderColor: `${activeRole?.accent}40`,
                          color: activeRole?.accent,
                          background: `${activeRole?.accent}10`,
                        }}
                      >
                        {activeRole && <activeRole.icon size={12} />}
                        {activeRole?.label}
                        <span className="text-white/25 ml-1">✕ change</span>
                      </button>

                      <h2 className="text-2xl font-semibold text-white mb-1">
                        How do you want to continue?
                      </h2>
                      <p className="text-base text-white/40 mb-6">Login or create a new account</p>

                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setAuthMode('login')
                            setStep(3)
                          }}
                          className="flex-1 flex flex-col items-start gap-1 px-6 py-5 rounded-xl border border-white/12 bg-transparent hover:bg-white/5 hover:border-white/20 transition-all duration-200"
                        >
                          <div className="flex items-center gap-2">
                            <LogIn size={16} className="text-white/70" />
                            <span className="text-base font-semibold text-white">Login</span>
                          </div>
                          <span className="text-sm text-white/35">Already registered</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setAuthMode('register')
                            setStep(3)
                          }}
                          className="flex-1 flex flex-col items-start gap-1 px-6 py-5 rounded-xl border-0 transition-all duration-200"
                          style={{ background: activeRole?.accent }}
                        >
                          <div className="flex items-center gap-2">
                            <UserPlus size={16} className="text-white" />
                            <span className="text-base font-semibold text-white">Register</span>
                          </div>
                          <span className="text-sm text-white/80">New to PharmaSeal</span>
                        </motion.button>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <button
                        onClick={() => setStep(2)}
                        className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors mb-4"
                      >
                        <ArrowLeft size={14} />
                        back
                      </button>

                      <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono mb-6"
                        style={{
                          borderColor: `${activeRole?.accent}40`,
                          color: activeRole?.accent,
                          background: `${activeRole?.accent}10`,
                        }}
                      >
                        {activeRole && <activeRole.icon size={12} />}
                        {activeRole?.label} — {authMode === 'login' ? 'Login' : 'Register'}
                      </div>

                      {authMode === 'login' && (
                        <form onSubmit={handleLogin} className="flex flex-col gap-3">
                          <AuthInput type="email" placeholder="Official email" required />
                          <AuthInput type="password" placeholder="Password" required />

                          <p className="text-right text-xs text-white/25 hover:text-white/50 cursor-pointer transition-colors -mt-1">
                            Forgot password?
                          </p>

                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full h-12 rounded-xl text-base font-semibold text-white mt-2"
                            style={{ background: activeRole?.accent }}
                          >
                            Login as {activeRole?.label}
                          </motion.button>
                        </form>
                      )}

                      {authMode === 'register' && (
                        <form onSubmit={handleRegister} className="flex flex-col">
                          {selectedRole === 'manufacturer' && (
                            <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                              <p className="text-[10px] font-mono text-white/25 tracking-widest uppercase">
                                — company info
                              </p>
                              <AuthInput placeholder="Company name" required />
                              <AuthInput placeholder="Drug License No.  MFG/2024/XXXXX" required />
                              <AuthInput placeholder="CDSCO Approval No." required />
                              <AuthInput placeholder="GST Number  22AAAAA0000A1Z5" required />

                              <p className="text-[10px] font-mono text-white/25 tracking-widest uppercase mt-2">
                                — authorized person
                              </p>
                              <AuthInput placeholder="Authorized person full name" required />
                              <AuthInput type="tel" placeholder="Phone  +91 XXXXX XXXXX" required />

                              <p className="text-[10px] font-mono text-white/25 tracking-widest uppercase mt-2">
                                — credentials
                              </p>
                              <AuthInput type="email" placeholder="Official email" required />
                              <AuthInput type="password" placeholder="Password" required />
                              <AuthInput type="password" placeholder="Confirm password" required />
                            </div>
                          )}

                          {selectedRole === 'distributor' && (
                            <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                              <p className="text-[10px] font-mono text-white/25 tracking-widest uppercase">
                                — company info
                              </p>
                              <AuthInput placeholder="Company / Firm name" required />
                              <AuthInput
                                placeholder="Drug Distribution License No.  DL/2024/XXXXX"
                                required
                              />
                              <AuthInput placeholder="GST Number" required />
                              <AuthInput placeholder="State of operation  Maharashtra, Gujarat..." required />
                              <AuthInput placeholder="Warehouse address" required />

                              <p className="text-[10px] font-mono text-white/25 tracking-widest uppercase mt-2">
                                — authorized person
                              </p>
                              <AuthInput placeholder="Authorized person full name" required />
                              <AuthInput type="tel" placeholder="Phone  +91 XXXXX XXXXX" required />

                              <p className="text-[10px] font-mono text-white/25 tracking-widest uppercase mt-2">
                                — credentials
                              </p>
                              <AuthInput type="email" placeholder="Official email" required />
                              <AuthInput type="password" placeholder="Password" required />
                              <AuthInput type="password" placeholder="Confirm password" required />
                            </div>
                          )}

                          {selectedRole === 'patient' && (
                            <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                              <p className="text-[10px] font-mono text-white/25 tracking-widest uppercase">
                                — personal info
                              </p>
                              <AuthInput placeholder="Full name" required />
                              <AuthInput type="email" placeholder="Email" required />
                              <AuthInput type="tel" placeholder="Phone  +91 XXXXX XXXXX" required />
                              <AuthInput placeholder="City" required />
                              <AuthInput placeholder="Aadhar Number  XXXX XXXX XXXX (optional)" />

                              <p className="text-[10px] font-mono text-white/25 tracking-widest uppercase mt-2">
                                — credentials
                              </p>
                              <AuthInput type="password" placeholder="Password" required />
                              <AuthInput type="password" placeholder="Confirm password" required />
                            </div>
                          )}

                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full h-12 rounded-xl text-base font-semibold text-white mt-4"
                            style={{ background: activeRole?.accent }}
                          >
                            Register as {activeRole?.label}
                          </motion.button>

                          {selectedRole === 'manufacturer' && (
                            <p className="text-center text-[10px] font-mono text-white/20 mt-3">
                              account pending verification after submission
                            </p>
                          )}
                        </form>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

