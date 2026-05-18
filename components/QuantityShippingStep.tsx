import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, MapPin, Loader, Truck, Zap, Printer } from 'lucide-react';
import {
  OrderFormData,
  Address,
  ProductDef,
  ShippingOption,
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
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFirstRender = React.useRef(true);

  useEffect(() => {
    const cep = d.address.cep.replace(/\D/g, '');
    if (cep.length === 8 && shippingOptions.length === 0 && !shippingLoading) {
      setShippingLoading(true);
      calcularFrete(d.address.cep, d.quantity, product.id)
        .then(opts => setShippingOptions(opts))
        .catch(() => setShippingError('Não foi possível calcular o frete.'))
        .finally(() => setShippingLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const cep = d.address.cep.replace(/\D/g, '');
    if (cep.length !== 8) return;
    setShippingOptions([]);
    setShippingError('');
    onChange({ ...d, shipping: null });
    setShippingLoading(true);
    calcularFrete(d.address.cep, d.quantity, product.id)
      .then(opts => setShippingOptions(opts))
      .catch(() => setShippingError('Não foi possível calcular o frete.'))
      .finally(() => setShippingLoading(false));
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
    setShippingOptions([]);
    setShippingError('');
    onChange({ ...d, address: { ...d.address, cep: formatted }, shipping: null });

    if (formatted.replace(/\D/g, '').length === 8) {
      setCepLoading(true);
      try {
        const addr = await lookupCEP(formatted);
        const updated: OrderFormData = {
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
        onChange(updated);
        setShippingLoading(true);
        try {
          const opts = await calcularFrete(formatted, d.quantity, product.id);
          setShippingOptions(opts);
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
    if (d.quantity < MIN_QTY) e.quantity = `Mínimo ${MIN_QTY} unidades`;
    if (!d.shipping) e.shipping = 'Selecione uma opção de frete para continuar';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const unitPriceSerigrafia = calcUnitPrice(product, 'serigrafia');
  const unitPriceLaser = calcUnitPrice(product, 'laser');
  const totalSerigrafia = calcTotal(product, 'serigrafia', d.quantity);
  const totalLaser = calcTotal(product, 'laser', d.quantity);

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <button onClick={onBack} className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Voltar
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Quantidade e Frete</span>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</div>
            <span className="text-sm font-semibold text-primary">Quantidade e Frete</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center">2</div>
            <span className="text-sm text-gray-400">Arte e Personalização</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center">3</div>
            <span className="text-sm text-gray-400">Seus Dados</span>
          </div>
        </div>

        <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
          Quantidade e Frete
        </h2>
        <p className="text-gray-500 mb-8">Defina a quantidade e calcule o frete antes de enviar sua arte</p>

        <div className="space-y-6">
          {/* Quantity + price */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-poppins font-semibold text-gray-900 mb-4">Quantidade</h3>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantas unidades?{' '}
                  <span className="text-gray-400">(mínimo {MIN_QTY} un.)</span>
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
                  className={`w-full border rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${errors.quantity ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
              </div>
            </div>

            {/* Price comparison table */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Printer size={16} className="text-primary" />
                  <span className="text-xs font-semibold text-gray-700">Serigrafia 1 Cor</span>
                </div>
                <p className="text-xs text-gray-500">
                  R$ {unitPriceSerigrafia.toFixed(2).replace('.', ',')} × {d.quantity} un.
                </p>
                <p className="font-poppins text-xl font-bold text-primary">
                  R$ {totalSerigrafia.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-[10px] text-amber-600 mt-1">Mínimo 25 unidades</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-primary" />
                  <span className="text-xs font-semibold text-gray-700">Gravação a Laser</span>
                </div>
                <p className="text-xs text-gray-500">
                  R$ {unitPriceLaser.toFixed(2).replace('.', ',')} × {d.quantity} un.
                </p>
                <p className="font-poppins text-xl font-bold text-primary">
                  R$ {totalLaser.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-[10px] text-green-600 mt-1">A partir de 10 unidades</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">*Frete não incluído no total acima. Escolha do tipo de personalização na próxima etapa.</p>
          </div>

          {/* CEP */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-poppins font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              Calcular Frete
            </h3>
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP de entrega</label>
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
              {(errors.cep || cepError) && (
                <p className="text-red-500 text-xs mt-1">{cepError || errors.cep}</p>
              )}
              {d.address.city && !cepError && (
                <p className="text-green-600 text-xs mt-1">
                  {d.address.city} – {d.address.state}
                </p>
              )}
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
                  <p className="text-xs text-gray-400 pt-1">* Prazo estimado a partir da postagem.</p>
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
              <ArrowLeft size={16} /> Voltar
            </button>
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primaryDark text-white font-semibold py-3 rounded-xl text-base transition-all hover:shadow-lg hover:shadow-primary/30"
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
