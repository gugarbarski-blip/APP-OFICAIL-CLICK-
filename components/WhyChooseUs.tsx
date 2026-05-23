import React from 'react';
import { Award, Zap, Users, Headphones } from 'lucide-react';

const differentials = [
  { icon: Award,      title: 'Qualidade Premium',         description: 'Copos em aço inox 18/8 com acabamento de alta durabilidade.' },
  { icon: Zap,        title: 'Entrega Rápida',            description: 'Produção ágil e envio expresso para todo o território nacional.' },
  { icon: Users,      title: 'Pedido Mínimo Flexível',    description: 'Comece com apenas 10 unidades, ideal para qualquer empresa.' },
  { icon: Headphones, title: 'Atendimento Especializado', description: 'Nossa equipe te acompanha em cada etapa do pedido.' },
];

export const WhyChooseUs: React.FC = () => (
  <section id="diferenciais" className="py-12 md:py-20 bg-[#1a1917]">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8 md:mb-12">
        <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">Por que nós?</span>
        <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-white mt-2">Nossos Diferenciais</h2>
        <p className="text-gray-400 mt-3 max-w-lg mx-auto">Mais do que brindes — experiências que fortalecem sua marca</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {differentials.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="group p-4 md:p-6 rounded-2xl border border-white/8 bg-[#2a2825] hover:border-[#D4AF37]/40 hover:bg-[#2e2b27] transition-all">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20 rounded-xl flex items-center justify-center mb-3 md:mb-4 transition-colors">
                <Icon size={20} className="text-[#D4AF37]" />
              </div>
              <h3 className="font-poppins font-semibold text-white text-sm md:text-base mb-1 md:mb-2">{item.title}</h3>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
