import React from 'react';
import { ArrowRight, Star, ShieldCheck, Building2 } from 'lucide-react';
import { PRODUCTS } from '../types';

interface HeroProps {
  onCtaClick: () => void;
}

const minPrice = Math.min(...Object.values(PRODUCTS).map(p => p.basePrice));

const productPills = ['Copos Térmicos', 'Ecobags', 'Moleskines', 'Cuias'];

export const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
  return (
    <section className="min-h-screen bg-[#0a0a0a] flex items-center relative overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center py-28 lg:py-24 relative z-10">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-5 order-2 lg:order-1">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-[#D4AF37]/50 text-[#D4AF37] px-4 py-1.5 rounded-full text-sm font-semibold">
            <Star size={13} className="fill-[#D4AF37]" />
            Brindes Corporativos Premium
          </div>

          {/* Title */}
          <h1 className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] text-[#EAB308]">
            Brindes<br />
            Corporativos<br />
            Personalizados
          </h1>

          {/* Description */}
          <p className="text-gray-300 text-base lg:text-lg leading-relaxed max-w-md">
            Copos térmicos, ecobags e cadernetas Moleskine com a identidade
            da sua empresa. Qualidade premium e entrega para todo o Brasil.
          </p>

          {/* Product pills */}
          <div className="flex flex-wrap gap-2">
            {productPills.map(pill => (
              <span key={pill} className="text-xs font-semibold text-gray-300 bg-white/8 border border-white/12 px-3 py-1 rounded-full">
                {pill}
              </span>
            ))}
          </div>

          {/* Price */}
          <div className="space-y-1">
            <p className="text-gray-400 text-sm">A partir de</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-poppins text-5xl font-extrabold text-[#EAB308]">
                R$ {minPrice.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-gray-400 text-base">/ unidade</span>
            </div>
            {/* Trust signals — abaixo do preço */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Building2 size={13} className="text-[#D4AF37] flex-shrink-0" />
                <span className="text-xs">Grupo Impresul · desde <span className="text-gray-300 font-semibold">1968</span></span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <ShieldCheck size={13} className="text-[#D4AF37] flex-shrink-0" />
                <span className="text-xs">CNPJ <span className="text-gray-300 font-semibold">92.869.650/0001-96</span></span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
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
              Ver Produtos
            </a>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="order-1 lg:order-2 flex items-center justify-center">
          <img
            src="/Imagem.LadoDireito.webp"
            alt="Copos Térmicos, Cuia, Ecobag e Moleskine personalizados ImpreBrindes"
            className="w-full max-w-[380px] sm:max-w-[480px] lg:max-w-[560px] h-auto object-contain"
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
};
