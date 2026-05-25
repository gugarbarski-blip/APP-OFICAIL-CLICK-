import React from 'react';
import { ArrowRight, Star, ShieldCheck, Truck } from 'lucide-react';
import { PRODUCT } from '../types';

interface HeroV2Props {
  onCtaClick: () => void;
}

export const HeroV2: React.FC<HeroV2Props> = ({ onCtaClick }) => {
  return (
    <section className="relative min-h-screen bg-[#080806] flex items-center overflow-hidden">

      {/* ── Background ambient glows ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top gold halo */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[520px]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.10) 0%, transparent 65%)',
          }}
        />
        {/* Right-side subtle glow */}
        <div
          className="absolute top-0 right-0 w-[700px] h-[700px]"
          style={{
            background:
              'radial-gradient(ellipse at 100% 0%, rgba(212,175,55,0.05) 0%, transparent 55%)',
          }}
        />
      </div>

      {/* ── Content grid ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full grid lg:grid-cols-2 gap-12 lg:gap-6 items-center py-28 lg:py-0 min-h-screen">

        {/* ────────── LEFT ────────── */}
        <div className="space-y-7 order-2 lg:order-1">

          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
              <img src="/Logo.webp" alt="IB" className="w-full h-full object-cover" />
            </div>
            <span className="font-poppins font-extrabold text-xl text-[#D4AF37] tracking-wide">
              ImpreBrindes
            </span>
          </div>

          {/* Premium badge */}
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/8 border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase">
            <Star size={10} className="fill-[#D4AF37]" />
            Brindes Personalizados Premium
          </div>

          {/* Headline */}
          <h1 className="font-poppins font-black leading-[0.93] tracking-tight">
            <span className="block text-[52px] sm:text-[64px] lg:text-[72px] text-white">Copos</span>
            <span className="block text-[52px] sm:text-[64px] lg:text-[72px] text-white">Térmicos</span>
            <span
              className="block text-[52px] sm:text-[64px] lg:text-[72px] bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #D4AF37 0%, #F5D87A 45%, #D4AF37 100%)',
              }}
            >
              Personalizados
            </span>
          </h1>

          {/* Description */}
          <p className="text-gray-400 text-base lg:text-lg leading-relaxed max-w-[420px] font-light">
            Copos Térmicos 475ml com a identidade da sua empresa.
            Qualidade premium e entrega para todo o Brasil.
          </p>

          {/* Gold accent line */}
          <div
            className="w-14 h-px"
            style={{
              background: 'linear-gradient(90deg, rgba(212,175,55,0.7) 0%, transparent 100%)',
            }}
          />

          {/* Price */}
          <div>
            <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase mb-1.5">
              A partir de
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className="font-poppins font-black text-[52px] lg:text-[60px] leading-none bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, #D4AF37 0%, #F5D87A 50%, #D4AF37 100%)',
                }}
              >
                R$ {PRODUCT.basePrice.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-gray-500 text-sm">/&nbsp;unidade</span>
            </div>
            <p className="text-gray-600 text-xs mt-1.5">
              Pedido mínimo: {PRODUCT.minQuantity} unidades
            </p>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-4 pt-1 flex-wrap">
            <button
              onClick={onCtaClick}
              className="group flex items-center gap-2.5 text-black font-bold px-8 py-4 rounded-xl text-sm tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #c9a02a 100%)',
                boxShadow: '0 8px 32px rgba(212,175,55,0.35)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 14px 44px rgba(212,175,55,0.55)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 8px 32px rgba(212,175,55,0.35)';
              }}
            >
              Compre Já
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform duration-200"
              />
            </button>

            <a
              href="#produto"
              className="flex items-center gap-2 border border-white/15 hover:border-[#D4AF37]/40 text-white/60 hover:text-white/90 font-medium px-8 py-4 rounded-xl text-sm tracking-wide transition-all duration-200 hover:-translate-y-0.5"
            >
              Ver Detalhes
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-5 pt-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#D4AF37]/60" />
              <span className="text-gray-500 text-xs">Qualidade Premium</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Truck size={13} className="text-[#D4AF37]/60" />
              <span className="text-gray-500 text-xs">Entrega em todo Brasil</span>
            </div>
          </div>
        </div>

        {/* ────────── RIGHT — Product Showcase ────────── */}
        <div className="order-1 lg:order-2 relative flex items-center justify-center h-[420px] sm:h-[520px] lg:h-screen max-h-[740px]">

          {/* Outer golden ring */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '560px',
              height: '560px',
              border: '1px solid rgba(212,175,55,0.22)',
            }}
          />

          {/* Inner golden ring (tighter) */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '490px',
              height: '490px',
              border: '1px solid rgba(212,175,55,0.10)',
            }}
          />

          {/* Center radial glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: '420px',
              height: '420px',
              background:
                'radial-gradient(circle at 50% 58%, rgba(212,175,55,0.07) 0%, transparent 65%)',
            }}
          />

          {/* Warm cinematic under-light */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: '400px',
              height: '130px',
              bottom: '88px',
              left: '50%',
              transform: 'translateX(-50%)',
              background:
                'radial-gradient(ellipse at 50% 100%, rgba(180,120,15,0.38) 0%, rgba(140,90,10,0.15) 40%, transparent 72%)',
            }}
          />

          {/* ── Products ── */}
          <div
            className="relative z-10 flex items-end justify-center gap-3 sm:gap-5"
            style={{ paddingBottom: '80px' }}
          >
            {/* Thermal tumbler — tallest, left */}
            <img
              src="/CopoTermicoSeuLogo.nobg.webp"
              alt="Copo Térmico 475ml"
              className="object-contain"
              style={{
                height: '295px',
                filter:
                  'drop-shadow(0 24px 48px rgba(0,0,0,0.85)) drop-shadow(0 0 18px rgba(212,175,55,0.08))',
              }}
              fetchPriority="high"
            />

            {/* Cuia / wine cup — middle, stepped down */}
            <img
              src="/CopoCuiaSeuNome.nobg.webp"
              alt="Copo Cuia 320ml"
              className="object-contain"
              style={{
                height: '218px',
                marginBottom: '4px',
                filter:
                  'drop-shadow(0 20px 40px rgba(0,0,0,0.85)) drop-shadow(0 0 14px rgba(212,175,55,0.06))',
              }}
            />

            {/* Ecobag — right */}
            <img
              src="/EcobagSeuLogo.nobg.webp"
              alt="Sacola Ecobag"
              className="object-contain"
              style={{
                height: '248px',
                filter:
                  'drop-shadow(0 22px 44px rgba(0,0,0,0.80)) drop-shadow(0 0 16px rgba(212,175,55,0.06))',
              }}
            />
          </div>

          {/* Pedestal */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: '470px',
              height: '56px',
              bottom: '64px',
              left: '50%',
              transform: 'translateX(-50%)',
              background:
                'radial-gradient(ellipse at 50% 0%, #262420 0%, #111009 55%, transparent 100%)',
              borderRadius: '50%',
            }}
          />

          {/* Floor shadow */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: '340px',
              height: '24px',
              bottom: '55px',
              left: '50%',
              transform: 'translateX(-50%)',
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.65) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
        </div>
      </div>

      {/* Bottom vignette */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #080806 0%, transparent 100%)',
        }}
      />
    </section>
  );
};
