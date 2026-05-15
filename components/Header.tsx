import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onCtaClick: () => void;
  onMeusPedidos: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCtaClick, onMeusPedidos }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Produtos', href: '#produto' },
    { label: 'Como Funciona', href: '#como-funciona' },
    { label: 'Diferenciais', href: '#diferenciais' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#514F4A]/95 backdrop-blur-md shadow-md border-b border-white/10' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-[0_2px_8px_rgba(212,175,55,0.4)] bg-[#514F4A] flex items-center justify-center">
            <img
              src="/Logo.webp"
              alt="ImpreBrindes Logo"
              className="w-[115%] h-[115%] max-w-none object-cover"
            />
          </div>
          <span className="font-poppins font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F1C40F]">
            ImpreBrindes
          </span>
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
            onClick={onMeusPedidos}
            className="text-sm font-semibold text-[#D4AF37] hover:text-[#F1C40F] transition-colors"
          >
            Meus Pedidos
          </button>
        </nav>

        {/* CTA */}
        <div className="hidden md:block">
          <button
            onClick={onCtaClick}
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
        <div className="md:hidden bg-[#514F4A] border-t border-white/10 px-4 pb-4">
          <nav className="flex flex-col gap-3 pt-3">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-semibold text-[#D4AF37] py-2 hover:text-[#F1C40F] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { setMenuOpen(false); onMeusPedidos(); }}
              className="text-sm font-semibold text-[#D4AF37] py-2 hover:text-[#F1C40F] transition-colors text-left"
            >
              Meus Pedidos
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
