import React from 'react';
import { ShoppingBag, Palette, CreditCard, Package } from 'lucide-react';

const steps = [
  { icon: ShoppingBag, title: 'Escolha o Produto',     description: 'Navegue pelo catálogo e selecione o produto desejado.',                                     color: 'bg-blue-500' },
  { icon: Palette,     title: 'Personalize',           description: 'Escolha o tipo de gravação e faça upload da sua arte ou logo.',                             color: 'bg-primary' },
  { icon: CreditCard,  title: 'Realize o Pagamento',   description: 'Pague com segurança via Mercado Pago: PIX, cartão ou boleto.',                              color: 'bg-accent' },
  { icon: Package,     title: 'Receba seu Brinde',      description: 'Entregamos em todo o Brasil com prazo garantido.',                                          color: 'bg-green-500' },
];

export const HowItWorks: React.FC = () => (
  <section id="como-funciona" className="py-20 bg-[#222019]">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">Simples e Rápido</span>
        <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-white mt-2">Como Funciona</h2>
        <p className="text-gray-400 mt-3 max-w-lg mx-auto">Do pedido à entrega em 4 passos simples</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="relative flex flex-col items-center text-center bg-[#2a2825] rounded-2xl p-6 border border-white/8 hover:border-[#D4AF37]/30 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#D4AF37] text-gray-900 rounded-full text-xs font-bold flex items-center justify-center">
                {index + 1}
              </div>
              <div className={`${step.color} w-14 h-14 rounded-2xl flex items-center justify-center mt-3 mb-4`}>
                <Icon size={26} className="text-white" />
              </div>
              <h3 className="font-poppins font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
