import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { ProductDef, PRODUCTS, CustomizationType } from '../types';

interface ProductShowcaseProps {
  onSelectProduct: (product: ProductDef) => void;
}

const ProductCard: React.FC<{ product: ProductDef; onSelect: () => void }> = ({ product, onSelect }) => {
  const customTypes = Object.entries(product.customizations) as [CustomizationType, typeof product.customizations.serigrafia][];

  return (
    <div className="bg-[#2a2825] rounded-3xl border border-white/8 hover:border-[#D4AF37]/30 overflow-hidden transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-row sm:flex-col">
      {/* Image area — faixa lateral no mobile, bloco superior no desktop */}
      <div
        onClick={onSelect}
        className="bg-gradient-to-br from-[#6b6257] via-[#4d473f] to-[#36322c] flex items-center justify-center relative overflow-hidden cursor-pointer group
                   w-[130px] flex-shrink-0 p-3
                   sm:w-auto sm:h-64 sm:p-8"
      >
        <div className="absolute top-0 left-1/4 w-full h-full bg-[#c78252]/15 blur-[60px] rounded-full pointer-events-none" />
        <img
          src={product.cardImage}
          alt={product.name}
          className="h-full w-full object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.6)] relative z-10 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex flex-col flex-1">
        <h3 className="font-poppins text-base sm:text-xl font-bold text-white mb-0.5 sm:mb-1">{product.name}</h3>
        <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-4 hidden sm:block">{product.description}</p>

        <ul className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-5">
          {product.features.slice(0, 4).map((feat, i) => (
            <li key={feat} className={`flex items-center gap-1.5 text-gray-300 text-xs sm:text-sm ${i >= 3 ? 'hidden sm:flex' : 'flex'}`}>
              <CheckCircle size={13} className="text-[#D4AF37] flex-shrink-0" />
              {feat}
            </li>
          ))}
        </ul>

        <div className="flex gap-1.5 sm:gap-2 mb-2 sm:mb-5 flex-wrap">
          {customTypes.map(([key, val]) => (
            <span key={key} className="bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-[#D4AF37]/20">
              {val.label}
            </span>
          ))}
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-1 mb-1.5 sm:mb-4 flex-wrap">
            <span className="text-gray-400 text-xs">a partir de</span>
            <span className="font-poppins text-xl sm:text-3xl font-bold text-[#F1C40F]">
              R$ {product.basePrice.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-gray-400 text-xs hidden sm:inline">/ un.</span>
          </div>
          <p className="text-gray-500 text-xs mb-2 sm:mb-4 hidden sm:block">Pedido mínimo: {product.minQuantity} unidades</p>
          <button
            onClick={onSelect}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#d49924] hover:from-[#d49924] hover:to-[#c28511] text-gray-900 font-bold py-2.5 sm:py-3.5 rounded-xl text-sm sm:text-base transition-all shadow-[0_4px_15px_rgba(212,175,55,0.25)] hover:shadow-[0_8px_20px_rgba(212,175,55,0.4)] hover:-translate-y-0.5"
          >
            Compre Já!
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({ onSelectProduct }) => {
  const products = Object.values(PRODUCTS);

  return (
    <section id="produto" className="py-12 md:py-20 bg-[#1a1917]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 md:mb-12">
          <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">Nossos Produtos</span>
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-white mt-2">Escolha seu Modelo</h2>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto">
            Personalize com a identidade da sua empresa — serigrafia ou gravação a laser
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {products.map(product => (
            <ProductCard key={product.id} product={product} onSelect={() => onSelectProduct(product)} />
          ))}
        </div>
      </div>
    </section>
  );
};
