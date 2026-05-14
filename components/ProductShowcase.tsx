import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { ProductDef, PRODUCTS, CustomizationType } from '../types';

interface ProductShowcaseProps {
  onSelectProduct: (product: ProductDef) => void;
}

const ProductCard: React.FC<{ product: ProductDef; onSelect: () => void }> = ({ product, onSelect }) => {
  const customTypes = Object.entries(product.customizations) as [CustomizationType, typeof product.customizations.serigrafia][];

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col">
      {/* Image area */}
      <div className="bg-[#423d38] bg-gradient-to-br from-[#6b6257] via-[#4d473f] to-[#36322c] flex items-center justify-center p-8 h-64 relative overflow-hidden">
        {/* Luz rebatida para simular a iluminação do Hero */}
        <div className="absolute top-0 left-1/4 w-full h-full bg-[#c78252]/15 blur-[60px] rounded-full pointer-events-none"></div>
        <img
          src={product.image}
          alt={product.name}
          className="h-full object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.6)] relative z-10"
        />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-poppins text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-4">{product.description}</p>

        {/* Features */}
        <ul className="space-y-1.5 mb-5">
          {product.features.slice(0, 4).map(feat => (
            <li key={feat} className="flex items-center gap-2 text-gray-600 text-sm">
              <CheckCircle size={14} className="text-primary flex-shrink-0" />
              {feat}
            </li>
          ))}
        </ul>

        {/* Customization types */}
        <div className="flex gap-2 mb-5">
          {customTypes.map(([key, val]) => (
            <span key={key} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
              {val.label}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-gray-400 text-sm">a partir de</span>
            <span className="font-poppins text-3xl font-bold text-accent">
              R$ {product.basePrice.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-gray-400 text-sm">/ un.</span>
          </div>
          <p className="text-gray-400 text-xs mb-4">Pedido mínimo: {product.minQuantity} unidades</p>
          <button
            onClick={onSelect}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primaryDark text-white font-semibold py-3.5 rounded-xl text-base transition-all hover:shadow-lg hover:shadow-primary/30"
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
    <section id="produto" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Nossos Produtos</span>
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-gold mt-2">
            Escolha seu Modelo
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Personalize com a identidade da sua empresa — serigrafia ou gravação a laser
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={() => onSelectProduct(product)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
