import React, { useState, useEffect } from 'react';
import { Menu, X, Gift } from 'lucide-react';

interface HeaderProps {
  onCtaClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCtaClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Produto', href: '#produto' },
    { label: 'Como Funciona', href: '#como-funciona' },
    { label: 'Diferenciais', href: '#diferenciais' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="bg-primary p-1.5 rounded-lg">
            <Gift size={20} className="text-white" />
          </div>
          <span className="font-poppins font-700 text-xl font-bold text-gray-900">
            Click<span className="text-primary">Brindes</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:block">
          <button
            onClick={onCtaClick}
            className="bg-primary hover:bg-primaryDark text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
          >
            Compre Já!
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-primary"
          onClick={() => setMenuOpen(o => !o)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
          <nav className="flex flex-col gap-3 pt-3">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-gray-700 py-2 hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { setMenuOpen(false); onCtaClick(); }}
              className="mt-2 bg-primary hover:bg-primaryDark text-white font-semibold py-3 rounded-lg text-sm transition-colors"
            >
              Compre Já!
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
