export type CustomizationType = 'serigrafia' | 'laser';

export type AppStep = 'landing' | 'customize' | 'order' | 'confirmation';

export type ProductId = 'copo-475' | 'cuia-320';

export interface ProductDef {
  id: ProductId;
  name: string;
  color: string;
  description: string;
  features: readonly string[];
  basePrice: number;
  image: string;
  customizations: {
    serigrafia: { label: string; extraPrice: number; description: string };
    laser: { label: string; extraPrice: number; description: string };
  };
  minQuantity: number;
}

export const PRODUCTS: Record<ProductId, ProductDef> = {
  'copo-475': {
    id: 'copo-475',
    name: 'Copo Térmico 475ml',
    color: 'Preto',
    description: 'Aço inox de alta qualidade, parede dupla a vácuo, mantém bebidas quentes e frias por 6 horas, tampa com vedação hermética.',
    features: [
      'Aço inox de alta qualidade',
      'Parede dupla a vácuo',
      'Mantém bebidas quentes e frias por 6 horas',
      'Tampa com vedação hermética',
      'Capacidade: 475ml',
      'Cor: Preto fosco',
      'Altura: 17,1 cm',
      'Largura: 9,1 cm',
      'Circunferência: 29,3 cm',
    ],
    basePrice: 23.00,
    image: '/Copo.jpg.png',
    customizations: {
      serigrafia: { label: 'Serigrafia 1 Cor', extraPrice: 0, description: 'Impressão em tinta de alta durabilidade' },
      laser: { label: 'Gravação a Laser', extraPrice: 5.00, description: 'Gravação permanente na superfície do copo' },
    },
    minQuantity: 10,
  },
  'cuia-320': {
    id: 'cuia-320',
    name: 'Copo Térmico Cuia 320ml',
    color: 'Preto',
    description: 'Formato cuia ergonômico, aço inox parede dupla, mantém bebidas quentes e frias por 6 horas, tampa deslizante.',
    features: [
      'Aço inox de alta qualidade',
      'Parede dupla a vácuo',
      'Mantém bebidas quentes e frias por 6 horas',
      'Tampa deslizante inclusa',
      'Capacidade: 320ml',
      'Cor: Preto fosco',
      'Formato cuia ergonômico',
    ],
    basePrice: 23.00,
    image: '/CopoCuia.jpg.png',
    customizations: {
      serigrafia: { label: 'Serigrafia 1 Cor', extraPrice: 0, description: 'Impressão em tinta de alta durabilidade' },
      laser: { label: 'Gravação a Laser', extraPrice: 5.00, description: 'Gravação permanente na superfície do copo' },
    },
    minQuantity: 10,
  },
};

// Keep backward compat helper
export const PRODUCT = PRODUCTS['copo-475'];

export type SerigrafiaColor = 'preto' | 'branco' | 'azul-escuro';

export const SERIGRAFIA_COLORS: { key: SerigrafiaColor; label: string; hex: string }[] = [
  { key: 'preto', label: 'Preto', hex: '#1a1a1a' },
  { key: 'branco', label: 'Branco', hex: '#ffffff' },
  { key: 'azul-escuro', label: 'Azul Escuro', hex: '#1b3a6b' },
];

export interface Customization {
  type: CustomizationType;
  serigrafiaColor: SerigrafiaColor;
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
  product: ProductDef;
  customization: Customization;
  formData: OrderFormData;
  totalPrice: number;
  createdAt: number;
}

export function calcUnitPrice(product: ProductDef, type: CustomizationType): number {
  return product.basePrice + product.customizations[type].extraPrice;
}

export function calcTotal(product: ProductDef, type: CustomizationType, quantity: number): number {
  return calcUnitPrice(product, type) * quantity;
}
