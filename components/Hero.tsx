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
    <section className="min-h-screen pt-16 relative flex items-center overflow-hidden">
      
      {/* 1. Parede de Fundo (Wall) */}
      <div className="absolute inset-0 bg-[#423d38] bg-gradient-to-br from-[#6b6257] via-[#4d473f] to-[#36322c] z-0">
        {/* Luz rebatida na parede */}
        <div className="absolute top-1/4 left-1/3 w-3/4 h-3/4 bg-[#c78252]/10 blur-[120px] rounded-full pointer-events-none"></div>
      </div>

      {/* 2. Mesa/Superfície (Table) */}
      <div className="absolute bottom-0 left-0 right-0 h-[38%] bg-gradient-to-b from-[#878077] to-[#5e5851] border-t-2 border-[#9a938a] shadow-[inset_0_40px_80px_rgba(0,0,0,0.35)] z-0">
        {/* Textura sutil na mesa */}
        <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-12 items-center relative z-10 w-full h-full">
        {/* Textos */}
        <div className="text-white space-y-6 order-2 md:order-1 pt-8 md:pt-0">
          
          {/* Logo Grande do Hero */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-[#c78252] to-[#a35928] p-2.5 rounded-2xl shadow-[0_4px_20px_rgba(184,106,52,0.5)] border border-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2d1f16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
            </div>
            <span className="font-poppins font-extrabold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#e8a272] to-[#b86a34] drop-shadow-md tracking-tight">
              ClickBrindes
            </span>
          </div>

          <div className="inline-flex items-center gap-2 bg-[#b86a34]/15 border border-[#b86a34]/40 text-[#e8a272] px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm backdrop-blur-sm">
            <Star size={14} className="fill-[#e8a272] text-[#e8a272]" />
            Brindes Personalizados Premium
          </div>

          <h1 className="font-poppins text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight drop-shadow-xl mt-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d18e5f] to-[#b86a34]">Brindes que</span><br />
            <span className="text-white">Marcam</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d18e5f] to-[#b86a34]">Momentos</span>
          </h1>

          <p className="text-gray-200 text-lg leading-relaxed font-medium max-w-md drop-shadow-md">
            Copos Térmicos 475ml personalizados com a identidade da sua empresa.
            Qualidade premium e entrega para todo o Brasil.
          </p>

          {/* Price */}
          <div className="flex flex-col gap-1 mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-gray-300 text-sm font-medium">A partir de</span>
              <span className="font-poppins text-[3.25rem] font-extrabold text-[#facc15] drop-shadow-[0_2px_10px_rgba(250,204,21,0.2)]">
                R$ {PRODUCT.basePrice.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-gray-300 text-sm font-medium">/ unidade</span>
            </div>
            <p className="text-[#a39e98] text-sm font-medium">Pedido mínimo: {PRODUCT.minQuantity} unidades</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={onCtaClick}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#b86a34] to-[#8c491e] hover:from-[#c77a44] hover:to-[#a35928] text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-[0_8px_25px_rgba(184,106,52,0.4)] hover:-translate-y-1 border border-white/10"
            >
              Compre Já!
              <ArrowRight size={18} />
            </button>
            <a
              href="#produto"
              className="flex items-center justify-center gap-2 border border-white/30 hover:border-white/60 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all bg-white/5 backdrop-blur-md hover:bg-white/10"
            >
              Ver Detalhes
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 pt-4 border-t border-white/10 mt-6">
            <div className="flex items-center gap-2 text-gray-300 text-xs font-semibold uppercase tracking-wider">
              <Truck size={15} className="text-[#c78252]" />
              Entrega para todo o Brasil
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-xs font-semibold uppercase tracking-wider">
              <Shield size={15} className="text-[#c78252]" />
              Garantia de satisfação
            </div>
          </div>
        </div>

        {/* Cup photo area */}
        <div className="order-1 md:order-2 flex justify-center relative items-end h-full pb-10 md:pb-0">
          <div className="relative w-full max-w-md translate-y-12 md:translate-y-24">
            <img
              src="/Copo.jpg.png"
              alt="Copo Térmico 475ml personalizado - Click Brindes"
              className="relative w-full h-auto object-contain z-10 scale-110"
              style={{ filter: 'drop-shadow(0 40px 30px rgba(0,0,0,0.8))' }}
            />
            {/* Sombra base do copo ultra realista projetada na mesa */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-12 bg-black/80 blur-2xl rounded-[100%] z-0"></div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[60%] h-4 bg-black blur-md rounded-[100%] z-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
