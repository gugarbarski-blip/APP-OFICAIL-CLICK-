import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Qual é o pedido mínimo?',
    a: 'O pedido mínimo é de 10 unidades por modelo. Esse número foi pensado para atender tanto pequenas empresas quanto grandes eventos corporativos.',
  },
  {
    q: 'Qual o prazo de produção e entrega?',
    a: 'O prazo de produção é de 7 a 10 dias úteis após aprovação da arte. O frete varia de acordo com o CEP: PAC (5–12 dias úteis) ou SEDEX (1–5 dias úteis). O prazo exato é calculado automaticamente no checkout.',
  },
  {
    q: 'Como envio minha arte/logo?',
    a: 'No processo de pedido, você faz o upload diretamente no site. Aceitamos arquivos PNG, JPG, SVG, PDF e AI. Para melhor qualidade, recomendamos arquivos vetoriais (SVG ou AI) ou PNG com fundo transparente em alta resolução.',
  },
  {
    q: 'Qual a diferença entre Serigrafia e Gravação a Laser?',
    a: 'A Serigrafia é uma impressão em tinta colorida diretamente no copo — ótima para logos coloridos e preços mais acessíveis. A Gravação a Laser remove a tinta do copo criando um efeito espelhado, permanente e sofisticado — ideal para logos simples e resultado premium (+ R$ 5,00/unidade).',
  },
  {
    q: 'Vocês aprovam a arte antes de produzir?',
    a: 'Sim! Após realizar o pedido, nossa equipe analisa a arte enviada e entra em contato por e-mail para confirmar o layout e tirar dúvidas antes de iniciar a produção. Nenhum pedido vai para produção sem sua aprovação.',
  },
  {
    q: 'Quais formas de pagamento são aceitas?',
    a: 'Aceitamos PIX (com desconto), cartão de crédito (em até 12x) e boleto bancário — tudo via Mercado Pago de forma segura.',
  },
  {
    q: 'E se a arte não ficar como esperado?',
    a: 'Trabalhamos com aprovação prévia justamente para evitar isso. Mas se após a entrega o produto não estiver dentro do acordado, reprocessamos sem custo adicional.',
  },
];

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-black/40 hover:bg-black/50 transition-colors"
      >
        <span className="font-semibold text-white text-sm">{q}</span>
        <ChevronDown
          size={18}
          className={`text-primary flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 bg-black/30">
          <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
};

export const FAQ: React.FC = () => (
  <section id="faq" className="py-20 relative">
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">Dúvidas</span>
        <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-gold mt-2">
          Perguntas Frequentes
        </h2>
        <p className="text-gray-300 mt-3">
          Não encontrou o que precisava? Entre em contato pelo e-mail contato@imprebrindes.com.br
        </p>
      </div>
      <div className="space-y-3">
        {faqs.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
      </div>
    </div>
  </section>
);
