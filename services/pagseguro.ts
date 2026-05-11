import { OrderFormData, Customization, PRODUCT, calcTotal } from '../types';

interface CheckoutParams {
  formData: OrderFormData;
  customization: Customization;
  totalPrice: number;
}

export function redirectToPagSeguro({ formData, customization, totalPrice }: CheckoutParams): void {
  const custType = PRODUCT.customizations[customization.type].label;
  const description = `${PRODUCT.name} - ${custType} x${formData.quantity}`;

  // In production: generate a PagSeguro session token via backend and use the JS lightbox.
  // For MVP sandbox mode, we build a simple payment link.
  const token = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_PAGSEGURO_TOKEN) ?? '';

  const params = new URLSearchParams({
    email: 'clickbrindes@email.com', // seller PagSeguro email — replace in production
    token,
    currency: 'BRL',
    itemId1: '0001',
    itemDescription1: description,
    itemAmount1: totalPrice.toFixed(2),
    itemQuantity1: '1',
    senderName: formData.name,
    senderEmail: formData.email,
    senderPhone: formData.phone.replace(/\D/g, ''),
    shippingAddressStreet: formData.address.street,
    shippingAddressNumber: formData.address.number,
    shippingAddressComplement: formData.address.complement,
    shippingAddressDistrict: formData.address.neighborhood,
    shippingAddressCity: formData.address.city,
    shippingAddressState: formData.address.state,
    shippingAddressPostalCode: formData.address.cep.replace(/\D/g, ''),
    shippingAddressCountry: 'BRA',
    shippingType: '3',
    reference: `CB-${Date.now()}`,
  });

  // Sandbox URL — swap to production URL when ready
  const checkoutUrl = `https://sandbox.pagseguro.uol.com.br/v2/checkout/payment.html?${params.toString()}`;
  window.open(checkoutUrl, '_blank');
}
