import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, MapPin, Loader, Truck, Printer, Zap } from 'lucide-react';
import {
  OrderFormData,
  Address,
  ProductDef,
  calcUnitPrice,
  calcTotal,
} from '../types';
import { lookupCEP, formatCEP } from '../services/cep';
import { calcularFrete } from '../services/shipping';

interface QuantityShippingStepProps {
  product: ProductDef;
  initialData: OrderFormData;
  onChange: (data: OrderFormData) => void;
  onBack: () => void;
  onNext: () => void;
}

export const QuantityShippingStep: React.FC<QuantityShippingStepProps> = ({
  product,
  initialData,
  onChange,
  onBack,
  onNext,
}) => {
  const MIN_QTY = product.minQuantity;
  const d = initialData;

  const [quantityInput, setQuantityInput] = useState(String(d.quantity));
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFirstRender = React.useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (d.address.state && !d.shipping) {
        const total = calcTotal(product, 'serigrafia', d.quantity);
        onChange({ ...d, shipping: calcularFrete(total, d.address.state) });
      }
      return;
    }
    if (!d.address.state) return;
    const total = calcTotal(product, 'serigrafia', d.quantity);
    onChange({ ...d, shipping: calcularFrete(total, d.address.state) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.quantity]);

  const setAddr = (field: keyof Address, value: string) => {
    onChange({ ...d, address: { ...d.address, [field]: value } });
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const handleCEP = async (raw: string) => {
    const formatted = formatCEP(raw);
    setAddr('cep', formatted);
    setCepError('');
    onChange({ ...d, address: { ...d.address, cep: formatted }, shipping: null });

    if (formatted.replace(/\D/g, '').length === 8) {
      setCepLoading(true);
      try {
        const addr = await lookupCEP(formatted);
        const total = calcTotal(product, 'serigrafia', d.quantity);
        const shipping = calcularFrete(total, addr.state);
        onChange({
          ...d,
          address: {
            ...d.address,
            cep: formatted,
            street: addr.street,
            neighborhood: addr.neighborhood,
            city: addr.city,
            state: addr.state,
          },
          shipping,
        });
      } catch {
        setCepError('CEP não encontrado. Verifique e tente novamente.');
      } finally {
        setCepLoading(false);
      }
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (d.quantity < MIN_QTY) e.quantity = `Mínimo ${MIN_QTY} unidades`;
    if (!d.shipping) e.shipping = 'Informe o CEP de entrega para continuar';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const unitPriceSerigrafia = calcUnitPrice(product, 'serigrafia');
  const unitPriceLaser = product.customizations.laser ? calcUnitPrice(product, 'laser') : null;
  const totalSerigrafia = calcTotal(product, 'serigrafia', d.quantity);
  const totalLaser = product.customizations.laser ? calcTotal(product, 'laser', d.quantity) : null;

  return (
    <div className="min-h-screen pt-16 bg-[#1a1917]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <button onClick={onBack} className="hover:text-[#D4AF37] transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Voltar
          </button>
          <span>/</span>
          <span className="text-white font-medium">Quantidade e Frete</span>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#D4AF37] text-gray-900 text-xs font-bold flex items-center justify-center">1</div>
            <span className="text-sm font-semibold text-[#D4AF37]">Quantidade e Frete</span>
          </div>
          <div className="flex-1 h-0.5 bg-white/10 mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/10 text-gray-500 text-xs font-bold flex items-center justify-center">2</div>
            <span className="text-sm text-gray-500">Arte e Personalização</span>
          </div>
          <div className="flex-1 h-0.5 bg-white/10 mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/10 text-gray-500 text-xs font-bold flex items-center justify-center">3</div>
            <span className="text-sm text-gray-500">Seus Dados</span>
          </div>
        </div>

        <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-white mb-1">
          Quantidade e Frete
        </h2>
        <p className="text-gray-400 mb-8">Defina a quantidade e calcule o frete antes de enviar sua arte</p>

        <div className="space-y-6">
          {/* Quantity + price */}
          <div className="bg-[#2a2825] rounded-2xl border border-white/8 p-6">
            <h3 className="font-poppins font-semibold text-white mb-4">Quantidade</h3>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Quantas unidades?{' '}
                  <span className="text-gray-500">(mínimo {MIN_QTY} un.)</span>
                </label>
                <input
                  type="number"
                  min={MIN_QTY}
                  value={quantityInput}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setQuantityInput(raw);
                    const parsed = parseInt(raw);
                    if (parsed >= MIN_QTY) {
                      onChange({ ...d, quantity: parsed });
                      setErrors(er => ({ ...er, quantity: '' }));
                    }
                  }}
                  onBlur={() => {
                    const parsed = parseInt(quantityInput);
                    const safe = (!parsed || parsed < MIN_QTY) ? MIN_QTY : parsed;
                    setQuantityInput(String(safe));
                    onChange({ ...d, quantity: safe });
                  }}
                  className={`w-full border rounded-lg px-3 py-2.5 bg-[#1a1917] text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${errors.quantity ? 'border-red-500' : 'border-white/15'}`}
                />
                {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity}</p>}
              </div>
            </div>

            {/* Price comparison table */}
            <div className={`mt-5 grid gap-3 ${unitPriceLaser !== null ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div className="bg-[#222019] rounded-xl p-4 border border-white/8">
                <div className="flex items-center gap-2 mb-2">
                  <Printer size={16} className="text-[#D4AF37]" />
                  <span className="text-xs font-semibold text-gray-300">Serigrafia 1 Cor</span>
                </div>
                <p className="text-xs text-gray-500">
                  R$ {unitPriceSerigrafia.toFixed(2).replace('.', ',')} × {d.quantity} un.
                </p>
                <p className="font-poppins text-xl font-bold text-[#F1C40F]">
                  R$ {totalSerigrafia.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-[10px] text-amber-400 mt-1">Mínimo {MIN_QTY} unidades</p>
              </div>
              {unitPriceLaser !== null && totalLaser !== null && (
                <div className="bg-[#222019] rounded-xl p-4 border border-white/8">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={16} className="text-[#D4AF37]" />
                    <span className="text-xs font-semibold text-gray-300">Gravação a Laser</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    R$ {unitPriceLaser.toFixed(2).replace('.', ',')} × {d.quantity} un.
                  </p>
                  <p className="font-poppins text-xl font-bold text-[#F1C40F]">
                    R$ {totalLaser.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-[10px] text-green-400 mt-1">A partir de {MIN_QTY} unidades</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3">*Frete não incluído no total acima. Escolha do tipo de personalização na próxima etapa.</p>
          </div>

          {/* CEP */}
          <div className="bg-[#2a2825] rounded-2xl border border-white/8 p-6">
            <h3 className="font-poppins font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-[#D4AF37]" />
              Calcular Frete
            </h3>
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-300 mb-1">CEP de entrega</label>
              <div className="relative">
                <input
                  type="text"
                  value={d.address.cep}
                  onChange={e => handleCEP(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  className={`w-full border rounded-lg px-3 py-2.5 bg-[#1a1917] text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] pr-9 placeholder:text-gray-600 ${errors.cep || cepError ? 'border-red-500' : 'border-white/15'}`}
                />
                {cepLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader size={16} className="text-[#D4AF37] animate-spin" />
                  </div>
                )}
              </div>
              {(errors.cep || cepError) && (
                <p className="text-red-400 text-xs mt-1">{cepError || errors.cep}</p>
              )}
              {d.address.city && !cepError && (
                <p className="text-green-400 text-xs mt-1">
                  {d.address.city} – {d.address.state}
                </p>
              )}
            </div>
          </div>

          {/* Shipping info card */}
          {d.shipping && (
            <div className="bg-[#2a2825] rounded-2xl border border-white/8 p-6">
              <h3 className="font-poppins font-semibold text-white mb-4 flex items-center gap-2">
                <Truck size={18} className="text-[#D4AF37]" />
                Frete
              </h3>
              <div className="flex items-center justify-between bg-[#222019] rounded-xl border border-[#D4AF37]/30 px-5 py-4">
                <div>
                  <p className="font-semibold text-white text-sm">{d.shipping.label.split(' — ')[0]}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{d.shipping.label.split(' — ').slice(1).join(' — ')}</p>
                </div>
                <span className="font-bold text-lg text-[#F1C40F]">
                  R$ {d.shipping.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-3">* Prazo estimado a partir da postagem. Valor calculado sobre o total do pedido.</p>
            </div>
          )}

          {errors.shipping && (
            <p className="text-red-400 text-sm -mt-3">{errors.shipping}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 border border-white/15 rounded-xl text-gray-300 font-medium hover:bg-white/5 transition-colors"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#d49924] hover:from-[#d49924] hover:to-[#c28511] text-gray-900 font-semibold py-3 rounded-xl text-base transition-all hover:shadow-lg hover:shadow-[#D4AF37]/30"
            >
              Continuar — Enviar Arte
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
