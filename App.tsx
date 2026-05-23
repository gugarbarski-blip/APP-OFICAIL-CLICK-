import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Gift, ArrowRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { AppStep, Customization, OrderFormData, ProductDef, PRODUCTS } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductShowcase } from './components/ProductShowcase';
import { HowItWorks } from './components/HowItWorks';
import { WhyChooseUs } from './components/WhyChooseUs';
import { Footer } from './components/Footer';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { QuemSomos } from './components/QuemSomos';
import { WhatsAppButton } from './components/WhatsAppButton';
import { StickyCtaBar } from './components/StickyCtaBar';

const QuantityShippingStep = lazy(() => import('./components/QuantityShippingStep').then(m => ({ default: m.QuantityShippingStep })));
const CustomizationStep    = lazy(() => import('./components/CustomizationStep').then(m => ({ default: m.CustomizationStep })));
const OrderForm            = lazy(() => import('./components/OrderForm').then(m => ({ default: m.OrderForm })));
const OrderSummary         = lazy(() => import('./components/OrderSummary').then(m => ({ default: m.OrderSummary })));
const AdminPanel           = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));
const AdminLogin           = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminLogin })));
const MeusPedidos          = lazy(() => import('./components/MeusPedidos').then(m => ({ default: m.MeusPedidos })));
const CustomerArea         = lazy(() => import('./components/CustomerArea').then(m => ({ default: m.CustomerArea })));
const PrivacyPolicy        = lazy(() => import('./components/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const PosCompra            = lazy(() => import('./components/PosCompra').then(m => ({ default: m.PosCompra })));

const Loader = () => (
  <div className="min-h-screen bg-[#1a1917] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
  </div>
);

const makeEmptyOrder = (product: ProductDef): OrderFormData => ({
  name: '',
  email: '',
  phone: '',
  cpfCnpj: '',
  quantity: product.minQuantity,
  address: { cep: '', street: '', neighborhood: '', city: '', state: '', number: '', complement: '' },
  shipping: null,
});

const EMPTY_CUSTOMIZATION: Customization = {
  type: 'serigrafia',
  serigrafiaColor: 'preto',
  artFile: null,
  artPreviewUrl: null,
};

type PaymentStatus = 'sucesso' | 'pendente' | 'erro' | null;

const PAYMENT_BANNERS: Record<NonNullable<PaymentStatus>, { icon: React.FC<{size:number;className?:string}>, bg: string; text: string; msg: string }> = {
  sucesso:  { icon: CheckCircle, bg: 'bg-green-50 border-green-200 text-green-800',  text: 'Pagamento aprovado!',   msg: 'Recebemos seu pagamento. Entraremos em contato para confirmar o pedido.' },
  pendente: { icon: Clock,        bg: 'bg-yellow-50 border-yellow-200 text-yellow-800', text: 'Pagamento pendente',    msg: 'Seu pagamento está sendo processado. Você receberá uma confirmação em breve.' },
  erro:     { icon: XCircle,      bg: 'bg-red-50 border-red-200 text-red-800',      text: 'Pagamento não concluído', msg: 'Houve um problema com seu pagamento. Tente novamente.' },
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('landing');

  // Meus Pedidos route
  if (window.location.pathname === '/meus-pedidos') {
    return <Suspense fallback={<Loader />}><MeusPedidos onBack={() => { window.history.pushState({}, '', '/'); window.location.reload(); }} /></Suspense>;
  }

  // Minha Conta route
  if (window.location.pathname === '/minha-conta') {
    return <Suspense fallback={<Loader />}><CustomerArea onBack={() => { window.history.pushState({}, '', '/'); window.location.reload(); }} /></Suspense>;
  }

  // Pos-compra route
  if (window.location.pathname === '/pedido-confirmado') {
    const p = new URLSearchParams(window.location.search);
    return (
      <Suspense fallback={<Loader />}>
        <PosCompra
          nome={p.get('nome') || ''}
          email={p.get('email') || ''}
          produto={p.get('produto') || ''}
          personalizacao={p.get('personalizacao') || ''}
          quantidade={p.get('quantidade') || ''}
          valor={p.get('valor') || ''}
          frete={p.get('frete') || ''}
          paymentId={p.get('payment_id') || undefined}
          pedidoId={p.get('pedido_id') || undefined}
        />
      </Suspense>
    );
  }

  // Privacy policy route
  if (window.location.pathname === '/privacidade') {
    return <Suspense fallback={<Loader />}><PrivacyPolicy onBack={() => { window.history.pushState({}, '', '/'); window.location.reload(); }} /></Suspense>;
  }
  const [selectedProduct, setSelectedProduct] = useState<ProductDef>(PRODUCTS['copo-475']);
  const [customization, setCustomization] = useState<Customization>(EMPTY_CUSTOMIZATION);
  const [orderData, setOrderData] = useState<OrderFormData>(makeEmptyOrder(PRODUCTS['copo-475']));
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(null);

  useEffect(() => {
    // Registra o estado inicial para que o botão voltar funcione desde a landing
    window.history.replaceState({ step: 'landing' }, '');

    const params = new URLSearchParams(window.location.search);
    const status = params.get('pagamento') as PaymentStatus;
    if (status && PAYMENT_BANNERS[status]) {
      setPaymentStatus(status);
      window.history.replaceState({ step: 'landing' }, '', '/');
    }

    // Botão voltar/avançar do navegador
    const handlePopState = (e: PopStateEvent) => {
      const s = (e.state?.step as AppStep) ?? 'landing';
      setStep(s);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', handlePopState);

    // Recuperação de PIX: se o cliente pagou e saiu da página antes do polling detectar,
    // na próxima vez que abrir o site verificamos e redirecionamos automaticamente
    try {
      const raw = sessionStorage.getItem('pixPending');
      if (raw) {
        const { paymentId, savedAt, params: redirectParams } = JSON.parse(raw);
        const expired = Date.now() - savedAt > 30 * 60 * 1000; // PIX expira em 30 min
        if (expired) {
          sessionStorage.removeItem('pixPending');
        } else {
          fetch(`/api/check-pix?id=${paymentId}`)
            .then(r => r.json())
            .then(({ status: pixStatus }) => {
              if (pixStatus === 'approved') {
                sessionStorage.removeItem('pixPending');
                window.location.href = `/pedido-confirmado?${new URLSearchParams(redirectParams)}`;
              }
            })
            .catch(() => {});
        }
      }
    } catch {
      sessionStorage.removeItem('pixPending');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goTo = (s: AppStep) => {
    window.history.pushState({ step: s }, '');
    setStep(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startOrder = (product: ProductDef) => {
    setSelectedProduct(product);
    setOrderData(makeEmptyOrder(product));
    setCustomization(EMPTY_CUSTOMIZATION);
    goTo('quantity');
  };

  // Admin route
  const isAdmin = window.location.pathname === '/admin';
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('admin_token') || '');
  if (isAdmin) {
    if (!adminToken) return <Suspense fallback={<Loader />}><AdminLogin onLogin={(token) => { sessionStorage.setItem('admin_token', token); setAdminToken(token); }} /></Suspense>;
    return <Suspense fallback={<Loader />}><AdminPanel token={adminToken} onLogout={() => { sessionStorage.removeItem('admin_token'); setAdminToken(''); }} /></Suspense>;
  }

  if (step === 'quantity') {
    return (
      <Suspense fallback={<Loader />}>
        <QuantityShippingStep
          product={selectedProduct}
          initialData={orderData}
          onChange={setOrderData}
          onBack={() => goTo('landing')}
          onNext={() => goTo('customize')}
        />
        <WhatsAppButton />
      </Suspense>
    );
  }

  if (step === 'customize') {
    return (
      <Suspense fallback={<Loader />}>
        <CustomizationStep
          product={selectedProduct}
          value={customization}
          quantity={orderData.quantity}
          onChange={setCustomization}
          onBack={() => goTo('quantity')}
          onNext={() => goTo('order')}
        />
        <WhatsAppButton />
      </Suspense>
    );
  }

  if (step === 'order') {
    return (
      <Suspense fallback={<Loader />}>
        <OrderForm
          product={selectedProduct}
          customization={customization}
          initialData={orderData}
          onChange={setOrderData}
          onBack={() => goTo('customize')}
          onNext={() => goTo('confirmation')}
        />
        <WhatsAppButton />
      </Suspense>
    );
  }

  if (step === 'confirmation') {
    return (
      <Suspense fallback={<Loader />}>
        <OrderSummary
          product={selectedProduct}
          customization={customization}
          formData={orderData}
          onBack={() => goTo('order')}
          onConfirm={() => goTo('landing')}
        />
        <WhatsAppButton />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        onCtaClick={() => startOrder(PRODUCTS['copo-475'])}
        onMeusPedidos={() => { window.history.pushState({}, '', '/meus-pedidos'); window.location.reload(); }}
        onMinhaContaClick={() => { window.history.pushState({}, '', '/minha-conta'); window.location.reload(); }}
      />
      {paymentStatus && (() => {
        const b = PAYMENT_BANNERS[paymentStatus];
        const Icon = b.icon;
        return (
          <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg mx-auto px-4`}>
            <div className={`flex items-start gap-3 border rounded-2xl px-5 py-4 shadow-lg ${b.bg}`}>
              <Icon size={22} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{b.text}</p>
                <p className="text-sm opacity-80 mt-0.5">{b.msg}</p>
              </div>
              <button onClick={() => setPaymentStatus(null)} className="opacity-50 hover:opacity-100 text-lg leading-none">×</button>
            </div>
          </div>
        );
      })()}
      <Hero onCtaClick={() => startOrder(PRODUCTS['copo-475'])} />
      <ProductShowcase onSelectProduct={startOrder} />
      <HowItWorks />
      <WhyChooseUs />
      <QuemSomos />
      <Testimonials />
      <FAQ />

      <section className="bg-gradient-to-br from-[#858079] via-[#6B6862] to-[#514F4A] py-10 md:py-16 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-[#D4AF37]/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="bg-[#514F4A] shadow-[0_4px_15px_rgba(212,175,55,0.3)] p-3 rounded-2xl border border-white/10">
              <Gift size={28} className="text-[#F1C40F]" />
            </div>
          </div>
          <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] drop-shadow-md mb-3 md:mb-4">
            Pronto para Personalizar?
          </h2>
          <p className="text-gray-200 font-medium text-base md:text-lg mb-6 md:mb-8 max-w-xl mx-auto">
            Faça o upload da sua arte agora e veja como seu copo ficará antes de finalizar o pedido.
          </p>
          <button
            onClick={() => document.getElementById('produto')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#D4AF37] to-[#d49924] hover:from-[#d49924] hover:to-[#c28511] text-gray-900 font-extrabold px-8 md:px-10 py-3.5 md:py-4 rounded-xl text-base md:text-lg transition-all shadow-[0_8px_20px_rgba(212,175,55,0.4)] hover:-translate-y-0.5"
          >
            Começar Agora
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <StickyCtaBar onCtaClick={() => document.getElementById('produto')?.scrollIntoView({ behavior: 'smooth' })} />
    </div>
  );
};

export default App;
