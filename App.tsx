import React, { useState } from 'react';
import { Gift, ArrowRight } from 'lucide-react';
import { AppStep, Customization, OrderFormData, ProductDef, PRODUCTS } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductShowcase } from './components/ProductShowcase';
import { HowItWorks } from './components/HowItWorks';
import { WhyChooseUs } from './components/WhyChooseUs';
import { Footer } from './components/Footer';
import { CustomizationStep } from './components/CustomizationStep';
import { OrderForm } from './components/OrderForm';
import { OrderSummary } from './components/OrderSummary';

const makeEmptyOrder = (product: ProductDef): OrderFormData => ({
  name: '',
  email: '',
  phone: '',
  quantity: product.minQuantity,
  address: { cep: '', street: '', neighborhood: '', city: '', state: '', number: '', complement: '' },
});

const EMPTY_CUSTOMIZATION: Customization = {
  type: 'serigrafia',
  serigrafiaColor: 'preto',
  artFile: null,
  artPreviewUrl: null,
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('landing');
  const [selectedProduct, setSelectedProduct] = useState<ProductDef>(PRODUCTS['copo-475']);
  const [customization, setCustomization] = useState<Customization>(EMPTY_CUSTOMIZATION);
  const [orderData, setOrderData] = useState<OrderFormData>(makeEmptyOrder(PRODUCTS['copo-475']));

  const goTo = (s: AppStep) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startOrder = (product: ProductDef) => {
    setSelectedProduct(product);
    setOrderData(makeEmptyOrder(product));
    setCustomization(EMPTY_CUSTOMIZATION);
    goTo('customize');
  };

  if (step === 'customize') {
    return (
      <CustomizationStep
        product={selectedProduct}
        value={customization}
        onChange={setCustomization}
        onBack={() => goTo('landing')}
        onNext={() => goTo('order')}
      />
    );
  }

  if (step === 'order') {
    return (
      <OrderForm
        product={selectedProduct}
        customizationType={customization.type}
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
      <Header onCtaClick={() => startOrder(PRODUCTS['copo-475'])} />
      <Hero onCtaClick={() => startOrder(PRODUCTS['copo-475'])} />
      <ProductShowcase onSelectProduct={startOrder} />
      <HowItWorks />
      <WhyChooseUs />

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
