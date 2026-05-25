export type CustomizationType = 'serigrafia' | 'laser';

export type AppStep = 'landing' | 'quantity' | 'customize' | 'order' | 'confirmation';

export type ProductId = 'copo-475' | 'cuia-320' | 'ecobag' | 'moleskine';

export interface ProductDef {
  id: ProductId;
  name: string;
  color: string;
  description: string;
  features: readonly string[];
  basePrice: number;
  image: string;
  cardImage: string;
  customizations: {
    serigrafia: { label: string; extraPrice: number; description: string };
    laser?: { label: string; extraPrice: number; description: string };
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
      'Contém tampa com abridor.',
      'Capacidade: 475ml',
      'Cor: Preto fosco',
      'Altura: 17,1 cm',
      'Largura: 9,1 cm',
      'Circunferência: 29,3 cm',
    ],
    basePrice: 23.00,
    image: '/CopoPreview475.webp',
    cardImage: '/CopoTermicoSeuLogo.webp',
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
    image: '/CopoCuia.webp',
    cardImage: '/CopoCuiaSeuNome.webp',
    customizations: {
      serigrafia: { label: 'Serigrafia 1 Cor', extraPrice: 0, description: 'Impressão em tinta de alta durabilidade' },
      laser: { label: 'Gravação a Laser', extraPrice: 5.00, description: 'Gravação permanente na superfície do copo' },
    },
    minQuantity: 10,
  },
  'ecobag': {
    id: 'ecobag',
    name: 'Sacola Ecobag em Algodão',
    color: 'Natural',
    description: 'Sacola de algodão com alças costuradas na parte interna. Resistente, sustentável e ideal para brindes corporativos.',
    features: [
      '100% algodão natural',
      'Altura: 37,5 cm · Largura: 30,5 cm',
      'Alças costuradas internamente (29 cm)',
      'Área de impressão: 21 × 30 cm',
      'Peso: ~69g',
      'Sustentável e reutilizável',
    ],
    basePrice: 11.00,
    image: '/EcoBagPreview.semlogo.webp',
    cardImage: '/EcobagSeuLogo.webp',
    customizations: {
      serigrafia: { label: 'Serigrafia 1 Cor', extraPrice: 0, description: 'Impressão em tinta de alta durabilidade sobre algodão' },
    },
    minQuantity: 25,
  },
  'moleskine': {
    id: 'moleskine',
    name: 'Caderneta Moleskine',
    color: 'Preto',
    description: 'Caderneta emborrachada com porta caneta elástico em nylon, marcador de página em cetim e fita elástica de nylon para fechar. Aproximadamente 80 folhas pardas pautadas.',
    features: [
      'Capa emborrachada em couro sintético',
      'Porta caneta elástico em nylon',
      'Marcador de página em cetim',
      'Fita elástica de fechamento',
      '~80 folhas pardas pautadas',
      'Altura: 21,2 cm · Largura: 14 cm',
      'Área de gravação: 20 × 13 cm',
      'Peso: ~266g',
    ],
    basePrice: 24.00,
    image: '/Moleskine.SemLogo.webp',
    cardImage: '/Moleskine.SeuLogo.nobg.webp',
    customizations: {
      serigrafia: { label: 'Serigrafia 1 Cor', extraPrice: 0, description: 'Impressão em tinta de alta durabilidade na capa' },
    },
    minQuantity: 20,
  },
};

// Keep backward compat helper
export const PRODUCT = PRODUCTS['copo-475'];

export type SerigrafiaColor = 'preto' | 'branco' | 'azul-escuro' | 'amarelo' | 'ciano' | 'vermelho';

export const SERIGRAFIA_COLORS: { key: SerigrafiaColor; label: string; hex: string }[] = [
  { key: 'preto', label: 'Preto', hex: '#1a1a1a' },
  { key: 'branco', label: 'Branco', hex: '#ffffff' },
  { key: 'azul-escuro', label: 'Azul Escuro', hex: '#1b3a6b' },
  { key: 'amarelo', label: 'Amarelo', hex: '#F5C518' },
  { key: 'ciano', label: 'Ciano', hex: '#00B4D8' },
  { key: 'vermelho', label: 'Vermelho', hex: '#D62828' },
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

export interface ShippingOption {
  service: string;
  price: number;
  deadlineDays: number;
  label: string;
  company?: string;
}

export interface OrderFormData {
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  quantity: number;
  address: Address;
  shipping: ShippingOption | null;
}

export interface Order {
  product: ProductDef;
  customization: Customization;
  formData: OrderFormData;
  totalPrice: number;
  createdAt: number;
}

export function calcUnitPrice(product: ProductDef, type: CustomizationType): number {
  return product.basePrice + (product.customizations[type]?.extraPrice ?? 0);
}

export function calcTotal(product: ProductDef, type: CustomizationType, quantity: number): number {
  return calcUnitPrice(product, type) * quantity;
}
