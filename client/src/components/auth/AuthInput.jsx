import React from 'react'

export const AuthInput = ({ label, className = '', ...props }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && (
      <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">
        {label}
      </span>
    )}
    <input
      {...props}
      className="w-full h-11 px-4 rounded-lg text-base text-white bg-white/[0.04] border border-white/10 placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
    />
  </div>
)

