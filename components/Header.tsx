import React from 'react';

const EgeniusIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400">
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 4.5L7 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
    </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="w-full bg-black/30 backdrop-blur-sm p-4 border-b border-cyan-400/20 shadow-lg shadow-cyan-500/5">
      <div className="container mx-auto flex items-center justify-center space-x-4">
        <EgeniusIcon />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-widest uppercase glow-text">
            EGenius
          </h1>
          <p className="text-xs text-cyan-300/80 tracking-wider">KTU Engineering Graphics Solver</p>
        </div>
      </div>
    </header>
  );
};