import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Package, MapPin, User, Palette, AlertCircle, QrCode, Copy, CheckCheck, Loader2, CreditCard } from 'lucide-react';
import { Customization, OrderFormData, ProductDef, SERIGRAFIA_COLORS, calcUnitPrice, calcTotal } from '../types';
import { ArtPreviewCanvas } from './ArtPreviewCanvas';

interface OrderSummaryProps {
  product: ProductDef;
  customization: Customization;
  formData: OrderFormData;
  onBack: () => void;
  onConfirm: () => void;
}

interface PixData {
  paymentId: number;
  pedidoId: string | null;
  qrCode: string;
  qrCodeBase64: string;
  expiresAt: string;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ product, customization, formData, onBack, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [pixStatus, setPixStatus] = useState<'pending' | 'approved' | 'expired'>('pending');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const custOption = product.customizations[customization.type];
  const unitPrice = calcUnitPrice(product, customization.type);
  const subtotal = calcTotal(product, customization.type, formData.quantity);
  const shippingPrice = formData.shipping?.price ?? 0;
  const total = subtotal + shippingPrice;

  const buildBody = (artUrl?: string | null) => ({
    productId: product.id,
    productName: `${product.name} — ${custOption.label}`,
    quantity: formData.quantity,
    buyerName: formData.name,
    buyerEmail: formData.email,
    buyerPhone: formData.phone,
    buyerCpfCnpj: formData.cpfCnpj,
    address: `${formData.address.street}, ${formData.address.number}${formData.address.complement ? `, ${formData.address.complement}` : ''} — ${formData.address.neighborhood}, ${formData.address.city}/${formData.address.state} CEP: ${formData.address.cep}`,
    customizationType: customization.type,
    serigrafiaColor: customization.type === 'serigrafia' ? customization.serigrafiaColor : '',
    artUrl: artUrl || null,
    shippingPrice: shippingPrice,
    shippingLabel: formData.shipping?.label || '',
  });

