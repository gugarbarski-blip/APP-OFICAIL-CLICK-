import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, MapPin, Loader, Truck } from 'lucide-react';
import { OrderFormData, Address, ProductDef, CustomizationType, ShippingOption, calcUnitPrice, calcTotal } from '../types';
import { lookupCEP, formatCEP, formatPhone } from '../services/cep';
import { calcularFrete } from '../services/shipping';

interface OrderFormProps {
  product: ProductDef;
  customizationType: CustomizationType;
  initialData: OrderFormData;
  onChange: (data: OrderFormData) => void;
  onBack: () => void;
  onNext: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ product, customizationType, initialData, onChange, onBack, onNext }) => {
  const MIN_QTY = product.minQuantity;
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState('');

  const d = initialData;

  const set = (field: keyof Omit<OrderFormData, 'address'>, value: string | number) => {
    onChange({ ...d, [field]: value });
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const setAddr = (field: keyof Address, value: string) => {
    onChange({ ...d, address: { ...d.address, [field]: value } });
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const handleCEP = async (raw: string) => {
    const formatted = formatCEP(raw);
    setAddr('cep', formatted);
    setCepError('');
    setShippingOptions([]);
    setShippingError('');
    onChange({ ...d, address: { ...d.address, cep: formatted }, shipping: null });

    if (formatted.replace(/\D/g, '').length === 8) {
      setCepLoading(true);
      try {
        const addr = await lookupCEP(formatted);
        const updatedData = {
          ...d,
          address: {
            ...d.address,
            cep: formatted,
            street: addr.street,
            neighborhood: addr.neighborhood,
            city: addr.city,
            state: addr.state,
          },
          shipping: null,
        };
        onChange(updatedData);

        // Calcular frete após obter o endereço
        setShippingLoading(true);
        try {
          const options = await calcularFrete(formatted, d.quantity);
          setShippingOptions(options);
        } catch {
          setShippingError('Não foi possível calcular o frete. Verifique o CEP.');
        } finally {
          setShippingLoading(false);
        }
      } catch {
        setCepError('CEP não encontrado. Verifique e tente novamente.');
      } finally {
        setCepLoading(false);
      }
    }
  };

  const selectShipping = (option: ShippingOption) => {
    onChange({ ...d, shipping: option });
    setErrors(e => ({ ...e, shipping: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!d.name.trim()) e.name = 'Nome é obrigatório';
    if (!d.email.trim() || !/\S+@\S+\.\S+/.test(d.email)) e.email = 'E-mail inválido';
    if (!d.phone.replace(/\D/g, '') || d.phone.replace(/\D/g, '').length < 10) e.phone = 'Telefone inválido';
    if (d.quantity < MIN_QTY) e.quantity = `Mínimo ${MIN_QTY} unidades`;
    if (d.address.cep.replace(/\D/g, '').length !== 8) e.cep = 'CEP inválido';
    if (!d.address.street.trim()) e.street = 'Rua é obrigatória';
    if (!d.address.number.trim()) e.number = 'Número é obrigatório';
    if (!d.address.city.trim()) e.city = 'Cidade é obrigatória';
    if (!d.shipping) e.shipping = 'Selecione uma opção de frete';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onNext();
  };

  const unitPrice = calcUnitPrice(product, customizationType);
  const total = calcTotal(product, customizationType, d.quantity);

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <button onClick={onBack} className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Voltar
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Dados do Pedido</span>
        </div>

        <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dados do Pedido</h2>
        <p className="text-gray-500 mb-8">Preencha seus dados para finalizar o pedido</p>

        <div className="space-y-6">
          {/* Quantity + price summary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-poppins font-semibold text-gray-900 mb-4">Quantidade e Valor</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade <span className="text-gray-400">(mínimo {MIN_QTY})</span>
                </label>
                <input
                  type="number"
                  min={MIN_QTY}
                  value={d.quantity}
                  onChange={e => set('quantity', Math.max(MIN_QTY, parseInt(e.target.value) || MIN_QTY))}
                  className={`w-full border rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${errors.quantity ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
              </div>
              <div className="bg-gray-50 rounded-xl px-5 py-3 text-center min-w-[160px]">
                <p className="text-xs text-gray-500">R$ {unitPrice.toFixed(2).replace('.', ',')} × {d.quantity} un.</p>
                <p className="font-poppins text-2xl font-bold text-primary">
                  R$ {total.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-xs text-gray-400">total estimado*</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">*Frete calculado no checkout. Arte e revisão incluídas.</p>
          </div>

          {/* Personal data */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-poppins font-semibold text-gray-900 mb-4">Seus Dados</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                <input
                  type="text"
                  value={d.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="João Silva"
                  className={`w-full border rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={d.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="joao@empresa.com.br"
                  className={`w-full border rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Telefone</label>
                <input
                  type="tel"
                  value={d.phone}
                  onChange={e => set('phone', formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className={`w-full border rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-poppins font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              Endereço de Entrega
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                <div className="relative">
                  <input
                    type="text"
                    value={d.address.cep}
                    onChange={e => handleCEP(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    className={`w-full border rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary pr-9 ${errors.cep || cepError ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {cepLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader size={16} className="text-primary animate-spin" />
                    </div>
                  )}
                </div>
                {(errors.cep || cepError) && <p className="text-red-500 text-xs mt-1">{cepError || errors.cep}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Logradouro</label>
                <input
                  type="text"
                  value={d.address.street}
                  onChange={e => setAddr('street', e.target.value)}
                  placeholder="Rua das Flores"
                  className={`w-full border rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${errors.street ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input
                  type="text"
                  value={d.address.number}
                  onChange={e => setAddr('number', e.target.value)}
                  placeholder="123"
                  className={`w-full border rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${errors.number ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complemento <span className="text-gray-400">(opcional)</span></label>
                <input
                  type="text"
                  value={d.address.complement}
                  onChange={e => setAddr('complement', e.target.value)}
                  placeholder="Apto 42"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                <input
                  type="text"
                  value={d.address.neighborhood}
                  onChange={e => setAddr('neighborhood', e.target.value)}
                  placeholder="Centro"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input
                  type="text"
                  value={d.address.city}
                  onChange={e => setAddr('city', e.target.value)}
                  placeholder="São Paulo"
                  className={`w-full border rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${errors.city ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <input
                  type="text"
                  value={d.address.state}
                  onChange={e => setAddr('state', e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                />
              </div>
            </div>
          </div>

          {/* Shipping options */}
          {(shippingLoading || shippingOptions.length > 0 || shippingError) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-poppins font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck size={18} className="text-primary" />
                Opções de Frete
              </h3>

              {shippingLoading && (
                <div className="flex items-center gap-3 text-gray-500 text-sm py-2">
                  <Loader size={16} className="animate-spin text-primary" />
                  Calculando frete para o seu CEP...
                </div>
              )}

              {shippingError && (
                <p className="text-red-500 text-sm">{shippingError}</p>
              )}

              {!shippingLoading && shippingOptions.length > 0 && (
                <div className="space-y-3">
                  {shippingOptions.map(opt => {
                    const selected = d.shipping?.service === opt.service;
                    return (
                      <button
                        key={opt.service}
                        type="button"
                        onClick={() => selectShipping(opt)}
                        className={`w-full flex items-center justify-between rounded-xl border-2 px-5 py-4 transition-all text-left ${
                          selected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selected ? 'border-primary bg-primary' : 'border-gray-300'}`} />
                          <div>
                            <p className={`font-semibold text-sm ${selected ? 'text-primary' : 'text-gray-800'}`}>
                              {opt.service === 'PAC' ? 'PAC — Econômico' : 'SEDEX — Expresso'}
                            </p>
                            <p className="text-xs text-gray-500">{opt.label}</p>
                          </div>
                        </div>
                        <span className={`font-bold text-base ${selected ? 'text-primary' : 'text-gray-900'}`}>
                          R$ {opt.price.toFixed(2).replace('.', ',')}
                        </span>
                      </button>
                    );
                  })}
                  <p className="text-xs text-gray-400 pt-1">* Prazo estimado a partir da postagem. Valores baseados na tabela Correios 2025.</p>
                  {errors.shipping && <p className="text-red-500 text-xs">{errors.shipping}</p>}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primaryDark text-white font-semibold py-3 rounded-xl text-base transition-all hover:shadow-lg hover:shadow-primary/30"
            >
              Ver Resumo do Pedido
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
