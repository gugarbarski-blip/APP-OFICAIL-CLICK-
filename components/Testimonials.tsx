import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Mariana Costa', role: 'Diretora de Marketing', company: 'TechSul Soluções',
    text: 'Pedimos 150 copos térmicos para o nosso evento corporativo. A gravação a laser ficou impecável e a entrega chegou antes do prazo. Já estamos planejando o próximo pedido!',
    stars: 5, initials: 'MC',
  },
  {
    name: 'Roberto Almeida', role: 'Proprietário', company: 'Almeida Imóveis',
    text: 'Usamos as ecobags como brinde de lançamento do empreendimento. O algodão é de boa qualidade, a serigrafia ficou nítida e o preço por unidade é muito competitivo.',
    stars: 5, initials: 'RA',
  },
  {
    name: 'Fernanda Souza', role: 'Gerente Comercial', company: 'GreenFood RS',
    text: 'Encomendamos cadernetas Moleskine personalizadas para nossa equipe de vendas. Ficaram lindas com o logo em serigrafia. Atendimento ágil e produto entregue conforme o combinado.',
    stars: 5, initials: 'FS',
  },
];

const Stars: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <Star key={i} size={14} className="fill-[#F1C40F] text-[#F1C40F]" />
    ))}
  </div>
);

export const Testimonials: React.FC = () => (
  <section id="depoimentos" className="py-12 md:py-20 bg-[#222019]">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8 md:mb-12">
        <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">Depoimentos</span>
        <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-white mt-2">O que nossos clientes dizem</h2>
        <p className="text-gray-400 mt-3 max-w-lg mx-auto">Empresas de todo o Brasil já personalizaram seus brindes com a gente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map(t => (
          <div key={t.name} className="bg-[#2a2825] rounded-2xl border border-white/8 hover:border-[#D4AF37]/30 p-6 flex flex-col gap-4 transition-all hover:bg-[#2e2b27]">
            <Stars count={t.stars} />
            <p className="text-gray-300 text-sm leading-relaxed flex-1">"{t.text}"</p>
            <div className="flex items-center gap-3 pt-2 border-t border-white/8">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/15 flex items-center justify-center font-poppins font-bold text-[#D4AF37] text-sm flex-shrink-0">
                {t.initials}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs">{t.role} · {t.company}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
