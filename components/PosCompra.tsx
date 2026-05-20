import React, { useEffect, useState } from 'react';
import { CheckCircle, Package, Truck, Phone, Home, Clock, Paintbrush, Star } from 'lucide-react';

interface PosCompraProps {
  nome: string;
  email: string;
  produto: string;
  personalizacao: string;
  quantidade: string;
  valor: string;
  frete: string;
}

const STEPS = [
  {
    icon: CheckCircle,
    title: 'Pagamento aprovado',
    desc: 'Seu pagamento PIX foi confirmado com sucesso.',
    done: true,
  },
  {
    icon: Phone,
    title: 'Entraremos em contato',
    desc: 'Nossa equipe vai te contatar em até 24h para confirmar os detalhes da personalização.',
    done: false,
  },
  {
    icon: Paintbrush,
    title: 'Produção do pedido',
    desc: 'Seu copo personalizado é produzido com cuidado e qualidade.',
    done: false,
  },
  {
    icon: Truck,
    title: 'Envio',
    desc: 'Seu pedido é embalado e enviado pelos Correios com código de rastreio.',
    done: false,
  },
  {
    icon: Star,
    title: 'Entrega',
    desc: 'Você recebe seu produto personalizado no endereço informado.',
    done: false,
  },
];

export const PosCompra: React.FC<PosCompraProps> = ({
  nome, email, produto, personalizacao, quantidade, valor, frete,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const primeiroNome = nome.split(' ')[0] || 'Cliente';
  const totalNum = parseFloat(valor) || 0;
  const qtd = parseInt(quantidade) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-16">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header animado */}
        <div
          className={`text-center mb-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <div className="flex justify-center mb-5">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center shadow-lg">
              <CheckCircle size={52} className="text-green-500" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="font-poppins text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Pedido Confirmado!
          </h1>
          <p className="text-gray-500 text-lg">
            Obrigado, <span className="font-semibold text-gray-800">{primeiroNome}</span>! Seu pedido foi recebido com sucesso.
          </p>
          {email && (
            <p className="text-sm text-gray-400 mt-1">
              Um e-mail de confirmação foi enviado para <span className="font-medium text-gray-600">{email}</span>
            </p>
          )}
        </div>

        {/* Card resumo do pedido */}
        <div
          className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h2 className="font-poppins font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={18} className="text-primary" />
            Resumo do Pedido
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Produto</span>
              <span className="font-medium text-gray-900 text-right max-w-[60%]">{produto}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Personalização</span>
              <span className="font-medium text-gray-900">{personalizacao}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Quantidade</span>
              <span className="font-medium text-gray-900">{qtd} unidades</span>
            </div>
            {frete && (
              <div className="flex justify-between">
                <span className="text-gray-500">Frete</span>
                <span className="font-medium text-gray-900">{frete}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total pago</span>
              <span className="font-bold text-xl text-primary">
                R$ {totalNum.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
            <span className="text-green-800 font-medium text-sm">Pagamento PIX confirmado</span>
          </div>
        </div>

        {/* Próximos passos */}
        <div
          className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h2 className="font-poppins font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            O que acontece agora?
          </h2>

          <div className="relative">
            {/* Linha vertical */}
            <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gray-100" />

            <div className="space-y-5">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="flex gap-4 items-start relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      step.done
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div className="pt-1.5">
                      <p className={`font-semibold text-sm ${step.done ? 'text-green-700' : 'text-gray-700'}`}>
                        {step.done && <span className="mr-1">✓</span>}
                        {step.title}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contato */}
        <div
          className={`bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <p className="text-amber-900 text-sm text-center leading-relaxed">
            <span className="font-semibold block mb-1">Dúvidas? Fale com a gente!</span>
            Em caso de dúvidas, entre em contato pelo WhatsApp ou responda o e-mail de confirmação.
          </p>
          <div className="flex justify-center mt-3">
            <a
              href="https://wa.me/5551995334623"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chamar no WhatsApp
            </a>
          </div>
        </div>

        {/* Botão voltar */}
        <div className={`text-center transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <button
            onClick={() => { window.location.href = '/'; }}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors"
          >
            <Home size={15} />
            Voltar ao início
          </button>
        </div>

      </div>
    </div>
  );
};
