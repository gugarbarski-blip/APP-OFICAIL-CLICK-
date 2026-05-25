import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../types';

const minPrice = Math.min(...Object.values(PRODUCTS).map(p => p.basePrice));

interface StickyCtaBarProps {
  onCtaClick: () => void;
}

export const StickyCtaBar: React.FC<StickyCtaBarProps> = ({ onCtaClick }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 350);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300 ease-in-out ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-[#D4AF37]/25 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex-shrink-0">
          <p className="text-gray-400 text-[11px] leading-none mb-0.5">A partir de</p>
          <div className="flex items-baseline gap-1">
            <span className="font-poppins font-extrabold text-[#F1C40F] text-xl leading-tight">
              R$ {minPrice.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-gray-400 text-[11px]">/ un.</span>
          </div>
        </div>
        <button
          onClick={onCtaClick}
          className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#d49924] text-gray-900 font-extrabold px-5 py-2.5 rounded-xl text-sm shadow-[0_4px_15px_rgba(212,175,55,0.4)] active:scale-95 transition-all flex-shrink-0"
        >
          Comprar Agora
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
