import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, MapPin, Truck, Printer, Zap, FileText, Package, Lock } from 'lucide-react';
import { OrderFormData, Address, ProductDef, Customization, calcTotal, SERIGRAFIA_COLORS } from '../types';
import { formatPhone } from '../services/cep';

interface OrderFormProps {
  product: ProductDef;
  customization: Customization;
  initialData: OrderFormData;
  onChange: (data: OrderFormData) => void;
  onBack: () => void;
  onNext: () => void;
}

// Algoritmo módulo 11 — verifica os dois dígitos verificadores do CPF
function isValidCpf(raw: string): boolean {
  const d = raw.replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += +d[i] * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== +d[9]) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += +d[i] * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === +d[10];
}

// Algoritmo módulo 11 — verifica os dois dígitos verificadores do CNPJ
function isValidCnpj(raw: string): boolean {
  const d = raw.replace(/\D/g, '');
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const calc = (nums: string, weights: number[]) => {
    const sum = weights.reduce((acc, w, i) => acc + +nums[i] * w, 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  if (calc(d, [5,4,3,2,9,8,7,6,5,4,3,2]) !== +d[12]) return false;
  return calc(d, [6,5,4,3,2,9,8,7,6,5,4,3,2]) === +d[13];
}

export const OrderForm: React.FC<OrderFormProps> = ({ product, customization, initialData, onChange, onBack, onNext }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const d = initialData;

  const subtotal = calcTotal(product, customization.type, d.quantity);
  const shipping  = d.shipping;
  const total     = subtotal + (shipping?.price ?? 0);

  const colorLabel = customization.type === 'serigrafia'
    ? SERIGRAFIA_COLORS.find(c => c.key === customization.serigrafiaColor)?.label ?? ''
    : '';

  const formatCpfCnpj = (raw: string): string => {
    const digits = raw.replace(/\D/g, '').slice(0, 14);
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const set = (field: keyof Omit<OrderFormData, 'address'>, value: string | number) => {
    onChange({ ...d, [field]: value });
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const setAddr = (field: keyof Address, value: string) => {
    onChange({ ...d, address: { ...d.address, [field]: value } });
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!d.name.trim()) e.name = 'Nome é obrigatório';
    if (!d.email.trim() || !/\S+@\S+\.\S+/.test(d.email)) e.email = 'E-mail inválido';
    if (!d.phone.replace(/\D/g, '') || d.phone.replace(/\D/g, '').length < 10) e.phone = 'Telefone inválido';
    const cpfCnpjDigits = d.cpfCnpj.replace(/\D/g, '');
    if (cpfCnpjDigits.length === 11 && !isValidCpf(cpfCnpjDigits)) e.cpfCnpj = 'CPF inválido';
    else if (cpfCnpjDigits.length === 14 && !isValidCnpj(cpfCnpjDigits)) e.cpfCnpj = 'CNPJ inválido';
    else if (cpfCnpjDigits.length !== 11 && cpfCnpjDigits.length !== 14) e.cpfCnpj = 'CPF (11 dígitos) ou CNPJ (14 dígitos) inválido';
    if (!d.address.street.trim()) e.street = 'Rua é obrigatória';
    if (!d.address.number.trim()) e.number = 'Número é obrigatório';
    if (!d.address.city.trim()) e.city = 'Cidade é obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="min-h-screen pt-16 bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <button onClick={onBack} className="hover:text-[#D4AF37] transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Voltar
          </button>
          <span>/</span>
          <span className="text-white font-medium">Seus Dados</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">✓</div>
            <span className="text-sm text-gray-500">Quantidade e Frete</span>
          </div>
          <div className="flex-1 h-0.5 bg-green-500 mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">✓</div>
            <span className="text-sm text-gray-500">Arte e Personalização</span>
          </div>
          <div className="flex-1 h-0.5 bg-[#D4AF37] mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#D4AF37] text-gray-900 text-xs font-bold flex items-center justify-center">3</div>
            <span className="text-sm font-semibold text-[#D4AF37]">Seus Dados</span>
          </div>
        </div>

        <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-white mb-1">Seus Dados</h2>
        <p className="text-gray-400 mb-8">Confirme o resumo e preencha seus dados para finalizar</p>

        <div className="space-y-6">

          {/* ── Order summary ── */}
          <div className="bg-[#2a2825] rounded-2xl border border-white/8 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Package size={18} className="text-[#D4AF37]" />
              <h3 className="font-poppins font-semibold text-white">Resumo do Pedido</h3>
            </div>

            <div className="space-y-3 text-sm">
              {/* Product + qty */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Produto</span>
                <span className="text-white font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Quantidade</span>
                <span className="text-white font-medium">{d.quantity} unidades</span>
              </div>

              {/* Customization */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Personalização</span>
                <span className="flex items-center gap-1.5 text-white font-medium">
                  {customization.type === 'serigrafia'
                    ? <><Printer size={13} className="text-[#D4AF37]" /> Serigrafia 1 Cor{colorLabel ? ` — ${colorLabel}` : ''}</>
                    : <><Zap size={13} className="text-[#D4AF37]" /> Gravação a Laser</>
                  }
                </span>
              </div>

              {/* Art file */}
              {customization.artFile && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Arte enviada</span>
                  <span className="flex items-center gap-1.5 text-green-400 font-medium">
                    <FileText size={13} /> {customization.artFile.name}
                  </span>
                </div>
              )}

              <div className="border-t border-white/8 my-1" />

              {/* Price breakdown */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Subtotal ({d.quantity} un.)</span>
                <span className="text-white">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>

              {shipping && (
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Truck size={13} />
                    {shipping.service === 'PAC' ? 'PAC — Econômico' : 'SEDEX — Expresso'}
                    <span className="text-gray-500 text-xs">({shipping.label})</span>
                  </span>
                  <span className="text-white">R$ {shipping.price.toFixed(2).replace('.', ',')}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-1 border-t border-white/8">
                <span className="font-bold text-white">Total</span>
                <span className="font-poppins text-xl font-bold text-[#F1C40F]">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>

          {/* ── Personal data ── */}
          <div className="bg-[#2a2825] rounded-2xl border border-white/8 p-6">
            <h3 className="font-poppins font-semibold text-white mb-4">Seus Dados</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Nome completo</label>
                <input
                  type="text"
                  value={d.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="João Silva"
                  className={`w-full border rounded-lg px-3 py-2.5 bg-[#0a0a0a] text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder:text-gray-600 ${errors.name ? 'border-red-400' : 'border-white/15'}`}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
                <input
                  type="email"
                  value={d.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="joao@empresa.com.br"
                  className={`w-full border rounded-lg px-3 py-2.5 bg-[#0a0a0a] text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder:text-gray-600 ${errors.email ? 'border-red-400' : 'border-white/15'}`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp / Telefone</label>
                <input
                  type="tel"
                  value={d.phone}
                  onChange={e => set('phone', formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className={`w-full border rounded-lg px-3 py-2.5 bg-[#0a0a0a] text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder:text-gray-600 ${errors.phone ? 'border-red-400' : 'border-white/15'}`}
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  CPF / CNPJ <span className="text-gray-500 text-xs font-normal">(necessário para emissão de nota fiscal)</span>
                </label>
                <input
                  type="text"
                  value={d.cpfCnpj}
                  onChange={e => set('cpfCnpj', formatCpfCnpj(e.target.value))}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  className={`w-full border rounded-lg px-3 py-2.5 bg-[#0a0a0a] text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder:text-gray-600 ${errors.cpfCnpj ? 'border-red-400' : 'border-white/15'}`}
                />
                {errors.cpfCnpj && <p className="text-red-400 text-xs mt-1">{errors.cpfCnpj}</p>}
              </div>
            </div>
          </div>

          {/* ── Delivery address ── */}
          <div className="bg-[#2a2825] rounded-2xl border border-white/8 p-6">
            <h3 className="font-poppins font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-[#D4AF37]" />
              Endereço de Entrega
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">CEP</label>
                <div className="relative">
                  <input
                    type="text"
                    value={d.address.cep}
                    readOnly
                    className="w-full border border-white/8 rounded-lg px-3 py-2.5 bg-[#111110] text-gray-400 cursor-not-allowed pr-9"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Lock size={14} className="text-gray-600" />
                  </div>
                </div>
                <p className="text-gray-600 text-xs mt-1">Para alterar o CEP, volte à etapa 1</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Rua / Logradouro</label>
                <input
                  type="text"
                  value={d.address.street}
                  onChange={e => setAddr('street', e.target.value)}
                  placeholder="Rua das Flores"
                  className={`w-full border rounded-lg px-3 py-2.5 bg-[#0a0a0a] text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder:text-gray-600 ${errors.street ? 'border-red-400' : 'border-white/15'}`}
                />
                {errors.street && <p className="text-red-400 text-xs mt-1">{errors.street}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Número</label>
                <input
                  type="text"
                  value={d.address.number}
                  onChange={e => setAddr('number', e.target.value)}
                  placeholder="123"
                  className={`w-full border rounded-lg px-3 py-2.5 bg-[#0a0a0a] text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder:text-gray-600 ${errors.number ? 'border-red-400' : 'border-white/15'}`}
                />
                {errors.number && <p className="text-red-400 text-xs mt-1">{errors.number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Complemento <span className="text-gray-500">(opcional)</span></label>
                <input
                  type="text"
                  value={d.address.complement}
                  onChange={e => setAddr('complement', e.target.value)}
                  placeholder="Apto 42"
                  className="w-full border border-white/15 rounded-lg px-3 py-2.5 bg-[#0a0a0a] text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bairro</label>
                <input
                  type="text"
                  value={d.address.neighborhood}
                  onChange={e => setAddr('neighborhood', e.target.value)}
                  placeholder="Centro"
                  className="w-full border border-white/15 rounded-lg px-3 py-2.5 bg-[#0a0a0a] text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Cidade</label>
                <input
                  type="text"
                  value={d.address.city}
                  onChange={e => setAddr('city', e.target.value)}
                  placeholder="São Paulo"
                  className={`w-full border rounded-lg px-3 py-2.5 bg-[#0a0a0a] text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder:text-gray-600 ${errors.city ? 'border-red-400' : 'border-white/15'}`}
                />
                {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
                <input
                  type="text"
                  value={d.address.state}
                  onChange={e => setAddr('state', e.target.value.toUpperCase())}
                  placeholder="SP"
                  maxLength={2}
                  className="w-full border border-white/15 rounded-lg px-3 py-2.5 bg-[#0a0a0a] text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder:text-gray-600 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 border border-white/15 rounded-xl text-gray-300 font-medium hover:bg-white/5 transition-colors"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <button
              onClick={() => { if (validate()) onNext(); }}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#d49924] hover:from-[#d49924] hover:to-[#c28511] text-gray-900 font-bold py-3 rounded-xl text-base transition-all hover:shadow-lg hover:shadow-[#D4AF37]/30"
            >
              Ver Resumo e Pagar
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
