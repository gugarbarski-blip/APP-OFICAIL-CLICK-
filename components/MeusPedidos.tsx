import React, { useState } from 'react';
import { ArrowLeft, Search, Package, CheckCircle, Printer, Truck, Home, Clock } from 'lucide-react';

interface Pedido {
  id: string;
  status: string;
  produto: string;
  quantidade: number;
  valor_total: number;
  created_at: string;
  codigo_rastreio?: string;
  tipo_personalizacao: string;
}

const STEPS = [
  { key: 'pendente',  label: 'Pedido Confirmado',   icon: CheckCircle, desc: 'Recebemos seu pedido e o pagamento está sendo processado.' },
  { key: 'pago',      label: 'Pagamento Aprovado',   icon: CheckCircle, desc: 'Pagamento confirmado! Seu pedido entrou na fila de produção.' },
  { key: 'producao',  label: 'Em Produção',          icon: Printer,     desc: 'Sua arte está sendo impressa nos copos.' },
  { key: 'enviado',   label: 'Saiu para Entrega',    icon: Truck,       desc: 'Seu pedido foi despachado e está a caminho.' },
  { key: 'entregue',  label: 'Pedido Entregue',      icon: Home,        desc: 'Pedido entregue com sucesso. Obrigado pela confiança!' },
];

const STATUS_ORDER = ['pendente', 'pago', 'producao', 'enviado', 'entregue'];

function StatusTimeline({ status, codigoRastreio }: { status: string; codigoRastreio?: string }) {
  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div className="mt-4">
      <div className="relative">
        {STEPS.map((step, idx) => {
          const done = idx <= currentIdx;
          const active = idx === currentIdx;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex gap-4 mb-1">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  done ? 'bg-green-500 border-green-500' : 'bg-white border-gray-200'
                }`}>
                  <Icon size={18} className={done ? 'text-white' : 'text-gray-300'} />
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`w-0.5 h-8 mt-1 ${done && idx < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
              <div className="pb-6">
                <p className={`font-semibold text-sm ${active ? 'text-green-600' : done ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                  {active && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Atual</span>}
                </p>
                {(done || active) && (
                  <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                )}
                {step.key === 'enviado' && codigoRastreio && done && (
                  <p className="text-xs mt-1 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                    Rastreio: <span className="font-bold">{codigoRastreio}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const MeusPedidos: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const buscar = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const res = await fetch(`/api/meus-pedidos?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPedidos(data.pedidos);
    } catch (e: any) {
      setError('Erro ao buscar pedidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft size={14} /> Voltar
        </button>

        <div className="flex items-center gap-3 mb-2">
          <Package size={28} className="text-[#0d9488]" />
          <h1 className="font-poppins text-2xl font-bold text-gray-900">Meus Pedidos</h1>
        </div>
        <p className="text-gray-500 mb-8">Digite seu e-mail para acompanhar seus pedidos.</p>

        <div className="flex gap-2 mb-8">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscar()}
            placeholder="seu@email.com"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
          />
          <button
            onClick={buscar}
            disabled={loading}
            className="flex items-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold px-5 py-3 rounded-xl text-sm transition-all disabled:opacity-50"
          >
            <Search size={16} />
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {searched && !loading && pedidos !== null && (
          pedidos.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhum pedido encontrado para este e-mail.</p>
              <p className="text-sm mt-1">Verifique se o e-mail está correto.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pedidos.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-xs text-gray-400 font-mono mb-1">#{p.id.slice(0, 8).toUpperCase()}</p>
                      <p className="font-semibold text-gray-900">{p.produto}</p>
                      <p className="text-sm text-gray-500">{p.quantidade} unidades · {p.tipo_personalizacao}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-poppins font-bold text-lg text-[#0d9488]">
                        R$ {p.valor_total?.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(p.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <StatusTimeline status={p.status} codigoRastreio={p.codigo_rastreio} />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
