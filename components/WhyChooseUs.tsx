import React from 'react';
import { Award, Zap, Users, Headphones } from 'lucide-react';

const differentials = [
  {
    icon: Award,
    title: 'Qualidade Premium',
    description: 'Copos em aço inox 18/8 com acabamento de alta durabilidade.',
  },
  {
    icon: Zap,
    title: 'Entrega Rápida',
    description: 'Produção ágil e envio expresso para todo o território nacional.',
  },
  {
    icon: Users,
    title: 'Pedido Mínimo Flexível',
    description: 'Comece com apenas 10 unidades, ideal para qualquer empresa.',
  },
  {
    icon: Headphones,
    title: 'Atendimento Especializado',
    description: 'Nossa equipe te acompanha em cada etapa do pedido.',
  },
];

export const WhyChooseUs: React.FC = () => {
  return (
    <section id="diferenciais" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">Por que nós?</span>
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-gold mt-2">
            Nossos Diferenciais
          </h2>
          <p className="text-gray-300 mt-3 max-w-lg mx-auto">
            Mais do que brindes — experiências que fortalecem sua marca
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {differentials.map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group p-6 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/10 hover:border-[#D4AF37]/40 hover:bg-black/50 transition-all"
              >
                <div className="w-12 h-12 bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <Icon size={22} className="text-[#D4AF37]" />
                </div>
                <h3 className="font-poppins font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
