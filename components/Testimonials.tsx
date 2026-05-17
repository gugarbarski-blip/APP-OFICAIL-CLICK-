import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Mariana Costa',
    role: 'Diretora de Marketing',
    company: 'TechSul Soluções',
    text: 'Encomendamos 200 copos para o nosso evento anual e o resultado foi incrível. A qualidade superou as expectativas e a entrega foi pontual. Os clientes adoraram!',
    stars: 5,
    initials: 'MC',
  },
  {
    name: 'Roberto Almeida',
    role: 'Proprietário',
    company: 'Almeida Imóveis',
    text: 'Usamos os copos como brinde para novos clientes. O acabamento é premium, parece muito mais caro do que realmente custa. A arte ficou perfeita com a gravação a laser.',
    stars: 5,
    initials: 'RA',
  },
  {
    name: 'Fernanda Souza',
    role: 'Gerente Comercial',
    company: 'GreenFood RS',
    text: 'Atendimento excelente desde o primeiro contato. Aprovaram a arte rapidinho e o prazo foi cumprido. Com certeza vou pedir mais para o fim do ano.',
    stars: 5,
    initials: 'FS',
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
  <section id="depoimentos" className="py-20 relative">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">Depoimentos</span>
        <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-gold mt-2">
          O que nossos clientes dizem
        </h2>
        <p className="text-gray-300 mt-3 max-w-lg mx-auto">
          Mais de 500 empresas já confiaram na ImpreBrindes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map(t => (
          <div key={t.name} className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 flex flex-col gap-4 hover:border-[#D4AF37]/30 hover:shadow-xl transition-all">
            <Stars count={t.stars} />
            <p className="text-gray-300 text-sm leading-relaxed flex-1">"{t.text}"</p>
            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center font-poppins font-bold text-[#D4AF37] text-sm flex-shrink-0">
                {t.initials}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{t.name}</p>
                <p className="text-gray-400 text-xs">{t.role} · {t.company}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
