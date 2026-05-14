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
    <section className="min-h-screen pt-16 bg-gradient-to-br from-[#858079] via-[#6B6862] to-[#514F4A] flex items-center relative overflow-hidden">
      {/* Luzes de fundo para simular a iluminação da foto */}
      <div className="absolute top-0 left-1/4 w-full h-full bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Textos */}
        <div className="text-white space-y-6 order-2 md:order-1">
          
          {/* Logo Grande do Hero (ClickBrindes Bronze) */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-[0_4px_15px_rgba(184,106,52,0.4)] bg-white flex items-center justify-center">
              <img 
                src="/Logo.pjg.png" 
                alt="ClickBrindes Logo" 
                className="w-[115%] h-[115%] max-w-none object-cover" 
              />
            </div>
            <span className="font-poppins font-extrabold text-4xl text-[#c78252] drop-shadow-md tracking-tight">
              ClickBrindes
            </span>
          </div>

          <div className="inline-flex items-center gap-2 bg-[#b86a34]/10 border border-[#b86a34]/30 text-[#e0a96d] px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm">
            <Star size={14} className="fill-[#e0a96d] text-[#e0a96d]" />
            Brindes Personalizados Premium
          </div>

          <h1 className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight drop-shadow-lg">
            <span className="text-[#c78252]">Brindes que</span><br />
            <span className="text-white">Marcam</span> <span className="text-[#c78252]">Momentos</span>
          </h1>

          <p className="text-gray-200 text-lg leading-relaxed font-medium max-w-md">
            Copos Térmicos 475ml personalizados com a identidade da sua empresa.
            Qualidade premium e entrega para todo o Brasil.
          </p>

          {/* Price */}
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-gray-300 text-sm font-medium">A partir de</span>
              <span className="font-poppins text-5xl font-extrabold text-[#eab308] drop-shadow-md">
                R$ {PRODUCT.basePrice.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-gray-300 text-sm font-medium">/ unidade</span>
            </div>
            <p className="text-gray-400 text-sm">Pedido mínimo: {PRODUCT.minQuantity} unidades</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={onCtaClick}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#b86a34] to-[#a35928] hover:from-[#a35928] hover:to-[#8c491e] text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-[0_8px_20px_rgba(184,106,52,0.3)] hover:-translate-y-0.5"
            >
              Compre Já!
              <ArrowRight size={18} />
            </button>
            <a
              href="#produto"
              className="flex items-center justify-center gap-2 border-2 border-white/20 hover:border-white/50 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors bg-white/5 backdrop-blur-sm"
            >
              Ver Detalhes
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 pt-4 border-t border-white/10 mt-6">
            <div className="flex items-center gap-2 text-gray-300 text-xs font-semibold uppercase tracking-wider">
              <Truck size={15} className="text-[#b86a34]" />
              Entrega para todo o Brasil
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-xs font-semibold uppercase tracking-wider">
              <Shield size={15} className="text-[#b86a34]" />
              Garantia de satisfação
            </div>
          </div>
        </div>

        {/* Cup photo area */}
        <div className="order-1 md:order-2 flex justify-center relative">
          <div className="relative w-full max-w-sm">
            <img
              src="/Copo.jpg.png"
              alt="Copo Térmico 475ml personalizado - Click Brindes"
              className="relative w-full h-auto object-contain drop-shadow-2xl z-10"
              style={{ filter: 'drop-shadow(0 35px 35px rgba(0,0,0,0.6))' }}
            />
            {/* Sombra base do copo para simular o chão/mesa da foto */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/60 blur-xl rounded-[100%] z-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
