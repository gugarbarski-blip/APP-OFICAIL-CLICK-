import React, { useState, useEffect } from 'react';
import { Gift, ArrowRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { AppStep, Customization, OrderFormData, ProductDef, PRODUCTS } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductShowcase } from './components/ProductShowcase';
import { HowItWorks } from './components/HowItWorks';
import { WhyChooseUs } from './components/WhyChooseUs';
import { Footer } from './components/Footer';
import { QuantityShippingStep } from './components/QuantityShippingStep';
import { CustomizationStep } from './components/CustomizationStep';
import { OrderForm } from './components/OrderForm';
import { OrderSummary } from './components/OrderSummary';
import { AdminPanel, AdminLogin } from './components/AdminPanel';
import { MeusPedidos } from './components/MeusPedidos';
import { CustomerArea } from './components/CustomerArea';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { QuemSomos } from './components/QuemSomos';
import { PrivacyPolicy } from './components/PrivacyPolicy';

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
    return <MeusPedidos onBack={() => { window.history.pushState({}, '', '/'); window.location.reload(); }} />;
  }

  // Minha Conta route
  if (window.location.pathname === '/minha-conta') {
    return <CustomerArea onBack={() => { window.history.pushState({}, '', '/'); window.location.reload(); }} />;
  }

  // Privacy policy route
  if (window.location.pathname === '/privacidade') {
    return <PrivacyPolicy onBack={() => { window.history.pushState({}, '', '/'); window.location.reload(); }} />;
  }
  const [selectedProduct, setSelectedProduct] = useState<ProductDef>(PRODUCTS['copo-475']);
  const [customization, setCustomization] = useState<Customization>(EMPTY_CUSTOMIZATION);
  const [orderData, setOrderData] = useState<OrderFormData>(makeEmptyOrder(PRODUCTS['copo-475']));
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('pagamento') as PaymentStatus;
    if (status && PAYMENT_BANNERS[status]) {
      setPaymentStatus(status);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const goTo = (s: AppStep) => {
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
    if (!adminToken) return <AdminLogin onLogin={(token) => { sessionStorage.setItem('admin_token', token); setAdminToken(token); }} />;
    return <AdminPanel token={adminToken} onLogout={() => { sessionStorage.removeItem('admin_token'); setAdminToken(''); }} />;
  }

  if (step === 'quantity') {
    return (
      <QuantityShippingStep
        product={selectedProduct}
        initialData={orderData}
        onChange={setOrderData}
        onBack={() => goTo('landing')}
        onNext={() => goTo('customize')}
      />
    );
  }

  if (step === 'customize') {
    return (
      <CustomizationStep
        product={selectedProduct}
        value={customization}
        onChange={setCustomization}
        onBack={() => goTo('quantity')}
        onNext={() => goTo('order')}
      />
    );
  }

  if (step === 'order') {
    return (
      <OrderForm
        product={selectedProduct}
        customization={customization}
        initialData={orderData}
        onChange={setOrderData}
        onBack={() => goTo('customize')}
        onNext={() => goTo('confirmation')}
      />
    );
  }

  if (step === 'confirmation') {
    return (
      <OrderSummary
        product={selectedProduct}
        customization={customization}
        formData={orderData}
        onBack={() => goTo('order')}
        onConfirm={() => goTo('landing')}
      />
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

      <section className="bg-gradient-to-br from-[#858079] via-[#6B6862] to-[#514F4A] py-16 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-[#D4AF37]/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="flex justify-center mb-4">
            <div className="bg-[#514F4A] shadow-[0_4px_15px_rgba(212,175,55,0.3)] p-3 rounded-2xl border border-white/10">
              <Gift size={32} className="text-[#F1C40F]" />
            </div>
          </div>
          <h2 className="font-poppins text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] drop-shadow-md mb-4">
            Pronto para Personalizar?
          </h2>
          <p className="text-gray-200 font-medium text-lg mb-8 max-w-xl mx-auto">
            Faça o upload da sua arte agora e veja como seu copo ficará antes de finalizar o pedido.
          </p>
          <button
            onClick={() => document.getElementById('produto')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#D4AF37] to-[#d49924] hover:from-[#d49924] hover:to-[#c28511] text-gray-900 font-extrabold px-10 py-4 rounded-xl text-lg transition-all shadow-[0_8px_20px_rgba(212,175,55,0.4)] hover:-translate-y-0.5"
          >
            Começar Agora
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default App;
