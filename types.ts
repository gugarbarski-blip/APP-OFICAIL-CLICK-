export type CustomizationType = 'serigrafia' | 'laser';

export type AppStep = 'landing' | 'customize' | 'order' | 'confirmation';

export interface Customization {
  type: CustomizationType;
  artFile: File | null;
  artPreviewUrl: string | null;
}

export interface Address {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
  complement: string;
}

export interface OrderFormData {
  name: string;
  email: string;
  phone: string;
  quantity: number;
  address: Address;
}

export interface Order {
  customization: Customization;
  formData: OrderFormData;
  totalPrice: number;
  createdAt: number;
}

export const PRODUCT = {
  name: 'Copo Térmico 475ml',
  color: 'Preto',
  description: 'Aço inox de alta qualidade, parede dupla a vácuo, mantém temperatura por 12h, tampa com vedação hermética.',
  features: [
    'Aço inox de alta qualidade',
    'Parede dupla a vácuo',
    'Mantém bebidas quentes por 12h',
    'Tampa com vedação hermética',
    'Capacidade: 475ml',
    'Cor: Preto fosco',
    'Altura: 17,1 cm',
    'Largura: 9,1 cm',
    'Circunferência: 29,3 cm',
  ],
  basePrice: 23.00,
  customizations: {
    serigrafia: { label: 'Serigrafia 1 Cor', extraPrice: 0, description: 'Impressão em tinta de alta durabilidade' },
    laser: { label: 'Gravação a Laser', extraPrice: 5.00, description: 'Gravação permanente na superfície do copo' },
  },
  minQuantity: 10,
} as const;

export function calcUnitPrice(type: CustomizationType): number {
  return PRODUCT.basePrice + PRODUCT.customizations[type].extraPrice;
}

export function calcTotal(type: CustomizationType, quantity: number): number {
  return calcUnitPrice(type) * quantity;
}
