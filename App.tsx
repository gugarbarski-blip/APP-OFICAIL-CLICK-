import React, { useState } from 'react';
import { CheckCircle, Gift, ArrowRight } from 'lucide-react';
import { AppStep, Customization, OrderFormData, PRODUCT, calcTotal } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductShowcase } from './components/ProductShowcase';
import { HowItWorks } from './components/HowItWorks';
import { WhyChooseUs } from './components/WhyChooseUs';
import { Footer } from './components/Footer';
import { CustomizationStep } from './components/CustomizationStep';
import { OrderForm } from './components/OrderForm';
import { OrderSummary } from './components/OrderSummary';

const EMPTY_ORDER: OrderFormData = {
  name: '',
  email: '',
  phone: '',
  quantity: PRODUCT.minQuantity,
  address: {
    cep: '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
    number: '',
    complement: '',
  },
};

const EMPTY_CUSTOMIZATION: Customization = {
  type: 'serigrafia',
  artFile: null,
  artPreviewUrl: null,
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('landing');
  const [customization, setCustomization] = useState<Customization>(EMPTY_CUSTOMIZATION);
  const [orderData, setOrderData] = useState<OrderFormData>(EMPTY_ORDER);

  const goTo = (s: AppStep) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (step === 'customize') {
    return (
      <CustomizationStep
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
        customization={customization}
        formData={orderData}
        onBack={() => goTo('order')}
        onConfirm={() => goTo('landing')}
      />
    );
  }

  // Landing page
  return (
    <div className="min-h-screen">
      <Header onCtaClick={() => goTo('customize')} />
      <Hero onCtaClick={() => goTo('customize')} />
      <ProductShowcase onCtaClick={() => goTo('customize')} />
      <HowItWorks />
      <WhyChooseUs />

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-primary to-primaryDark py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Gift size={32} className="text-white" />
            </div>
          </div>
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-white mb-4">
            Pronto para Personalizar?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Faça o upload da sua arte agora e veja como seu copo ficará antes de finalizar o pedido.
          </p>
          <button
            onClick={() => goTo('customize')}
            className="inline-flex items-center gap-3 bg-accent hover:bg-accentDark text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
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
