import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-[#030303] border-t border-white/10 py-10 mt-20 text-xs font-mono-code uppercase tracking-wider text-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span>© 2026 DEVARENA GLOBAL. WHERE INNOVATION COMPETES.</span>
        </div>
        <div className="flex items-center gap-6 text-gray-400">
          <a href="#" className="hover:text-[#d0bcff] transition">PRIVACY</a>
          <a href="#" className="hover:text-[#d0bcff] transition">TERMS</a>
          <a href="#" className="hover:text-[#d0bcff] transition">DISCORD</a>
          <a href="#" className="hover:text-[#d0bcff] transition">GITHUB</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

