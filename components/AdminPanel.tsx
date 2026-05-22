import React, { useEffect, useState } from 'react';
import { Package, RefreshCw, LogOut, Download, DollarSign, TrendingUp, BarChart3, ShoppingBag } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendente:  { label: 'Pendente',   color: 'bg-yellow-100 text-yellow-800' },
  pago:      { label: 'Pago',       color: 'bg-blue-100 text-blue-800' },
  producao:  { label: 'Produção',   color: 'bg-purple-100 text-purple-800' },
  enviado:   { label: 'Enviado',    color: 'bg-indigo-100 text-indigo-800' },
  entregue:  { label: 'Entregue',   color: 'bg-green-100 text-green-800' },
  cancelado: { label: 'Cancelado',  color: 'bg-red-100 text-red-800' },
};

interface Pedido {
  id: string;
  status: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf_cnpj?: string;
  produto: string;
  quantidade: number;
  valor_total: number;
  endereco: string;
  tipo_personalizacao: string;
  cor_serigrafia: string;
  created_at: string;
  codigo_rastreio?: string;
  arte_url?: string;
}

function authHeaders(token: string) {
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

const FILTER_TABS = [
  { key: 'todos', label: 'Todos' },
  { key: 'pago', label: 'Pago' },
  { key: 'producao', label: 'Produção' },
  { key: 'enviado', label: 'Enviado' },
  { key: 'entregue', label: 'Entregue' },
  { key: 'pendente', label: 'Pendente' },
  { key: 'cancelado', label: 'Cancelado' },
];

export const AdminPanel: React.FC<{ token: string; onLogout: () => void }> = ({ token, onLogout }) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pago');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    const res = await fetch('/api/admin/pedidos', { headers: authHeaders(token) });
    if (res.status === 401) { onLogout(); return; }
    const { pedidos: data } = await res.json();
    const HIDDEN = ['aguardando_pix', 'aguardando_cartao'];
    setPedidos((data || []).filter((p: Pedido) => !HIDDEN.includes(p.status)));
    setLastUpdated(new Date());
    if (!silent) setLoading(false);
    else setRefreshing(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch('/api/admin/update-status', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ id, status }),
    });
    await load();
    setUpdating(null);
  };

  const updateRastreio = async (id: string, codigo: string) => {
    await fetch('/api/admin/update-rastreio', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ id, codigo }),
    });
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
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-gray-400 hidden sm:block">
                {refreshing ? 'Atualizando...' : `Atualizado às ${lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
              </span>
            )}
            <button onClick={() => load()} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Atualizar
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
              <LogOut size={15} /> Sair
            </button>
          </div>
        </div>

        {/* ── Métricas de negócio ── */}
        {(() => {
          const PAID = ['pago', 'producao', 'enviado', 'entregue'];
          const paidAll = pedidos.filter(p => PAID.includes(p.status));
          const now = new Date();
          const paidMes = paidAll.filter(p => {
            const d = new Date(p.created_at);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
          });
          const fatMes    = paidMes.reduce((s, p) => s + (p.valor_total || 0), 0);
          const fatTotal  = paidAll.reduce((s, p) => s + (p.valor_total || 0), 0);
          const ticket    = paidAll.length > 0 ? fatTotal / paidAll.length : 0;
          const unidMes   = paidMes.reduce((s, p) => s + (p.quantidade || 0), 0);

          const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

          const cards = [
            { icon: DollarSign, bg: 'bg-green-50',  ic: 'text-green-600',  label: 'Faturamento do Mês', value: fmt(fatMes),   sub: `${paidMes.length} pedido${paidMes.length !== 1 ? 's' : ''}` },
            { icon: TrendingUp, bg: 'bg-blue-50',   ic: 'text-blue-600',   label: 'Faturamento Total',  value: fmt(fatTotal),  sub: `${paidAll.length} pedidos pagos` },
            { icon: BarChart3,  bg: 'bg-purple-50', ic: 'text-purple-600', label: 'Ticket Médio',       value: fmt(ticket),    sub: 'por pedido pago' },
            { icon: Package,    bg: 'bg-amber-50',  ic: 'text-amber-600',  label: 'Unidades no Mês',    value: String(unidMes), sub: 'copos personalizados' },
          ];

          // Produto mais vendido
          const prodMap: Record<string, { pedidos: number; unidades: number }> = {};
          paidAll.forEach(p => {
            const nome = p.produto?.split(' — ')[0]?.trim() || 'Desconhecido';
            if (!prodMap[nome]) prodMap[nome] = { pedidos: 0, unidades: 0 };
            prodMap[nome].pedidos++;
            prodMap[nome].unidades += p.quantidade || 0;
          });
          const prodStats = Object.entries(prodMap)
            .map(([nome, s]) => ({ nome, ...s }))
            .sort((a, b) => b.unidades - a.unidades);

          return (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {cards.map(({ icon: Icon, bg, ic, label, value, sub }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4">
                    <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                      <Icon size={18} className={ic} />
                    </div>
                    <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>

              {prodStats.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {prodStats.map(({ nome, pedidos: qtd, unidades }) => (
                    <div key={nome} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <ShoppingBag size={18} className="text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{nome}</p>
                        <p className="text-xs text-gray-500">{qtd} pedido{qtd !== 1 ? 's' : ''} · {unidades} unidades vendidas</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-gray-900">{unidades}</p>
                        <p className="text-xs text-gray-400">unid.</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          );
        })()}

        {/* ── Pipeline de status ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {['pago','producao','enviado','entregue'].map(s => (
            <div key={s} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{pedidos.filter(p => p.status === s).length}</p>
              <p className="text-xs text-gray-500 mt-1">{STATUS_LABELS[s].label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {FILTER_TABS.map(tab => {
            const count = tab.key === 'todos' ? pedidos.length : pedidos.filter(p => p.status === tab.key).length;
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  isActive
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Carregando pedidos...</div>
        ) : pedidos.filter(p => statusFilter === 'todos' || p.status === statusFilter).length === 0 ? (
          <div className="text-center py-20 text-gray-400">Nenhum pedido com status "{FILTER_TABS.find(t => t.key === statusFilter)?.label}".</div>
        ) : (
          <div className="space-y-4">
            {pedidos.filter(p => statusFilter === 'todos' || p.status === statusFilter).map(p => (
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
                    {p.telefone && <p className="text-sm text-gray-500">{p.telefone}</p>}
                    {p.cpf_cnpj && <p className="text-xs text-gray-400">CPF/CNPJ: {p.cpf_cnpj}</p>}
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
                  <div className="sm:col-span-2"><span className="text-gray-400">Endereço:</span> {p.endereco}</div>
                  {p.codigo_rastreio && <div><span className="text-gray-400">Rastreio:</span> <span className="font-mono font-semibold">{p.codigo_rastreio}</span></div>}
                  {p.arte_url && (
                    <div className="sm:col-span-2">
                      <span className="text-gray-400">Arte do cliente:</span>{' '}
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(p.arte_url!);
                            const blob = await res.blob();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            const ext = p.arte_url!.split('.').pop()?.split('?')[0] || 'png';
                            a.download = `arte-${p.id.slice(0, 8)}.${ext}`;
                            a.click();
                            URL.revokeObjectURL(url);
                          } catch {
                            window.open(p.arte_url!, '_blank');
                          }
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer"
                      >
                        <Download size={13} />
                        Baixar arquivo
                      </button>
                    </div>
                  )}
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

export const AdminLogin: React.FC<{ onLogin: (token: string) => void }> = ({ onLogin }) => {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!pw.trim()) return;
    setLoading(true);
    setErr('');
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        onLogin(data.token);
      } else {
        setErr(data.error || 'Senha incorreta');
      }
    } catch {
      setErr('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-sm shadow-sm">
        <h1 className="font-poppins text-xl font-bold text-gray-900 mb-6 text-center">Painel Admin</h1>
        <input
          type="password"
          placeholder="Senha"
          value={pw}
          onChange={e => { setPw(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className={`w-full border rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-primary ${err ? 'border-red-400' : 'border-gray-300'}`}
        />
        {err && <p className="text-red-500 text-sm mb-3">{err}</p>}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-primary hover:bg-primaryDark text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60"
        >
          {loading ? 'Verificando...' : 'Entrar'}
        </button>
      </div>
    </div>
  );
};
