import type { VercelRequest, VercelResponse } from '@vercel/node';

// CEP de origem: ImpreBrindes - Porto Alegre/RS
const CEP_ORIGEM = '91430221';

// Determina a zona de frete com base na UF de destino (origem = RS)
function getZone(uf: string): number {
  const uf_ = uf.toUpperCase();
  if (['RS'].includes(uf_)) return 1;
  if (['SC', 'PR'].includes(uf_)) return 2;
  if (['SP', 'RJ', 'ES', 'MG'].includes(uf_)) return 3;
  if (['GO', 'MS', 'MT', 'DF'].includes(uf_)) return 4;
  if (['BA', 'SE', 'AL', 'PE', 'PB', 'RN', 'CE', 'PI'].includes(uf_)) return 5;
  if (['MA', 'TO', 'PA', 'AP'].includes(uf_)) return 6;
  if (['AM', 'RR', 'RO', 'AC'].includes(uf_)) return 7;
  return 4; // fallback zona central
}

// Tabela de preços PAC (Encomenda PAC) por peso (g) e zona — valores Correios 2025
// Índice: zona 1-7 (índice 0 = zona 1)
const PAC_TABLE: { maxWeight: number; prices: number[] }[] = [
  { maxWeight: 300,   prices: [17.00, 18.50, 20.00, 22.00, 24.00, 28.00, 32.00] },
  { maxWeight: 500,   prices: [17.50, 19.00, 21.00, 23.00, 25.00, 29.00, 33.00] },
  { maxWeight: 1000,  prices: [18.50, 20.00, 22.50, 25.00, 27.00, 32.00, 37.00] },
  { maxWeight: 2000,  prices: [20.00, 22.00, 25.00, 28.00, 31.00, 37.00, 43.00] },
  { maxWeight: 3000,  prices: [21.50, 24.00, 28.00, 32.00, 36.00, 43.00, 50.00] },
  { maxWeight: 5000,  prices: [24.00, 27.00, 32.00, 37.00, 43.00, 52.00, 61.00] },
  { maxWeight: 10000, prices: [30.00, 35.00, 42.00, 50.00, 59.00, 72.00, 85.00] },
  { maxWeight: 15000, prices: [36.00, 43.00, 52.00, 63.00, 75.00, 92.00, 109.00] },
  { maxWeight: 20000, prices: [42.00, 51.00, 62.00, 76.00, 91.00, 112.00, 133.00] },
  { maxWeight: 30000, prices: [54.00, 67.00, 82.00, 102.00, 123.00, 152.00, 181.00] },
];

// Tabela de preços SEDEX por peso (g) e zona
const SEDEX_TABLE: { maxWeight: number; prices: number[] }[] = [
  { maxWeight: 300,   prices: [22.00, 26.00, 32.00, 36.00, 40.00, 48.00, 56.00] },
  { maxWeight: 500,   prices: [23.00, 27.50, 34.00, 39.00, 44.00, 53.00, 62.00] },
  { maxWeight: 1000,  prices: [25.00, 30.00, 38.00, 44.00, 51.00, 62.00, 73.00] },
  { maxWeight: 2000,  prices: [29.00, 36.00, 47.00, 56.00, 65.00, 80.00, 95.00] },
  { maxWeight: 3000,  prices: [33.00, 42.00, 56.00, 68.00, 79.00, 98.00, 117.00] },
  { maxWeight: 5000,  prices: [41.00, 54.00, 74.00, 92.00, 107.00, 134.00, 161.00] },
  { maxWeight: 10000, prices: [61.00, 82.00, 116.00, 146.00, 171.00, 216.00, 261.00] },
  { maxWeight: 15000, prices: [81.00, 110.00, 158.00, 200.00, 235.00, 298.00, 361.00] },
  { maxWeight: 20000, prices: [101.00, 138.00, 200.00, 254.00, 299.00, 380.00, 461.00] },
  { maxWeight: 30000, prices: [141.00, 194.00, 284.00, 362.00, 427.00, 544.00, 661.00] },
];

// Prazo estimado em dias úteis por zona
const PAC_DEADLINE = [5, 6, 7, 9, 11, 14, 17];
const SEDEX_DEADLINE = [1, 2, 3, 4, 4, 5, 5];

function getPrice(table: typeof PAC_TABLE, weightGrams: number, zone: number): number {
  const zoneIndex = zone - 1;
  const row = table.find(r => weightGrams <= r.maxWeight) ?? table[table.length - 1];
  return row.prices[zoneIndex];
}

async function getUFFromCEP(cep: string): Promise<string> {
  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  if (!res.ok) throw new Error('CEP inválido');
  const data = await res.json();
  if (data.erro) throw new Error('CEP não encontrado');
  return data.uf;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cepDestino, quantity, productId } = req.body as { cepDestino: string; quantity: number; productId: string };

  const cleanCEP = String(cepDestino).replace(/\D/g, '');
  if (cleanCEP.length !== 8) {
    return res.status(400).json({ error: 'CEP de destino inválido' });
  }
  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Quantidade inválida' });
  }

  try {
    const uf = await getUFFromCEP(cleanCEP);
    const zone = getZone(uf);

    // Caixa: 33×36×45 cm, cabe 20 copos, pesa 750g vazia
    // Peso cúbico Correios = C×L×A / 6000 → 33×36×45 / 6000 = 8.910g por caixa
    const CUPS_PER_BOX = 20;
    const BOX_WEIGHT_G = 750;
    const BOX_CUBIC_G = Math.round((33 * 36 * 45) / 6000 * 1000); // 8910g

    const weightPerUnit = productId === 'cuia-320' ? 173 : 268;
    const numBoxes = Math.ceil(quantity / CUPS_PER_BOX);
    const realWeight = quantity * weightPerUnit + numBoxes * BOX_WEIGHT_G;
    const cubicWeight = numBoxes * BOX_CUBIC_G;
    const weightGrams = Math.max(realWeight, cubicWeight);

    const pacPrice = getPrice(PAC_TABLE, weightGrams, zone);
    const sedexPrice = getPrice(SEDEX_TABLE, weightGrams, zone);
    const pacDays = PAC_DEADLINE[zone - 1];
    const sedexDays = SEDEX_DEADLINE[zone - 1];

    return res.status(200).json({
      options: [
        {
          service: 'PAC',
          price: pacPrice,
          deadlineDays: pacDays,
          label: `PAC — até ${pacDays} dias úteis`,
        },
        {
          service: 'SEDEX',
          price: sedexPrice,
          deadlineDays: sedexDays,
          label: `SEDEX — até ${sedexDays} dia${sedexDays > 1 ? 's' : ''} útil${sedexDays > 1 ? 'is' : ''}`,
        },
      ],
      weightGrams,
      zone,
      uf,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao calcular frete';
    return res.status(500).json({ error: message });
  }
}
