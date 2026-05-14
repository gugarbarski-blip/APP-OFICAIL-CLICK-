import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package, RefreshCw, LogOut } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendente:  { label: 'Pendente',   color: 'bg-yellow-100 text-yellow-800' },
  pago:      { label: 'Pago',       color: 'bg-blue-100 text-blue-800' },
  producao:  { label: 'Produção',   color: 'bg-purple-100 text-purple-800' },
  enviado:   { label: 'Enviado',    color: 'bg-indigo-100 text-indigo-800' },
  entregue:  { label: 'Entregue',   color: 'bg-green-100 text-green-800' },
  cancelado: { label: 'Cancelado',  color: 'bg-red-100 text-red-800' },
};

const ADMIN_PASSWORD = 'clickbrindes2024';

interface Pedido {
  id: string;
  status: string;
  nome: string;
  email: string;
  produto: string;
  quantidade: number;
  valor_total: number;
  endereco: string;
  tipo_personalizacao: string;
  cor_serigrafia: string;
  created_at: string;
  codigo_rastreio?: string;
}

export const AdminPanel: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });
    setPedidos(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await supabase.from('pedidos').update({ status }).eq('id', id);
    await load();
    setUpdating(null);
  };

  const updateRastreio = async (id: string, codigo: string) => {
    await supabase.from('pedidos').update({ codigo_rastreio: codigo, status: 'enviado' }).eq('id', id);
    await load();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package size={28} className="text-primary" />
            <h1 className="font-poppins text-2xl font-bold text-gray-900">Painel de Pedidos</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
              <RefreshCw size={15} /> Atualizar
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
              <LogOut size={15} /> Sair
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {['pago','producao','enviado','entregue'].map(s => (
            <div key={s} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{pedidos.filter(p => p.status === s).length}</p>
              <p className="text-xs text-gray-500 mt-1">{STATUS_LABELS[s].label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Carregando pedidos...</div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Nenhum pedido ainda.</div>
        ) : (
          <div className="space-y-4">
            {pedidos.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 font-mono">#{p.id.slice(0,8)}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_LABELS[p.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[p.status]?.label || p.status}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">{p.nome}</p>
                    <p className="text-sm text-gray-500">{p.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-poppins text-xl font-bold text-primary">R$ {p.valor_total?.toFixed(2).replace('.', ',')}</p>
                    <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-4 bg-gray-50 rounded-xl p-3">
                  <div><span className="text-gray-400">Produto:</span> {p.produto}</div>
                  <div><span className="text-gray-400">Quantidade:</span> {p.quantidade} unid.</div>
                  <div><span className="text-gray-400">Personalização:</span> {p.tipo_personalizacao} {p.cor_serigrafia ? `— ${p.cor_serigrafia}` : ''}</div>
                  <div><span className="text-gray-400">Endereço:</span> {p.endereco}</div>
                  {p.codigo_rastreio && <div><span className="text-gray-400">Rastreio:</span> <span className="font-mono font-semibold">{p.codigo_rastreio}</span></div>}
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-gray-500 font-medium">Atualizar status:</span>
                  {Object.entries(STATUS_LABELS).map(([key, val]) => (
                    <button
                      key={key}
                      disabled={p.status === key || updating === p.id}
                      onClick={() => updateStatus(p.id, key)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${
                        p.status === key ? val.color + ' border-transparent font-bold' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {val.label}
                    </button>
                  ))}
                  <input
                    placeholder="Código de rastreio"
                    className="ml-auto text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) { updateRastreio(p.id, val); (e.target as HTMLInputElement).value = ''; }
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminLogin: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);

  const submit = () => {
    if (pw === ADMIN_PASSWORD) { onLogin(); }
    else { setErr(true); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-sm shadow-sm">
        <h1 className="font-poppins text-xl font-bold text-gray-900 mb-6 text-center">Painel Admin</h1>
        <input
          type="password"
          placeholder="Senha"
          value={pw}
          onChange={e => { setPw(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className={`w-full border rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-primary ${err ? 'border-red-400' : 'border-gray-300'}`}
        />
        {err && <p className="text-red-500 text-sm mb-3">Senha incorreta</p>}
        <button onClick={submit} className="w-full bg-primary hover:bg-primaryDark text-white font-semibold py-3 rounded-xl transition-all">
          Entrar
        </button>
      </div>
    </div>
  );
};