  const uploadArt = async (): Promise<string | null> => {
    const file = customization.artFile;
    if (!file) return null;
    const fileBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    try {
      const res = await fetch('/api/upload-art', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64, fileName: file.name, mimeType: file.type }),
      });
      if (!res.ok) return null;
      const { url } = await res.json();
      return url as string;
    } catch {
      return null;
    }
  };

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const artUrl = await uploadArt();
      const res = await fetch('/api/create-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody(artUrl)),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.detail?.message || errData?.error || 'Erro ao gerar PIX');
      }
      const data = await res.json();
      if (!data.qrCode) throw new Error('PIX não gerado');
      setPixData(data);
      // Salva no sessionStorage para recuperação se o usuário sair e voltar
      sessionStorage.setItem('pixPending', JSON.stringify({
        paymentId: data.paymentId,
        savedAt: Date.now(),
        params: {
          pedido_id: data.pedidoId || '',
          nome: formData.name,
          email: formData.email,
          produto: `${product.name} — ${custOption.label}`,
          personalizacao: custOption.label,
          quantidade: String(formData.quantity),
          valor: String(total.toFixed(2)),
          frete: formData.shipping?.label || '',
          payment_id: String(data.paymentId),
        },
      }));
    } catch (e: any) {
      setError(e?.message || 'Não foi possível gerar o PIX. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPay = async () => {
    setCardLoading(true);
    setError(null);
    try {
      const artUrl = await uploadArt();
      const res = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody(artUrl)),
      });
      if (!res.ok) throw new Error('Erro ao criar preferência');
      const { checkoutUrl } = await res.json();
      if (!checkoutUrl) throw new Error('URL de checkout não gerada');
      window.location.href = checkoutUrl;
    } catch {
      setError('Não foi possível iniciar o pagamento com cartão. Tente novamente.');
      setCardLoading(false);
    }
  };

  const handleCopy = () => {
    if (!pixData?.qrCode) return;
    navigator.clipboard.writeText(pixData.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleReset = () => {
    setPixData(null);
    setPixStatus('pending');
    setTimeLeft(null);
    setCopied(false);
    sessionStorage.removeItem('pixPending');
  };

  useEffect(() => {
    if (!pixData) return;

    const isExpired = () => pixData.expiresAt && new Date() >= new Date(pixData.expiresAt);

    // Verifica expiração imediatamente (ex: usuário ficou na tela parada)
    if (isExpired()) {
      setPixStatus('expired');
      return;
    }

    pollRef.current = setInterval(async () => {
      // Bug 3 fix: para o polling quando o PIX expira
      if (isExpired()) {
        setPixStatus('expired');
        clearInterval(pollRef.current!);
        return;
      }
      try {
        const res = await fetch(`/api/check-pix?id=${pixData.paymentId}`);
        const { status } = await res.json();
        if (status === 'approved') {
          setPixStatus('approved');
          clearInterval(pollRef.current!);
          sessionStorage.removeItem('pixPending');
          const params = new URLSearchParams({
            pedido_id: pixData.pedidoId || '',
            nome: formData.name,
            email: formData.email,
            produto: `${product.name} — ${custOption.label}`,
            personalizacao: custOption.label,
            quantidade: String(formData.quantity),
            valor: String(total.toFixed(2)),
            frete: formData.shipping?.label || '',
            payment_id: String(pixData.paymentId),
          });
          setTimeout(() => { window.location.href = `/pedido-confirmado?${params}`; }, 2000);
        } else if (status === 'cancelled' || status === 'expired' || status === 'rejected') {
          setPixStatus('expired');
          clearInterval(pollRef.current!);
        }
      } catch {}
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [pixData]);

  // Bug 5 fix: countdown regressivo exibido ao cliente
  useEffect(() => {
    if (!pixData?.expiresAt || pixStatus !== 'pending') return;
    const tick = () => {
      const secs = Math.max(0, Math.floor((new Date(pixData.expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(secs);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [pixData, pixStatus]);

  const colorOpt = customization.type === 'serigrafia'
    ? SERIGRAFIA_COLORS.find(c => c.key === customization.serigrafiaColor)
    : null;

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
                  {colorOpt && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      — Cor:
                      <span className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block" style={{ backgroundColor: colorOpt.hex }} />
                      {colorOpt.label}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 text-sm">Quantidade: <span className="font-semibold">{formData.quantity} unidades</span></p>
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>R$ {unitPrice.toFixed(2).replace('.', ',')} × {formData.quantity}</span>
                    <span className="font-semibold text-gray-900">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
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
              <span className="font-semibold">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Frete</span>
              {formData.shipping ? (
                <div className="text-right">
                  <span className="font-semibold text-green-400">R$ {formData.shipping.price.toFixed(2).replace('.', ',')}</span>
                  <p className="text-xs text-gray-500">{formData.shipping.label}</p>
                </div>
              ) : (
                <span className="text-gray-500 text-sm">Não informado</span>
              )}
            </div>
            <div className="border-t border-gray-700 pt-4 flex justify-between items-baseline mb-6">
              <span className="font-poppins font-semibold text-lg">Total</span>
              <span className="font-poppins text-3xl font-bold text-accent">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* PIX QR Code */}
            {pixData && (
              <div className="mb-6 bg-white rounded-2xl p-6 text-gray-900">
                {pixStatus === 'approved' ? (
                  <div className="text-center py-4">
                    <CheckCheck size={48} className="text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-green-600 text-lg">Pagamento aprovado!</p>
                    <p className="text-gray-500 text-sm mt-1">Redirecionando...</p>
                  </div>
                ) : pixStatus === 'expired' ? (
                  // Bug 4 fix: estado expirado com opção de gerar novo PIX
                  <div className="text-center py-4">
                    <AlertCircle size={40} className="text-red-400 mx-auto mb-2" />
                    <p className="font-semibold text-red-600">PIX expirado</p>
                    <p className="text-gray-500 text-sm mt-1 mb-4">O tempo para pagamento expirou.</p>
                    <button
                      onClick={handleReset}
                      className="w-full flex items-center justify-center gap-2 bg-[#32BCAD] hover:bg-[#29a99b] text-white rounded-xl py-3 px-4 text-sm font-semibold transition-colors"
                    >
                      <QrCode size={16} />
                      Gerar novo PIX
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-center mb-4 flex items-center justify-center gap-2">
                      <QrCode size={18} className="text-[#32BCAD]" />
                      Escaneie o QR Code com seu banco
                    </p>
                    <div className="flex justify-center mb-4">
                      <img
                        src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                        alt="QR Code PIX"
                        className="w-48 h-48 border border-gray-200 rounded-xl"
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center mb-3">ou copie o código abaixo</p>
                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      {copied ? <CheckCheck size={16} className="text-green-500" /> : <Copy size={16} />}
                      {copied ? 'Copiado!' : 'Copiar código PIX'}
                    </button>
                    {timeLeft !== null && (
                      <p className={`text-xs text-center mt-3 font-medium ${timeLeft < 120 ? 'text-red-500' : 'text-amber-600'}`}>
                        ⏱ Expira em {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
                      <Loader2 size={12} className="animate-spin" />
                      Aguardando pagamento...
                    </div>
                  </>
                )}
              </div>
            )}

            {!pixData && (
              <div className="space-y-3">
                <button
                  onClick={handlePay}
                  disabled={loading || cardLoading}
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-base transition-all ${
                    loading
                      ? 'bg-gray-700 text-gray-400 cursor-wait'
                      : cardLoading
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-[#32BCAD] hover:bg-[#29a99b] text-white hover:shadow-lg hover:shadow-[#32BCAD]/30'
                  }`}
                >
                  {loading ? <><Loader2 size={20} className="animate-spin" />Gerando PIX...</> : <><QrCode size={20} />Gerar QR Code PIX</>}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-700" />
                  <span className="text-gray-500 text-xs">ou</span>
                  <div className="flex-1 h-px bg-gray-700" />
                </div>

                <button
                  onClick={handleCardPay}
                  disabled={cardLoading || loading}
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-base border transition-all ${
                    cardLoading
                      ? 'border-indigo-700 bg-indigo-900/50 text-indigo-300 cursor-wait'
                      : loading
                        ? 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'border-indigo-500 bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-500/30'
                  }`}
                >
                  {cardLoading
                    ? <><Loader2 size={20} className="animate-spin" />Redirecionando...</>
                    : <><CreditCard size={20} />Pagar com Cartão — até 12x</>
                  }
                </button>
              </div>
            )}

            <p className="text-gray-500 text-xs text-center mt-3">
              Pagamento seguro via Mercado Pago · PIX ou Cartão
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
