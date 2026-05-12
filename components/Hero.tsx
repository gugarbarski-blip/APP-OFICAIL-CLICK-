import React from 'react';
import { ArrowRight, Star, Truck, Shield } from 'lucide-react';
import { PRODUCT } from '../types';

interface HeroProps {
  onCtaClick: () => void;
}

const CupSVG: React.FC = () => (
  <svg viewBox="0 0 200 280" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
    {/* Lid */}
    <ellipse cx="100" cy="32" rx="52" ry="12" fill="#2a2a2a" />
    <rect x="52" y="28" width="96" height="18" rx="4" fill="#222222" />
    <rect x="68" y="34" width="64" height="6" rx="3" fill="#333333" />
    {/* Lid button */}
    <rect x="88" y="16" width="24" height="16" rx="4" fill="#1a1a1a" />
    <rect x="93" y="10" width="14" height="10" rx="3" fill="#111111" />

    {/* Body */}
    <path
      d="M58 44 Q52 46 50 55 L44 220 Q43 235 58 240 L142 240 Q157 235 156 220 L150 55 Q148 46 142 44 Z"
      fill="#1a1a1a"
    />
    {/* Gloss highlight */}
    <path
      d="M68 50 Q62 52 60 60 L56 190 Q58 195 65 196 L75 196 L79 60 Q78 52 72 50 Z"
      fill="rgba(255,255,255,0.07)"
    />

    {/* Print area */}
    <rect x="68" y="105" width="64" height="70" rx="4"
      fill="rgba(255,255,255,0.05)"
      stroke="rgba(255,255,255,0.15)"
      strokeWidth="1"
      strokeDasharray="4 3"
    />
    <text x="100" y="136" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="Inter, sans-serif">Seu Logo</text>
    <text x="100" y="148" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="Inter, sans-serif">Aqui</text>

    {/* Bottom */}
    <ellipse cx="100" cy="238" rx="42" ry="9" fill="#111111" />
    <ellipse cx="100" cy="236" rx="36" ry="7" fill="#0d0d0d" />

    {/* Handle / grip detail */}
    <rect x="143" y="120" width="18" height="50" rx="9" fill="#222222" />
    <rect x="145" y="124" width="14" height="42" rx="7" fill="#1a1a1a" />
  </svg>
);

export const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
  return (
    <section className="min-h-screen pt-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div className="text-white space-y-6 order-2 md:order-1">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
            <Star size={14} className="fill-accent text-accent" />
            Brindes Personalizados Premium
          </div>

          <h1 className="font-poppins text-4xl sm:text-5xl font-bold leading-tight">
            Brindes que<br />
            <span className="text-primary">Marcam</span> Momentos
          </h1>

          <p className="text-gray-300 text-lg leading-relaxed">
            Copos Térmicos 475ml personalizados com a identidade da sua empresa.
            Qualidade premium, gravação permanente e entrega para todo o Brasil.
          </p>

          {/* Price badge */}
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm">A partir de</span>
            <span className="font-poppins text-4xl font-bold text-accent">
              R$ {PRODUCT.basePrice.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-gray-400 text-sm">/ unidade</span>
          </div>
          <p className="text-gray-500 text-sm -mt-4">Pedido mínimo: {PRODUCT.minQuantity} unidades</p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onCtaClick}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primaryDark text-white font-semibold px-8 py-4 rounded-xl text-base transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Compre Já!
              <ArrowRight size={18} />
            </button>
            <a
              href="#produto"
              className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white font-medium px-8 py-4 rounded-xl text-base transition-colors"
            >
              Ver Detalhes
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Truck size={16} className="text-primary" />
              Entrega para todo o Brasil
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Shield size={16} className="text-primary" />
              Garantia de satisfação
            </div>
          </div>
        </div>

        {/* Cup mockup */}
        <div className="order-1 md:order-2 flex justify-center">
          <div className="relative w-56 h-80 sm:w-64 sm:h-96">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-75 translate-y-8" />
            <CupSVG />
          </div>
        </div>
      </div>
    </section>
  );
};
