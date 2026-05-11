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
            <svg viewBox="0 0 200 280" className="w-48 h-64 drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="100" cy="32" rx="52" ry="12" fill="#2a2a2a" />
              <rect x="52" y="28" width="96" height="18" rx="4" fill="#222222" />
              <rect x="68" y="34" width="64" height="6" rx="3" fill="#333333" />
              <rect x="88" y="16" width="24" height="16" rx="4" fill="#1a1a1a" />
              <rect x="93" y="10" width="14" height="10" rx="3" fill="#111111" />
              <path d="M58 44 Q52 46 50 55 L44 220 Q43 235 58 240 L142 240 Q157 235 156 220 L150 55 Q148 46 142 44 Z" fill="#1a1a1a" />
              <path d="M68 50 Q62 52 60 60 L56 190 Q58 195 65 196 L75 196 L79 60 Q78 52 72 50 Z" fill="rgba(255,255,255,0.07)" />
              <rect x="68" y="105" width="64" height="70" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3" />
              <text x="100" y="136" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Inter, sans-serif">Seu Logo</text>
              <text x="100" y="148" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Inter, sans-serif">Aqui</text>
              <ellipse cx="100" cy="238" rx="42" ry="9" fill="#111111" />
              <ellipse cx="100" cy="236" rx="36" ry="7" fill="#0d0d0d" />
              <rect x="143" y="120" width="18" height="50" rx="9" fill="#222222" />
              <rect x="145" y="124" width="14" height="42" rx="7" fill="#1a1a1a" />
            </svg>

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
