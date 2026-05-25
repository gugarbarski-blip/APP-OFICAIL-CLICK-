import React, { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  onCtaClick: () => void;
  onMeusPedidos: () => void;
  onMinhaContaClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCtaClick, onMeusPedidos, onMinhaContaClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { label: 'Produtos', href: '#produto' },
    { label: 'Como Funciona', href: '#como-funciona' },
    { label: 'Diferenciais', href: '#diferenciais' },
    { label: 'Quem Somos', href: '#quem-somos' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md shadow-md border-b border-white/10' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center group">
          <div className="h-10 rounded-lg overflow-hidden">
            <img
              src="/Logo.webp"
              alt="ImpreBrindes Logo"
              className="h-10 w-auto object-contain"
            />
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-[#D4AF37] hover:text-[#F1C40F] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={onMinhaContaClick}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#D4AF37] hover:text-[#F1C40F] transition-colors"
          >
            <User size={15} />
            {loggedIn ? 'Minha Conta' : 'Entrar'}
          </button>
        </nav>

        {/* CTA */}
        <div className="hidden md:block">
          <button
            onClick={() => document.getElementById('produto')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#d49924] hover:from-[#d49924] hover:to-[#c28511] text-gray-900 font-bold px-5 py-2 rounded-lg text-sm transition-all shadow-[0_4px_10px_rgba(212,175,55,0.3)] hover:-translate-y-0.5"
          >
            Compre Já!
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-[#D4AF37] hover:text-[#F1C40F]"
          onClick={() => setMenuOpen(o => !o)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-white/10 px-4 pb-4">
          <nav className="flex flex-col gap-3 pt-3">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  setTimeout(() => {
                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="text-sm font-semibold text-[#D4AF37] py-2 hover:text-[#F1C40F] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { setMenuOpen(false); onMinhaContaClick(); }}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#D4AF37] py-2 hover:text-[#F1C40F] transition-colors text-left"
            >
              <User size={15} />
              {loggedIn ? 'Minha Conta' : 'Entrar'}
            </button>
            <button
              onClick={() => { setMenuOpen(false); onCtaClick(); }}
              className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#d49924] hover:from-[#d49924] hover:to-[#c28511] text-gray-900 font-bold py-3 rounded-lg text-sm transition-all shadow-[0_4px_10px_rgba(212,175,55,0.3)]"
            >
              Compre Já!
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
