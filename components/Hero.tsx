import React from 'react';
import { ArrowRight, Star, Truck, Shield } from 'lucide-react';
import { PRODUCT } from '../types';

interface HeroProps {
  onCtaClick: () => void;
}

const CupSVG: React.FC = () => (
  <img src="/Copo.jpg.png" alt="Copo Térmico 475ml" className="w-full h-full object-contain drop-shadow-2xl" />
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
            Qualidade premium e entrega para todo o Brasil.
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
