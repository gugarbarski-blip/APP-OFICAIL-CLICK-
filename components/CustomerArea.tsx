import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Package, CheckCircle, Printer, Truck, Home,
  LogOut, User, Eye, EyeOff, Mail, Lock, UserPlus, LogIn,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

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
  { key: 'pendente',  label: 'Pedido Confirmado',  icon: CheckCircle, desc: 'Recebemos seu pedido e o pagamento está sendo processado.' },
  { key: 'pago',      label: 'Pagamento Aprovado',  icon: CheckCircle, desc: 'Pagamento confirmado! Seu pedido entrou na fila de produção.' },
  { key: 'producao',  label: 'Em Produção',         icon: Printer,     desc: 'Sua arte está sendo impressa nos copos.' },
  { key: 'enviado',   label: 'Saiu para Entrega',   icon: Truck,       desc: 'Seu pedido foi despachado e está a caminho.' },
  { key: 'entregue',  label: 'Pedido Entregue',     icon: Home,        desc: 'Pedido entregue com sucesso. Obrigado pela confiança!' },
];
const STATUS_ORDER = ['pendente', 'pago', 'producao', 'enviado', 'entregue'];

function StatusTimeline({ status, codigoRastreio }: { status: string; codigoRastreio?: string }) {
  const currentIdx = STATUS_ORDER.indexOf(status);
  return (
    <div className="mt-4">
      {STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex gap-4 mb-1">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-green-500 border-green-500' : 'bg-white border-gray-200'}`}>
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
              {(done || active) && <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>}
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
  );
}

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? 'Senha'}
        className="w-full border border-gray-300 rounded-xl pl-9 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
      />
      <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha) return;
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });
    setLoading(false);
    if (err) {
      if (err.message.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.');
      } else {
        setError(err.message);
      }
      return;
    }
    onSuccess();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="relative">
        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
        />
      </div>
      <PasswordInput value={senha} onChange={setSenha} placeholder="Sua senha" />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50"
      >
        <LogIn size={16} />
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: (msg: string) => void }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmar) { setError('As senhas não coincidem.'); return; }
    if (senha.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: senha,
      options: { data: { nome: nome.trim() } },
    });
    setLoading(false);
    if (err) {
      if (err.message.includes('already registered')) {
        setError('Este e-mail já possui uma conta. Tente fazer login.');
      } else {
        setError(err.message);
      }
      return;
    }
    onSuccess('Conta criada! Verifique seu e-mail para ativar a conta e então faça login.');
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="relative">
        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={nome}
          onChange={e => setNome(e.target.value)}
          placeholder="Seu nome completo"
          required
          className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
        />
      </div>
      <div className="relative">
        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com (mesmo usado no pedido)"
          required
          className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
        />
      </div>
      <PasswordInput value={senha} onChange={setSenha} placeholder="Crie uma senha (mín. 6 caracteres)" />
      <PasswordInput value={confirmar} onChange={setConfirmar} placeholder="Confirme a senha" />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50"
      >
        <UserPlus size={16} />
        {loading ? 'Criando conta...' : 'Criar Conta'}
      </button>
    </form>
  );
}

function Dashboard({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const nome = session.user.user_metadata?.nome || session.user.email?.split('@')[0] || 'Cliente';

  useEffect(() => {
    const fetchPedidos = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/customer/orders', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setPedidos(data.pedidos);
      } catch {
        setError('Erro ao carregar pedidos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, [session.access_token]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-poppins text-2xl font-bold text-gray-900">Olá, {nome}!</h1>
          <p className="text-sm text-gray-500 mt-0.5">{session.user.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors border border-gray-200 hover:border-red-200 px-3 py-2 rounded-lg"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Package size={22} className="text-[#0d9488]" />
        <h2 className="font-poppins text-lg font-bold text-gray-900">Meus Pedidos</h2>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-400">
          <div className="w-8 h-8 border-2 border-[#0d9488] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Carregando pedidos...</p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {!loading && pedidos !== null && pedidos.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum pedido encontrado.</p>
          <p className="text-sm mt-1">
            Certifique-se de usar o mesmo e-mail informado no pedido.
          </p>
        </div>
      )}

      {!loading && pedidos && pedidos.length > 0 && (
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
      )}
    </div>
  );
}

export const CustomerArea: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setTab('login');
    setSuccessMsg('');
  };

  const handleRegisterSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTab('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0d9488] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft size={14} /> Voltar
        </button>

        {session ? (
          <Dashboard session={session} onLogout={handleLogout} />
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <User size={28} className="text-[#0d9488]" />
              <h1 className="font-poppins text-2xl font-bold text-gray-900">Minha Conta</h1>
            </div>
            <p className="text-gray-500 mb-8">
              Acesse sua conta para acompanhar seus pedidos com segurança.
            </p>

            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm mb-6">
                {successMsg}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex border-b border-gray-100 mb-6">
                <button
                  onClick={() => { setTab('login'); setSuccessMsg(''); }}
                  className={`flex-1 pb-3 text-sm font-semibold transition-colors ${tab === 'login' ? 'text-[#0d9488] border-b-2 border-[#0d9488]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => { setTab('register'); setSuccessMsg(''); }}
                  className={`flex-1 pb-3 text-sm font-semibold transition-colors ${tab === 'register' ? 'text-[#0d9488] border-b-2 border-[#0d9488]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Criar Conta
                </button>
              </div>

              {tab === 'login' ? (
                <LoginForm onSuccess={() => setSuccessMsg('')} />
              ) : (
                <RegisterForm onSuccess={handleRegisterSuccess} />
              )}
            </div>

            {tab === 'login' && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Não tem conta?{' '}
                <button onClick={() => setTab('register')} className="text-[#0d9488] font-semibold hover:underline">
                  Cadastre-se gratuitamente
                </button>
              </p>
            )}
            {tab === 'register' && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Já tem conta?{' '}
                <button onClick={() => setTab('login')} className="text-[#0d9488] font-semibold hover:underline">
                  Faça login
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
