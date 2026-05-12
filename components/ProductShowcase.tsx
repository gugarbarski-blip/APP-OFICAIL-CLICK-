import React from 'react';
import { CheckCircle, Zap, Droplets, Thermometer, ArrowRight } from 'lucide-react';
import { PRODUCT, CustomizationType } from '../types';

interface ProductShowcaseProps {
  onCtaClick: () => void;
}

const featureIcons = [Thermometer, Droplets, Zap, CheckCircle, CheckCircle, CheckCircle];

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({ onCtaClick }) => {
  const customTypes = Object.entries(PRODUCT.customizations) as [CustomizationType, typeof PRODUCT.customizations.serigrafia][];

  return (
    <section id="produto" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Nosso Produto</span>
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
            {PRODUCT.name}
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">{PRODUCT.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Cup visual + price */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 flex flex-col items-center gap-6 shadow-xl">
            <img src="/copo.jpg" alt="Copo Térmico 475ml" className="w-48 h-64 object-contain drop-shadow-2xl" />

            <div className="text-center text-white">
              <p className="text-gray-400 text-sm">Cor: {PRODUCT.color}</p>
              <div className="flex items-baseline gap-1 justify-center mt-2">
                <span className="text-gray-400 text-sm">a partir de</span>
                <span className="font-poppins text-3xl font-bold text-accent">
                  R$ {PRODUCT.basePrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-1">por unidade · mínimo {PRODUCT.minQuantity} un.</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-8">
            {/* Features */}
            <div>
              <h3 className="font-poppins font-semibold text-lg text-gray-900 mb-4">Especificações</h3>
              <ul className="space-y-3">
                {PRODUCT.features.map((feat, i) => {
                  const Icon = featureIcons[i] || CheckCircle;
                  return (
                    <li key={feat} className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={15} className="text-primary" />
                      </div>
                      {feat}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Customization options */}
            <div>
              <h3 className="font-poppins font-semibold text-lg text-gray-900 mb-4">Tipos de Personalização</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customTypes.map(([key, val]) => (
                  <div key={key} className="border border-gray-200 rounded-xl p-4 hover:border-primary hover:bg-primary/5 transition-colors">
                    <p className="font-semibold text-gray-900 text-sm">{val.label}</p>
                    <p className="text-gray-500 text-xs mt-1">{val.description}</p>
                    {val.extraPrice > 0 && (
                      <p className="text-primary text-xs mt-2 font-medium">+ R$ {val.extraPrice.toFixed(2).replace('.', ',')} / un.</p>
                    )}
                    {val.extraPrice === 0 && (
                      <p className="text-green-600 text-xs mt-2 font-medium">Incluído no preço</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onCtaClick}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primaryDark text-white font-semibold py-4 rounded-xl text-base transition-all hover:shadow-lg hover:shadow-primary/30"
            >
              Personalizar Meu Copo
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
