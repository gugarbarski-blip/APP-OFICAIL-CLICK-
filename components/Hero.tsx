import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { PRODUCT } from '../types';

interface HeroProps {
  onCtaClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
  return (
    <section className="min-h-screen bg-[#1a1917] flex items-center relative overflow-hidden">

      <div className="max-w-7xl mx-auto px-6 lg:px-16 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center py-24 lg:py-0 relative z-10">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6 order-2 lg:order-1">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#1a1917]">
              <img src="/Logo.webp" alt="IB" className="w-full h-full object-cover" />
            </div>
            <span className="font-poppins font-extrabold text-2xl text-[#D4AF37] tracking-tight">
              ImpreBrindes
            </span>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-[#D4AF37]/50 text-[#D4AF37] px-4 py-1.5 rounded-full text-sm font-semibold">
            <Star size={13} className="fill-[#D4AF37]" />
            Brindes Personalizados Premium
          </div>

          {/* Title */}
          <h1 className="font-poppins text-5xl sm:text-6xl font-extrabold leading-[1.05] text-[#EAB308]">
            Copos Térmicos<br />
            Personalizados
          </h1>

          {/* Description */}
          <p className="text-gray-300 text-base lg:text-lg leading-relaxed max-w-md">
            Copos Térmicos 475ml personalizados com a identidade da sua empresa.
            Qualidade premium e entrega para todo o Brasil.
          </p>

          {/* Price */}
          <div className="space-y-1">
            <p className="text-gray-400 text-sm">A partir de</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-poppins text-5xl font-extrabold text-[#EAB308]">
                R$ {PRODUCT.basePrice.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-gray-400 text-base">/ unidade</span>
            </div>
            <p className="text-gray-500 text-sm">Comece com apenas {PRODUCT.minQuantity} unidades</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onCtaClick}
              className="flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c9a82e] active:bg-[#b8971e] text-black font-bold px-8 py-3.5 rounded-xl text-base transition-colors"
            >
              Compre Já!
              <ArrowRight size={18} />
            </button>
            <a
              href="#produto"
              className="flex items-center justify-center border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors"
            >
              Ver Detalhes
            </a>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="order-1 lg:order-2 relative flex items-center justify-center h-[420px] sm:h-[520px] lg:h-screen max-h-[700px]">

          {/* Golden circle ring */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '520px',
              height: '520px',
              border: '2px solid rgba(212,175,55,0.45)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Warm glow beneath products */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: '420px',
              height: '140px',
              bottom: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'radial-gradient(ellipse at 50% 100%, rgba(200,130,20,0.28) 0%, transparent 70%)',
            }}
          />

          {/* Products */}
          <div
            className="relative z-10 flex items-end justify-center gap-2 sm:gap-4"
            style={{ paddingBottom: '80px' }}
          >
            <img
              src="/CopoTermicoSeuLogo.nobg.webp"
              alt="Copo Térmico 475ml"
              className="object-contain drop-shadow-2xl"
              style={{ height: '280px' }}
              fetchPriority="high"
            />
            <img
              src="/CopoCuiaSeuNome.nobg.webp"
              alt="Copo Cuia 320ml"
              className="object-contain drop-shadow-2xl"
              style={{ height: '210px', marginBottom: '4px' }}
            />
            <img
              src="/EcobagSeuLogo.webp"
              alt="Sacola Ecobag"
              className="object-contain drop-shadow-2xl"
              style={{ height: '240px', mixBlendMode: 'multiply' }}
            />
          </div>

          {/* Platform disc */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: '480px',
              height: '48px',
              bottom: '60px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'radial-gradient(ellipse at 50% 0%, #2e2e2e 0%, #111 60%, transparent 100%)',
              borderRadius: '50%',
            }}
          />
        </div>
      </div>
    </section>
  );
};
