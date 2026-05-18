import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { ProductDef, PRODUCTS, CustomizationType } from '../types';

interface ProductShowcaseProps {
  onSelectProduct: (product: ProductDef) => void;
}

const ProductCard: React.FC<{ product: ProductDef; onSelect: () => void }> = ({ product, onSelect }) => {
  const customTypes = Object.entries(product.customizations) as [CustomizationType, typeof product.customizations.serigrafia][];

  return (
    <div className="bg-[#2a2825] rounded-3xl border border-white/8 hover:border-[#D4AF37]/30 overflow-hidden transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col">
      {/* Image area */}
      <div
        onClick={onSelect}
        className="bg-gradient-to-br from-[#6b6257] via-[#4d473f] to-[#36322c] flex items-center justify-center p-8 h-64 relative overflow-hidden cursor-pointer group"
      >
        <div className="absolute top-0 left-1/4 w-full h-full bg-[#c78252]/15 blur-[60px] rounded-full pointer-events-none" />
        <img
          src={product.cardImage}
          alt={product.name}
          className="h-full object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.6)] relative z-10 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-poppins text-xl font-bold text-white mb-1">{product.name}</h3>
        <p className="text-gray-400 text-sm mb-4">{product.description}</p>

        <ul className="space-y-1.5 mb-5">
          {product.features.slice(0, 4).map(feat => (
            <li key={feat} className="flex items-center gap-2 text-gray-300 text-sm">
              <CheckCircle size={14} className="text-[#D4AF37] flex-shrink-0" />
              {feat}
            </li>
          ))}
        </ul>

        <div className="flex gap-2 mb-5">
          {customTypes.map(([key, val]) => (
            <span key={key} className="bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-medium px-3 py-1 rounded-full border border-[#D4AF37]/20">
              {val.label}
            </span>
          ))}
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-gray-400 text-sm">a partir de</span>
            <span className="font-poppins text-3xl font-bold text-[#F1C40F]">
              R$ {product.basePrice.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-gray-400 text-sm">/ un.</span>
          </div>
          <p className="text-gray-500 text-xs mb-4">Pedido mínimo: {product.minQuantity} unidades</p>
          <button
            onClick={onSelect}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#d49924] hover:from-[#d49924] hover:to-[#c28511] text-gray-900 font-bold py-3.5 rounded-xl text-base transition-all shadow-[0_4px_15px_rgba(212,175,55,0.25)] hover:shadow-[0_8px_20px_rgba(212,175,55,0.4)] hover:-translate-y-0.5"
          >
            Compre Já!
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({ onSelectProduct }) => {
  const products = Object.values(PRODUCTS);

  return (
    <section id="produto" className="py-20 bg-[#1a1917]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">Nossos Produtos</span>
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-white mt-2">Escolha seu Modelo</h2>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto">
            Personalize com a identidade da sua empresa — serigrafia ou gravação a laser
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {products.map(product => (
            <ProductCard key={product.id} product={product} onSelect={() => onSelectProduct(product)} />
          ))}
        </div>
      </div>
    </section>
  );
};
