import React from 'react';
import { ShieldCheck, Award, Building2, Calendar } from 'lucide-react';

const stats = [
  { icon: Calendar,    value: '1968',   label: 'Ano de fundação do Grupo Impresul' },
  { icon: Building2,   value: '+55',    label: 'Anos de experiência em impressão e brindes' },
  { icon: Award,       value: '100%',   label: 'Dedicação à qualidade e satisfação do cliente' },
  { icon: ShieldCheck, value: 'CNPJ',   label: '92.869.650/0001-96 · Empresa regularizada' },
];

export const QuemSomos: React.FC = () => {
  return (
    <section id="quem-somos" className="py-20 bg-gradient-to-br from-[#2c2a27] via-[#3a3731] to-[#2c2a27] relative overflow-hidden">
      {/* Glow decorativo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12">
          <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-widest">Nossa história</span>
          <h2 className="font-poppins text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Quem Somos
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] rounded-full mx-auto mt-4" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Texto */}
          <div className="space-y-5">
            <p className="text-gray-200 text-lg leading-relaxed">
              A <strong className="text-[#F1C40F]">ImpreBrindes</strong> faz parte do{' '}
              <strong className="text-[#F1C40F]">Grupo Impresul</strong>, um dos grupos empresariais
              mais sólidos do Sul do Brasil, fundado em <strong className="text-white">1968</strong>.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Com mais de cinco décadas de atuação no mercado de impressão, comunicação visual e
              brindes corporativos, o Grupo Impresul construiu uma reputação baseada em{' '}
              <strong className="text-white">excelência, inovação e compromisso</strong> com seus clientes.
            </p>
            <p className="text-gray-300 leading-relaxed">
              A ImpreBrindes nasce dessa tradição para oferecer brindes personalizados de alto padrão
              com a agilidade do e-commerce: você faz o pedido online, nossa equipe cuida de tudo e
              entregamos direto na sua porta, em todo o Brasil.
            </p>

            {/* Badge CNPJ */}
            <div className="inline-flex items-center gap-3 bg-white/5 border border-[#D4AF37]/30 rounded-2xl px-5 py-4 mt-2">
              <ShieldCheck size={28} className="text-[#D4AF37] flex-shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">Empresa regularizada</p>
                <p className="text-gray-400 text-xs mt-0.5">CNPJ: 92.869.650/0001-96</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div
                key={value}
                className="bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 rounded-2xl p-5 transition-all group"
              >
                <div className="w-11 h-11 bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20 rounded-xl flex items-center justify-center mb-3 transition-colors">
                  <Icon size={22} className="text-[#D4AF37]" />
                </div>
                <p className="font-poppins text-2xl font-extrabold text-[#F1C40F]">{value}</p>
                <p className="text-gray-400 text-xs mt-1 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
