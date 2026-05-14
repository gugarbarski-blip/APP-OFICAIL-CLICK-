import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Package, MapPin, User, Palette, AlertCircle } from 'lucide-react';
import { Customization, OrderFormData, ProductDef, SERIGRAFIA_COLORS, calcUnitPrice, calcTotal } from '../types';
import { ArtPreviewCanvas } from './ArtPreviewCanvas';

interface OrderSummaryProps {
  product: ProductDef;
  customization: Customization;
  formData: OrderFormData;
  onBack: () => void;
  onConfirm: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ product, customization, formData, onBack, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const custOption = product.customizations[customization.type];
  const unitPrice = calcUnitPrice(product, customization.type);
  const total = calcTotal(product, customization.type, formData.quantity);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: `${product.name} — ${custOption.label}`,
          quantity: formData.quantity,
          unitPrice,
          buyerName: formData.name,
          buyerEmail: formData.email,
          address: `${formData.address.street}, ${formData.address.number}${formData.address.complement ? `, ${formData.address.complement}` : ''} — ${formData.address.neighborhood}, ${formData.address.city}/${formData.address.state} CEP: ${formData.address.cep}`,
          customizationType: customization.type,
          serigrafiaColor: customization.type === 'serigrafia' ? customization.serigrafiaColor : '',
        }),
      });

      if (!res.ok) throw new Error('Erro ao criar preferência de pagamento');

      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch (err) {
      setError('Não foi possível iniciar o pagamento. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <button onClick={onBack} className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Voltar
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Resumo do Pedido</span>
        </div>

        <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Resumo do Pedido</h2>
        <p className="text-gray-500 mb-8">Revise os detalhes antes de pagar</p>

        <div className="space-y-4">
          {/* Product */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-poppins font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={18} className="text-primary" />
              Produto
            </h3>
            <div className="flex gap-6 items-start">
              <div className="w-28 flex-shrink-0">
                <ArtPreviewCanvas artUrl={customization.artPreviewUrl} cupImageUrl={product.image} />
              </div>
              <div className="space-y-2 flex-1">
                <p className="font-semibold text-gray-900">{product.name}</p>
                <p className="text-gray-500 text-sm">Cor: {product.color}</p>
                <div className="flex items-center gap-2">
                  <Palette size={14} className="text-primary" />
                  <p className="text-gray-700 text-sm">{custOption.label}</p>
                  {customization.type === 'serigrafia' && (() => {
                    const colorOpt = SERIGRAFIA_COLORS.find(c => c.key === customization.serigrafiaColor);
                    return colorOpt ? (
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        — Cor:
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block" style={{ backgroundColor: colorOpt.hex }} />
                        {colorOpt.label}
                      </span>
                    ) : null;
                  })()}
                </div>
                <p className="text-gray-700 text-sm">Quantidade: <span className="font-semibold">{formData.quantity} unidades</span></p>
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>R$ {unitPrice.toFixed(2).replace('.', ',')} × {formData.quantity}</span>
                    <span className="font-semibold text-gray-900">R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">+ frete calculado no checkout</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-poppins font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-primary" />
              Seus Dados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div><p className="text-gray-400 text-xs">Nome</p><p className="font-medium text-gray-900">{formData.name}</p></div>
              <div><p className="text-gray-400 text-xs">E-mail</p><p className="font-medium text-gray-900">{formData.email}</p></div>
              <div><p className="text-gray-400 text-xs">Telefone</p><p className="font-medium text-gray-900">{formData.phone}</p></div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-poppins font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              Endereço de Entrega
            </h3>
            <p className="text-gray-700 text-sm">
              {formData.address.street}, {formData.address.number}
              {formData.address.complement && `, ${formData.address.complement}`}
            </p>
            <p className="text-gray-700 text-sm">
              {formData.address.neighborhood} — {formData.address.city}/{formData.address.state}
            </p>
            <p className="text-gray-500 text-sm">CEP: {formData.address.cep}</p>
          </div>

          {/* Total & Pay */}
          <div className="bg-gray-900 rounded-2xl p-6 text-white">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Subtotal (produtos)</span>
              <span className="font-semibold">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Frete</span>
              <span className="text-gray-400 text-sm">Calculado no checkout</span>
            </div>
            <div className="border-t border-gray-700 pt-4 flex justify-between items-baseline">
              <span className="font-poppins font-semibold text-lg">Total estimado</span>
              <span className="font-poppins text-3xl font-bold text-accent">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            {error && (
              <div className="mt-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}
            <button
              onClick={handlePay}
              disabled={loading}
              className={`mt-6 w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-base transition-all ${
                loading
                  ? 'bg-gray-700 text-gray-400 cursor-wait'
                  : 'bg-[#009EE3] hover:bg-[#008CC7] text-white hover:shadow-lg hover:shadow-[#009EE3]/30'
              }`}
            >
              {loading ? (
                <>Redirecionando para o Mercado Pago...</>
              ) : (
                <>
                  <CreditCard size={20} />
                  Ir para Pagamento — Mercado Pago
                </>
              )}
            </button>
            <p className="text-gray-500 text-xs text-center mt-3">
              Pagamento seguro via Mercado Pago · PIX, Cartão ou Boleto
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
