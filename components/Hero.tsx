import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { PRODUCT } from '../types';

interface HeroProps {
  onCtaClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
  return (
    <section className="min-h-screen bg-[#0a0a0a] flex items-center relative overflow-hidden">

      <div className="max-w-7xl mx-auto px-6 lg:px-16 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center py-24 lg:py-0 relative z-10">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6 order-2 lg:order-1">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#111]">
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
        <div className="order-1 lg:order-2 relative h-[420px] sm:h-[520px] lg:h-[640px]">

          {/* Golden ring — behind everything */}
          <div className="absolute pointer-events-none" style={{
            width: '500px', height: '500px',
            border: '2px solid rgba(212,175,55,0.55)',
            borderRadius: '50%',
            bottom: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1,
          }} />

          {/* Amber backlight glow — intense, behind products */}
          <div className="absolute pointer-events-none" style={{
            width: '320px', height: '320px',
            bottom: '210px',
            left: '42%',
            transform: 'translateX(-50%)',
            background: 'radial-gradient(circle, rgba(255,175,20,0.55) 0%, rgba(220,130,10,0.25) 40%, transparent 68%)',
            borderRadius: '50%',
            filter: 'blur(22px)',
            zIndex: 2,
          }} />

          {/* Products — sitting on platform top face */}
          <div className="absolute pointer-events-none" style={{
            bottom: '170px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px',
            zIndex: 8,
          }}>
            <img src="/CopoTermicoSeuLogo.nobg.webp" alt="Copo 475ml"
              style={{ height: '270px', objectFit: 'contain', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.8))' }}
              fetchPriority="high"
            />
            <img src="/CopoCuiaSeuNome.nobg.webp" alt="Cuia 320ml"
              style={{ height: '200px', objectFit: 'contain', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.8))' }}
            />
            <img src="/EcobagSeuLogo.nobg.webp" alt="Ecobag"
              style={{ height: '240px', objectFit: 'contain', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.7))' }}
            />
          </div>

          {/* Platform — top face (ellipse) */}
          <div className="absolute pointer-events-none" style={{
            width: '540px', height: '52px',
            bottom: '168px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'radial-gradient(ellipse at 50% 35%, #363636 0%, #1e1e1e 100%)',
            borderRadius: '50%',
            border: '1px solid rgba(212,175,55,0.25)',
            zIndex: 6,
          }} />

          {/* Platform — body (cylinder side wall) */}
          <div className="absolute pointer-events-none" style={{
            width: '540px', height: '110px',
            bottom: '58px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(to bottom, #1e1e1e 0%, #121212 50%, #0c0c0c 100%)',
            borderBottomLeftRadius: '50% 22px',
            borderBottomRightRadius: '50% 22px',
            zIndex: 5,
          }} />

          {/* Platform — subtle floor shadow */}
          <div className="absolute pointer-events-none" style={{
            width: '500px', height: '30px',
            bottom: '42px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.6) 0%, transparent 70%)',
            zIndex: 4,
          }} />
        </div>
      </div>
    </section>
  );
};
